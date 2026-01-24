if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {

    

    let { latitude, longitude } = position.coords;
  

    // fetchServer(latitude,longitude)
   fetchServer(latitude, longitude).then((data) => {
    console.log(data);
   });

      document.getElementById("location").innerText = `Latitude: ${latitude}, Longitude ${longitude}`

  });

} else {
  console.log("Location not available")
}


async function fetchServer(lat, lon){

  // lat = latitude;
  // lon = longitude;

const response = await fetch(`/api?latitude=${lat}&longitude=${lon}`)
const data = await response.text();
// console.log(data);
return data;
}