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

            // Profile picture
            const profilePicture = document.getElementById('profile-picture');
            if (profilePicture) {
                profilePicture.src = userData.photoURL || 'https://bootdey.com/img/Content/avatar/avatar1.png';
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
    
    if (!file || !user) {
        throw new Error('No file selected or user not logged in');
    }

    try {
        // Create a unique filename
        const timestamp = new Date().getTime();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${user.uid}_${timestamp}.${fileExtension}`;

        // Create a reference to the file location
        const storageRef = firebase.storage().ref(`profile-pictures/${fileName}`);

        // Upload the file
        const uploadTask = await storageRef.put(file);

        // Get the download URL
        const photoURL = await uploadTask.ref.getDownloadURL();

        // Update user profile
        await user.updateProfile({ photoURL });

        return photoURL;
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        throw error;
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

        // Handle profile picture upload
        const fileInput = document.getElementById('profile-upload');
        if (fileInput && fileInput.files.length > 0) {
            try {
                const photoURL = await handleProfilePictureUpload(fileInput.files[0]);
                if (photoURL) {
                    updateData.photoURL = photoURL;
                }
            } catch (uploadError) {
                showMessage('Failed to upload profile picture: ' + uploadError.message, 'danger');
                return;
            }
        }

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
            
            // Set up profile picture preview
            const profileUpload = document.getElementById('profile-upload');
            if (profileUpload) {
                profileUpload.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const profilePicture = document.getElementById('profile-picture');
                            if (profilePicture) {
                                profilePicture.src = e.target.result;
                            }
                        };
                        reader.readAsDataURL(file);
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