// Dependencies
import "dotenv/config";
import cors from "cors";
import crypto from "crypto";
import express from "express";
import path from "path";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

// Init databse and create tables
const db = new Database("database.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS tracks (id TEXT PRIMARY KEY, title TEXT, artist TEXT, album TEXT, year TEXT, label TEXT, bpm INTEGER, tags TEXT, user_id TEXT, folder_name TEXT, acoustid_fingerprint_id TEXT, metadata TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS folders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, name));
`);

// Express config and headers for music brainz
const app = express();
const PORT = 3000;
const MUSICBRAINZ_HEADERS = {
  "User-Agent": "trackidt/1.0.0 ( contact@trackidt.app )",
};

// Password encrypt
const hash = (p) => {
  const s = crypto.randomBytes(16).toString("hex");
  return `scrypt:${s}:${crypto.scryptSync(p, s, 64).toString("hex")}`;
};

const verify = (p, sp) => {
  const [, s, sh] = sp.split(":");
  return crypto.timingSafeEqual(
    Buffer.from(sh, "hex"),
    crypto.scryptSync(p, s, 64),
  );
};

// Cross origin bypass
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Username and password auth endpoint
app.post("/api/auth/:mode", (req, res) => {
  const { username: u, password: p } = req.body;
  if (req.params.mode === "register") {
    try {
      const id = crypto.randomUUID();
      db.prepare(
        "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      ).run(id, u.trim(), hash(p));
      res.json({ id, username: u });
    } catch (e) {
      res.status(409).json({ error: "User exists" });
    }
  } else {
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(u?.trim());
    if (!user || !verify(p, user.password))
      return res.status(401).json({ error: "Invalid" });
    res.json({ id: user.id, username: user.username });
  }
});

// Folders endpoint
app.get("/api/folders", (req, res) =>
  res.json(
    db
      .prepare(
        "SELECT folders.name, COUNT(tracks.id) AS count FROM folders LEFT JOIN tracks ON tracks.user_id = folders.user_id AND tracks.folder_name = folders.name WHERE folders.user_id = ? GROUP BY folders.name",
      )
      .all(req.query.userId),
  ),
);
app.post("/api/folders", (req, res) => {
  db.prepare("INSERT OR IGNORE INTO folders (user_id, name) VALUES (?, ?)").run(
    req.body.user_id,
    req.body.name.trim(),
  );
  res.json({ success: true });
});
app.patch("/api/folders/:name", (req, res) => {
  db.prepare(
    "UPDATE tracks SET folder_name = ? WHERE user_id = ? AND folder_name = ?",
  ).run(req.body.name, req.body.user_id, req.params.name);
  db.prepare("UPDATE folders SET name = ? WHERE user_id = ? AND name = ?").run(
    req.body.name,
    req.body.user_id,
    req.params.name,
  );
  res.json({ success: true });
});
app.delete("/api/folders/:name", (req, res) => {
  db.prepare(
    "UPDATE tracks SET folder_name = NULL WHERE user_id = ? AND folder_name = ?",
  ).run(req.query.userId, req.params.name);
  db.prepare("DELETE FROM folders WHERE user_id = ? AND name = ?").run(
    req.query.userId,
    req.params.name,
  );
  res.json({ success: true });
});

// Tracks endpoint
app.get("/api/tracks", (req, res) =>
  res.json(
    db
      .prepare(
        "SELECT * FROM tracks WHERE user_id = ? ORDER BY created_at DESC",
      )
      .all(req.query.userId),
  ),
);
app.post("/api/tracks", (req, res) => {
  const t = req.body;
  db.prepare(
    "INSERT INTO tracks (id, title, artist, album, year, label, bpm, tags, user_id, folder_name, acoustid_fingerprint_id, metadata) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
  ).run(
    t.id,
    t.title,
    t.artist,
    t.album,
    t.year,
    t.label,
    t.bpm,
    t.tags,
    t.user_id,
    t.folder_name,
    t.acoustid_fingerprint_id,
    JSON.stringify(t.metadata),
  );
  res.json({ success: true });
});
app.patch("/api/tracks/:id", (req, res) => {
  const fields = Object.keys(req.body).filter((f) =>
    ["bpm", "tags", "folder_name"].includes(f),
  );
  db.prepare(
    `UPDATE tracks SET ${fields.map((f) => `${f} = ?`).join(",")} WHERE id = ?`,
  ).run(...fields.map((f) => req.body[f]), req.params.id);
  res.json({ success: true });
});
app.delete("/api/tracks/:id", (req, res) => {
  res.json(db.prepare("DELETE FROM tracks WHERE id = ?").run(req.params.id));
});

// Recognition endpoint
app.post("/api/recognize", async (req, res) => {
  try {
    const { data } = await axios.get("https://api.acoustid.org/v2/lookup", {
      params: {
        client: process.env.ACOUSTID_CLIENT_KEY,
        format: "json",
        meta: "recordings+releases+usermeta",
        fingerprint: req.body.fingerprint,
        duration: req.body.duration,
      },
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed" });
  }
});

app.get("/api/mb/:id", async (req, res) => {
  try {
    const { data } = await axios.get(
      `https://musicbrainz.org/ws/2/recording/${req.params.id}?fmt=json&inc=artists+releases+tags+genres`,
      { headers: MUSICBRAINZ_HEADERS },
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed" });
  }
});

// Search musicbrainz db
app.get("/api/mb-search", async (req, res) => {
  try {
    const q = req.query.query.replace(/\.[^/.]+$/, "").replace(/[_]+/g, " ");
    const { data } = await axios.get(
      `https://musicbrainz.org/ws/2/recording?fmt=json&query=${encodeURIComponent(q)}&limit=1`,
      { headers: MUSICBRAINZ_HEADERS },
    );
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed" });
  }
});

// Load from dist when in production // npm run build - npm run start
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
  app.get("*", (req, res) => res.sendFile(path.resolve("dist/index.html")));
}

app.listen(PORT, "0.0.0.0", () => console.log(`Server: ${PORT}`));
