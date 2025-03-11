// Import Firebase v8 modules correctly
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js";
import "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDusEPSeKh9n2I4KCw5cI3CLg1MDUE3Rsk",
    authDomain: "streetsmartbcit.firebaseapp.com",
    projectId: "streetsmartbcit",
    storageBucket: "streetsmartbcit.appspot.com",
    messagingSenderId: "986336052202",
    appId: "1:986336052202:web:f1d93cdc86f3a30934a893",
    measurementId: "G-8T152ZN88P"
    };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("✅ Firebase initialized successfully");

// Function to create new reports
db.collection("reports").doc(ReportingObserver.uid).set({
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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
})


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
    