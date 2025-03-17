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
async function createReportCard(report, docId) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    
    // make sure we have problem types to show
    const problemTypes = Array.isArray(report.roadProblemTypes) ? report.roadProblemTypes.join(', ') : 'None';
    
    // get who reported this
    const reporterName = await getUserName(report.userId);
    
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title mb-3">${report.title || 'Untitled Report'}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${report.location || 'No location specified'}</h6>
            <p class="card-text">
                <strong>Date:</strong> ${report.date || 'N/A'}<br>
                <strong>Time:</strong> ${report.time || 'N/A'}<br>
                <strong>Problem Types:</strong> ${problemTypes}<br>
                <strong>Summary:</strong> ${report.problemSummary || 'No summary provided'}
            </p>
            <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="text-muted">
                    Reported by: ${reporterName}<br>
                    Created: ${formatDate(report.createdAt)}
                </div>
                <div class="dropdown">
                    <button class="btn btn-outline-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-share"></i> Share
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><button class="dropdown-item share-native" type="button">
                            <i class="bi bi-share"></i> Share via...
                        </button></li>
                        <li><button class="dropdown-item share-discord disabled" type="button" title="Coming soon!">
                            <i class="bi bi-discord"></i> Discord <small class="text-muted">(Coming soon)</small>
                        </button></li>
                        <li><button class="dropdown-item share-twitter" type="button">
                            <i class="bi bi-twitter-x"></i> Twitter
                        </button></li>
                        <li><button class="dropdown-item share-instagram disabled" type="button" title="Coming soon!">
                            <i class="bi bi-instagram"></i> Instagram <small class="text-muted">(Coming soon)</small>
                        </button></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><button class="dropdown-item share-copy" type="button" onclick="event.preventDefault(); event.stopPropagation();">
                            <i class="bi bi-clipboard"></i> Copy Link
                        </button></li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Add click handlers for share buttons
    const baseUrl = window.location.href.split('/pages/')[0];
    const shareUrl = `${baseUrl}/pages/reports/shared-report.html?id=${docId}`;
    const shareText = `Check out this road report: ${report.title}`;

    // Native share button (includes iMessage, AirDrop on iOS)
    const nativeShareBtn = card.querySelector('.share-native');
    nativeShareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: report.title || 'Road Report',
                text: shareText,
                url: shareUrl
            }).catch(err => {
                console.error('Error sharing:', err);
                // If sharing fails, copy the link instead
                copyToClipboard(shareUrl);
                const originalHtml = nativeShareBtn.innerHTML;
                nativeShareBtn.innerHTML = '<i class="bi bi-check"></i> Link Copied!';
                setTimeout(() => {
                    nativeShareBtn.innerHTML = originalHtml;
                }, 1000);
            });
        } else {
            // If native sharing isn't supported, just copy the link instead
            copyToClipboard(shareUrl);
            const originalHtml = nativeShareBtn.innerHTML;
            nativeShareBtn.innerHTML = '<i class="bi bi-check"></i> Link Copied!';
            setTimeout(() => {
                nativeShareBtn.innerHTML = originalHtml;
            }, 1000);
        }
    });

    // Discord share
    const discordBtn = card.querySelector('.share-discord');
    discordBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any action
    });

    // Twitter share
    const twitterBtn = card.querySelector('.share-twitter');
    twitterBtn.addEventListener('click', () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank');
    });

    // Instagram share
    const instagramBtn = card.querySelector('.share-instagram');
    instagramBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent any action
    });

    // Copy link button
    const copyBtn = card.querySelector('.share-copy');
    copyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const originalHtml = copyBtn.innerHTML;
        try {
            await copyToClipboard(shareUrl);
            copyBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalHtml;
            }, 1000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    });

    return card;
}

// Helper function to copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Failed to copy text:', err);
        throw err; // Re-throw to handle in the click handler
    }
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
            const card = await createReportCard(report, doc.id);
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
    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadReports();
        } else {
            // Show login prompt instead of redirecting
            const reportsContainer = document.getElementById('reports-container');
            if (reportsContainer) {
                reportsContainer.innerHTML = `
                    <div class="text-center">
                        <div class="alert alert-info" role="alert">
                            <h4 class="alert-heading">Please Log In</h4>
                            <p>You need to be logged in to view all reports.</p>
                            <p>However, you can still view shared reports using direct links!</p>
                            <hr>
                            <a href="../auth/login-signup-page/login.html" class="btn btn-primary">
                                <i class="bi bi-box-arrow-in-right"></i> Log In
                            </a>
                            <a href="../auth/login-signup-page/signup.html" class="btn btn-outline-primary">
                                <i class="bi bi-person-plus"></i> Sign Up
                            </a>
                        </div>
                    </div>
                `;

                // Update profile link to login
                const profileLink = document.querySelector('a[href="../profile/Profile.html"]');
                if (profileLink) {
                    profileLink.href = '../auth/login-signup-page/login.html';
                    profileLink.innerHTML = `
                        <i class="bi bi-box-arrow-in-right"></i>
                        <span>Login</span>
                    `;
                }
            }
        }
    });
}); 