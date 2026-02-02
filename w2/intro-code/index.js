// Lightweight HTTP server for serving static assets and responding to geolocation lookups.
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

const app = express();
const port = 3000;

// Host client files (HTML, JS, CSS) from the public directory.
app.use(express.static("public"));

const options = { verbose: console.log };
const db = new Database("database.db", options);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loc TEXT, 
  temp REAL NUMBER,
  humidity REAL NUMBER,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
  `);

const API_KEY = process.env.API_KEY;

// Echo back the provided coordinates so the front end can display server acknowledgement.
app.get("/getweather", async (req, res) => {
  const { latitude, longitude } = req.query;

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    res.send(data);
    //  console.log(data);
  } catch (error) {
    console.log(error);
  }

  res.send();
});

// POST method route
app.post("/submit", express.json(), (req, res) => {
  const data = req.body;
  const stmt = db.prepare(
    "INSERT INTO submissions (loc, temp, humidity, name) VALUES (?,?,?,?)",
  );
  stmt.run(data.loc, data.temp, data.humidity, data.name);
  res.send("POST request to the homepage");
});

// Start listening for HTTP requests once the server is configured.
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
