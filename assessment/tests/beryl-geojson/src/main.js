let myMap;

myMap = L.map("mapCanvas", {
  center: [53.4808, -2.2426],
  zoom: 10,
  minZoom: 9,
  maxZoom: 50,
});
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 100,
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(myMap);

const size = 5;
const icon = L.divIcon({
  className: "bus-marker",
  html: `
          <div class="bus-marker" style="width:${size}px; height:${size}px;">
            <span class="bus-label"></span>
          </div>
        `,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});

fetch(
  "https://beryl-gbfs-production.web.app/v2_2/Greater_Manchester/free_bike_status.json",
)
  .then((response) => response.json())

  .then((responseData) => {
    for (let i = 0; i < responseData.data.bikes.length; i++) {
      console.log(responseData.data.bikes[i]);
    }

    const bikes = responseData.data.bikes;

    const layerGroup = L.featureGroup().addTo(myMap);

    bikes.forEach(({ lat, lon, bike_id, station_id, vehicle_type_id }) => {
      layerGroup.addLayer(
        L.marker([lat, lon], { icon }).bindPopup(
          `Bike ID: ${bike_id}`,
          `Station ID: ${station_id}`,
          `Bike Type: ${vehicle_type_id}`,
        ),
      );
    });

    myMap.fitBounds(layerGroup.getBounds());
  });

function getMarkerHtml() {
  const zoom = myMap.getZoom();
  const size = Math.max(15, Math.min(40, zoom * 2 + 10));
  return `
          <div class="bus-marker" style="width:${size}px; height:${size}px; display="block">
            <span class="bus-label"></span>
          </div>
        `;
}
