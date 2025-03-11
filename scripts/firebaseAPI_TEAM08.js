// hey there! here's our Firebase setup for the app 🔥
const firebaseConfig = {
    apiKey: "AIzaSyDaQqgxo9Y_se5nrwerXbZyBF3h3ZWxKUs",
    authDomain: "comp1800-bby8.firebaseapp.com",
    projectId: "comp1800-bby8",
    storageBucket: "comp1800-bby8.appspot.com",
    messagingSenderId: "1034785903646",
    appId: "1:1034785903646:web:e7f78d2422c63555f1c3a9"
};

// let's get Firebase up and running
firebase.initializeApp(firebaseConfig);

// these are the main Firebase features we'll be using
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("✅ Firebase initialized successfully");

// Function to show messages
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (messageDiv) {
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(() => {
      messageDiv.style.opacity = 0;
    }, 2000); // Message disappears in 2 seconds before redirection
  } else {
    console.error(`❌ Element with id '${divId}' not found.`);
  }
}

// Function to create or update user profile data
async function setupUserProfile(user, additionalData = {}) {
  try {
    const userRef = db.collection("users").doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user profile
      const userData = {
        email: user.email,
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        photoURL: user.photoURL || '',
        bio: '',
        location: '',
        phone: '',
        title: '',
        social: {
          twitter: '',
          linkedin: '',
          github: '',
          instagram: ''
        },
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      };
      await userRef.set(userData);
      console.log("✅ New user profile created");
    } else {
      // Update existing user's last login
      await userRef.update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        ...additionalData
      });
      console.log("✅ User last login updated");
    }
  } catch (error) {
    console.error("❌ Error setting up user profile:", error);
    throw error;
  }
}

// Function to redirect after successful authentication
function redirectToMain() {
  console.log("🔄 Redirecting to main.html...");
  setTimeout(() => {
    window.location.href = "../main.html"; // Redirect after 2 seconds
  }, 2000); // Redirect after 2 seconds
}

// Ensure event listeners are added only after the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM fully loaded");

  // Sign Up (Email & Password)
  const signUpButton = document.getElementById("submitSignUp");
  if (signUpButton) {
    signUpButton.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("🟢 Sign-up clicked");

      const email = document.getElementById("rEmail").value;
      const password = document.getElementById("rPassword").value;
      const firstName = document.getElementById("fName").value;
      const lastName = document.getElementById("lName").value;

      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log("✅ User created successfully:", userCredential.user);

        // Set up user profile with additional data
        await setupUserProfile(userCredential.user, {
          firstName,
          lastName,
          email
        });

        showMessage("✅ Account Created Successfully! Redirecting...", "signUpMessage");
        redirectToMain();
      } catch (error) {
        console.error("❌ Sign-up error:", error);
        if (error.code === "auth/email-already-in-use") {
          showMessage("⚠️ Email Address Already Exists!", "signUpMessage");
        } else if (error.code === "auth/invalid-email") {
          showMessage("⚠️ Invalid email format.", "signUpMessage");
        } else {
          showMessage("❌ Unable to create user", "signUpMessage");
        }
      }
    });
  } else {
    console.warn("⚠️ Sign-up button not found.");
  }

  // Sign In (Email & Password)
  const signInButton = document.getElementById("submitSignIn");
  if (signInButton) {
    signInButton.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("🟢 Sign-in clicked");

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Update user's last login
        await setupUserProfile(userCredential.user);
        
        showMessage("✅ Login successful! Redirecting...", "signInMessage");
        localStorage.setItem("loggedInUserId", userCredential.user.uid);
        redirectToMain();
      } catch (error) {
        console.error("❌ Sign-in error:", error);
        if (error.code === "auth/invalid-credential") {
          showMessage("⚠️ Incorrect Email or Password", "signInMessage");
        } else {
          showMessage("❌ Account does not exist", "signInMessage");
        }
      }
    });
  } else {
    console.warn("⚠️ Sign-in button not found.");
  }
});

// we'll share these with other files that need them
export { auth, db, storage };