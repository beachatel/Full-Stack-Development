import React, { useEffect, useState } from "react";
import { Edit3, FolderOpen, LogOut, Music, Search, Trash2 } from "lucide-react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import AudioRecogniser from "./components/AudioRecogniser";

const api = axios.create({ baseURL: "/api" });

// Main app
// Handles user authentication, track listing, folder management, and audio recognition

export default function App() {
  // Memory for login
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("trackidt_user")),
  );
  const [tracks, setTracks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [file, setFile] = useState(null);
  const [recognizing, setRecognizing] = useState(false);
  const [moving, setMoving] = useState(null);
  const [auth, setAuth] = useState({
    mode: "login",
    username: "",
    password: "",
    error: "",
  });

  // Fetches tracks and folders for the logged-in user from the API

  const load = async () => {
    if (!user) return;
    const [t, f] = await Promise.all([
      api.get("/tracks", { params: { userId: user.id } }),
      api.get("/folders", { params: { userId: user.id } }),
    ]);
    setTracks(t.data);
    setFolders(f.data);
  };

  useEffect(() => {
    load();
  }, [user]);

  // Handles user login or registration.

  const onAuth = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/auth/${auth.mode}`, {
        username: auth.username,
        password: auth.password,
      });
      localStorage.setItem("trackidt_user", JSON.stringify(data));
      setUser(data);
    } catch (err) {
      setAuth({ ...auth, error: err.response?.data?.error || "Failed" });
    }
  };

  // Audio recognition process
  // Sends the fingerprint to the server, parses the results, fetches metadata from MusicBrainz and saves the recognised track to the db

  const onRecognize = async (fingerprint, duration) => {
    setRecognizing(true);
    try {
      const { data } = await api.post("/recognize", { fingerprint, duration });
      let res = data.results?.find(
        (r) => r.recordings?.length || r.usermeta?.length || r.tracks?.length,
      );
      let rec, meta;

      if (res) {
        rec = res.recordings?.[0];
        const item = res.usermeta?.[0] || res.tracks?.[0];
        meta = item
          ? {
              title: item.title,
              artist: Array.isArray(item.artists)
                ? item.artists.map((a) => a.name || a).join(", ")
                : item.artist,
              album: item.album,
            }
          : null;
      } else {
        // Fallback to filename search if fingerprinting fails
        const { data: search } = await api.get("/mb-search", {
          params: { query: file.name },
        });
        rec = search.recordings?.[0];
        if (!rec) return alert("No match found");
      }

      const mb = rec ? (await api.get(`/mb/${rec.id}`)).data : {};
      const release = rec?.releases?.[0];

      // Create new track entry with metadata
      await api.post("/tracks", {
        id: uuidv4(),
        user_id: user.id,
        title: rec?.title || meta?.title || "Unknown",
        artist: rec
          ? rec.artists?.map((a) => a.name).join(", ") ||
            rec["artist-credit"]?.map((a) => a.name).join(", ")
          : meta?.artist || "Unknown",
        album: release?.title || meta?.album || "Unknown",
        year: release?.date?.slice(0, 4) || "N/A",
        label: release?.label || "N/A",
        bpm:
          mb.tags
            ?.find((t) => t.name.toLowerCase().includes("bpm"))
            ?.name.match(/\d+/)?.[0] || 0,
        tags: (mb.tags || []).map((t) => t.name).join(", "),
        acoustid_fingerprint_id: res?.id || "",
        metadata: {
          mbid: rec?.id,
          coverArtUrl: release?.id
            ? `https://coverartarchive.org/release/${release.id}/front-250`
            : "",
        },
      });
      load();
      setFile(null);
    } catch (err) {
      alert("Error");
    } finally {
      setRecognizing(false);
    }
  };

  const visible =
    selectedFolder === "All"
      ? tracks
      : tracks.filter((t) => t.folder_name === selectedFolder);

  if (!user)
    return (
      <div className="auth-overlay">
        <form onSubmit={onAuth} className="card auth-form">
          <h1>
            trackidt<span className="brand-dot">.</span>
          </h1>
          <input
            className="input"
            placeholder="Username"
            value={auth.username}
            onChange={(e) => setAuth({ ...auth, username: e.target.value })}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={auth.password}
            onChange={(e) => setAuth({ ...auth, password: e.target.value })}
          />
          {auth.error && <p className="error">{auth.error}</p>}
          <button className="btn btn-primary">
            {auth.mode === "login" ? "Login" : "Register"}
          </button>
          <button
            type="button"
            className="btn btn-logout"
            onClick={() =>
              setAuth({
                ...auth,
                mode: auth.mode === "login" ? "register" : "login",
              })
            }
          >
            {auth.mode === "login" ? "Need an account?" : "Have an account?"}
          </button>
        </form>
      </div>
    );

  return (
    <div className="container">
      <header>
        <h1>
          trackidt<span className="brand-dot">.</span>
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("trackidt_user");
            setUser(null);
          }}
          className="btn btn-logout"
        >
          <LogOut size={14} /> Logout ({user.username})
        </button>
      </header>

      {!file ? (
        <div
          onClick={() => document.getElementById("f").click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setFile(e.dataTransfer.files[0]);
          }}
          className="upload-zone"
        >
          <p>Drag or click to upload audio</p>
          <input
            id="f"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
          />
        </div>
      ) : (
        <AudioRecogniser
          file={file}
          url={URL.createObjectURL(file)}
          onRecognize={onRecognize}
          onCancel={() => setFile(null)}
        />
      )}

      {recognizing && <div className="pulse">Recognizing...</div>}

      <section className="track-list">
        <h2 className="flex items-center gap-2">
          <Music className="brand-dot" /> {selectedFolder}
        </h2>
        <div className="flex-col" style={{ marginTop: "1.5rem" }}>
          {visible.map((t) => {
            const meta = JSON.parse(t.metadata || "{}");
            return (
              <div key={t.id} className="track-row">
                <div className="track-info">
                  {meta.coverArtUrl ? (
                    <img src={meta.coverArtUrl} className="track-img" alt="" />
                  ) : (
                    <div className="track-img flex items-center justify-center">
                      <Music size={16} style={{ opacity: 0.2 }} />
                    </div>
                  )}
                  <div className="track-meta">
                    <p>{t.title}</p>
                    <p className="artist">
                      {t.artist} • {t.folder_name || "All"}
                    </p>
                  </div>
                </div>
                <div className="track-actions">
                  <div style={{ position: "relative" }}>
                    <button
                      className="btn"
                      onClick={() => setMoving(moving === t.id ? null : t.id)}
                      title="Move"
                    >
                      <FolderOpen size={14} />
                    </button>
                    {moving === t.id && (
                      <div className="menu">
                        {folders.map((f) => (
                          <button
                            key={f.name}
                            className="btn menu-item"
                            onClick={() => {
                              api
                                .patch(`/tracks/${t.id}`, {
                                  folder_name: f.name,
                                })
                                .then(load);
                              setMoving(null);
                            }}
                          >
                            {f.name}
                          </button>
                        ))}
                        <button
                          className="btn menu-item"
                          style={{ color: "var(--brand)" }}
                          onClick={() => {
                            const n = prompt("Name");
                            if (n)
                              api
                                .post("/folders", { user_id: user.id, name: n })
                                .then(load);
                          }}
                        >
                          + New
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    className="btn"
                    onClick={() => api.delete(`/tracks/${t.id}`).then(load)}
                    style={{ color: "#f87171" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="folder-grid">
        <div
          onClick={() => setSelectedFolder("All")}
          className={`card folder-card card-hover ${selectedFolder === "All" ? "active" : ""}`}
        >
          <h4>All Tracks</h4>
          <p>{tracks.length} tracks</p>
        </div>
        {folders.map((f) => (
          <div
            key={f.name}
            onClick={() => setSelectedFolder(f.name)}
            className={`card folder-card card-hover ${selectedFolder === f.name ? "active" : ""}`}
          >
            <h4>{f.name}</h4>
            <p>{f.count} tracks</p>
            <div className="folder-tools">
              <button
                className="btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const n = prompt("New name", f.name);
                  if (n)
                    api
                      .patch(`/folders/${f.name}`, {
                        user_id: user.id,
                        name: n,
                      })
                      .then(load);
                }}
              >
                <Edit3 size={12} />
              </button>
              <button
                className="btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete?"))
                    api
                      .delete(`/folders/${f.name}`, {
                        params: { userId: user.id },
                      })
                      .then(load);
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        <div
          onClick={() => {
            const n = prompt("Folder name");
            if (n)
              api.post("/folders", { user_id: user.id, name: n }).then(load);
          }}
          className="card folder-card new-folder"
        >
          <span>+</span>
          <p>New Folder</p>
        </div>
      </section>
    </div>
  );
}
