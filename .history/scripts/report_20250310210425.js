// // Import Firebase modules
// import "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js";
// import "https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js";
// import "https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js";
// import "https://www.gstatic.com/firebasejs/8.10.0/firebase-storage.js";


// // Import our firebase config
// import { firebaseConfig } from './config.js';


// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


// Function to create new reports
async function writeNewReport (reports) {
    try {
        const reportRef = db.collection("reports").doc(reports.uid);
        
        // Create new report 
        const reportData = {
            createdAt: firebase.firestore.FieldValu0e.serverTimestamp(),
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
    } catch (error) {
        console.error("Error uploading new Report form.", error);
        alert("Failed to upload New Report Form. Please try again.");
    }

// Event Listener after Submit Button is clicked
document.addEventListener("DOMContentLoaded", function () {
    // Submit Report
    const submitReportButton = document.getElementById("submitReport");
    if(submitReportButton) {
        submitReportButton.addEventListener("click", async (event) => {
            event.preventDefault();

            const title = document.getElementById("report-title-name").value;
            const location = document.getElementById("location-name").value;
            const date = document.getElementById("report-date").value;
            const time = document.getElementById("report-time").value;
            const roadProblemType = document.getElementById().value;
            const problemSummary = document.getElementById("message-text").value;
            
            await writeNewReport();
            redirectToMain();
        })
    } else {
        console.warn("Submit button not found.");
    }
})
}








