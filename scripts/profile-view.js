// Import Firebase instances from the API file
import { auth, db } from './firebaseAPI_TEAM08.js';

// Wait for Firebase to be initialized
let initializationAttempts = 0;
const maxAttempts = 10;

function waitForFirebase() {
    return new Promise((resolve, reject) => {
        function checkFirebase() {
            initializationAttempts++;
            if (firebase.apps.length > 0) {
                console.log("Firebase is initialized");
                resolve();
            } else if (initializationAttempts >= maxAttempts) {
                reject(new Error("Firebase initialization timeout"));
            } else {
                console.log("Waiting for Firebase...");
                setTimeout(checkFirebase, 100);
            }
        }
        checkFirebase();
    });
}

// Function to format date
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Function to update profile information
function updateProfileInfo(user, userData) {
    console.log("updating profile info:", userData);
    
    // profile picture
    const profilePic = document.getElementById('profile-picture');
    if (profilePic) {
        profilePic.src = userData.photoURL || 'https://bootdey.com/img/Content/avatar/avatar1.png';
    }

    // name and bio
    const userName = document.getElementById('user-name');
    if (userName) {
        userName.textContent = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous User';
    }

    const bioShort = document.getElementById('user-bio-short');
    if (bioShort) {
        bioShort.textContent = userData.title || '';
    }

    const bio = document.getElementById('user-bio');
    if (bio) {
        bio.textContent = userData.bio || 'No bio available';
    }

    // contact info
    const joinDate = document.getElementById('join-date');
    if (joinDate) {
        joinDate.textContent = formatDate(userData.createdAt) || 'N/A';
    }

    const location = document.getElementById('user-location');
    if (location) {
        location.textContent = userData.location || 'Not specified';
    }
    
    const userEmail = document.getElementById('user-email');
    if (userEmail) {
        userEmail.textContent = userData.email || user.email;
        userEmail.href = `mailto:${userData.email || user.email}`;
    }
    
    const phone = document.getElementById('user-phone');
    if (phone) {
        phone.textContent = userData.phone || 'Not specified';
    }

    // social links
    const socialLinks = {
        'twitter-link': userData.social?.twitter || '',
        'linkedin-link': userData.social?.linkedin || '',
        'github-link': userData.social?.github || '',
        'instagram-link': userData.social?.instagram || ''
    };

    for (const [id, url] of Object.entries(socialLinks)) {
        const link = document.getElementById(id);
        if (link) {
            if (url && url.trim() !== '') {
                link.href = url;
                link.classList.remove('disabled');
            } else {
                link.href = '#';
                link.classList.add('disabled');
            }
        }
    }
}

// handle signing out
async function handleSignOut() {
    try {
        await auth.signOut();
        console.log("Signed out successfully");
        localStorage.removeItem('loggedInUserId'); // Clear stored user ID
        window.location.href = '../../pages/auth/login.html';
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
}

// Initialize the page
async function initializePage() {
    try {
        await waitForFirebase();
        console.log("Initializing page...");
        
        // Set up sign out button
        const signOutBtn = document.getElementById('signOutBtn');
        if (signOutBtn) {
            console.log("Found sign out button, adding click handler");
            signOutBtn.addEventListener('click', handleSignOut);
        } else {
            console.error("Couldn't find sign out button");
            throw new Error("Sign out button not found");
        }

        // Check if user is logged in
        const user = auth.currentUser;
        if (user) {
            console.log("User is logged in:", user.email);
            const doc = await db.collection('users').doc(user.uid).get();
            const userData = doc.data() || {};
            updateProfileInfo(user, userData);
        } else {
            console.log("No user logged in, waiting for auth state change");
        }
    } catch (error) {
        console.error("Error initializing page:", error);
    }
}

// Listen for authentication state changes
auth.onAuthStateChanged(async (user) => {
    console.log("Auth state changed:", user ? "logged in" : "logged out");
    
    if (user) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            const userData = doc.data() || {};
            updateProfileInfo(user, userData);
        } catch (error) {
            console.error('Error loading user data:', error);
            alert('Failed to load profile data. Please refresh the page.');
        }
    } else {
        console.log("No user logged in, redirecting to login page");
        window.location.href = '../../pages/auth/login.html';
    }
});

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initializePage); 