// Public Messenger app_id (Intercom → Settings → Installation). Not a secret.
const INTERCOM_APP_ID = "nm57i4fb";
const INTERCOM_API_BASE = "https://api-iam.intercom.io"; // US
// const INTERCOM_API_BASE = "https://api-iam.eu.intercom.io"; // EU
// const INTERCOM_API_BASE = "https://api-iam.au.intercom.io"; // AU

const STORAGE_KEY = "orbitly.persona";
const BILLING_URL = "https://billing.example.com";

// Must match the Snowflake demo data exactly.
const PERSONAS = [
  { id: "jordan", name: "Jordan Lee",  email: "jordan.lee@brightloop.example",  company: "Brightloop", plan: "Starter",        used: 48200,  limit: 50000,   resetInDays: 4,  scenario: "Approaching limit (main script)" },
  { id: "priya",  name: "Priya Nair",  email: "priya.nair@tallyfox.example",    company: "Tallyfox",   plan: "Starter",        used: 51300,  limit: 50000,   resetInDays: 9,  scenario: "Limit reached, throttled" },
  { id: "marcus", name: "Marcus Webb", email: "marcus.webb@quillstack.example", company: "Quillstack", plan: "Growth",         used: 62450,  limit: 200000,  resetInDays: 17, scenario: "Healthy, no upsell" },
  { id: "elena",  name: "Elena Rossi", email: "elena.rossi@cobaltline.example", company: "Cobaltline", plan: "Scale",          used: 972000, limit: 1000000, resetInDays: 2,  scenario: "Next tier is Enterprise (sales)" },
  { id: "tom",    name: "Tom Becker",  email: "tom.becker@ferngrid.example",    company: "Ferngrid",   plan: "Basic (Legacy)", used: 25000,  limit: 25000,   resetInDays: 6,  scenario: "Limit reached, blocked legacy plan" },
  { id: "unknown",name: "Alex Unknown",email: "nobody@unknown.example",         company: "—",          plan: "Starter",        used: 0,      limit: 50000,   resetInDays: 10, scenario: "Email not found → Fin asks for email" }
];

// Suggested [opener, follow-up] lines for the presenter to paste into the Messenger.
const OPENERS = {
  jordan:  ["I got an error saying I've hit my API limit — can you check my account?", "What happens if I go over before then?"],
  priya:   ["My API calls keep getting 429 errors, what's going on?", "Yes please, show me the next plan."],
  marcus:  ["I'm getting an API limit error, can you check my usage?", "So I don't need to upgrade right now?"],
  elena:   ["We're almost out of API calls this month — what are our options?", "Can you connect me with someone about Enterprise?"],
  tom:     ["All my API requests are failing since this morning, did I hit a limit?", "Can I move to a current plan to unblock things?"],
  unknown: ["Can you check my API usage?", "It's jordan.lee@brightloop.example"]
};

const PLANS = {
  "Starter":        { limit: "50,000",     price: "$99",    per: "/mo", mode: "throttled", overage: "Calls over the limit are throttled", short: "Throttled at the limit", features: ["Core API", "Email support", "2 API keys"] },
  "Growth":         { limit: "200,000",    price: "$299",   per: "/mo", mode: "throttled", overage: "Calls over the limit are throttled", short: "Throttled at the limit", features: ["Core API", "Webhooks", "Priority email support", "10 API keys"] },
  "Scale":          { limit: "1,000,000",  price: "$899",   per: "/mo", mode: "billed",    overage: "Calls over the limit are billed at $0.90 per 1,000", short: "Overage billed at $0.90 per 1,000", features: ["Everything in Growth", "SSO", "99.9% SLA"] },
  "Enterprise":     { limit: "5,000,000+", price: "Custom", per: "",    mode: "custom",    overage: "Custom limits, agreed with sales", short: "Custom pricing · contact sales", features: ["Dedicated CSM", "99.99% SLA", "Audit logs"] },
  "Basic (Legacy)": { limit: "25,000",     price: "$49",    per: "/mo", mode: "blocked",   overage: "Calls over the limit are blocked", legacy: true }
};
const TIERS = ["Starter", "Growth", "Scale", "Enterprise"];

const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString("en-US");
const messengerEnabled = Boolean(INTERCOM_APP_ID) && INTERCOM_APP_ID !== "REPLACE_ME";
let current = PERSONAS[0];

