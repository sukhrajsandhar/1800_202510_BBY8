// grab what we need from Firebase
import { auth, db } from './firebaseAPI_TEAM08.js';

// helper function to make dates look nice
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// let's cache usernames so we don't keep asking Firebase for them
const userNameCache = new Map();

async function getUserName(userId) {
    try {
        // check if we already know this user's name
        if (userNameCache.has(userId)) {
            return userNameCache.get(userId);
        }

        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        let name = 'Anonymous User';

        if (userData && userData.firstName && userData.lastName) {
            name = `${userData.firstName} ${userData.lastName}`;
        }

        // remember this name for next time
        userNameCache.set(userId, name);
        return name;
    } catch (error) {
        console.error('oops, trouble getting the user name:', error);
        return 'Anonymous User';
    }
}

// creates a nice card to show each report
async function createReportCard(report) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    
    // make sure we have problem types to show
    const problemTypes = Array.isArray(report.roadProblemTypes) ? report.roadProblemTypes.join(', ') : 'None';
    
    // get who reported this
    const reporterName = await getUserName(report.userId);
    
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${report.title || 'Untitled Report'}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${report.location || 'No location specified'}</h6>
            <p class="card-text">
                <strong>Date:</strong> ${report.date || 'N/A'}<br>
                <strong>Time:</strong> ${report.time || 'N/A'}<br>
                <strong>Problem Types:</strong> ${problemTypes}<br>
                <strong>Summary:</strong> ${report.problemSummary || 'No summary provided'}
            </p>
            <div class="card-footer text-muted">
                Reported by: ${reporterName}<br>
                Created: ${formatDate(report.createdAt)}
            </div>
        </div>
    `;
    return card;
}

// loads and shows all the reports (will try again if it fails)
async function loadReports(retryCount = 0) {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.log("hey, looks like no one is logged in! 👋");
            window.location.href = 'login-signup-page/login.html';
            return;
        }

        const reportsContainer = document.getElementById('reports-container');
        if (!reportsContainer) {
            console.error('hmm, cant find where to put the reports 🤔');
            return;
        }

        // let people know we're working on it
        reportsContainer.innerHTML = '<h2 class="text-center mb-4">Getting the latest reports...</h2>';

        // grab all reports from Firebase
        const querySnapshot = await db.collection('reports')
            .orderBy('createdAt', 'desc')
            .get();

        if (querySnapshot.empty) {
            reportsContainer.innerHTML = '<h3 class="text-center">No reports yet - be the first to add one!</h3>';
            return;
        }

        // clear the loading message
        reportsContainer.innerHTML = '';

        // add each report to the page
        for (const doc of querySnapshot.docs) {
            const report = doc.data();
            const card = await createReportCard(report);
            reportsContainer.appendChild(card);
        }

    } catch (error) {
        console.error('uh oh, something went wrong loading reports:', error);
        
        // if something goes wrong, let's try again
        if (retryCount < 3 && (error.code === 'permission-denied' || error.code === 'unavailable')) {
            console.log(`no worries, trying again... (attempt ${retryCount + 1}/3)`);
            setTimeout(() => loadReports(retryCount + 1), 1000 * (retryCount + 1));
            return;
        }

        const reportsContainer = document.getElementById('reports-container');
        if (reportsContainer) {
            reportsContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <p>Oops! Had trouble loading the reports: ${error.message}</p>
                    <button class="btn btn-primary mt-2" onclick="window.location.reload()">
                        Try Loading Reports Again
                    </button>
                </div>
            `;
        }
    }
}

// start everything up when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // make sure someone's logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadReports();
        } else {
            window.location.href = 'login-signup-page/login.html';
        }
    });
}); 