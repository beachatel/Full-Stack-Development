// Lightweight HTTP server for serving static assets and responding to geolocation lookups.
import express from "express";

const app = express();
const port = 3000;

// Host client files (HTML, JS, CSS) from the public directory.
app.use(express.static("public"));

// Echo back the provided coordinates so the front end can display server acknowledgement.
app.get("/api", (req, res) => {
  const { latitude, longitude } = req.query;
  console.log(`Received latitude: ${latitude}, longitude: ${longitude}`);
  res.send(`Received latitude: ${latitude}, longitude: ${longitude}`);
});

// Start listening for HTTP requests once the server is configured.
app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
