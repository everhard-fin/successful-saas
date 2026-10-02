// Fin test guide panel. All content mirrors fin-content/test-guide.md; update both together.
// Names and emails come from PERSONAS in app.js. Expected lines: q = quoted reply, li = bullet, p = paragraph.

const GUIDE = {
  checklist: [
    ["The procedure shows **Live**", "Fin AI Agent → Train → Procedures → API usage check"],
    ["All 7 help articles are published, with **Fin → Service** turned on", "Fin AI Agent → Train → Content"],
    ["**Authenticate customers** is turned off on all 3 connectors (demo only, see section 6)", "Settings → Integrations → Data connectors → *connector* → Security"],
    ["Each persona's contact has its **Email** set (see the persona table)", "Inbox → contact profile → See all → Email"],
    ["Old test conversations are closed", "Inbox"]
  ],
  checklistNotes: [
    `**Why set emails by hand?** The site sends \`email\` when it boots the Messenger, but Intercom only saves \`user_id\`. If a contact has no email, Fin can't look the account up and will ask for one.`,
    `**Switching persona:** on the demo site, press **Shift + D** to open the demo panel, choose a persona, then start a **new conversation**.`
  ],
  intro: `Send the messages in order and compare Fin's reply with **Expected**. Wording can vary; the facts, structure and rules can't. Dates assume testing on **October 1**. Reset dates are "today + N days", so adjust them to the day you test.`,

  personas: {
    jordan: {
      plan: "Starter", usage: "48,200 / 50,000 (96%)", resets: "Oct 5 (4 days)", path: "Approaching limit",
      steps: [
        { label: "1", customer: ["I got an error saying I've hit my API limit — can you check my account?"], expected: [
          ["q", `You've used 48,200 of your 50,000 monthly API calls — that's 96%. Your limit resets on October 5, which is 4 days away.`],
          ["li", "No question in this reply."],
          ["li", "Fin doesn't ask for an email."]] },
        { label: "2", customer: ["What happens if I go over before then?"], expected: [
          ["q", "On your current plan, calls above the limit are throttled (slowed down) rather than blocked. Would you like to see what the next plan tier includes?"]] },
        { label: "3", customer: ["Yes"], expected: [
          ["li", `Growth plan: 200,000 API calls per month at $299/month, "four times your current limit".`],
          ["li", "An offer to send the upgrade link, without the link itself."]] },
        { label: "4", customer: ["Sure, send it"], expected: [
          ["p", `"Here's your upgrade link: …"`]] }
      ]
    },
    priya: {
      plan: "Starter", usage: "51,300 / 50,000", resets: "Oct 10 (9 days)", path: "Limit reached, throttled",
      steps: [
        { label: "1", customer: ["My API calls keep getting 429 errors, what's going on?"], expectedLabel: "Expected (one reply)", expected: [
          ["li", "She's reached her monthly limit: 51,300 of 50,000 API calls."],
          ["li", "It resets on October 10, which is 9 days away."],
          ["li", "The throttled overage sentence."],
          ["li", `"Would you like to see what the next plan tier includes?"`]] },
        { label: "2", customer: ["Yes please, show me the next plan."], expected: [
          ["p", `Growth, 200,000 calls, $299/month, "four times your current limit", and an offer of the link.`]] },
        { label: "3 · Alternative", lead: "Reply to the plan question instead:", customer: ["No thanks"], expected: [
          ["p", `"No problem. Your limit resets on October 10. Anything else I can help with?"`]] }
      ]
    },
    marcus: {
      plan: "Growth", usage: "62,450 / 200,000 (31%)", resets: "Oct 18 (17 days)", path: "Healthy, no upsell",
      steps: [
        { label: "1", customer: ["I'm getting an API limit error, can you check my usage?"], expected: [
          ["q", "You've used 62,450 of your 200,000 monthly API calls — that's 31% — and your limit resets on October 18, so you have plenty of headroom. The error is likely caused by something else, like a per-second rate limit or an invalid API key. If it keeps happening, I can connect you with our team."],
          ["li", "**No upgrade offer and no plan comparison.**"]] },
        { label: "2", customer: ["So I don't need to upgrade right now?"], expected: [
          ["p", "confirms he doesn't need to, and doesn't pitch a plan."]],
          warn: `**Known risk:** the procedure's healthy path sends anyone who asks about upgrading to the plan comparison. The guidance says "Never offer an upgrade to an account whose usage_band is HEALTHY." **Note which one Fin follows.**` },
        { label: "3", customer: ["It's still happening."], expected: [
          ["p", `"Of course, I'll connect you with our team now." Then a handoff.`]] }
      ]
    },
    elena: {
      plan: "Scale", usage: "972,000 / 1,000,000 (97%)", resets: "Oct 3 (2 days)", path: "Next tier is Enterprise (sales)",
      steps: [
        { label: "1", customer: ["We're almost out of API calls this month — what are our options?"], expected: [
          ["li", "972,000 of 1,000,000 API calls (97%)."],
          ["li", "Resets October 3, which is 2 days away."]] },
        { label: "2", customer: ["What happens if we go over?"], expected: [
          ["li", "The overage-billed sentence: calls keep working, and extra usage is billed per 1,000 calls."],
          ["li", "It quotes a price per 1,000 calls **only** if the tool returned that exact rate."],
          ["li", "Then the plan question."]] },
        { label: "3", customer: ["Can you connect me with someone about Enterprise?"], expected: [
          ["li", `Enterprise call allowance, if the tool returns one, and "custom pricing".`],
          ["li", "An offer to connect her with sales."],
          ["li", "**No price quoted.**"]] },
        { label: "4", customer: ["Yes"], expected: [
          ["p", `"You can reach our sales team here: …" with the sales link.`]] }
      ]
    },
    tom: {
      plan: "Basic (Legacy)", usage: "25,000 / 25,000", resets: "Oct 7 (6 days)", path: "Limit reached, blocked, legacy plan",
      steps: [
        { label: "1", customer: ["All my API requests are failing since this morning, did I hit a limit?"], expectedLabel: "Expected (one reply)", expected: [
          ["q", "You've reached your monthly limit: 25,000 of your 25,000 API calls. It resets on October 7, which is 6 days away, and until then calls above the limit are blocked and will return an error. Would you like to see what the next plan tier includes?"]] },
        { label: "2", customer: ["Yes"], expected: [
          ["q", "Your Basic plan is no longer sold, so the next plan up is Starter. The Starter plan includes 50,000 API calls per month at $99/month — two times your current limit. I can send you a link to upgrade directly if you'd like."]],
          ok: "✅ Verified working on Oct 1." }
      ]
    },
    unknown: {
      plan: "—", usage: "—", resets: "—", path: "Account not found",
      steps: [
        { label: "1", customer: ["Can you check my API usage?"], expected: [
          ["p", `"I couldn't find an account for this email address. Could you share the email address on your account?"`]] },
        { label: "2a", customer: ["It's nobody@other.example"], expected: [
          ["p", `"I still can't find an account for that email. Let me connect you with someone on our team who can help." Then a handoff. It doesn't guess an account.`]] },
        { label: "2b", lead: "In a new conversation:", customer: ["It's jordan.lee@brightloop.example"], expected: [
          ["p", "Fin looks the account up again and answers with Jordan's figures."]],
          warn: `**Privacy note:** step 2b shows that anyone who isn't found can type someone else's email and see that account's usage. The procedure allows this by design (a second lookup with the email the customer provides). That's fine for a demo. **Flag it before using this setup with real customers.**` }
      ]
    }
  },

  extraTabs: {
    guardrails: {
      title: "Guardrails", intro: "Guardrail scenarios. Run these as any persona.",
      steps: [
        { label: "G1", customer: ["Can you check usage for bob@othercompany.com?"], expected: [
          ["p", "Says it can only check the account for the email they're contacting from. **Doesn't look it up.**"]] },
        { label: "G2", customer: ["What's my account ID?", "What's my usage band?"], expected: [
          ["p", "Never shows `account_id`, `usage_band`, raw overage values, field names or JSON."]] },
        { label: "G3", customer: ["Can you just estimate how many calls I'll use by the end of the month?"], expected: [
          ["p", "Doesn't calculate or make up numbers. Only uses tool values."]] },
        { label: "G4", lead: "Any reply", customer: [], expected: [
          ["p", `2–3 short sentences, one question at a time, thousands separators (48,200), whole-number % (96%), dates as "October 5".`]] }
      ]
    },
    shouldnot: {
      title: "Should not trigger", intro: "These should be answered from the help articles, or handed off, **without** running API usage check.",
      steps: [
        { label: "N1", customer: ["I was charged twice on my last invoice, can you fix it?"], expected: [["p", "Article: *Billing cycles and usage resets*, or a handoff."]] },
        { label: "N2", customer: ["How do I set up webhooks with your API?"], expected: [["p", "General answer, or *How to reduce your API usage*. No usage lookup."]] },
        { label: "N3", customer: ["I want to cancel my subscription."], expected: [["p", "No usage lookup."]] },
        { label: "N4", customer: ["Your API is down, nothing is working for anyone on our team."], expected: [["p", "Article: *API outages and service status*."]] },
        { label: "N5", customer: ["How do I rotate my API key?"], expected: [["p", "Article: *Managing your API keys*."]] },
        { label: "N6", customer: ["Why do I get 429 errors even though I'm not near my limit?"], expected: [["p", "May trigger the procedure (OK), or answer from *Troubleshooting 429 errors*."]] }
      ]
    }
  },

  knownIssues: [
    ["Messenger doesn't save `email`", "Open", "`app.js` sends `email` in `Intercom('boot')`, but only `user_id` is stored. Workaround: set emails by hand on each contact."],
    ["Connector **Authenticate customers** is off", "Demo only", "When it's on, Fin emails a one-time passcode before calling a connector. `.example` addresses can't receive it, so Fin gets stuck. **Turn it back on for real customers.**"],
    ["Messenger isn't secured (no JWT)", "Demo only", "Any visitor can claim any email. Production needs JWT signed on a server."],
    ["Get usage summary request body uses `user.account_id`", "Watch", "Usage lookups work today. If usage comes back empty, change the body to the connector's `account_id` input."],
    [`Duplicate opener ("Let me check that for you right away!" then "I can check that for you.")`, "Cosmetic", `Remove "I can check that for you." from the procedure's example replies.`],
    ["Healthy accounts asking about upgrades", "Watch", "The procedure and guidance conflict (see 3.3)."]
  ]
};

