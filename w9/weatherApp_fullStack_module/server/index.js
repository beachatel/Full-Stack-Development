import express from "express";
import dotenv from "dotenv";
import Database from "better-sqlite3";

// Server config
dotenv.config();
const app = express();
const port = 3000;
const apiKey = process.env.API_KEY;
// Insert JSON middleware
app.use(express.json());

// Database config
const db = new Database("favourites.db");

// Create data table
db.prepare(
  `CREATE TABLE IF NOT EXISTS favourites(id INTEGER PRIMARY KEY AUTOINCREMENT,
  placename TEXT NOT NULL
  )`,
).run();

// Resolve a place name to coordinates, then fetch weather for the top match.
async function geocoding(placename) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${placename}&limit=5&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    // OpenWeather geocoding returns a list of matches; use the first result.
    const { name, lat, lon } = data[0];
    const weather = await getWeatherData(lat, lon);
    return { name, weather };
  } catch {
    // Ignore fetch/parse errors so failed lookups do not break the app.
  }
}

// Fetch One Call weather data and pass it to the forecast renderer.
async function getWeatherData(lat, lon) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

app.get("/weather", async (req, res) => {
  console.log(req.query);
  const { placename } = req.query;
  const data = await geocoding(placename);

  res.send(data);
});

app.post("/addFavourite", (req, res) => {
  console.log("This is the add favourites endpoint");
  const { placename } = req.body;
  console.log(placename);
  db.prepare("INSERT INTO favourites (placename) VALUES (?)").run(placename);
  res.json({ Success: true, data: req.body });
});

app.get("/getFavourites", (req, res) => {
  console.log("This is the get favourites endpoint");
  const favourites = db.prepare("SELECT * FROM favourites").all();
  res.json({ success: true, data: favourites });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port} `);
});
