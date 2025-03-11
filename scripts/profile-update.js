// let's get what we need from Firebase
import { auth, db } from './firebaseAPI_TEAM08.js';

// shows friendly messages to keep you in the loop
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('updateMessage');
    messageDiv.className = `alert alert-${type} mt-3`;
    messageDiv.style.display = 'block';
    messageDiv.textContent = message;
    
    // if everything went well, let's head back to your profile
    if (type === 'success') {
        setTimeout(() => {
            window.location.href = 'Profile.html';
        }, 1500);
    }
}

// gets your existing info and puts it in the form
async function loadUserData(user) {
    try {
        const doc = await db.collection('users').doc(user.uid).get();
        const userData = doc.data();

        if (userData) {
            // fill in your basic info
            document.getElementById('firstName').value = userData.firstName || '';
            document.getElementById('lastName').value = userData.lastName || '';
            document.getElementById('email').value = userData.email || user.email;
            document.getElementById('title').value = userData.title || '';
            document.getElementById('bio').value = userData.bio || '';
            document.getElementById('phone').value = userData.phone || '';
            document.getElementById('location').value = userData.location || '';
            
            // pop in your social media links
            document.getElementById('twitter').value = userData.social?.twitter || '';
            document.getElementById('linkedin').value = userData.social?.linkedin || '';
            document.getElementById('github').value = userData.social?.github || '';
            document.getElementById('instagram').value = userData.social?.instagram || '';

            // show your profile picture
            const profilePicture = document.getElementById('profile-picture');
            if (profilePicture) {
                profilePicture.src = userData.photoURL || 'https://bootdey.com/img/Content/avatar/avatar1.png';
            }
        }
    } catch (error) {
        console.error('oops, had trouble loading your data:', error);
        showMessage('hmm, something went wrong loading your profile. mind refreshing the page? 🔄', 'danger');
    }
}

// handles your new profile picture
async function handleProfilePictureUpload(file) {
    const user = auth.currentUser;
    
    if (!file || !user) {
        throw new Error('looks like we need a file and you to be logged in! 📸');
    }

    try {
        // give your picture a unique name
        const timestamp = new Date().getTime();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${user.uid}_${timestamp}.${fileExtension}`;

        // find a cozy spot for your picture in Firebase
        const storageRef = firebase.storage().ref(`profile-pictures/${fileName}`);

        // upload your new pic
        const uploadTask = await storageRef.put(file);

        // get the link to your picture
        const photoURL = await uploadTask.ref.getDownloadURL();

        // update your profile with the new pic
        await user.updateProfile({ photoURL });

        return photoURL;
    } catch (error) {
        console.error('uh oh, trouble with your picture:', error);
        throw error;
    }
}

// saves all your profile changes
async function updateProfile(event) {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        showMessage('hey there! mind logging in first? 👋', 'danger');
        return;
    }

    try {
        // package up all your new info
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

        // handle your new profile picture if you added one
        const fileInput = document.getElementById('profile-upload');
        if (fileInput && fileInput.files.length > 0) {
            try {
                const photoURL = await handleProfilePictureUpload(fileInput.files[0]);
                if (photoURL) {
                    updateData.photoURL = photoURL;
                }
            } catch (uploadError) {
                showMessage('oops! had some trouble with your picture: ' + uploadError.message + ' 🖼️', 'danger');
                return;
            }
        }

        // update your email if it changed
        if (updateData.email !== user.email) {
            await user.updateEmail(updateData.email);
        }

        // handle password changes if you want to update it
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const currentPassword = document.getElementById('currentPassword').value;

        if (newPassword || confirmPassword || currentPassword) {
            if (newPassword !== confirmPassword) {
                throw new Error("looks like your new passwords don't match! 🔑");
            }
            if (!currentPassword) {
                throw new Error("we need your current password to make this change 🔒");
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

        // save everything to Firebase
        await db.collection('users').doc(user.uid).update(updateData);
        showMessage('awesome! your profile is all updated! ✨', 'success');

    } catch (error) {
        console.error('uh oh, something went wrong:', error);
        showMessage(error.message || 'hmm, had some trouble updating your profile 😕', 'danger');
    }
}

// let's get everything set up when the page loads
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadUserData(user);
            
            // set up the preview for your new profile picture
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

            // handle when you submit your changes
            const profileForm = document.getElementById('profile-form');
            if (profileForm) {
                profileForm.addEventListener('submit', updateProfile);
            }
        } else {
            window.location.href = 'login-signup-page/login.html';
        }
    });
}); 