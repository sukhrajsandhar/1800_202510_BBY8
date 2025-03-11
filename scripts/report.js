// Import what we need from Firebase API
import { auth, db } from './firebaseAPI_TEAM08.js';

// Function to create new reports
async function writeNewReport(reportData) {
    try {
        // Get current user
        const user = auth.currentUser;
        if (!user) {
            throw new Error('You must be logged in to create a report');
        }

        // Create new report with user information
        const newReport = {
            ...reportData,
            userId: user.uid,
            userEmail: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };

        // Add to Firestore with auto-generated ID
        await db.collection("reports").add(newReport);
        console.log("✅ New report added to Firestore");
        
        // Show success message
        showMessage('Report submitted successfully!', 'success');
        
        // Close modal and redirect to reports page after short delay
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();
        setTimeout(() => {
            window.location.href = 'Reports.html';
        }, 1500);

    } catch (error) {
        console.error("❌ Error creating new report:", error);
        showMessage(error.message, 'danger');
    }
}

// Function to show messages to the user
function showMessage(message, type = 'info') {
    // Create message div if it doesn't exist
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

    // Hide message after 3 seconds
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

// Function to get selected checkbox values
function getSelectedProblemTypes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.id);
}

// Set today's date as the default value for the date input
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

// Event Listener for form submission
document.addEventListener("DOMContentLoaded", function () {
    // Check if user is logged in
    auth.onAuthStateChanged((user) => {
        if (!user) {
            console.log("❌ No user logged in");
            // Redirect to login if not logged in
            window.location.href = 'login-signup-page/login.html';
            return;
        }
    });

    // Set default date
    setDefaultDate();

    // Handle form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get form values
            const title = document.getElementById("report-title-name").value;
            const location = document.getElementById("location-name").value;
            const date = document.getElementById("report-date").value;
            const time = document.getElementById("report-time").value;
            const problemTypes = getSelectedProblemTypes();
            const problemSummary = document.getElementById("message-text").value;

            // Validate form
            if (!title || !location || !date || !time || problemTypes.length === 0 || !problemSummary) {
                showMessage('Please fill in all required fields', 'warning');
                return;
            }

            // Create report data object
            const reportData = {
                title,
                location,
                date,
                time,
                roadProblemTypes: problemTypes,
                problemSummary
            };

            // Submit report
            await writeNewReport(reportData);
        });
    } else {
        console.warn("⚠️ Report form not found");
    }
});

// Export functions for use in other files
export { writeNewReport };








