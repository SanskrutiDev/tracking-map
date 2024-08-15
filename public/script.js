const socket = io();

// Initialize the map and tile layer
const map = L.map("map").setView([18.5018, 73.9272], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "@ Shri Laxmi Classic Housing Society"
}).addTo(map);

const markers = {};

// Custom icon setup
const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Watch the user's location and emit it via Socket.io
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Handle receiving location updates from the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Set map view to the latest received coordinates
    map.setView([latitude, longitude]);

    // If a marker for this ID already exists, move it; otherwise, create a new marker
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    }
});

// Handle user disconnection
socket.on("user-disconnect", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
