// let's get what we need from Firebase
import { auth, db } from './firebaseAPI_TEAM08.js';

// this function helps us save new reports to Firebase
async function writeNewReport(reportData) {
    try {
        // first, make sure someone's logged in
        const user = auth.currentUser;
        if (!user) {
            throw new Error('hey there! looks like you need to log in first 😊');
        }

        // add some extra info about who's making the report
        const newReport = {
            ...reportData,
            userId: user.uid,
            userEmail: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };

        // save it to Firebase
        await db.collection("reports").add(newReport);
        console.log("awesome! your report has been saved ✨");
        
        // let them know it worked
        showMessage('Thanks for your report! Redirecting you now...', 'success');
        
        // close the form and head to the reports page
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();
        setTimeout(() => {
            window.location.href = 'Reports.html';
        }, 1500);

    } catch (error) {
        console.error("oops, something went wrong:", error);
        showMessage(error.message, 'danger');
    }
}

// shows a nice message to let users know what's happening
function showMessage(message, type = 'info') {
    // create a spot for our message if it doesn't exist
    let messageDiv = document.getElementById('reportMessage');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'reportMessage';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.right = '20px';
        messageDiv.style.zIndex = '9999';
        document.body.appendChild(messageDiv);
    }

    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';

    // make the message disappear after a bit
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// gets all the checked problem types from the form
function getSelectedProblemTypes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.id);
}

// sets today's date as the default
function setDefaultDate() {
    const dateInput = document.getElementById('report-date');
    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${year}-${month}-${day}`;
    }
}

// when the page loads, let's set everything up
document.addEventListener("DOMContentLoaded", function () {
    // make sure someone's logged in
    auth.onAuthStateChanged((user) => {
        if (!user) {
            console.log("hey friend! you'll need to log in first 👋");
            window.location.href = 'login-signup-page/login.html';
            return;
        }
    });

    // set today's date in the form
    setDefaultDate();

    // handle the form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // grab all the info from the form
            const title = document.getElementById("report-title-name").value;
            const location = document.getElementById("location-name").value;
            const date = document.getElementById("report-date").value;
            const time = document.getElementById("report-time").value;
            const problemTypes = getSelectedProblemTypes();
            const problemSummary = document.getElementById("message-text").value;

            // make sure everything's filled out
            if (!title || !location || !date || !time || problemTypes.length === 0 || !problemSummary) {
                showMessage('could you fill in all the fields? we need the details to help! 🙂', 'warning');
                return;
            }

            // package up all the report info
            const reportData = {
                title,
                location,
                date,
                time,
                roadProblemTypes: problemTypes,
                problemSummary
            };

            // send it off to Firebase
            await writeNewReport(reportData);
        });
    } else {
        console.warn("hmm, can't find the report form 🤔");
    }
});

// make these functions available to other files
export { writeNewReport };








