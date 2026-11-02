// Pendo web snippet API key (Pendo → Settings → Subscription settings → App → Install settings). Public, like the Intercom app_id.
const PENDO_API_KEY = "2230e0e8-67b7-4abc-9ea0-8c5a86083acd";
const PENDO_CDN = "https://cdn.pendo.io"; // US
// const PENDO_CDN = "https://cdn.eu.pendo.io"; // EU

const LENS_KEY = "orbitly.lens";
const pendoEnabled = Boolean(PENDO_API_KEY) && PENDO_API_KEY !== "REPLACE_ME";
const PAGE_NAMES = { overview: "Overview Page", integrations: "Integrations Page", billing: "Billing Page" };
const TYPE_LABELS = { page: "Page", feature: "Feature", track: "Track event", error: "Error", frustration: "Frustration", omitted: "Omitted" };
const NODE_X = [12.5, 37.5, 62.5, 87.5];

let pendoStarted = false;
let sessionEvents = [];
let sessionStart = Date.now();
let recentClicks = [];
let flowRun = 0;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- Pendo agent ---------- */

// Standard Pendo install snippet: queue calls until the agent script arrives.
function loadPendo() {
  const o = (window.pendo = window.pendo || {});
  o._q = o._q || [];
  ["initialize", "identify", "updateOptions", "pageLoad", "track", "trackAgent"].forEach((m, i) => {
    o[m] = o[m] || function () { o._q[i === 0 ? "unshift" : "push"]([m].concat([].slice.call(arguments, 0))); };
  });
  const s = document.createElement("script");
  s.async = true;
  s.src = `${PENDO_CDN}/agent/static/${PENDO_API_KEY}/pendo.js`;
  document.head.appendChild(s);
}

// Visitor ID = email, the same value the Messenger boots with as user_id, so Fin can match them.
function pendoIdentity(p) {
  return {
    visitor: { id: p.email, email: p.email, full_name: p.name },
    account: { id: p.company, name: p.company }
  };
}

function identifyPendo(p) {
  if (!pendoEnabled) return;
  if (pendoStarted) window.pendo.identify(pendoIdentity(p));
  else window.pendo.initialize(pendoIdentity(p));
  pendoStarted = true;
}

function pendoTrack(name, props) {
  if (pendoEnabled) window.pendo.track(name, props);
  record("track", name, Object.values(props).join(" · "));
}

function renderAgentStatus() {
  const el = $("lens-agent");
  if (!pendoEnabled) {
    el.dataset.state = "off";
    el.textContent = "Pendo snippet off: set PENDO_API_KEY in pendo.js. The lens still shows what Pendo would send.";
    return;
  }
  const ready = typeof window.pendo.isReady === "function" && window.pendo.isReady();
  el.dataset.state = ready ? "live" : "loading";
  el.textContent = ready ? "Pendo agent live, recording this session" : "Pendo agent loading…";
  if (!ready) setTimeout(renderAgentStatus, 1000);
}

/* ---------- Session timeline ---------- */

function elapsed(at) {
  const s = Math.max(0, Math.round((at - sessionStart) / 1000));
  return `+${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function record(type, label, detail = "") {
  const list = $("lens-timeline");
  const now = Date.now();
  const last = sessionEvents[sessionEvents.length - 1];

  if (type !== "omitted" && last && last.type === type && last.label === label && now - last.at < 4000) {
    last.count += 1;
    last.at = now;
    const row = list.querySelector(`[data-i="${sessionEvents.length - 1}"]`);
    row.querySelector(".ev-count").textContent = `×${last.count}`;
    row.classList.remove("bump");
    void row.offsetWidth;
    row.classList.add("bump");
    return;
  }

  const li = document.createElement("li");
  li.className = `ev t-${type}`;
  li.innerHTML = `
    <span class="ev-dot"></span>
    <div class="ev-body">
      <span class="ev-type">${TYPE_LABELS[type]}</span>
      <strong>${esc(label)}<span class="ev-count"></span></strong>
      ${detail ? `<small>${esc(detail)}</small>` : ""}
    </div>
    <time>${elapsed(now)}</time>`;

  if (type === "omitted") {
    setTimeout(() => li.classList.add("gone"), 1400);
    setTimeout(() => li.remove(), 2000);
  } else {
    li.dataset.i = sessionEvents.length;
    sessionEvents.push({ type, label, at: now, count: 1 });
  }
  list.appendChild(li);
  list.scrollTop = list.scrollHeight;
  renderCount();
}

function renderCount() {
  const n = sessionEvents.length;
  $("lens-count").textContent = `${n} event${n === 1 ? "" : "s"} Fin can read`;
}

function startSession(p) {
  sessionEvents = [];
  sessionStart = Date.now();
  $("lens-timeline").innerHTML = "";
  $("lens-visitor").textContent = p.email;
  $("lens-user").textContent = p.email;
  $("lens-match").textContent = "✓ IDs match, so Fin can find this visitor in Pendo";
  resetFlow();
  record("page", PAGE_NAMES[currentRoute()], `#/${currentRoute()}`);
}

function trackRage(el) {
  const now = Date.now();
  recentClicks = recentClicks.filter((c) => c.el === el && now - c.t < 1500);
  recentClicks.push({ el, t: now });
  if (recentClicks.length === 3) record("frustration", "Rage click", el.dataset.pendoFeature || el.textContent.trim());
}

/* ---------- Flow: how Fin reads the session ---------- */

