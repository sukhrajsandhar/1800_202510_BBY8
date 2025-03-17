import { MAPBOX_CONFIG } from './config.js';

// Initialize the Mapbox address autofill
function initializeLocationAutofill() {
    initializeModalSearch();
    initializeMapSearch();
}

function initializeModalSearch() {
    const locationInput = document.getElementById('location-name');
    const coordinatesInput = document.getElementById('location-coordinates');
    const locationContainer = locationInput?.parentElement;
    
    if (!locationInput || !locationContainer) return;

    // Initialize the geocoder with minimal configuration
    const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_CONFIG.ACCESS_TOKEN,
        mapboxgl: mapboxgl,
        countries: 'ca',
        marker: false,
        placeholder: 'Start typing an address...',
        flyTo: false
    });

    // Create a wrapper div for the geocoder
    const geocoderContainer = document.createElement('div');
    geocoderContainer.className = 'geocoder-container';
    locationContainer.insertBefore(geocoderContainer, locationInput);
    locationInput.style.display = 'none';

    // Add geocoder to the wrapper div
    geocoder.addTo(geocoderContainer);

    // Handle selection
    geocoder.on('result', (event) => {
        const result = event.result;
        
        if (result) {
            try {
                // Update the hidden input with the formatted address
                locationInput.value = result.place_name;
                
                // Store the coordinates as an array [longitude, latitude]
                const coordinates = result.center;
                coordinatesInput.value = JSON.stringify(coordinates);
                
                console.log('Selected location:', {
                    address: result.place_name,
                    coordinates: coordinates
                });
            } catch (error) {
                console.error('Error handling geocoder result:', error);
            }
        }
    });

    // Handle errors
    geocoder.on('error', (error) => {
        console.error('Geocoding error:', error);
    });

    // Clear the coordinates when the input is cleared
    geocoder.on('clear', () => {
        locationInput.value = '';
        coordinatesInput.value = '';
    });

    // Handle the modal being shown
    const modal = document.getElementById('exampleModal');
    if (modal) {
        modal.addEventListener('shown.bs.modal', () => {
            // Reset the geocoder input
            geocoder.clear();
            // Ensure the geocoder is properly displayed
            geocoderContainer.style.display = 'block';
        });
    }
}

function initializeMapSearch() {
    const searchBar = document.querySelector('.search-bar');
    if (!searchBar) return;

    // Remove any existing input and icon
    const existingInput = searchBar.querySelector('input');
    const existingIcon = searchBar.querySelector('i');
    if (existingInput) existingInput.remove();
    if (existingIcon) existingIcon.remove();

    // Initialize the geocoder with minimal configuration
    const geocoder = new MapboxGeocoder({
        accessToken: MAPBOX_CONFIG.ACCESS_TOKEN,
        mapboxgl: mapboxgl,
        countries: 'ca',
        marker: false,
        placeholder: 'Search location...',
        flyTo: false
    });

    // Add geocoder directly to the search bar
    geocoder.addTo(searchBar);

    // Style the geocoder to match your design
    const geocoderInput = searchBar.querySelector('.mapboxgl-ctrl-geocoder');
    if (geocoderInput) {
        geocoderInput.style.width = '100%';
        geocoderInput.style.maxWidth = 'none';
        geocoderInput.style.boxShadow = 'none';
        geocoderInput.style.border = 'none';
        geocoderInput.style.backgroundColor = 'transparent';
    }

    // Handle selection
    geocoder.on('result', (event) => {
        const result = event.result;
        if (result && window.mainMap) {
            try {
                window.mainMap.flyTo({
                    center: result.center,
                    zoom: 15
                });
            } catch (error) {
                console.error('Error handling map selection:', error);
            }
        }
    });

    // Handle errors
    geocoder.on('error', (error) => {
        console.error('Geocoding error:', error);
    });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLocationAutofill); 