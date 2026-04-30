// Dependencies
import WaveSurfer from "wavesurfer.js";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Search, X, Activity } from "lucide-react";
import { ChromaprintContext } from "chromaprint-wasm";

// Component for audio playback and fingerprint generation
// WaveSurfer.js to allow waveform viz and scrubbing
// Chromaprint-wasm for generating AcoustID fingerprints

export default function AudioRecogniser({ file, url, onRecognize, onCancel }) {
  const containerRef = useRef(null);
  const waveSurferRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialise WaveSurfer when the URL changes
  useEffect(() => {
    if (!containerRef.current) return;
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#4f46e5",
      progressColor: "#6366f1",
      cursorColor: "#ffffff",
      barWidth: 2,
      barRadius: 3,
      height: 80,
    });
    ws.load(url).catch((e) => {
      if (e.name !== "AbortError") console.error(e);
    });
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    waveSurferRef.current = ws;
    return () => ws.destroy();
  }, [url]);

  // Generates an AcoustID fingerprint for the current audio file.
  // Decodes the audio to PCM (uncompressed digital audio), resamples it to 11025Hz then uses Chromaprint to generate the fingerprint
  const handleRecognize = async () => {
    setIsProcessing(true);
    try {
      const sampleRate = 11025; // Standard AcoustID sample rate
      const time = 120; // Analyze up to 120 seconds
      const context = new OfflineAudioContext(1, sampleRate * time, sampleRate);
      const audioBuffer = await context.decodeAudioData(
        await file.arrayBuffer(),
      );
      const data = audioBuffer.getChannelData(0).slice(0, sampleRate * time);

      // Convert Float32Array to Int16Array (needed for chromaprint-wasm)
      const pcm16 = new Int16Array(data.length);
      for (let i = 0; i < data.length; i++) {
        const s = Math.max(-1, Math.min(1, data[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      const cp = new ChromaprintContext();
      cp.feed(pcm16);
      await onRecognize(cp.finish(), Math.round(audioBuffer.duration));
    } catch (err) {
      alert("Error generating fingerprint");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card recognizer-box">
      <button onClick={onCancel} className="close-btn">
        <X size={16} />
      </button>
      <div
        className="flex justify-between items-center"
        style={{ marginBottom: "1rem" }}
      >
        <h3 style={{ fontWeight: 500 }}>Identification</h3>
        <div className="flex gap-2">
          <button
            onClick={() => waveSurferRef.current?.playPause()}
            className="btn"
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "0.5rem",
              borderRadius: "50%",
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={handleRecognize}
            disabled={isProcessing}
            className="btn btn-primary"
          >
            {isProcessing ? (
              <Activity size={18} className="spin" />
            ) : (
              <Search size={18} />
            )}
            {isProcessing ? "Processing..." : "Identify"}
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "0.5rem",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
