// Attempt to read coordinates if the browser exposes the geolocation API.
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    // Grab complementary data for the detected coordinates before updating the UI.
    getData(latitude, longitude).then((data) => {
      const locationDiv = document.getElementById("location");
      const tempDiv = document.getElementById("temperature");
      const humidDiv = document.getElementById("humidity");

      locationDiv.innerText = `Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}`;
      tempDiv.innerText = "temp: " + data.current.temp;
      humidDiv.innerText = "humidity: " + data.current.humidity;
    });
  });
} else {
  console.log("Geolocation is not supported by this browser.");
}

// Fetches server-side data tied to the provided latitude and longitude.
async function getData(latitude, longitude) {
  try {
    const response = await fetch(
      `/getweather?latitude=${latitude}&longitude=${longitude}`,
    );
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    // Provide visibility into request failures so issues bubble up quickly.
    console.error("Error fetching data from /api:", error);
  }
}

//  JavaScript to handle submit button

function submit() {
  const data = {
    loc: document.getElementById("location").innerText,
    temperature: document.getElementById("temperature").innerText,
    humidity: document.getElementById("humidity").innerText,
    name: document.getElementById("name").value,
  };
  sendToServer(data);
}

async function sendToServer(data) {
  try {
    const response = await fetch("/submit", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch {
    console.log(error);
  }
}
