// VisionSense AI - Enterprise Monitoring & Human Decision Console
// Built with React 18, Tailwind CSS

const { useState, useEffect } = React;

// --- HIGH-FIDELITY SVG SURVEILLANCE SNAPSHOT GENERATOR ---
function SurveillanceSnapshot({ type, rule }) {
  const getGraphic = () => {
    switch (type) {
      case 'Exam Hall':
        return (
          <svg className="w-full h-full" viewBox="0 0 600 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="360" fill="#0d131f" />
            <path d="M0 240 L600 240" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="60" y="140" width="120" height="70" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="240" y="140" width="120" height="70" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="420" y="140" width="120" height="70" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <circle cx="120" cy="110" r="22" fill="#334155" />
            <circle cx="300" cy="110" r="22" fill="#ef4444" fillOpacity="0.4" stroke="#ef4444" strokeWidth="2" />
            <circle cx="480" cy="110" r="22" fill="#334155" />
            <rect x="90" y="155" width="30" height="40" fill="#475569" rx="2" />
            <rect x="270" y="155" width="30" height="40" fill="#94a3b8" rx="2" />
            <rect x="450" y="155" width="30" height="40" fill="#475569" rx="2" />
            <rect x="315" y="165" width="16" height="26" rx="3" fill="#ef4444" className="animate-pulse" />
          </svg>
        );
      case 'Malls / Shops':
        return (
          <svg className="w-full h-full" viewBox="0 0 600 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="360" fill="#0b1120" />
            <rect x="40" y="60" width="140" height="220" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="420" y="60" width="140" height="220" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <rect x="60" y="90" width="100" height="15" fill="#06b6d4" opacity="0.6" />
            <rect x="60" y="130" width="100" height="15" fill="#3b82f6" opacity="0.6" />
            <rect x="60" y="170" width="100" height="15" fill="#8b5cf6" opacity="0.6" />
            <circle cx="280" cy="140" r="26" fill="#ef4444" fillOpacity="0.3" stroke="#ef4444" strokeWidth="2" />
            <path d="M250 240 L270 170 L290 170 L310 240" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
            <rect x="290" y="185" width="24" height="20" fill="#ef4444" rx="3" />
          </svg>
        );
      case 'Traffic Signals and Toll Plaza':
        return (
          <svg className="w-full h-full" viewBox="0 0 600 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="360" fill="#090d16" />
            <path d="M200 0 L150 360" stroke="#334155" strokeWidth="4" />
            <path d="M400 0 L450 360" stroke="#334155" strokeWidth="4" />
            <path d="M300 0 L300 360" stroke="#f59e0b" strokeWidth="3" strokeDasharray="12 12" />
            <line x1="160" y1="200" x2="440" y2="200" stroke="#ef4444" strokeWidth="6" />
            <rect x="240" y="140" width="120" height="80" rx="12" fill="#1e293b" stroke="#ef4444" strokeWidth="3" />
            <circle cx="265" cy="155" r="8" fill="#f59e0b" />
            <circle cx="335" cy="155" r="8" fill="#f59e0b" />
          </svg>
        );
      case 'Railway':
        return (
          <svg className="w-full h-full" viewBox="0 0 600 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="360" fill="#080c14" />
            <rect x="0" y="0" width="600" height="180" fill="#1e293b" />
            <line x1="0" y1="180" x2="600" y2="180" stroke="#f59e0b" strokeWidth="6" strokeDasharray="16 8" />
            <rect x="0" y="186" width="600" height="174" fill="#0f172a" />
            <line x1="0" y1="230" x2="600" y2="230" stroke="#475569" strokeWidth="4" />
            <line x1="0" y1="290" x2="600" y2="290" stroke="#475569" strokeWidth="4" />
            <circle cx="320" cy="230" r="20" fill="#ef4444" fillOpacity="0.4" stroke="#ef4444" strokeWidth="2" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full" viewBox="0 0 600 360" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="360" fill="#1e293b" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#090d16] flex items-center justify-center">
      {getGraphic()}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>
    </div>
  );
}

// --- 4 ENVIRONMENTS DATA PRESETS ---
// --- 4 ENVIRONMENTS: display metadata only. Alerts are no longer
// hardcoded here — they come live from the backend (GET /api/events/recent
// on load, then pushed in real time over /ws/alerts). This is the core of
// turning this from a static mock frontend into a dynamic one. ---
const ENVIRONMENTS_DATA = {
  "Exam Hall": { name: "Exam Hall", icon: "building-2", totalCameras: 12 },
  "Malls / Shops": { name: "Malls / Shops", icon: "shopping-bag", totalCameras: 24 },
  "Traffic Signals and Toll Plaza": { name: "Traffic Signals & Toll Plaza", icon: "car", totalCameras: 18 },
  "Railway": { name: "Railway", icon: "train-front", totalCameras: 16 },
};

// Maps the frontend's display keys to the `environment` slug each
// detection service reports under (see Mall/ExamHall/railway/Traffic
// app/config.py ENVIRONMENT values and docker-compose.yml).
const ENV_SLUGS = {
  "Exam Hall": "exam_hall",
  "Malls / Shops": "mall",
  "Traffic Signals and Toll Plaza": "traffic",
  "Railway": "railway",
};
const SLUG_TO_ENV_KEY = Object.fromEntries(
  Object.entries(ENV_SLUGS).map(([key, slug]) => [slug, key])
);

const HUMANIZE = (label) =>
  (label || "UNKNOWN")
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");

const SEVERITY_TO_PRIORITY = { critical: "High", high: "High", medium: "Medium", low: "Low" };
const STATUS_LABEL = { pending: "Pending", approved: "Approved", dismissed: "Dismissed", escalated: "Escalated", false_positive: "False Positive" };

const DEFAULT_BBOX = { top: "30%", left: "35%", width: "30%", height: "35%" };

// API helpers are defined in api.js (loaded before this file).
// fetchRecentAlerts, submitDecision, and connectAlertsSocket are all
// available from that file. The local wrappers below add try/catch
// resilience so the UI never crashes on a failed fetch.

async function fetchRecentAlertsSafe(limit = 200) {
  try {
    return await fetchRecentAlerts(limit);
  } catch (err) {
    console.warn("fetchRecentAlerts failed, returning empty list:", err);
    return [];
  }
}

async function submitDecisionSafe(eventId, status, comment) {
  // Backend schema (AlertDecision) requires the key to be 'decision',
  // not 'status'. This wrapper translates the call correctly.
  try {
    return await submitDecision(eventId, status, comment);
  } catch (err) {
    console.warn("submitDecision failed:", err);
  }
}

// Converts a raw AlertOut from the backend (see app/schemas/events.py)
// into the shape the existing UI components expect (mirrors the fields
// the old mock ENVIRONMENTS_DATA alerts used: rule, ruleShort, keyframes,
// aiModel, bbox as percentage strings, etc).
function mapAlertFromApi(apiAlert) {
  if (!apiAlert) return null;
  const detectedAt = apiAlert.detected_at ? new Date(apiAlert.detected_at) : new Date();

  let bbox = DEFAULT_BBOX;
  if (apiAlert.bbox && apiAlert.bbox.frame_width && apiAlert.bbox.frame_height) {
    bbox = {
      top: `${((apiAlert.bbox.y1 / apiAlert.bbox.frame_height) * 100).toFixed(1)}%`,
      left: `${((apiAlert.bbox.x1 / apiAlert.bbox.frame_width) * 100).toFixed(1)}%`,
      width: `${(((apiAlert.bbox.x2 - apiAlert.bbox.x1) / apiAlert.bbox.frame_width) * 100).toFixed(1)}%`,
      height: `${(((apiAlert.bbox.y2 - apiAlert.bbox.y1) / apiAlert.bbox.frame_height) * 100).toFixed(1)}%`,
    };
  }

  const ruleName = HUMANIZE(apiAlert.activity_type || apiAlert.activity_label || "Detection");

  return {
    id: `ALT-${apiAlert.id ?? Math.floor(Math.random() * 10000)}`,
    dbId: apiAlert.id,
    rule: ruleName,
    ruleShort: ruleName || "Detection",
    priority: SEVERITY_TO_PRIORITY[apiAlert.severity] || "Medium",
    status: STATUS_LABEL[apiAlert.status] || "Pending",
    camera: apiAlert.camera_name || "Camera Feed",
    location: apiAlert.camera_name || "Zone Alpha",
    time: detectedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: detectedAt.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    confidence: Math.round((apiAlert.confidence ?? 0.85) * 100),
    aiModel: "YOLO11n + Rule Engine",
    description: `AI detected "${ruleName}" on ${apiAlert.camera_name || "Camera"} (track #${apiAlert.track_id ?? 'n/a'}).`,
    keyframes: [{ id: 1, time: "00:00", label: "Detection" }],
    bbox,
    snapshotUrl: apiAlert.snapshot_url || null,
    clipUrl: apiAlert.clip_url || null,
    environment: apiAlert.environment || "exam_hall",
    jsonLog: apiAlert.json_log || null,
  };
}

// Main App Component
function App() {
  const [currentTab, setCurrentTab] = useState("live-monitoring");
  const [selectedEnvKey, setSelectedEnvKey] = useState("Exam Hall");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const currentEnv = ENVIRONMENTS_DATA[selectedEnvKey] || ENVIRONMENTS_DATA["Exam Hall"];

  // Live alerts grouped by environment display key, e.g. { "Exam Hall": [...] }.
  // Populated from GET /api/events/recent on mount, then kept current by the
  // /ws/alerts WebSocket subscription below — this replaces the old
  // hardcoded ENVIRONMENTS_DATA[...].alerts mock arrays entirely.
  const [liveAlertsByEnv, setLiveAlertsByEnv] = useState({});
  const [decisionLog, setDecisionLog] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const alerts = (liveAlertsByEnv[selectedEnvKey] || []).filter(Boolean);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const severityRank = { High: 3, Medium: 2, Low: 1 };
  const filteredAlerts = alerts
    .filter((alert) => severityFilter === "ALL" || alert.priority === severityFilter)
    .sort((a, b) => (severityRank[b.priority] || 0) - (severityRank[a.priority] || 0) || b.confidence - a.confidence);
  // No live camera-registry endpoint is wired into the UI yet, so this
  // estimates "online" as distinct cameras seen reporting so far; falls
  // back to the full count when nothing has reported yet this session.
  const onlineCamerasCount = new Set(alerts.map(a => a.camera)).size || currentEnv.totalCameras;
  const [selectedAlertId, setSelectedAlertId] = useState("");
  const [activeKeyframeIndex, setActiveKeyframeIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // ── Video Source state ──────────────────────────────────────────────────────
  // sourceMode: "file" | "stream"
  const [sourceMode, setSourceMode] = useState("file");
  // sourceStatus: "idle" | "uploading" | "connecting" | "active" | "error"
  const [sourceStatus, setSourceStatus] = useState("idle");
  const [sourceError, setSourceError] = useState(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [activeSourceUrl, setActiveSourceUrl] = useState("");

  // Clip-popup: shows a floating preview for the latest incoming alert that
  // has a real snapshot attached, so the operator notices immediately.
  const [clipPopupAlert, setClipPopupAlert] = useState(null);

  // Authentication & Admin State
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [metrics, setMetrics] = useState({
    pending: 0,
    today: 0,
    approved: 0,
    dismissed: 0,
    escalated: 0,
  });

  // ── Source control handlers ────────────────────────────────────────────────

  const handleSourceUpload = async () => {
    if (!uploadFile) { setSourceError("Please select a video file."); return; }
    const envSlug = ENV_SLUGS[selectedEnvKey];
    if (!envSlug) { setSourceError("Unknown environment."); return; }
    setSourceStatus("uploading");
    setSourceError(null);
    try {
      const result = await uploadVideoSource(uploadFile, envSlug);
      setActiveSourceUrl(result.source || "");
      setSourceStatus("active");
    } catch (err) {
      setSourceError(err.message || "Upload failed.");
      setSourceStatus("error");
    }
  };

  const handleStreamConnect = async () => {
    const url = streamUrl.trim();
    if (!url) { setSourceError("Please enter a stream URL."); return; }
    const envSlug = ENV_SLUGS[selectedEnvKey];
    if (!envSlug) { setSourceError("Unknown environment."); return; }
    setSourceStatus("connecting");
    setSourceError(null);
    try {
      await setStreamSource(envSlug, url);
      setActiveSourceUrl(url);
      setSourceStatus("active");
    } catch (err) {
      setSourceError(err.message || "Connection failed.");
      setSourceStatus("error");
    }
  };

  const handleSourceStop = async () => {
    const envSlug = ENV_SLUGS[selectedEnvKey];
    if (!envSlug) return;
    try {
      await setStreamSource(envSlug, "none");
    } catch (_) {}
    setSourceStatus("idle");
    setActiveSourceUrl("");
    setSourceError(null);
  };

  // Initial load: pull whatever alerts already exist, then subscribe to
  // the live feed for anything reported after the page opened.
  useEffect(() => {
    let socket;

    fetchRecentAlertsSafe(200)
      .then((apiAlerts) => {
        if (!Array.isArray(apiAlerts)) return;
        const grouped = {};
        for (const raw of apiAlerts) {
          const envKey = SLUG_TO_ENV_KEY[raw.environment];
          if (!envKey) continue; // unknown environment slug, ignore
          const mapped = mapAlertFromApi(raw);
          if (!mapped || mapped.status !== "Pending") continue; // queue view only shows pending
          (grouped[envKey] = grouped[envKey] || []).push(mapped);
        }
        setLiveAlertsByEnv(grouped);
        setDecisionLog(Object.values(grouped).flat().map((a) => ({ id: a.id, rule: a.rule, camera: a.camera, status: a.status, confidence: a.confidence, date: a.date, operator: "AI" })));
      })
      .catch((err) => console.error("Failed to load recent alerts:", err));

    socket = connectAlertsSocket(
      (raw) => {
        if (!raw || !raw.environment) return;
        const envKey = SLUG_TO_ENV_KEY[raw.environment];
        if (!envKey) return;
        const mapped = mapAlertFromApi(raw);
        if (!mapped) return;
        setLiveAlertsByEnv((prev) => ({
          ...prev,
          [envKey]: [mapped, ...(prev[envKey] || [])],
        }));
        if (mapped.clipUrl || mapped.snapshotUrl) {
          setClipPopupAlert(mapped);
          setTimeout(() => setClipPopupAlert(null), 8000);
        }
      },
      setConnectionStatus
    );

    return () => socket && socket.close && socket.close();
  }, []);

  useEffect(() => {
    const currentAlerts = liveAlertsByEnv[selectedEnvKey] || [];
    if (currentAlerts.length > 0 && !currentAlerts.find((a) => a && a.id === selectedAlertId)) {
      setSelectedAlertId(currentAlerts[0]?.id ?? "");
      setActiveKeyframeIndex(0);
    }
    setMetrics((prev) => ({ ...prev, pending: currentAlerts.length }));
  }, [selectedEnvKey, liveAlertsByEnv, selectedAlertId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAlert = filteredAlerts.find(a => a.id === selectedAlertId) || filteredAlerts[0] || null;

  const handleDecision = (actionType) => {
    if (!activeAlert) return;

    const actionLabel = actionType === 'approve' ? 'Approved' : actionType === 'dismiss' ? 'Dismissed' : 'Escalated';

    setToastMessage({
      type: actionType,
      text: `Alert ${activeAlert.id} marked as ${actionLabel}.`
    });

    setTimeout(() => setToastMessage(null), 3500);

    setMetrics(prev => ({
      ...prev,
      pending: Math.max(0, prev.pending - 1),
      approved: actionType === 'approve' ? prev.approved + 1 : prev.approved,
      dismissed: actionType === 'dismiss' ? prev.dismissed + 1 : prev.dismissed,
      escalated: actionType === 'escalate' ? prev.escalated + 1 : prev.escalated,
    }));

    // Persist the human decision in the PostgreSQL event payload.
    const decisionStatus = actionType === 'approve' ? 'approved' : actionType === 'dismiss' ? 'dismissed' : 'escalated';
    submitDecisionSafe(activeAlert.dbId, decisionStatus, commentText)
      .catch((err) => console.error('Failed to save decision:', err));

    setDecisionLog(prev => [
      { ...activeAlert, status: actionLabel, operator: "Admin", date: activeAlert.date },
      ...prev,
    ].slice(0, 50));

    const updatedAlerts = alerts.filter(a => a.id !== activeAlert.id);
    setLiveAlertsByEnv(prev => ({ ...prev, [selectedEnvKey]: updatedAlerts }));
    setCommentText("");

    if (updatedAlerts.length > 0) {
      setSelectedAlertId(updatedAlerts[0].id);
      setActiveKeyframeIndex(0);
    } else {
      setSelectedAlertId("");
    }
  };

  const handleLogout = () => {
    setShowAdminMenu(false);
    setIsLoggedOut(true);
  };

  const handleLogin = () => {
    setIsLoggedOut(false);
    setToastMessage({
      type: 'approve',
      text: 'Admin Session Restored. Welcome back!'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0b0f17] text-gray-100 font-sans relative">

      {/* --- LOGOUT OVERLAY SCREEN WITH SLEEK SVG LOCK BADGE --- */}
      {isLoggedOut && (
        <div className="fixed inset-0 z-50 bg-[#0b0f17]/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-fadeIn">
          <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">

            {/* SVG BRAND LOCK GRAPHIC */}
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mx-auto shadow-xl shadow-blue-500/10">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">VisionSense AI</h2>
              <p className="text-xs text-gray-400 mt-1">Session Terminated • Security Console Locked</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0b0f17] border border-gray-800 text-left text-xs space-y-2.5">
              <div className="flex justify-between text-gray-400">
                <span>Last Operator:</span>
                <span className="text-white font-semibold">Admin (Chief Security Officer)</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Session Time:</span>
                <span className="font-mono-telemetry text-gray-300">23 Jul 2026, {currentTime}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Active System State:</span>
                <span className="text-emerald-400 font-semibold">● 100% Operational</span>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Log In as Admin</span>
            </button>

            <p className="text-[11px] text-gray-500">Secured with 256-bit AES Enterprise Encryption</p>
          </div>
        </div>
      )}

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-2xl glass-panel border border-gray-700 animate-bounce">
          {toastMessage.type === 'approve' && <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>}
          {toastMessage.type === 'dismiss' && <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>}
          {toastMessage.type === 'escalate' && <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></div>}
          <span className="text-sm font-medium text-white">{toastMessage.text}</span>
        </div>
      )}

      {/* --- TOP HEADER NAVBAR LAYER --- */}
      <header className="h-16 px-6 glass-header flex items-center justify-between z-30 shrink-0 border-b border-gray-800">

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <i data-lucide="shield" className="w-5 h-5 text-blue-400"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wide text-white">VisionSense AI</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 rounded pulse-radar">LIVE</span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Intelligent Monitoring System</p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-gray-800 mx-1"></div>

          {/* ENVIRONMENT DROPDOWN */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-gray-800 text-sm font-medium">
            <span className="text-gray-400 text-xs font-semibold">Environment:</span>
            <i data-lucide="building-2" className="w-4 h-4 text-blue-400"></i>
            <select
              value={selectedEnvKey}
              onChange={(e) => setSelectedEnvKey(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-sm pr-2"
            >
              <option value="Exam Hall" className="bg-[#111827]">Exam Hall</option>
              <option value="Malls / Shops" className="bg-[#111827]">Malls / Shops</option>
              <option value="Traffic Signals and Toll Plaza" className="bg-[#111827]">Traffic Signals and Toll Plaza</option>
              <option value="Railway" className="bg-[#111827]">Railway</option>
            </select>
          </div>

        </div>

        <div className="flex items-center gap-4">

          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${connectionStatus === 'connected'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : connectionStatus === 'connecting'
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${connectionStatus === 'connected' ? 'bg-emerald-500' : connectionStatus === 'connecting' ? 'bg-amber-500' : 'bg-red-500'
              }`}></span>
            <span>{connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting…' : 'Disconnected'}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-telemetry text-gray-300 bg-[#111827] px-3 py-1.5 rounded-lg border border-gray-800">
            <i data-lucide="calendar" className="w-3.5 h-3.5 text-gray-400"></i>
            <span>23 Jul 2026, {currentTime}</span>
          </div>

          {/* NOTIFICATIONS BELL */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowAdminMenu(false);
              }}
              className="relative p-2 rounded-lg bg-[#111827] border border-gray-800 hover:bg-gray-800 text-gray-300 transition cursor-pointer"
            >
              <i data-lucide="bell" className="w-4 h-4"></i>
              {metrics.pending > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border border-[#0b0f17]">
                  {metrics.pending}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#111827] border border-gray-800 rounded-xl shadow-2xl p-4 z-50 glass-panel">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
                  <h4 className="font-semibold text-sm text-white">System Notifications</h4>
                  <span className="text-xs text-blue-400 font-medium cursor-pointer">Clear All</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex gap-3 text-xs p-2 rounded bg-red-500/10 border border-red-500/20">
                    <i data-lucide="alert-triangle" className="w-4 h-4 text-red-400 shrink-0 mt-0.5"></i>
                    <div>
                      <p className="font-semibold text-red-400">Real-Time Threat Detected</p>
                      <p className="text-gray-300 text-[11px]">{alerts[0]?.rule || "High priority alert pending review"}</p>
                      <span className="text-[10px] text-gray-500">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* --- ADMIN PROFILE MENU DROPDOWN WITH HIGH-FIDELITY SVG ICONS --- */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAdminMenu(!showAdminMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg bg-[#111827] border border-gray-800 hover:bg-gray-800 transition cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 text-xs font-bold border border-blue-500/40 shrink-0">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-200">Admin</span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* ADMIN DROPDOWN POPOVER */}
            {showAdminMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#111827] border border-gray-700/80 rounded-2xl shadow-2xl p-4 z-50 glass-panel animate-fadeIn">

                {/* Header User Badge */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-800 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Chief Security Officer</h4>
                    <p className="text-[11px] text-gray-400">admin@visionsense.ai</p>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                      ● Shift Active
                    </span>
                  </div>
                </div>

                {/* Dropdown Items with SVG Icons */}
                <div className="space-y-1 text-xs">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/80 transition">
                    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Account Settings</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/80 transition">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Security SOP Protocols</span>
                  </button>

                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/80 transition">
                    <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span>Theme: Obsidian Dark</span>
                  </button>
                </div>

                {/* Log Out Button */}
                <div className="pt-3 mt-3 border-t border-gray-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold hover:bg-red-600 hover:text-white transition cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </header>

      {/* --- MAIN BODY WRAPPER --- */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-60 bg-[#0b0f17] border-r border-gray-800/80 flex flex-col justify-between p-4 shrink-0">
          <div className="space-y-6">
            <nav className="space-y-1.5">

              <button
                onClick={() => setCurrentTab("live-monitoring")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${currentTab === "live-monitoring"
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/5 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                  }`}
              >
                <i data-lucide="layout-dashboard" className="w-4 h-4"></i>
                <span>Live Monitoring</span>
              </button>

              <button
                onClick={() => setCurrentTab("alerts")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${currentTab === "alerts"
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <i data-lucide="bell" className="w-4 h-4"></i>
                  <span>Alerts</span>
                </div>
                {metrics.pending > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white font-bold text-xs rounded-full flex items-center justify-center">
                    {metrics.pending}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentTab("history")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${currentTab === "history"
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                  }`}
              >
                <i data-lucide="history" className="w-4 h-4"></i>
                <span>Alert History</span>
              </button>

              <button
                onClick={() => setCurrentTab("source")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${currentTab === "source"
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                  }`}
              >
                <i data-lucide="upload-cloud" className="w-4 h-4"></i>
                <span>Video Source</span>
              </button>

            </nav>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-800/80">
            <div className="p-3.5 rounded-xl bg-[#111827] border border-gray-800/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-400 font-medium">Environment</span>
                <i data-lucide="chevron-right" className="w-3.5 h-3.5 text-gray-500"></i>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <i data-lucide="building-2" className="w-4 h-4 text-blue-400"></i>
                <span className="text-sm font-bold text-white truncate">{currentEnv.name}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                <span>{currentEnv.totalCameras} Cameras</span>
                <span className="text-emerald-400 font-semibold">Online {onlineCamerasCount}/{currentEnv.totalCameras}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(onlineCamerasCount / (currentEnv.totalCameras || 1)) * 100}%` }}></div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            >
              <i data-lucide="log-out" className="w-4 h-4 text-red-400"></i>
              <span>Logout</span>
            </button>
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4 relative">

          {/* ALERT CLIP POPUP (TOAST) */}
          {clipPopupAlert && (
            <div className="absolute top-5 right-5 z-50 animate-fade-in-down w-80 bg-[#111827] border border-red-500/50 rounded-xl shadow-2xl shadow-red-500/20 overflow-hidden flex flex-col">
              <div className="bg-red-500/10 px-3 py-2 flex items-center justify-between border-b border-red-500/20">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  New Alert Detected
                </span>
                <button onClick={() => setClipPopupAlert(null)} className="text-gray-400 hover:text-white">
                  <i data-lucide="x" className="w-3.5 h-3.5"></i>
                </button>
              </div>
              <div className="p-3">
                <div className="h-32 bg-black rounded-lg overflow-hidden border border-gray-800 mb-2">
                  {clipPopupAlert.clipUrl ? (
                    <video src={clipPopupAlert.clipUrl} className="w-full h-full object-contain" muted autoPlay loop playsInline />
                  ) : (
                    <img src={clipPopupAlert.snapshotUrl} alt="Alert Clip" className="w-full h-full object-contain" />
                  )}
                </div>
                <h4 className="font-bold text-white text-sm">{clipPopupAlert.ruleShort}</h4>
                <p className="text-xs text-gray-400">{clipPopupAlert.location} • {clipPopupAlert.time}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { handleDecision('approve'); setClipPopupAlert(null); }} className="flex-1 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold hover:bg-emerald-600 hover:text-white transition">Approve</button>
                  <button onClick={() => { handleDecision('dismiss'); setClipPopupAlert(null); }} className="flex-1 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-xs font-semibold hover:bg-red-600 hover:text-white transition">Dismiss</button>
                </div>
              </div>
            </div>
          )}

          {currentTab === "live-monitoring" && (
            <>
              {/* TOP METRICS STRIP */}
              <div className="grid grid-cols-6 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[#111827] border border-red-500/30 card-glow-red flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-red-400">Pending Alerts</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{metrics.pending}</h3>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 inline-block">Needs Review</span>
                  </div>
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                    <i data-lucide="bell-ring" className="w-5 h-5"></i>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-blue-500/20 card-glow-blue flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-gray-400">Today's Alerts</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{metrics.today}</h3>
                    <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-flex items-center gap-1">
                      <i data-lucide="trending-up" className="w-3 h-3"></i> ↑ 12% vs yesterday
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <i data-lucide="activity" className="w-5 h-5"></i>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-emerald-500/20 card-glow-green flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-emerald-400">Approved</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{metrics.approved}</h3>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 inline-block">This Week</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <i data-lucide="check-circle-2" className="w-5 h-5"></i>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-amber-500/20 card-glow-orange flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-amber-400">Dismissed</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{metrics.dismissed}</h3>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 inline-block">This Week</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <i data-lucide="x-circle" className="w-5 h-5"></i>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-purple-500/20 card-glow-purple flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-purple-400">Escalated</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{metrics.escalated}</h3>
                    <span className="text-[11px] text-gray-400 font-medium mt-1 inline-block">This Week</span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <i data-lucide="upload-cloud" className="w-5 h-5"></i>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-cyan-500/20 card-glow-cyan flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-cyan-400">Active Cameras</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{onlineCamerasCount} / {currentEnv.totalCameras}</h3>
                    <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">All Online</span>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <i data-lucide="video" className="w-5 h-5"></i>
                  </div>
                </div>
              </div>

              {/* THREE-COLUMN CONSOLE */}
              <div className="grid grid-cols-12 gap-4 flex-1">

                {/* LEFT PANEL */}
                <div className="col-span-3 bg-[#111827] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        Pending Alerts ({filteredAlerts.length})
                      </h3>
                      <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="bg-[#0b0f17] text-gray-300 text-xs px-2 py-1 rounded border border-gray-800 outline-none">
                        <option value="ALL">High → Low</option>
                        <option value="High">High only</option>
                        <option value="Medium">Medium only</option>
                        <option value="Low">Low only</option>
                      </select>
                    </div>
                    <p className="text-[11px] text-gray-400 mb-3">Real-time alerts and AI detections</p>

                    <div className="space-y-3">
                      {filteredAlerts.map((alert) => {
                        const isSelected = activeAlert && alert.id === activeAlert.id;
                        return (
                          <div
                            key={alert.id}
                            onClick={() => {
                              setSelectedAlertId(alert.id);
                              setActiveKeyframeIndex(0);
                            }}
                            className={`p-3 rounded-xl cursor-pointer transition border relative overflow-hidden ${isSelected
                                ? "bg-[#161e2e] border-red-500 shadow-lg shadow-red-500/10"
                                : "bg-[#0b0f17]/60 border-gray-800/80 hover:bg-[#161e2e]/50 hover:border-gray-700"
                              }`}
                          >
                            <div className="flex gap-3 items-center">
                              <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-700/80 bg-black">
                                {alert.snapshotUrl ? (
                                  <img src={alert.snapshotUrl} alt="Alert Thumbnail" className="w-full h-full object-cover" />
                                ) : (
                                  <SurveillanceSnapshot type={selectedEnvKey} rule={alert.rule} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                                  <span className="text-[9px] font-bold text-white font-mono-telemetry truncate">{alert?.ruleShort ?? "No rule"}</span>
                                </div>
                                <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-500"></div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${alert?.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                                    {alert?.ruleShort ?? "No rule selected"}
                                  </span>
                                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${alert?.priority === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    }`}>
                                    {alert?.priority ?? "Medium"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 truncate">{alert?.location ?? ""}</p>
                                <span className="text-[10px] text-gray-500 font-mono-telemetry block mt-1">{alert?.time ?? ""}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {alerts.length === 0 && (
                        <div className="p-6 text-center text-gray-500 text-xs">
                          <i data-lucide="check-circle-2" className="w-8 h-8 mx-auto mb-2 text-emerald-500"></i>
                          All pending alerts resolved!
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab("alerts")}
                    className="w-full py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 border-t border-gray-800/80 pt-3 mt-3"
                  >
                    <span>View All Alerts</span>
                    <i data-lucide="arrow-right" className="w-3.5 h-3.5"></i>
                  </button>
                </div>

                {/* CENTER PANEL */}
                <div className="col-span-6 bg-[#111827] border border-gray-800 rounded-2xl p-5 flex flex-col max-h-[calc(100vh-120px)] overflow-y-auto">
                  {activeAlert ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            Alert Review
                          </h3>
                          <span className="px-2.5 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40 rounded-md">
                            High Priority
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
                          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                            <span>{activeAlert?.rule ?? "Detection"}</span>
                          </h2>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-400 pb-3 border-b border-gray-800/80 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <i data-lucide="building-2" className="w-3.5 h-3.5 text-blue-400"></i>
                            <span>{activeAlert?.location ?? ""}</span>
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="flex items-center gap-1.5 font-mono-telemetry">
                            <i data-lucide="clock" className="w-3.5 h-3.5 text-gray-400"></i>
                            <span>{activeAlert?.date ?? ""}</span>
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="font-mono-telemetry text-gray-400 font-semibold">Alert ID: {activeAlert?.id ?? ""}</span>
                        </div>
                      </div>

                      {/* SURVEILLANCE FEED CANVAS */}
                      <div className="relative my-3 rounded-xl overflow-hidden bg-[#090d16] border border-gray-800 h-64 shadow-2xl surveillance-grid flex items-center justify-center">
                        {activeAlert?.clipUrl ? (
                          <video src={activeAlert.clipUrl} className="max-w-full max-h-full object-contain" controls autoPlay={isPlaying} muted playsInline />
                        ) : activeAlert?.snapshotUrl ? (
                          <img src={activeAlert.snapshotUrl} alt="Alert Snapshot" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <SurveillanceSnapshot type={selectedEnvKey} rule={activeAlert?.rule} />
                        )}

                        <div className="ai-scanner-line"></div>

                        {showBoundingBox && activeAlert?.bbox && (
                          <div
                            className="ai-bounding-box"
                            style={{
                              top: activeAlert.bbox.top || "30%",
                              left: activeAlert.bbox.left || "35%",
                              width: activeAlert.bbox.width || "30%",
                              height: activeAlert.bbox.height || "35%"
                            }}
                          >
                            <span className="absolute -top-6 left-0 px-2 py-0.5 bg-red-600 text-white font-mono-telemetry text-[10px] font-bold rounded shadow-md whitespace-nowrap z-10">
                              {activeAlert?.ruleShort ?? "No rule selected"} {activeAlert?.confidence ?? 0}%
                            </span>
                          </div>
                        )}

                        <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono-telemetry text-white z-10">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          <span>CAM-LIVE • 4K UHD</span>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-white text-xs z-10">
                          <div className="flex items-center gap-3">
                            <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-blue-400">
                              <i data-lucide={isPlaying ? "pause" : "play"} className="w-4 h-4"></i>
                            </button>
                            <span className="font-mono-telemetry text-gray-300">00:03 / 00:10</span>
                          </div>

                          <div className="flex-1 mx-4 h-1 bg-gray-700/80 rounded-full overflow-hidden relative">
                            <div className="w-1/3 h-full bg-red-500"></div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button onClick={() => setShowBoundingBox(!showBoundingBox)} className="hover:text-blue-400 text-xs flex items-center gap-1">
                              <i data-lucide="scan" className="w-3.5 h-3.5"></i>
                              <span>AI Overlay</span>
                            </button>
                            <button className="hover:text-blue-400">
                              <i data-lucide="volume-2" className="w-4 h-4"></i>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* KEYFRAME SCRUBBER */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {(activeAlert?.keyframes || []).map((kf, idx) => (
                            <div
                              key={kf?.id || idx}
                              onClick={() => setActiveKeyframeIndex(idx)}
                              className={`relative flex-1 h-14 rounded-lg overflow-hidden cursor-pointer border transition ${activeKeyframeIndex === idx ? "keyframe-active" : "border-gray-800 opacity-60 hover:opacity-100"
                                }`}
                            >
                              {activeAlert?.snapshotUrl ? (
                                <img src={activeAlert.snapshotUrl} alt="Thumb" className="w-full h-full object-cover" />
                              ) : (
                                <SurveillanceSnapshot type={selectedEnvKey} />
                              )}
                              <div className="absolute bottom-0 inset-x-0 bg-black/85 px-1 py-0.5 text-center">
                                <p className="text-[9px] font-bold text-white truncate">{kf?.label ?? ""}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* COMMENTS INPUT */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-300 mb-1">
                          <span>Comments (Optional)</span>
                          <span className="text-gray-500 font-mono-telemetry">{commentText.length}/200</span>
                        </div>
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value.slice(0, 200))}
                          placeholder="Write your comments here..."
                          rows={2}
                          className="w-full px-3 py-1.5 rounded-xl bg-[#0b0f17] border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                        ></textarea>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => handleDecision('approve')}
                          className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <i data-lucide="check-circle-2" className="w-4 h-4"></i>
                            <span>Approve</span>
                          </div>
                          <span className="text-[10px] font-normal text-emerald-100 opacity-80">Confirm violation</span>
                        </button>

                        <button
                          onClick={() => handleDecision('dismiss')}
                          className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <i data-lucide="x-circle" className="w-4 h-4"></i>
                            <span>Dismiss</span>
                          </div>
                          <span className="text-[10px] font-normal text-red-100 opacity-80">False alarm</span>
                        </button>

                        <button
                          onClick={() => handleDecision('escalate')}
                          className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-600/20 transition flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <i data-lucide="alert-triangle" className="w-4 h-4"></i>
                            <span>Escalate</span>
                          </div>
                          <span className="text-[10px] font-normal text-amber-100 opacity-80">Need supervisor</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-500">
                      <i data-lucide="check-circle-2" className="w-12 h-12 mb-3 text-emerald-500"></i>
                      <h4 className="text-lg font-bold text-white mb-1">Environment Clear</h4>
                      <p className="text-xs text-gray-400">No active pending alerts for {currentEnv.name}.</p>
                    </div>
                  )}
                </div>

                {/* RIGHT PANEL */}
                <div className="col-span-3 bg-[#111827] border border-gray-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white border-b border-gray-800 pb-3 mb-3">
                      Alert Information
                    </h3>

                    {activeAlert ? (
                      <div className="space-y-3.5 text-xs">

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-800 text-blue-400 shrink-0">
                            <i data-lucide="building-2" className="w-4 h-4"></i>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[11px]">Environment</p>
                            <p className="font-semibold text-white mt-0.5">{currentEnv.name}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-800 text-blue-400 shrink-0">
                            <i data-lucide="shield-alert" className="w-4 h-4"></i>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[11px]">Rule / Activity</p>
                            <p className="font-semibold text-white mt-0.5">{activeAlert?.ruleShort ?? "No rule selected"}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-800 text-blue-400 shrink-0">
                            <i data-lucide="video" className="w-4 h-4"></i>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[11px]">Camera</p>
                            <p className="font-semibold text-white mt-0.5">{activeAlert?.camera ?? ""}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-800 text-blue-400 shrink-0">
                            <i data-lucide="clock" className="w-4 h-4"></i>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[11px]">Time Detected</p>
                            <p className="font-semibold text-white mt-0.5 font-mono-telemetry">{activeAlert?.date ?? ""}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-800 text-blue-400 shrink-0">
                            <i data-lucide="activity" className="w-4 h-4"></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-gray-400 text-[11px]">Confidence</p>
                              <span className="font-bold text-white font-mono-telemetry">{activeAlert?.confidence ?? 0}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activeAlert?.confidence ?? 0}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-800 text-blue-400 shrink-0">
                            <i data-lucide="calendar" className="w-4 h-4"></i>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[11px]">Status</p>
                            <span className="font-semibold text-red-400 mt-0.5 inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              Pending Review
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-800 text-blue-400 shrink-0">
                            <i data-lucide="shield" className="w-4 h-4"></i>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[11px]">Priority</p>
                            <span className="px-2 py-0.5 text-xs font-bold text-red-400 bg-red-500/10 rounded mt-0.5 inline-block">
                              {activeAlert?.priority ?? "Medium"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-800 text-blue-400 shrink-0">
                            <i data-lucide="cpu" className="w-4 h-4"></i>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[11px]">AI Model</p>
                            <p className="font-semibold text-white mt-0.5">{activeAlert?.aiModel ?? "YOLO11n + Rule Engine"}</p>
                          </div>
                        </div>

                        <details className="mt-3 border-t border-gray-800 pt-3 text-xs">
                          <summary className="cursor-pointer text-blue-400 font-semibold">View generated JSON log</summary>
                          <pre className="mt-2 max-h-48 overflow-auto rounded bg-[#0b0f17] p-3 text-[10px] text-emerald-300 whitespace-pre-wrap">{JSON.stringify(activeAlert?.jsonLog || {}, null, 2)}</pre>
                        </details>
                        <div className="flex items-start gap-3 pt-2 border-t border-gray-800">
                          <div className="p-2 rounded-lg bg-gray-800 text-blue-400 shrink-0">
                            <i data-lucide="file-text" className="w-4 h-4"></i>
                          </div>
                          <div>
                            <p className="text-gray-400 text-[11px]">Description</p>
                            <p className="text-gray-300 mt-0.5 leading-relaxed">{activeAlert?.description ?? ""}</p>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-8">
                        No active alert selected.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* TAB 2: ALERTS QUEUE */}
          {currentTab === "alerts" && (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Pending Alerts Queue - {currentEnv.name}</h2>
                  <p className="text-xs text-gray-400">Active threats requiring human decision review</p>
                </div>
                <button
                  onClick={() => setCurrentTab("live-monitoring")}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-500 transition"
                >
                  Return to Decision Console
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {filteredAlerts.map(a => (
                  <div key={a.id} className="p-4 rounded-xl bg-[#0b0f17] border border-gray-800 hover:border-blue-500 transition space-y-3">
                    <div className="relative h-40 rounded-lg overflow-hidden border border-gray-700 bg-black">
                      {a.snapshotUrl ? (
                        <img src={a.snapshotUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <SurveillanceSnapshot type={selectedEnvKey} rule={a.rule} />
                      )}
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white font-bold text-xs rounded">
                        {a.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base">{a.rule}</h4>
                    <p className="text-xs text-gray-400">{a.location} • {a.time}</p>
                    <button
                      onClick={() => {
                        setSelectedAlertId(a.id);
                        setCurrentTab("live-monitoring");
                      }}
                      className="w-full py-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold text-xs transition"
                    >
                      Review Alert
                    </button>
                  </div>
                ))}

                {alerts.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500 text-sm">
                    No pending alerts to display for this environment.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ALERT HISTORY */}
          {currentTab === "history" && (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Alert History & Audit Trail</h2>
                  <p className="text-xs text-gray-400">Complete historical decision logs</p>
                </div>
              </div>

              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#0b0f17] text-gray-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Alert ID</th>
                    <th className="p-3">Rule / Activity</th>
                    <th className="p-3">Camera</th>
                    <th className="p-3">Decision</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {decisionLog.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-800/40">
                      <td className="p-3 font-mono-telemetry text-blue-400 font-semibold">{row.id}</td>
                      <td className="p-3 font-bold text-white">{row.rule}</td>
                      <td className="p-3">{row.camera}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${row.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            row.status === 'Dismissed' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono-telemetry">{row.confidence}%</td>
                      <td className="p-3 font-mono-telemetry text-gray-400">{row.date}</td>
                      <td className="p-3 font-semibold text-white">{row.operator}</td>
                    </tr>
                  ))}

                  {decisionLog.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">
                        No history records logged in this session yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: VIDEO SOURCE */}
          {currentTab === "source" && (
            <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-6 max-w-4xl mx-auto w-full">
              <div className="border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <i data-lucide="video" className="w-5 h-5 text-blue-400"></i>
                  Video Source Configuration
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Upload a local video file or connect a live stream to feed the AI pipeline for {currentEnv.name}.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setSourceMode("file"); setSourceError(null); }}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition ${sourceMode === "file" ? "bg-blue-600/20 border-blue-500 text-blue-400 font-bold" : "bg-[#0b0f17] border-gray-800 text-gray-400 hover:text-white"}`}
                >
                  <i data-lucide="upload" className="w-4 h-4"></i>
                  File Upload
                </button>
                <button 
                  onClick={() => { setSourceMode("stream"); setSourceError(null); }}
                  className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition ${sourceMode === "stream" ? "bg-blue-600/20 border-blue-500 text-blue-400 font-bold" : "bg-[#0b0f17] border-gray-800 text-gray-400 hover:text-white"}`}
                >
                  <i data-lucide="radio" className="w-4 h-4"></i>
                  Live Stream
                </button>
              </div>

              <div className="p-5 bg-[#0b0f17] border border-gray-800 rounded-xl min-h-[200px] flex flex-col justify-center">
                {sourceMode === "file" ? (
                  <div className="space-y-4 max-w-md mx-auto w-full">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2">Select Video File (.mp4, .avi, .mkv)</label>
                      <input 
                        type="file" 
                        accept="video/*"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30"
                      />
                    </div>
                    <button 
                      onClick={handleSourceUpload}
                      disabled={!uploadFile || sourceStatus === "uploading"}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {sourceStatus === "uploading" ? <span className="animate-pulse">Uploading & Processing...</span> : <span>Start Detection</span>}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-md mx-auto w-full">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2">Stream URL (RTSP / HTTP)</label>
                      <input 
                        type="text" 
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        placeholder="rtsp://admin:pass@192.168.1.100:554/stream"
                        className="w-full px-4 py-2 bg-[#111827] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button 
                      onClick={handleStreamConnect}
                      disabled={!streamUrl || sourceStatus === "connecting"}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition flex items-center justify-center gap-2"
                    >
                      {sourceStatus === "connecting" ? <span className="animate-pulse">Connecting...</span> : <span>Connect Stream</span>}
                    </button>
                  </div>
                )}
              </div>

              {sourceError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold flex items-center gap-2">
                  <i data-lucide="alert-circle" className="w-4 h-4"></i>
                  {sourceError}
                </div>
              )}

              {sourceStatus === "active" && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Source Active
                    </div>
                    <button 
                      onClick={handleSourceStop}
                      className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition"
                    >
                      Stop Pipeline
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 font-mono-telemetry truncate break-all">
                    URL: {activeSourceUrl}
                  </p>
                  <p className="text-xs text-emerald-400/80">
                    The AI pipeline is now processing frames from this source. Switch to Live Monitoring to review alerts.
                  </p>
                </div>
              )}

            </div>
          )}

        </main>

      </div>

    </div>
  );
}

const rootContainer = document.getElementById('root');
if (rootContainer) {
  const root = ReactDOM.createRoot(rootContainer);
  root.render(<App />);
}
