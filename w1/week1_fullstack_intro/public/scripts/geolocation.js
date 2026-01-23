// Attempt to read coordinates if the browser exposes the geolocation API.
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    // Grab complementary data for the detected coordinates before updating the UI.
    getData(latitude, longitude).then((data) => {
      const locationDiv = document.getElementById("location");
      locationDiv.innerText = `Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}\nData from /api: ${data}`;
    });
  });
} else {
  console.log("Geolocation is not supported by this browser.");
}

// Fetches server-side data tied to the provided latitude and longitude.
async function getData(latitude, longitude) {
  try {
    const response = await fetch(
      `/api?latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}`,
    );
    const data = await response.text();
    return data;
  } catch (error) {
    // Provide visibility into request failures so issues bubble up quickly.
    console.error("Error fetching data from /api:", error);
  }
}
