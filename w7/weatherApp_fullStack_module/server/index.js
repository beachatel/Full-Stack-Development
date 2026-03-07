import express from "express"; // import express (es6) in es5 it would be require
import dotenv from "dotenv";

dotenv.config();

const app = express(); // create a variable to hold express functions
const port = 3000; // declare port as 3000;
const apiKey = "process.env.apiKey,";

async function geocoding(placename) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${placename}&limit=5&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const { lat, lon } = data[0];
    getWeatherData(lat, lon);
  } catch {}
}

async function getWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
}

// get function takes two arguments: first is a string that is api endpoint
// second is anon function to execute
app.get("/weather", (request, response) => {
  const { placename } = request.query;
  geocoding(placename);

  //response.send("this is the weather API"); // send function sends text
  response.json({ message: "weather API" }); // json function sends json/objects
});

app.listen(3000, () => {
  // two arguments, first is port or host name
  // second is a anon function to log the server is listening
  console.log(`server is running on http://localhost${port}`);
});
