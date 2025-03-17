// grab what we need from firebase
import { auth, db } from './firebaseAPI_TEAM08.js';

// shows feedback messages to the user
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('updateMessage');
    messageDiv.className = `alert alert-${type} mt-3`;
    messageDiv.style.display = 'block';
    messageDiv.textContent = message;
    
    if (type === 'success') {
        setTimeout(() => {
            window.location.href = 'Profile.html';
        }, 1500);
    }
}

// fills the form with user's existing data
async function loadUserData(user) {
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        const userData = doc.data();

        if (userData) {
            // Basic info
            document.getElementById('firstName').value = userData.firstName || '';
            document.getElementById('lastName').value = userData.lastName || '';
            document.getElementById('email').value = userData.email || user.email;
            document.getElementById('title').value = userData.title || '';
            document.getElementById('bio').value = userData.bio || '';
            document.getElementById('phone').value = userData.phone || '';
            document.getElementById('location').value = userData.location || '';
            
            // Social media links
            document.getElementById('twitter').value = userData.social?.twitter || '';
            document.getElementById('linkedin').value = userData.social?.linkedin || '';
            document.getElementById('github').value = userData.social?.github || '';
            document.getElementById('instagram').value = userData.social?.instagram || '';

            // Profile picture - use display image from Firestore
            const profilePicture = document.getElementById('profile-picture');
            if (profilePicture) {
                // Always use Firestore's photoURL if available
                profilePicture.src = userData.photoURL || '../../images/default-avatar.svg';
                profilePicture.onerror = () => {
                    profilePicture.src = 'https://bootdey.com/img/Content/avatar/avatar1.png';
                };
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showMessage('Failed to load profile data. Please refresh the page.', 'danger');
    }
}

// handles uploading a new profile picture
async function handleProfilePictureUpload(file) {
    const user = auth.currentUser;
    const loadingIndicator = document.getElementById('profile-loading');
    
    if (!file || !user) {
        throw new Error('No file selected or user not logged in');
    }

    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select an image file');
        }

        // Validate file size (max 5MB for initial upload)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            throw new Error('Image size should be less than 5MB');
        }

        // Show loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        // Function to compress image
        const compressImage = (imgFile, maxWidth, maxHeight, quality) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(imgFile);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Calculate new dimensions
                        if (width > height) {
                            if (width > maxWidth) {
                                height = Math.round((height * maxWidth) / width);
                                width = maxWidth;
                            }
                        } else {
                            if (height > maxHeight) {
                                width = Math.round((width * maxHeight) / height);
                                height = maxHeight;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Get compressed image as base64
                        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                        resolve(compressedBase64);
                    };
                };
            });
        };

        // Create compressed display image
        const displayImage = await compressImage(file, 400, 400, 0.7);

        // Use a default avatar URL for auth profile
        const defaultAvatarUrl = 'https://bootdey.com/img/Content/avatar/avatar1.png';

        // Update user profile with default URL and Firestore with display image
        await Promise.all([
            user.updateProfile({ photoURL: defaultAvatarUrl }),
            db.collection('users').doc(user.uid).update({
                photoURL: displayImage,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
        ]);

        return displayImage;
    } catch (error) {
        console.error('Error handling profile picture:', error);
        throw error;
    } finally {
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
}

// saves all profile changes
async function updateProfile(event) {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        showMessage('Please log in to update your profile.', 'danger');
        return;
    }

    try {
        const updateData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            title: document.getElementById('title').value,
            bio: document.getElementById('bio').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value,
            social: {
                twitter: document.getElementById('twitter').value,
                linkedin: document.getElementById('linkedin').value,
                github: document.getElementById('github').value,
                instagram: document.getElementById('instagram').value
            },
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Update email if changed
        if (updateData.email !== user.email) {
            await user.updateEmail(updateData.email);
        }

        // Handle password change
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const currentPassword = document.getElementById('currentPassword').value;

        if (newPassword || confirmPassword || currentPassword) {
            if (newPassword !== confirmPassword) {
                throw new Error("New passwords don't match");
            }
            if (!currentPassword) {
                throw new Error("Current password is required to change password");
            }

            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await user.reauthenticateWithCredential(credential);
            
            if (newPassword) {
                await user.updatePassword(newPassword);
            }
        }

        // Save to Firestore
        await db.collection('users').doc(user.uid).update(updateData);
        showMessage('Profile updated! Redirecting...', 'success');

    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage(error.message || 'Error updating profile', 'danger');
    }
}

// Set up event listeners when the page loads
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadUserData(user);
            
            // Set up profile picture preview and upload
            const profileUpload = document.getElementById('profile-upload');
            const profilePicture = document.getElementById('profile-picture');
            let isUploading = false;
            
            if (profileUpload && profilePicture) {
                // Make the profile picture clickable to trigger file upload
                profilePicture.addEventListener('click', () => {
                    if (!isUploading) {
                        profileUpload.click();
                    }
                });

                profileUpload.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (file && !isUploading) {
                        isUploading = true;
                        try {
                            // Show preview immediately
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                profilePicture.src = e.target.result;
                            };
                            reader.readAsDataURL(file);

                            // Handle the upload
                            const photoURL = await handleProfilePictureUpload(file);
                            showMessage('Profile picture updated successfully!', 'success');
                            
                            // Update the preview with the actual uploaded URL
                            profilePicture.src = photoURL;
                        } catch (error) {
                            showMessage(error.message || 'Error uploading profile picture', 'danger');
                            // Revert to previous image if upload fails
                            loadUserData(user);
                        } finally {
                            isUploading = false;
                            // Clear the file input
                            profileUpload.value = '';
                        }
                    }
                });
            }

            // Set up form submission
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                profileForm.addEventListener('submit', updateProfile);
            }
        } else {
            window.location.href = 'login-signup-page/login.html';
        }
    });
}); 