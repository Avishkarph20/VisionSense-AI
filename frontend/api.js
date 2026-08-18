// Thin API client for the FastAPI backend. Everything goes through the
// same-origin "/api" and "/ws" paths, which nginx.conf reverse-proxies
// to the backend container — so the browser never needs to know the
// backend's container hostname/port and there's no cross-origin request
// to fight CORS over in production.
const API_BASE = "/api";

async function fetchRecentAlerts(limit = 100) {
  const res = await fetch(`${API_BASE}/events/recent?limit=${limit}`);
  if (!res.ok) throw new Error(`GET /events/recent failed: ${res.status}`);
  return res.json();
}

async function submitDecision(alertId, decision, comment) {
  const res = await fetch(`${API_BASE}/events/${alertId}/decision`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, comment: comment || null }),
  });
  if (!res.ok) throw new Error(`PATCH decision failed: ${res.status}`);
  return res.json();
}

// Opens the live alerts WebSocket and reconnects automatically if the
// connection drops (backend restart, network blip, etc). `onAlert` is
// called with each parsed alert payload; `onStatusChange` is called with
// "connecting" | "connected" | "disconnected".
function connectAlertsSocket(onAlert, onStatusChange) {
  let socket;
  let closedByCaller = false;

  const connect = () => {
    onStatusChange && onStatusChange("connecting");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    socket = new WebSocket(`${protocol}//${window.location.host}/ws/alerts`);

    socket.onopen = () => onStatusChange && onStatusChange("connected");

    socket.onmessage = (event) => {
      try {
        onAlert(JSON.parse(event.data));
      } catch (err) {
        console.error("Failed to parse alert payload:", err);
      }
    };

    socket.onclose = () => {
      onStatusChange && onStatusChange("disconnected");
      if (!closedByCaller) {
        setTimeout(connect, 3000); // auto-reconnect
      }
    };

    socket.onerror = () => socket.close();
  };

  connect();

  return {
    close: () => {
      closedByCaller = true;
      socket && socket.close();
    },
  };
}

// ── Video-source management ───────────────────────────────────────────────────

/**
 * Upload a video file to MinIO and point the detection service for the given
 * environment at the uploaded source path.
 *
 * @param {File}   file        - The File object from <input type="file">
 * @param {string} environment - e.g. "exam_hall" | "mall" | "railway" | "traffic"
 * @returns {Promise<{source: string, status: string, ...}>}
 */
async function uploadVideoSource(file, environment) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/source/${encodeURIComponent(environment)}/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail || `Upload failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Point a detection service at a stream or file URL (RTSP, HTTP, presigned MinIO).
 * Pass url="" or "none" to put the service back into idle / synthetic-frame mode.
 *
 * @param {string} environment - e.g. "exam_hall"
 * @param {string} url         - stream URL or ""
 * @returns {Promise<{status: string, source: string, ...}>}
 */
async function setStreamSource(environment, url) {
  const res = await fetch(`${API_BASE}/source/${encodeURIComponent(environment)}/set`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url || "" }),
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail || `Set source failed: ${res.status}`);
  }
  return res.json();
}
