// Import Firebase configuration and Mapbox config
import { auth, db } from './firebaseAPI_TEAM08.js';
import { MAPBOX_CONFIG } from './config.js';

// Initialize Mapbox
mapboxgl.accessToken = MAPBOX_CONFIG.ACCESS_TOKEN;
let map = null;

// Initialize Firebase
async function initializeFirebase() {
    return new Promise((resolve, reject) => {
        try {
            // Check if Firebase is already initialized
            if (firebase.apps.length) {
                console.log('Firebase already initialized');
                resolve();
                return;
            }

            // Wait for auth to be ready
            const unsubscribe = auth.onAuthStateChanged(() => {
                unsubscribe();
                console.log('Firebase initialized successfully');
                resolve();
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error('Firebase initialization timeout'));
            }, 10000);
        } catch (error) {
            console.error('Firebase initialization error:', error);
            reject(error);
        }
    });
}

// Helper function to format dates
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    try {
        const date = timestamp.toDate();
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
}

// Get username from Firebase
async function getUserName(userId) {
    if (!userId) return 'Anonymous User';
    
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return 'Anonymous User';
        }
        const userData = userDoc.data();
        return userData && userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`
            : 'Anonymous User';
    } catch (error) {
        console.error('Error getting username:', error);
        return 'Anonymous User';
    }
}

// Create the report view with mini map
async function createReportView(report) {
    const reporterName = await getUserName(report.userId);
    const problemTypes = Array.isArray(report.roadProblemTypes) ? report.roadProblemTypes : [];
    
    // Get coordinates from the location string (assuming format: "lat,lng")
    let coordinates = null;
    if (report.coordinates) {
        console.log('Coordinates data:', report.coordinates);
        if (typeof report.coordinates === 'string') {
            coordinates = report.coordinates.split(',').map(coord => parseFloat(coord.trim()));
        } else if (Array.isArray(report.coordinates)) {
            coordinates = report.coordinates.map(coord => parseFloat(coord));
        } else if (report.coordinates.lat && report.coordinates.lng) {
            coordinates = [report.coordinates.lat, report.coordinates.lng];
        }
        console.log('Processed coordinates:', coordinates);
    }

    const reportHTML = `
        <div class="report-details mb-4">
            <h2 class="mb-3">${report.title || 'Untitled Report'}</h2>
            <div class="location-info mb-3">
                <i class="bi bi-geo-alt"></i>
                <strong>${report.location || 'No location specified'}</strong>
            </div>
            
            <!-- Mini Map -->
            <div id="mini-map" class="mini-map"></div>

            <div class="row mt-4">
                <div class="col-md-6">
                    <p><strong>Date:</strong> ${report.date || 'N/A'}</p>
                    <p><strong>Time:</strong> ${report.time || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Reported by:</strong> ${reporterName}</p>
                    <p><strong>Created:</strong> ${formatDate(report.createdAt)}</p>
                </div>
            </div>

            <div class="problem-types mb-3">
                <strong>Problem Types:</strong><br>
                ${problemTypes.map(type => `
                    <span class="badge bg-primary problem-type-badge">${type}</span>
                `).join('')}
            </div>

            <div class="problem-summary mt-4">
                <h5>Problem Summary</h5>
                <p>${report.problemSummary || 'No summary provided'}</p>
            </div>
        </div>
    `;

    const reportContainer = document.querySelector('#report-container .col-md-8');
    reportContainer.innerHTML = reportHTML;

    // Initialize mini map if we have coordinates
    if (coordinates && coordinates.length === 2) {
        map = new mapboxgl.Map({
            container: 'mini-map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: coordinates,
            zoom: 15
        });

        // Add marker
        new mapboxgl.Marker()
            .setLngLat(coordinates)
            .addTo(map);

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl());
    } else {
        document.getElementById('mini-map').innerHTML = 
            '<div class="alert alert-warning">Location coordinates not available</div>';
    }

    // Set up share buttons
    setupShareButtons(report);
}

// Setup share button functionality
function setupShareButtons(report) {
    const shareUrl = window.location.href;
    const shareText = `Check out this road report: ${report.title}`;

    // Twitter share
    document.querySelector('.share-twitter').addEventListener('click', () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank');
    });

    // Discord share
    document.querySelector('.share-discord').addEventListener('click', () => {
        const discordUrl = `https://discord.com/share?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(discordUrl, '_blank');
    });

    // Instagram share (copy to clipboard)
    document.querySelector('.share-instagram').addEventListener('click', async (e) => {
        await copyToClipboard(shareUrl);
        const button = e.currentTarget;
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="bi bi-instagram"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = originalHtml;
        }, 1000);
    });

    // Copy link
    document.querySelector('.share-copy').addEventListener('click', async (e) => {
        await copyToClipboard(shareUrl);
        const button = e.currentTarget;
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="bi bi-clipboard"></i> Copied!';
        setTimeout(() => {
            button.innerHTML = originalHtml;
        }, 1000);
    });
}

// Helper function to copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Failed to copy text:', err);
    }
}

// Load and display the report
async function loadReport() {
    try {
        // Get report ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const reportId = urlParams.get('id');

        if (!reportId) {
            showError('No report ID specified. Please check your link and try again.');
            return;
        }

        console.log('Loading report:', reportId);

        // Get report from Firebase
        const reportDoc = await db.collection('reports').doc(reportId).get()
            .catch(error => {
                console.error('Error fetching report:', error);
                if (error.code === 'permission-denied') {
                    throw new Error('Unable to access this report. Please check the link or try again later.');
                }
                if (error.code === 'unavailable') {
                    throw new Error('Network error. Please check your connection and try again.');
                }
                throw new Error('Unable to load the report. Please try refreshing the page.');
            });
        
        if (!reportDoc.exists) {
            showError('Report not found. It may have been deleted or the link might be incorrect.');
            return;
        }

        console.log('Report loaded successfully');
        const report = { id: reportDoc.id, ...reportDoc.data() };
        await createReportView(report);

    } catch (error) {
        console.error('Error loading report:', error);
        showError(error.message || 'Unable to load the report. Please try again later.');
    }
}

// Show error message
function showError(message) {
    const reportContainer = document.querySelector('#report-container .col-md-8');
    reportContainer.innerHTML = `
        <div class="alert alert-warning" role="alert">
            ${message}
        </div>
    `;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing application...');
        
        // Initialize Firebase first
        await initializeFirebase();
        console.log('Firebase initialized, loading report...');
        
        // Then load the report
        await loadReport();
        
        // Update UI based on auth state
        auth.onAuthStateChanged((user) => {
            const profileLink = document.querySelector('a[href="../profile/Profile.html"]');
            if (profileLink) {
                if (!user) {
                    // If not logged in, change profile link to login
                    profileLink.href = '../auth/login-signup-page/login.html';
                    profileLink.innerHTML = `
                        <i class="bi bi-box-arrow-in-right"></i>
                        <span>Login</span>
                    `;
                }
            }
        });
    } catch (error) {
        console.error('Error during initialization:', error);
        showError('Unable to initialize the application. Please try refreshing the page.');
    }
}); 