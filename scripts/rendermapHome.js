
var map = L.map("map").setView([28, 32], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let centers = [];
let markers = [];
let currentFilter = "";

const sampleData = [
    {
        name: "Eco-Hub Community Center",
        address: "123 Green Street, EcoVille",
        lat: 28.1,
        lng: 32.1,
        materials: ["Plastics", "Glass", "Paper"],
        hours: {
            Monday: "9:00 AM - 5:00 PM",
            Tuesday: "9:00 AM - 5:00 PM",
            Wednesday: "9:00 AM - 5:00 PM",
            Thursday: "9:00 AM - 5:00 PM",
            Friday: "9:00 AM - 5:00 PM",
            Saturday: "10:00 AM - 2:00 PM",
            Sunday: "Closed"
        },
        phone: "+1 (555) 123-4567",
        website: "www.ecohub-center.com"
    },
    {
        name: "Sustainable City Depot",
        address: "45 River Road, Sustainburg",
        lat: 28.2,
        lng: 32.2,
        materials: ["Metal", "Electronics", "Batteries"],
        hours: {
            Monday: "8:00 AM - 6:00 PM",
            Tuesday: "8:00 AM - 6:00 PM",
            Wednesday: "8:00 AM - 6:00 PM",
            Thursday: "8:00 AM - 6:00 PM",
            Friday: "8:00 AM - 6:00 PM",
            Saturday: "9:00 AM - 3:00 PM",
            Sunday: "Closed"
        },
        phone: "+1 (555) 987-6543",
        website: "www.sustainablecitydepot.org"
    },
    {
        name: "Urban Recycle Point",
        address: "789 Main Avenue, Metro City",
        lat: 28.3,
        lng: 32.3,
        materials: ["Textiles", "Hazardous Waste"],
        hours: {
            Monday: "10:00 AM - 4:00 PM",
            Tuesday: "10:00 AM - 4:00 PM",
            Wednesday: "10:00 AM - 4:00 PM",
            Thursday: "10:00 AM - 4:00 PM",
            Friday: "10:00 AM - 4:00 PM",
            Saturday: "Closed",
            Sunday: "Closed"
        },
        phone: "+1 (555) 456-7890",
        website: "www.urbanrecyclepoint.com"
    },
    {
        name: "Northside Eco-Station",
        address: "10 Forest Lane, Woodland",
        lat: 28.4,
        lng: 32.4,
        materials: ["Organics", "Garden Waste"],
        hours: {
            Monday: "8:00 AM - 4:00 PM",
            Tuesday: "8:00 AM - 4:00 PM",
            Wednesday: "8:00 AM - 4:00 PM",
            Thursday: "8:00 AM - 4:00 PM",
            Friday: "8:00 AM - 4:00 PM",
            Saturday: "9:00 AM - 1:00 PM",
            Sunday: "Closed"
        },
        phone: "+1 (555) 234-5678",
        website: "www.northsideeco.com"
    },
    {
        name: "Central Park Collection",
        address: "22 Park Boulevard, Downtown",
        lat: 28.5,
        lng: 32.5,
        materials: ["Paper", "Glass"],
        hours: {
            Monday: "7:00 AM - 7:00 PM",
            Tuesday: "7:00 AM - 7:00 PM",
            Wednesday: "7:00 AM - 7:00 PM",
            Thursday: "7:00 AM - 7:00 PM",
            Friday: "7:00 AM - 7:00 PM",
            Saturday: "8:00 AM - 5:00 PM",
            Sunday: "8:00 AM - 2:00 PM"
        },
        phone: "+1 (555) 345-6789",
        website: "www.centralparkrecycle.org"
    }
];

// Use sample data if fetch fails
try {
    fetch("recyclingCentersData.json")
        .then((res) => res.json())
        .then((data) => {
            centers = data;
            renderMarkers(centers);
        })
        .catch(() => {
            centers = sampleData;
            renderMarkers(centers);
        });
} catch (e) {
    centers = sampleData;
    renderMarkers(centers);
}

function getMaterialIconClass(material) {
    switch (material) {
        case "Plastics": return "fas fa-bottle-water";
        case "Glass": return "fas fa-wine-bottle";
        case "Paper": return "fas fa-scroll";
        case "Electronics": return "fas fa-tv";
        case "Textiles": return "fas fa-shirt";
        case "Organics": return "fas fa-leaf";
        case "Metal": return "fas fa-microchip";
        case "Batteries": return "fas fa-battery-full";
        case "Hazardous Waste": return "fas fa-flask";
        case "Garden Waste": return "fas fa-leaf";
        default: return "fas fa-recycle";
    }
}

function getMaterialColor(material) {
    switch (material) {
        case "Plastics": return "#66bb6a";
        case "Glass": return "#4caf93";
        case "Paper": return "#9ccc65";
        case "Electronics": return "#388e3c";
        case "Textiles": return "#558b2f";
        case "Organics": return "#43a047";
        case "Metal": return "#78909c";
        case "Batteries": return "#ffa726";
        case "Hazardous Waste": return "#ef5350";
        case "Garden Waste": return "#7cb342";
        default: return "#28a745";
    }
}

function renderMarkers(data) {
    markers.forEach((m) => map.removeLayer(m));
    markers = [];

    data.forEach((center) => {
        const materialsHtml = center.materials
            .map((material) => {
                let icon = getMaterialIconClass(material);
                return `<div class="d-flex align-items-center gap-1 px-2 py-1 bg-light border rounded small text-dark"><i class="${icon}"></i>${material}</div>`;
            })
            .join("");

        const hoursHtml = Object.entries(center.hours || {})
            .map(
                ([day, time]) =>
                    `<div class="text-secondary">${day}:</div><div class="text-dark text-end">${time}</div>`
            )
            .join("");

        const popupHtml = `
    <div class="position-relative">
        <button class="btn-close position-absolute" style="top: 16px; right: 16px; z-index: 10;" onclick="map.closePopup()"></button>
        <div class="p-4 pb-3 border-bottom">
            <div class="fs-5 fw-semibold text-dark mb-1">${center.name}</div>
            <div class="text-secondary small d-flex align-items-center gap-1">
                <i class="fas fa-map-marker-alt"></i>${center.address}
            </div>
        </div>
        <div class="p-3">
            <div class="fw-semibold text-dark mb-2 small">Accepted Materials</div>
            <div class="d-flex flex-wrap gap-1 mb-3">${materialsHtml}</div>
            <div class="fw-semibold text-dark mb-2 small">Operating Hours</div>
            <div class="hours-grid mb-3 small">${hoursHtml}</div>
            <div class="fw-semibold text-dark mb-2 small">Contact Information</div>
            <div class="mb-3 small">
                <div class="d-flex align-items-center gap-2 mb-1 text-dark"><i class="fas fa-phone"></i>${center.phone}</div>
                <div class="d-flex align-items-center gap-2 text-dark"><i class="fas fa-globe"></i>${center.website}</div>
            </div>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}" target="_blank" class="directions-btn btn btn-success w-100 text-white text-decoration-none d-flex align-items-center justify-content-center gap-2 text-decoration-none">Get Directions</a>
        </div>
    </div>`;

        const mainMaterial = center.materials[0] || "";
        const iconClass = getMaterialIconClass(mainMaterial);
        const bgColor = getMaterialColor(mainMaterial);

        const customIcon = L.divIcon({
            html: `
    <div style="width: 40px; height: 40px; background: ${bgColor}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px ${bgColor}50;">
        <i class="${iconClass} text-white" style="font-size: 16px; transform: rotate(45deg);"></i>
    </div>`,
            className: "custom-div-icon",
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
        });

        const marker = L.marker([center.lat, center.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(popupHtml, { maxWidth: 350, className: "custom-popup", closeButton: false });

        markers.push(marker);
    });

    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
    }
}

// Search functionality
function performSearch(searchTerm) {
    if (!searchTerm.trim()) {
        if (currentFilter) {
            const filtered = centers.filter((c) => c.materials.includes(currentFilter));
            renderMarkers(filtered);
        } else {
            renderMarkers(centers);
        }
        return;
    }

    const term = searchTerm.toLowerCase();

    const results = centers.filter(center => {
        return (
            center.name.toLowerCase().includes(term) ||
            center.address.toLowerCase().includes(term) ||
            center.materials.some(material => material.toLowerCase().includes(term))
        );
    });

    const filteredResults = currentFilter ?
        results.filter(center => center.materials.includes(currentFilter)) :
        results;

    renderMarkers(filteredResults);
}

document.querySelectorAll(".material-item").forEach((item) => {
    item.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelectorAll(".material-item.active").forEach((activeItem) =>
            activeItem.classList.remove("active")
        );

        const material = this.getAttribute("data-material");
        this.classList.add("active");
        currentFilter = material;

        const searchInput = document.querySelector('.input-group input');
        const searchTerm = searchInput ? searchInput.value : '';

        if (!material) {
            performSearch(searchTerm);
        } else {
            const filtered = centers.filter((c) => c.materials.includes(material));
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const searched = filtered.filter(center =>
                    center.name.toLowerCase().includes(term) ||
                    center.address.toLowerCase().includes(term)
                );
                renderMarkers(searched);
            } else {
                renderMarkers(filtered);
            }
        }
    });
});

const mainSearchInput = document.querySelector('.input-group input');
const mainSearchButton = document.querySelector('.input-group .btn');

if (mainSearchInput && mainSearchButton) {
    mainSearchButton.addEventListener('click', () => {
        performSearch(mainSearchInput.value);
    });

    mainSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(mainSearchInput.value);
        }
    });
}

const navSearchInput = document.querySelector('.navbar .form-control');
const navSearchIcon = document.querySelector('.navbar .fa-search');

if (navSearchInput && navSearchIcon) {
    navSearchIcon.addEventListener('click', () => {
        performSearch(navSearchInput.value);
    });

    navSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(navSearchInput.value);
        }
    });
}

document.querySelector('.material-item[data-material=""]').classList.add('active');

window.addEventListener("resize", () => {
    setTimeout(() => {
        map.invalidateSize();
    }, 250);
});

setTimeout(() => {
    map.invalidateSize();
}, 100);
