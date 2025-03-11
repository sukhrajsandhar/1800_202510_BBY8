
// Import our firebase config
import { firebaseConfig } from './config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
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
    }




//     db.collection("reports").doc(reports.uid).set({
//         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//         location: " ",
//         problemSummary: " ",
//         roadProblemType: " ",
//         date: " ",
//         time: " ",
//         title: " ",
//     }).then(function () {
//         console.log("New report added to firestore");
//         window.location.assign("main.html");
//     }).catch(function (error){
//         console.log("Error adding new report");
//     });
// }

// // Function to redirect after successful authentication
// function redirectToMain() {
//     console.log("🔄 Redirecting to main.html...");
//     setTimeout(() => {
//     window.location.href = "../main.html"; // Redirect after 2 seconds
//     }, 2000); // Redirect after 2 seconds
// }



// Ensure event listeners are added only after the DOM is loaded
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