function setFlow(step, nodes, x, call, caption) {
  const flow = $("flow");
  flow.dataset.step = step;
  flow.querySelectorAll(".flow-node").forEach((n, i) => n.classList.toggle("on", nodes.includes(i)));
  const packet = $("flow-packet");
  packet.classList.toggle("show", x !== null);
  if (x !== null) packet.style.left = NODE_X[x] + "%";
  flow.querySelector(".flow-call code").textContent = call;
  $("flow-caption").textContent = caption;
}

function resetFlow() {
  flowRun += 1;
  setFlow("0", [], null, "getSessionActivity({ visitorId })",
    "Pendo is recording this session. Click around, then open the Messenger and ask Fin about it.");
}

function scanTimeline() {
  $("lens-timeline").querySelectorAll(".ev:not(.t-omitted)").forEach((li, i) => {
    li.classList.remove("scan");
    void li.offsetWidth;
    li.style.animationDelay = `${i * 90}ms`;
    li.classList.add("scan");
  });
}

async function playFlow() {
  const run = ++flowRun;
  const n = sessionEvents.length;
  const frames = [
    ["1", [0], 0, "“I need help…”", "You ask Fin for help in the Messenger.", 1500],
    ["2", [0, 1], 1, "“I need help…”", "Fin checks what you were doing before you asked.", 1400],
    ["3", [1, 2, 3], 3, `getSessionActivity({ visitorId: "${current.email}" })`, "Fin calls the Pendo data connector with your Visitor ID.", 1800],
    ["4", [3], 3, `← ${n} events: pages, features, track events, errors, frustration`, `Pendo returns ${n} events from this session. Untagged clicks are left out.`, 2400],
    ["5", [1, 2, 3], 1, `← ${n} events`, "Fin answers with that context, and skips the steps you've already tried.", 1600]
  ];
  for (const [step, nodes, x, call, caption, ms] of frames) {
    if (run !== flowRun) return;
    setFlow(step, nodes, x, call, caption);
    if (step === "4") scanTimeline();
    await wait(ms);
  }
  if (run === flowRun) setFlow("done", [0, 1], null, `Fin read ${n} events`, "Fin answers with that context, and skips the steps you've already tried.");
}

/* ---------- Integrations page ---------- */

async function connectIntegration(btn) {
  const card = btn.closest(".integration");
  if (card.classList.contains("busy")) return;
  const name = card.querySelector("h3").textContent;
  const error = card.querySelector(".int-error");
  card.classList.add("busy");
  btn.textContent = "Connecting…";
  if (error) error.hidden = true;
  await wait(900);

  if (btn.dataset.connect === "slack") {
    // A real failing request and console error, so Pendo's error collection has something genuine to capture.
    const status = await fetch("api/integrations/slack/connect", { method: "POST" }).then((r) => r.status, () => 0);
    console.error(`Slack connect failed: admin_approval_required. A Slack workspace admin must approve the Successful SaaS app (HTTP ${status}).`);
    record("error", "Network error", `POST /api/integrations/slack/connect → ${status || "failed"}`);
    record("error", "Console error", "Slack connect failed: admin_approval_required");
    record("frustration", "Error click", "Connect Slack Button");
    pendoTrack("Integration Connect Failed", { integration: name, reason: "admin_approval_required" });
    btn.textContent = "Try again";
    error.hidden = false;
  } else {
    pendoTrack("Integration Connected", { integration: name });
    card.classList.add("connected");
    btn.outerHTML = '<span class="pill pill-green">Connected</span>';
  }
  card.classList.remove("busy");
}

/* ---------- Lens panel ---------- */

function setLens(open) {
  $("lens").hidden = !open;
  document.body.classList.toggle("lens-open", open);
  $("lens-toggle").setAttribute("aria-expanded", String(open));
  try { localStorage.setItem(LENS_KEY, open ? "1" : "0"); } catch (_) { /* storage blocked */ }
}

// Called from selectPersona() in app.js after the Messenger reboots as the new persona.
function syncPendoPersona(p) {
  identifyPendo(p);
  startSession(p);
  if (typeof window.Intercom === "function") window.Intercom("onShow", () => { if (!$("lens").hidden) playFlow(); });
}

// Called from renderRoute() in app.js on every hash change.
function onPendoRoute(route) {
  record("page", PAGE_NAMES[route], `#/${route}`);
}

/* ---------- Wiring ---------- */

document.addEventListener("click", (e) => {
  if (e.target.closest("#lens, .demo-panel, .pill-dock, .toasts")) return;
  const tagged = e.target.closest("[data-pendo-feature]");
  const target = tagged || e.target.closest("a, button");
  if (!target) return;
  trackRage(target);
  if (tagged) record("feature", tagged.dataset.pendoFeature, "Clicked");
  else record("omitted", "Untagged click", "Not tagged in Pendo, so Fin never sees it");
}, true);

document.querySelector(".integrations").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-connect]");
  if (btn) connectIntegration(btn);
});

$("lens-toggle").addEventListener("click", () => setLens($("lens").hidden));
$("lens-close").addEventListener("click", () => setLens(false));
$("flow-replay").addEventListener("click", playFlow);

document.addEventListener("keydown", (e) => {
  const typing = e.target.closest("input, textarea, select, [contenteditable]");
  if (!typing && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "p") {
    e.preventDefault();
    setLens($("lens").hidden);
  }
});

let lensSaved = null;
try { lensSaved = localStorage.getItem(LENS_KEY); } catch (_) { /* storage blocked */ }

if (pendoEnabled) loadPendo();
setLens(lensSaved ? lensSaved === "1" : window.innerWidth >= 1100);
renderAgentStatus();
syncPendoPersona(current);