// Same rule as the backend: reset date = today + resetInDays.
function resetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function usage(p) {
  const pct = (p.used / p.limit) * 100;
  return {
    pct,
    label: Math.floor(pct) + "%", // floor so 99.6% never reads as "100%"
    remaining: Math.max(0, p.limit - p.used),
    level: pct >= 100 ? "red" : pct >= 80 ? "amber" : "green"
  };
}

/* ---------- Dashboard ---------- */

function renderDashboard(p) {
  const u = usage(p);
  const plan = PLANS[p.plan];
  const reset = resetDate(p.resetInDays);

  $("user-initials").textContent = p.name.split(" ").map((w) => w[0]).join("");
  $("user-name").textContent = p.name;
  $("user-company").textContent = p.company;
  $("hero-name").textContent = p.name.split(" ")[0];
  $("hero-plan").textContent = p.plan;
  document.querySelectorAll(".js-company").forEach((el) => { el.textContent = p.company === "—" ? el.dataset.fallback : p.company; });

  $("banner").hidden = u.pct < 80;
  if (u.pct >= 100) {
    $("banner-title").textContent = "429 Too Many Requests — Monthly API limit reached";
    $("banner-text").textContent = plan.mode === "blocked"
      ? `All API requests are blocked until your limit resets on ${reset}.`
      : `Requests are being throttled until your limit resets on ${reset}.`;
  } else if (u.pct >= 80) {
    $("banner-title").textContent = `Warning: you've used ${u.label} of your monthly API calls`;
    $("banner-text").textContent = `${fmt(u.remaining)} calls left until your limit resets on ${reset}.`;
  }

  $("meter").dataset.level = u.level;
  $("meter-fill").style.width = Math.min(u.pct, 100) + "%";
  $("usage-pct").textContent = u.label;
  $("plan-badge").textContent = p.used > p.limit ? `${fmt(p.used - p.limit)} over limit` : `${fmt(u.remaining)} calls left`;
  $("usage-count").textContent = `${fmt(p.used)} / ${fmt(p.limit)} API calls`;
  $("usage-reset").textContent = `Resets on ${reset} · in ${p.resetInDays} day${p.resetInDays === 1 ? "" : "s"}`;

  $("plan-name").textContent = p.plan;
  $("plan-price").textContent = plan.price + plan.per;
  $("plan-limit").textContent = `${plan.limit} API calls / month`;
  $("plan-overage").textContent = plan.overage;
  $("plan-note").hidden = !plan.legacy;

  renderPricing(p.plan);
}

function renderPricing(currentPlan) {
  const currentIdx = TIERS.indexOf(currentPlan); // -1 for legacy plans
  $("pricing-grid").innerHTML = TIERS.map((name, i) => {
    const t = PLANS[name];
    const isCurrent = i === currentIdx;
    const cta = isCurrent ? "Your plan" : name === "Enterprise" ? "Contact sales" : i < currentIdx ? "Switch plan" : "Upgrade";
    return `
      <article class="tier glass${isCurrent ? " current" : ""}">
        ${isCurrent ? '<span class="tier-badge">Current plan</span>' : ""}
        <h3>${name}</h3>
        <p class="tier-price">${t.price}<small>${t.per}</small></p>
        <p class="tier-limit">${t.limit} calls / month</p>
        <p class="tier-overage">${t.short}</p>
        <ul>${t.features.map((f) => `<li>${f}</li>`).join("")}</ul>
        <a class="btn ${isCurrent ? "btn-outline" : "btn-primary"}" href="${BILLING_URL}">${cta}</a>
      </article>`;
  }).join("");
}

/* ---------- Demo panel ---------- */

function renderPanel() {
  $("persona-list").innerHTML = PERSONAS.map((p) => {
    const u = usage(p);
    return `
      <div class="persona" data-id="${p.id}" role="radio" aria-checked="false" tabindex="0">
        <div class="persona-head"><strong>${p.name}</strong><span class="pct" data-level="${u.level}">${u.label}</span></div>
        <div class="persona-email">${p.email}</div>
        <div class="persona-scenario">${p.scenario}</div>
        ${OPENERS[p.id].map((line, i) => `
          <div class="opener">
            <span class="opener-tag">${i ? "Follow-up" : "Opener"}</span>
            <q>${line}</q>
            <button class="copy" type="button" data-persona="${p.id}" data-line="${i}">Copy</button>
          </div>`).join("")}
      </div>`;
  }).join("");
}

