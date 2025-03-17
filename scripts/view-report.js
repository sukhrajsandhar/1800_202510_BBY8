// Import Firebase configuration
import { auth, db } from './firebaseAPI_TEAM08.js';

// Helper function to format dates
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Cache for usernames
const userNameCache = new Map();

// Get username from Firebase
async function getUserName(userId) {
    try {
        if (userNameCache.has(userId)) {
            return userNameCache.get(userId);
        }

        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        let name = 'Anonymous User';

        if (userData && userData.firstName && userData.lastName) {
            name = `${userData.firstName} ${userData.lastName}`;
        }

        userNameCache.set(userId, name);
        return name;
    } catch (error) {
        console.error('Error getting username:', error);
        return 'Anonymous User';
    }
}

// Create the report card HTML
async function createReportView(report) {
    const reporterName = await getUserName(report.userId);
    const problemTypes = Array.isArray(report.roadProblemTypes) ? report.roadProblemTypes.join(', ') : 'None';
    
    return `
        <div class="card">
            <div class="card-body">
                <h2 class="card-title">${report.title || 'Untitled Report'}</h2>
                <h6 class="card-subtitle mb-3 text-muted">${report.location || 'No location specified'}</h6>
                
                <div class="report-details mb-4">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Date:</strong> ${report.date || 'N/A'}</p>
                            <p><strong>Time:</strong> ${report.time || 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Problem Types:</strong> ${problemTypes}</p>
                            <p><strong>Reported by:</strong> ${reporterName}</p>
                        </div>
                    </div>
                </div>

                <div class="problem-summary">
                    <h5>Problem Summary</h5>
                    <p>${report.problemSummary || 'No summary provided'}</p>
                </div>

                <div class="card-footer text-muted mt-3">
                    Created: ${formatDate(report.createdAt)}
                </div>
            </div>
        </div>
    `;
}

// Load and display the report
async function loadReport() {
    const reportContainer = document.getElementById('report-container');
    
    try {
        // Get report ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const reportId = urlParams.get('id');

        if (!reportId) {
            reportContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    No report ID specified. Please check your link and try again.
                </div>
            `;
            return;
        }

        // Get report from Firebase
        const reportDoc = await db.collection('reports').doc(reportId).get();
        
        if (!reportDoc.exists) {
            reportContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    Report not found. It may have been deleted or the link might be incorrect.
                </div>
            `;
            return;
        }

        const report = { id: reportDoc.id, ...reportDoc.data() };
        const reportHTML = await createReportView(report);
        reportContainer.innerHTML = reportHTML;

    } catch (error) {
        console.error('Error loading report:', error);
        reportContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <p>Error loading the report: ${error.message}</p>
                <button class="btn btn-primary mt-2" onclick="window.location.reload()">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', loadReport); 