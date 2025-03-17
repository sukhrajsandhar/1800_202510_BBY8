// Import Firebase configuration
import { auth, db } from './firebaseAPI_TEAM08.js';

// Object to store marker references
let markers = new Map();

// Define marker colors for different problem types
const markerColors = {
    Construction: '#ff7043',
    Hazard: '#ffca28',
    Police: '#42a5f5',
    Crash: '#e53935'
};

// Function to create a marker element
function createMarkerElement(type) {
    const markerColor = markerColors[type] || '#78909c'; // Default color for unknown types
    
    const markerHtml = `
        <div class="marker-pin" style="background-color: ${markerColor};">
            <span class="marker-icon">
                ${getIconForType(type)}
            </span>
        </div>
    `;
    
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = markerHtml;
    return el;
}

// Function to get icon for different problem types
function getIconForType(type) {
    switch (type) {
        case 'Construction':
            return '<i class="bi bi-cone-striped"></i>';
        case 'Hazard':
            return '<i class="bi bi-exclamation-triangle"></i>';
        case 'Police':
            return '<i class="bi bi-shield"></i>';
        case 'Crash':
            return '<i class="bi bi-car-front"></i>';
        default:
            return '<i class="bi bi-geo-alt"></i>';
    }
}

// Function to create popup content
function createPopupContent(report) {
    const date = report.date || 'N/A';
    const time = report.time || 'N/A';
    const types = Array.isArray(report.roadProblemTypes) ? report.roadProblemTypes.join(', ') : 'None';
    
    return `
        <div class="report-popup">
            <h5>${report.title || 'Untitled Report'}</h5>
            <p><strong>Location:</strong> ${report.location || 'No location specified'}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Type:</strong> ${types}</p>
            <p><strong>Summary:</strong> ${report.problemSummary || 'No summary provided'}</p>
        </div>
    `;
}

// Function to add a marker to the map
function addMarker(map, report, coordinates) {
    // Create marker element
    const markerElement = createMarkerElement(report.roadProblemTypes[0]);
    
    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(createPopupContent(report));
    
    // Create and add the marker
    const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map);
    
    // Store marker reference
    markers.set(report.id, marker);
}

// Function to load and display all report markers
export async function loadReportMarkers(map) {
    try {
        // Clear existing markers
        markers.forEach(marker => marker.remove());
        markers.clear();
        
        // Get all reports from Firestore
        const querySnapshot = await db.collection('reports')
            .where('status', '==', 'active')
            .get();
        
        console.log(`Found ${querySnapshot.size} active reports`);
        
        // Add markers for each report
        querySnapshot.forEach(doc => {
            const report = doc.data();
            report.id = doc.id;
            
            console.log('Processing report:', {
                id: report.id,
                title: report.title,
                location: report.location,
                coordinates: report.coordinates
            });
            
            // Try to get coordinates from the report data
            let coordinates = null;
            
            // First try the coordinates field
            if (report.coordinates && Array.isArray(report.coordinates) && report.coordinates.length === 2) {
                coordinates = report.coordinates;
                console.log('Using array coordinates:', coordinates);
            }
            // If that fails, try parsing it as a string
            else if (report.coordinates && typeof report.coordinates === 'string') {
                try {
                    const parsed = JSON.parse(report.coordinates);
                    if (Array.isArray(parsed) && parsed.length === 2) {
                        coordinates = parsed;
                        console.log('Using parsed string coordinates:', coordinates);
                    }
                } catch (e) {
                    console.warn(`Could not parse coordinates string for report ${report.id}`);
                }
            }
            
            if (coordinates) {
                addMarker(map, report, coordinates);
                console.log('Added marker for report:', report.id);
            } else {
                console.warn(`Report ${report.id} has invalid or missing coordinates:`, report.coordinates);
            }
        });
    } catch (error) {
        console.error('Error loading report markers:', error);
    }
}

// Add marker styles to the document
const style = document.createElement('style');
style.textContent = `
    .custom-marker {
        width: 35px;
        height: 35px;
    }
    
    .marker-pin {
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        background: #00cae9;
        position: absolute;
        transform: rotate(-45deg);
        left: 50%;
        top: 50%;
        margin: -15px 0 0 -15px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .marker-icon {
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
    }
    
    .report-popup {
        padding: 10px;
        max-width: 300px;
    }
    
    .report-popup h5 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #333;
    }
    
    .report-popup p {
        margin: 5px 0;
        font-size: 14px;
    }
`;
document.head.appendChild(style); 