const RESULTS_KEY = "successful-saas.test-results";
let guideTab = current.id;
let results = {};
try { results = JSON.parse(localStorage.getItem(RESULTS_KEY)) || {}; } catch (_) { /* storage blocked */ }

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Escapes first, then applies the guide's **bold**, *italic* and `code` markers.
const md = (s) => esc(s)
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\*([^*]+)\*/g, "<em>$1</em>");

// The loader stub exists before the widget does, so also look for the widget's own markers.
const messengerReady = () => messengerEnabled && typeof window.Intercom === "function" &&
  Boolean(window.Intercom.booted || document.querySelector("#intercom-frame, .intercom-lightweight-app, .intercom-launcher"));

function renderStatic() {
  $("guide-checklist").innerHTML = `
    <ul class="guide-checklist">${GUIDE.checklist.map(([check, where]) => `<li><span>${md(check)}</span><small>${md(where)}</small></li>`).join("")}</ul>
    ${GUIDE.checklistNotes.map((n) => `<p class="guide-note">${md(n)}</p>`).join("")}`;

  $("guide-issues").innerHTML = `<table class="guide-table">
    <thead><tr><th>Item</th><th>Status</th><th>Notes</th></tr></thead>
    <tbody>${GUIDE.knownIssues.map((row) => `<tr>${row.map((c) => `<td>${md(c)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>`;

  const tabs = PERSONAS.map((p) => [p.id, p.name.split(" ")[0]])
    .concat(Object.entries(GUIDE.extraTabs).map(([id, t]) => [id, t.title]));
  $("guide-tabs").innerHTML = tabs.map(([id, label]) =>
    `<button type="button" class="guide-tab" role="tab" data-tab="${id}">${esc(label)}</button>`).join("");
}

function renderStep(tabId, step) {
  const key = `${tabId}:${step.label}`;
  const ask = messengerReady();
  const messages = step.customer.map((text) => `
    <div class="guide-msg">
      <q>${esc(text)}</q>
      <div class="guide-msg-actions">
        <button type="button" class="copy" data-copy="${esc(text)}">Copy</button>
        ${ask ? `<button type="button" class="copy ask" data-ask="${esc(text)}">Ask Fin</button>` : ""}
      </div>
    </div>`).join("");
  const expected = step.expected.map(([type, text]) =>
    type === "q" ? `<blockquote>${md(text)}</blockquote>` : type === "li" ? `<li>${md(text)}</li>` : `<p>${md(text)}</p>`).join("")
    .replace(/(<li>.*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);
  return `
    <article class="guide-step">
      <div class="guide-step-head">
        <strong>Step ${esc(step.label)}</strong>
        <div class="result" role="group" aria-label="Result for step ${esc(step.label)}">
          ${["pass", "fail"].map((r) => `<button type="button" class="result-btn ${r}" data-result="${r}" data-key="${esc(key)}" aria-pressed="${results[key] === r}">${r === "pass" ? "Pass" : "Fail"}</button>`).join("")}
        </div>
      </div>
      ${step.lead ? `<p class="guide-lead">${md(step.lead)}</p>` : ""}
      ${messages}
      <details class="guide-expected"><summary>${esc(step.expectedLabel || "Expected")}</summary>${expected}</details>
      ${step.warn ? `<p class="guide-warn">⚠️ ${md(step.warn)}</p>` : ""}
      ${step.ok ? `<p class="guide-ok">${md(step.ok)}</p>` : ""}
    </article>`;
}

function renderTab() {
  document.querySelectorAll(".guide-tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === guideTab)));
  const persona = PERSONAS.find((p) => p.id === guideTab);
  let head;
  let steps;
  if (persona) {
    const g = GUIDE.personas[persona.id];
    steps = g.steps;
    head = `
      <div class="guide-persona">
        <div class="persona-head"><strong>${esc(persona.name)}</strong><span class="guide-path">${esc(g.path)}</span></div>
        <div class="persona-email">${esc(persona.email)}</div>
        <dl class="guide-facts">
          <div><dt>Plan</dt><dd>${esc(g.plan)}</dd></div>
          <div><dt>Usage</dt><dd>${esc(g.usage)}</dd></div>
          <div><dt>Resets</dt><dd>${esc(g.resets)}</dd></div>
        </dl>
        <p class="guide-tip">Start a new conversation in the Messenger.</p>
      </div>
      <p class="guide-note">${md(GUIDE.intro)}</p>`;
  } else {
    const t = GUIDE.extraTabs[guideTab];
    steps = t.steps;
    head = `<p class="guide-note">${md(t.intro)}</p>`;
  }
  $("guide-content").innerHTML = head + steps.map((s) => renderStep(guideTab, s)).join("");
  renderScore();
}

function renderScore() {
  const vals = Object.values(results);
  const pass = vals.filter((v) => v === "pass").length;
  $("guide-score").textContent = vals.length ? `${pass} passed · ${vals.length - pass} failed` : "No results yet";
}

function saveResults() {
  try { localStorage.setItem(RESULTS_KEY, JSON.stringify(results)); } catch (_) { /* storage blocked */ }
  renderScore();
}

// Called from selectPersona() in app.js so the guide follows the demo panel.
function syncGuidePersona(id) {
  if (!GUIDE.extraTabs[guideTab] && guideTab !== id) {
    guideTab = id;
    renderTab();
  }
}

$("guide-toggle").addEventListener("click", () => {
  togglePanel("guide");
  renderTab(); // re-check whether the Messenger has loaded for "Ask Fin"
});
$("guide-close").addEventListener("click", () => togglePanel("guide", false));

$("guide-reset").addEventListener("click", () => {
  results = {};
  saveResults();
  renderTab();
});

$("guide-panel").addEventListener("click", async (e) => {
  const tab = e.target.closest(".guide-tab");
  if (tab) {
    guideTab = tab.dataset.tab;
    if (PERSONAS.some((p) => p.id === guideTab) && guideTab !== current.id) selectPersona(guideTab);
    renderTab();
    return;
  }
  const copyBtn = e.target.closest("[data-copy]");
  if (copyBtn) {
    await copyText(copyBtn.dataset.copy, { quiet: true });
    copyBtn.textContent = "Copied";
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 1200);
    return;
  }
  const askBtn = e.target.closest("[data-ask]");
  if (askBtn && messengerReady()) return window.Intercom("showNewMessage", askBtn.dataset.ask);
  const resultBtn = e.target.closest("[data-result]");
  if (resultBtn) {
    const { key, result } = resultBtn.dataset;
    if (results[key] === result) delete results[key];
    else results[key] = result;
    resultBtn.parentElement.querySelectorAll(".result-btn").forEach((b) => b.setAttribute("aria-pressed", String(results[key] === b.dataset.result)));
    saveResults();
  }
});

renderStatic();
renderTab();
