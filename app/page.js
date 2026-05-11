"use client";
import { useState, useRef, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0A0A; color: #F0EDE6; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
  :root { --accent: #E63946; --bg: #0A0A0A; --surface: #141414; --border: #2A2A2A; --text: #F0EDE6; --muted: #888; }
  .app { max-width: 780px; margin: 0 auto; padding: 0 24px 80px; }
  .header { padding: 40px 0 0; display: flex; align-items: flex-start; justify-content: space-between; }
  .logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: var(--accent); }
  .live-badge { display: flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 11px; color: var(--accent); letter-spacing: 2px; }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: blink 1.2s ease-in-out infinite; }
  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
  .hero { padding: 48px 0 32px; text-align: center; }
  .hero h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(56px, 9vw, 96px); line-height: 0.92; letter-spacing: 2px; }
  .hero h1 span { color: var(--accent); }
  .hero-sub { margin-top: 16px; font-size: 15px; color: var(--muted); font-weight: 300; line-height: 1.6; }
  .divider { height: 1px; background: var(--border); margin: 0 0 40px; }
  .player-card { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 32px; margin-bottom: 24px; }
  .waveform { display: flex; align-items: center; gap: 3px; height: 48px; margin-bottom: 24px; }
  .bar { width: 3px; border-radius: 2px; background: var(--border); transition: background 0.1s; }
  .bar.active { background: var(--accent); }
  .controls { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .play-btn { width: 52px; height: 52px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; transition: all 0.15s; }
  .play-btn:hover { border-color: var(--accent); }
  .play-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .progress-wrap { flex: 1; }
  .progress { width: 100%; height: 3px; background: var(--border); border-radius: 2px; appearance: none; cursor: pointer; }
  .progress::-webkit-slider-thumb { appearance: none; width: 13px; height: 13px; border-radius: 50%; background: var(--accent); cursor: pointer; }
  .time { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--muted); min-width: 80px; text-align: right; }
  .script-box { background: #0F0F0F; border: 1px solid var(--border); border-radius: 3px; padding: 24px; margin-bottom: 24px; min-height: 120px; }
  .script-label { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; }
  .script-text { font-size: 15px; color: #ccc; line-height: 1.8; white-space: pre-wrap; }
  .script-placeholder { color: #444; font-style: italic; font-size: 14px; }
  .kpi-section { margin-bottom: 32px; }
  .kpi-section-label { font-family: 'DM Mono', monospace; font-size: 10px; color: #555; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 10px; text-align: center; }
  .kpi-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 10px; }
  .kpi { background: var(--surface); border: 1px solid var(--border); border-radius: 3px; padding: 14px 16px; width: 170px; flex-shrink: 0; }
  .kpi-label { font-size: 11px; color: var(--muted); margin-bottom: 4px; text-align: center; }
  .kpi-val { font-size: 20px; font-weight: 500; color: var(--text); text-align: center; }
  .kpi-change { font-size: 12px; margin-top: 2px; text-align: center; }
  .kpi-date { font-size: 10px; color: #555; margin-top: 3px; font-family: 'DM Mono', monospace; text-align: center; }
  .up { color: #4DFF91; }
  .down { color: var(--accent); }
  .ticker-wrap { overflow: hidden; border-top: 1px solid var(--border); padding-top: 12px; margin-bottom: 32px; }
  .ticker { display: flex; gap: 40px; white-space: nowrap; animation: scroll 12s linear infinite; }
  .ticker-item { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--muted); }
  .ticker-item span { color: var(--text); font-weight: 500; }
  @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  .btn { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; padding: 13px 28px; border: none; cursor: pointer; transition: all 0.15s; border-radius: 2px; }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: #ff5560; }
  .btn-primary:disabled { background: #333; color: #555; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--muted); color: var(--text); }
  .btn-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: center; }
  .status { font-size: 13px; color: var(--muted); margin-top: 10px; min-height: 18px; text-align: center; }
  .voice-badge { font-family: 'DM Mono', monospace; font-size: 10px; color: #4DFF91; letter-spacing: 2px; margin-top: 6px; text-align: center; }
`;

const bars = Array.from({ length: 52 }, () => Math.random() * 30 + 8);

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ":" + (sec < 10 ? "0" : "") + sec;
}

const KpiCard = ({ k }) => (
  <div className="kpi">
    <div className="kpi-label">{k.label}</div>
    <div className="kpi-val">{k.val}</div>
    {k.change && <div className={"kpi-change " + (k.change.startsWith("+") ? "up" : "down")}>{k.change.startsWith("+") ? "▲" : "▼"} {k.change}</div>}
    {k.date && <div className="kpi-date">{k.date}</div>}
  </div>
);

export default function HomePage() {
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeDisplay, setTimeDisplay] = useState("0:00 / 0:00");
  const [kpis, setKpis] = useState(null);
  const [ticker, setTicker] = useState([]);
  const audioRef = useRef(null);
  const audioBase64Ref = useRef(null);

  const defaultKpis = Array(10).fill({ label: "—", val: "—", change: "", date: "" });

  useEffect(() => {
    fetch("/api/kpis")
      .then((r) => r.json())
      .then((data) => {
        if (data.kpis) setKpis(data.kpis);
        if (data.ticker) setTicker(data.ticker);
      })
      .catch(() => {});
  }, []);

  const displayKpis = kpis || defaultKpis;

  const generate = async () => {
    setLoading(true);
    setScript("");
    setStatus("Fetching live data and writing script...");
    setGenerated(false);
    setSpeaking(false);
    setProgress(0);
    setTimeDisplay("0:00 / 0:00");
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    try {
      const res = await fetch("/api/broadcast", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScript(data.script);
      setGenerated(true);
      if (data.audio) {
        audioBase64Ref.current = data.audio;
        setUseElevenLabs(true);
        setStatus("AI voice ready. Press play to hear the broadcast.");
      } else {
        setUseElevenLabs(false);
        setStatus("Script ready. Press play to hear the broadcast.");
      }
    } catch (e) {
      setStatus("Error: " + e.message);
    }
    setLoading(false);
  };

  const speak = () => {
    if (!generated) return;
    if (useElevenLabs && audioBase64Ref.current) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setSpeaking(false);
        setStatus("Paused.");
        return;
      }
      if (!audioRef.current) {
        const audio = new Audio("data:audio/mpeg;base64," + audioBase64Ref.current);
        audioRef.current = audio;
        audio.addEventListener("timeupdate", () => {
          if (audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100);
            setTimeDisplay(formatTime(audio.currentTime) + " / " + formatTime(audio.duration));
          }
        });
        audio.addEventListener("ended", () => {
          setSpeaking(false);
          setStatus("Broadcast complete.");
          setProgress(0);
        });
      }
      audioRef.current.play();
      setSpeaking(true);
      setStatus("On air...");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setStatus("Paused.");
      return;
    }
    const utter = new SpeechSynthesisUtterance(script);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onend = () => { setSpeaking(false); setStatus("Broadcast complete."); };
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
    setStatus("On air...");
  };

  const copy = () => {
    if (script) { navigator.clipboard.writeText(script); setStatus("Script copied to clipboard."); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div className="logo">RETAIL RADIO</div>
          <div className="live-badge"><div className="live-dot" /> LIVE DATA</div>
        </header>
        <section className="hero">
          <h1>THE MARKETS<br /><span>ARE TALKING.</span><br />WE TRANSLATE.</h1>
          <p className="hero-sub">AI-generated retail market analysis — written and broadcast in seconds.</p>
        </section>
        <div className="divider" />

        <div className="kpi-section">
          <div className="kpi-section-label">// Retail Sales</div>
          <div className="kpi-row">
            {displayKpis.slice(0, 3).map((k, i) => <KpiCard key={i} k={k} />)}
          </div>
          <div className="kpi-section-label" style={{marginTop: "16px"}}>// Categories</div>
          <div className="kpi-row">
            {displayKpis.slice(3, 6).map((k, i) => <KpiCard key={i} k={k} />)}
          </div>
          <div className="kpi-section-label" style={{marginTop: "16px"}}>// Consumer Health</div>
          <div className="kpi-row">
            {displayKpis.slice(6, 10).map((k, i) => <KpiCard key={i} k={k} />)}
          </div>
        </div>

        <div className="ticker-wrap">
          <div className="ticker">
            {ticker.length > 0 && [...ticker, ...ticker].map((item, i) => (
              <div className="ticker-item" key={i}>
                {item.label}: <span>{item.val}</span>{item.change ? ` — ${item.change}` : ""}
              </div>
            ))}
          </div>
        </div>

        <div className="player-card">
          <div className="waveform">
            {bars.map((h, i) => (
              <div key={i} className={"bar" + (speaking ? " active" : "")} style={{ height: h + "px" }} />
            ))}
          </div>
          <div className="controls">
            <button className="play-btn" onClick={speak} disabled={!generated}>
              {speaking ? "⏸" : "▶"}
            </button>
            <div className="progress-wrap">
              <input
                type="range" className="progress" min="0" max="100"
                value={progress} step="0.1"
                onChange={(e) => {
                  if (audioRef.current && audioRef.current.duration) {
                    audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration;
                    setProgress(parseFloat(e.target.value));
                  }
                }}
              />
            </div>
            <span className="time">{speaking ? timeDisplay : "0:00"}</span>
          </div>
          {useElevenLabs && generated && (
            <div className="voice-badge">● ELEVENLABS AI VOICE</div>
          )}
        </div>

        <div className="script-box">
          <div className="script-label">Broadcast Script</div>
          {script
            ? <div className="script-text">{script}</div>
            : <div className="script-placeholder">Your AI-generated broadcast script will appear here...</div>
          }
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={generate} disabled={loading}>
            {loading ? "Generating..." : "Generate Broadcast"}
          </button>
          {generated && (
            <button className="btn btn-ghost" onClick={copy}>Copy Script</button>
          )}
        </div>
        <div className="status">{status}</div>
      </div>
    </>
  );
}
