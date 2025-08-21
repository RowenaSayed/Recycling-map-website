var map = L.map("map").setView([28, 32], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let centers = [];
let markers = [];

fetch("recyclingCentersData.json")
    .then((res) => res.json())
    .then((data) => {
        centers = data;
        renderMarkers(centers);
    });

function getMaterialIconClass(material) {
    switch (material) {
        case "Plastics": return "fas fa-bottle-droplet";
        case "Glass": return "fas fa-wine-bottle";
        case "Paper": return "fas fa-scroll";
        case "Electronics": return "fas fa-tv";
        case "Textiles": return "fas fa-shirt";
        case "Organics": return "fas fa-leaf";
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
          <a href="https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}" target="_blank" class="directions-btn btn btn-success text-white text-decoration-none w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none">Get Directions</a>
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

document.querySelectorAll(".material-item").forEach((item) => {
    item.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelectorAll(".material-item.active").forEach((activeItem) =>
            activeItem.classList.remove("active")
        );
        const material = this.getAttribute("data-material") || "All Materials";
        document.querySelectorAll(`[data-material="${material}"]`).forEach(
            (matchingItem) => {
                matchingItem.classList.add("active");
            }
        );
        if (!this.getAttribute("data-material")) {
            document.querySelectorAll(".material-item").forEach((allItem) => {
                if (!allItem.getAttribute("data-material")) {
                    allItem.classList.add("active");
                }
            });
        }
        if (material === "All Materials") {
            renderMarkers(centers);
        } else {
            const filtered = centers.filter((c) => c.materials.includes(material));
            renderMarkers(filtered);
        }
    });
});

window.addEventListener("resize", () => {
    setTimeout(() => {
        map.invalidateSize();
    }, 250);
});

setTimeout(() => {
    map.invalidateSize();
}, 100);
