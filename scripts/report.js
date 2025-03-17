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

        // Get coordinates from the hidden input
        const coordinatesInput = document.getElementById('location-coordinates');
        let coordinates = null;
        
        if (!coordinatesInput?.value) {
            throw new Error('Please select a location from the suggestions');
        }
        
        try {
            coordinates = JSON.parse(coordinatesInput.value);
            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
                throw new Error('Invalid coordinates format');
            }
            console.log('Using coordinates for new report:', coordinates);
        } catch (error) {
            console.error('Error parsing coordinates:', error);
            throw new Error('Invalid location data. Please try selecting the location again.');
        }

        // Create new report with user information and coordinates
        const newReport = {
            ...reportData,
            userId: user.uid,
            userEmail: user.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active',
            coordinates: coordinates // Store as array [longitude, latitude]
        };

        console.log('Creating new report with data:', newReport);

        // Add to Firestore with auto-generated ID
        const docRef = await db.collection("reports").add(newReport);
        console.log("✅ New report added to Firestore with ID:", docRef.id);
        
        // Dispatch event for map markers
        document.dispatchEvent(new Event('reportAdded'));
        
        // Show success message
        showMessage('Report submitted successfully!', 'success');
        
        // Close modal and redirect to reports page after short delay
        const modal = bootstrap.Modal.getInstance(document.getElementById('exampleModal'));
        modal.hide();
        setTimeout(() => {
            window.location.href = '/pages/reports/Reports.html';
        }, 1500);

    } catch (error) {
        console.error("❌ Error creating new report:", error);
        showMessage(error.message, 'danger');
    }
}

// Function to show messages to the user
function showMessage(message, type = 'info') {
    const alertPlaceholder = document.getElementById('alert-placeholder') || document.createElement('div');
    alertPlaceholder.id = 'alert-placeholder';
    alertPlaceholder.style.position = 'fixed';
    alertPlaceholder.style.top = '20px';
    alertPlaceholder.style.left = '50%';
    alertPlaceholder.style.transform = 'translateX(-50%)';
    alertPlaceholder.style.zIndex = '1050';
    document.body.appendChild(alertPlaceholder);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    alertPlaceholder.appendChild(wrapper);

    // Remove the alert after 5 seconds
    setTimeout(() => {
        wrapper.firstElementChild.classList.remove('show');
        setTimeout(() => wrapper.remove(), 150);
    }, 5000);
}

// Function to get selected problem types
function getSelectedProblemTypes() {
    const checkboxes = document.querySelectorAll('input[name="roadProblemType"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Function to set default date and time to current moment
function setDefaultDateTime() {
    const dateInput = document.getElementById('report-date');
    const timeInput = document.getElementById('report-time');
    
    if (dateInput) {
        const now = new Date();
        // Format date in local time
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const localDate = `${year}-${month}-${day}`;
        
        dateInput.value = localDate;
        dateInput.min = localDate; // Can't select dates before today
        
        // Set max date to end of current year
        const maxDate = `${year}-12-31`;
        dateInput.max = maxDate;
    }
    
    if (timeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
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

    // Set default date and time
    setDefaultDateTime();

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

            // Debug log for form values
            console.log('Form values:', {
                title,
                location,
                date,
                time,
                problemTypes,
                problemSummary
            });

            // Validate form
            if (!title || !location || !date || !time || problemTypes.length === 0 || !problemSummary) {
                console.log('Missing fields:', {
                    title: !title,
                    location: !location,
                    date: !date,
                    time: !time,
                    problemTypes: problemTypes.length === 0,
                    problemSummary: !problemSummary
                });
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