function markActive(id) {
  document.querySelectorAll(".persona").forEach((el) => {
    const on = el.dataset.id === id;
    el.classList.toggle("active", on);
    el.setAttribute("aria-checked", String(on));
  });
}

// Presenter panels slide in from the left; only one can be open at a time.
const PANELS = { demo: ["demo-panel", null], guide: ["guide-panel", "guide-toggle"] };

function togglePanel(name = "demo", open = !$(PANELS[name][0]).classList.contains("open")) {
  Object.entries(PANELS).forEach(([key, [panelId, pillId]]) => {
    const panel = $(panelId);
    if (!panel) return;
    const on = key === name && open;
    panel.classList.toggle("open", on);
    panel.inert = !on;
    panel.setAttribute("aria-hidden", String(!on));
    if (pillId) $(pillId).setAttribute("aria-expanded", String(on));
  });
}

function selectPersona(id) {
  current = PERSONAS.find((p) => p.id === id) || PERSONAS[0];
  renderDashboard(current);
  markActive(current.id);
  try { localStorage.setItem(STORAGE_KEY, current.id); } catch (_) { /* storage blocked */ }
  bootMessenger(current);
  if (typeof syncGuidePersona === "function") syncGuidePersona(current.id);
}

/* ---------- Toasts & clipboard ---------- */

function toast(message, { kind = "info", sticky = false } = {}) {
  const el = document.createElement("div");
  el.className = `toast glass toast-${kind}`;
  el.setAttribute("role", "status");
  el.textContent = message;
  const dismiss = () => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); };
  el.addEventListener("click", dismiss);
  $("toasts").appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  if (!sticky) setTimeout(dismiss, 2000);
}

async function copyText(text, { quiet = false } = {}) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {
    // navigator.clipboard is unavailable on file:// and non-secure origins.
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  if (!quiet) toast("Copied");
}

/* ---------- Intercom Messenger ---------- */

// Standard Intercom loader: queue calls until the widget script arrives.
function loadMessenger() {
  const w = window;
  if (typeof w.Intercom === "function") return;
  const i = function () { i.c(arguments); };
  i.q = [];
  i.c = (args) => i.q.push(args);
  w.Intercom = i;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://widget.intercom.io/widget/" + INTERCOM_APP_ID;
  document.head.appendChild(s);
}

// shutdown + boot gives Fin a fresh Messenger session as the selected persona.
function bootMessenger(p) {
  if (!messengerEnabled) return;
  window.Intercom("shutdown");
  window.Intercom("boot", {
    api_base: INTERCOM_API_BASE,
    app_id: INTERCOM_APP_ID,
    user_id: p.email,
    email: p.email,
    name: p.name,
    company: { company_id: p.company, name: p.company }
  });
}

function warnMissingAppId() {
  toast("Intercom Messenger not loaded — set INTERCOM_APP_ID in app.js", { kind: "warn", sticky: true });
}

/* ---------- Wiring ---------- */

$("demo-close").addEventListener("click", () => togglePanel("demo", false));

$("reset-convo").addEventListener("click", () => {
  if (!messengerEnabled) return warnMissingAppId();
  bootMessenger(current);
  toast(`Conversation reset for ${current.name}`);
});

$("persona-list").addEventListener("click", (e) => {
  const copyBtn = e.target.closest(".copy");
  if (copyBtn) return copyText(OPENERS[copyBtn.dataset.persona][copyBtn.dataset.line]);
  const card = e.target.closest(".persona");
  if (card && card.dataset.id !== current.id) selectPersona(card.dataset.id);
});

$("persona-list").addEventListener("keydown", (e) => {
  const card = e.target.closest(".persona");
  if (card && e.target === card && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    if (card.dataset.id !== current.id) selectPersona(card.dataset.id);
  }
});

document.addEventListener("keydown", (e) => {
  const typing = e.target.closest("input, textarea, select, [contenteditable]");
  const shortcut = !typing && e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey && { d: "demo", t: "guide" }[e.key.toLowerCase()];
  if (shortcut) {
    e.preventDefault();
    togglePanel(shortcut);
  }
  if (e.key === "Escape") togglePanel("demo", false);
});

let savedId = null;
try { savedId = localStorage.getItem(STORAGE_KEY); } catch (_) { /* storage blocked */ }

if (messengerEnabled) loadMessenger();
else warnMissingAppId();

renderPanel();
selectPersona(savedId || "jordan");
