
// Import our firebase config
import { firebaseConfig } from './config.js';

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();




// Function to create new reports
async function writeNewReport (reports) {
    try {
        const reportRef = db.collection("reports").doc(reports.uid);
        
        // Create new report 
        const reportData = {
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            location: " ",
            problemSummary: " ",
            roadProblemType: " ",
            date: " ",
            time: " ",
            title: " ",
        };
        await reportRef.set(reportData).then(function(){
            console.log("New report added to Firestore");
            window.location.assign("main.html");
        }).catch(function(error) {
            console.log("Error adding new report");
        });
    }




    db.collection("reports").doc(reports.uid).set({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        location: " ",
        problemSummary: " ",
        roadProblemType: " ",
        date: " ",
        time: " ",
        title: " ",
    }).then(function () {
        console.log("New report added to firestore");
        window.location.assign("main.html");
    }).catch(function (error){
        console.log("Error adding new report");
    });
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

    const submitReportButton = document.getElementById("submitReport");
    if(submitReportButton) {
        submitReportButton.addEventListener("click", async(event) => {
            const title = document.getElementById("report-title-name").value;
            const location = document.getElementById("location-name").value;
            const date = document.getElementById("report-date").value;
            const time = document.getElementById("report-time").value;
            const roadProblemType = document.getElementById().value;
            const problemSummary = document.getElementById("message-text").value;
            
        })
    }
})



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