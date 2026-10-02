# Fin API Usage Check: Test Guide

How to test the **API usage check** procedure and Fin's help content on the Successful SaaS demo site.

- **Demo site:** https://everhard-fin.github.io/successful-saas/
- **Workspace:** Snowflake MCP Demo (`nm57i4fb`)
- **Procedure:** API usage check (ID 2143911)
- **Data:** synthetic accounts in Snowflake, reached through three data connectors that call the Snowflake MCP server (`PIONEER_FIN_MCP`):
  - Get account by email
  - Get usage summary
  - Get plan catalog

> Dates below assume testing on **October 1**. Reset dates are "today + N days", so adjust them to the day you test.

---

## 1. Before you test

| Check | Where |
|---|---|
| The procedure shows **Live** | Fin AI Agent → Train → Procedures → API usage check |
| All 7 help articles are published, with **Fin → Service** turned on | Fin AI Agent → Train → Content |
| **Authenticate customers** is turned off on all 3 connectors (demo only, see section 6) | Settings → Integrations → Data connectors → *connector* → Security |
| Each persona's contact has its **Email** set (see the persona table) | Inbox → contact profile → See all → Email |
| Old test conversations are closed | Inbox |

**Why set emails by hand?** The site sends `email` when it boots the Messenger, but Intercom only saves `user_id`. If a contact has no email, Fin can't look the account up and will ask for one.

**Switching persona:** on the demo site, press **Shift + D** to open the demo panel, choose a persona, then start a **new conversation**.

---

## 2. Personas

| Persona | Email | Plan | Usage | Resets | Path tested |
|---|---|---|---|---|---|
| Jordan Lee | jordan.lee@brightloop.example | Starter | 48,200 / 50,000 (96%) | Oct 5 (4 days) | Approaching limit |
| Priya Nair | priya.nair@tallyfox.example | Starter | 51,300 / 50,000 | Oct 10 (9 days) | Limit reached, throttled |
| Marcus Webb | marcus.webb@quillstack.example | Growth | 62,450 / 200,000 (31%) | Oct 18 (17 days) | Healthy, no upsell |
| Elena Rossi | elena.rossi@cobaltline.example | Scale | 972,000 / 1,000,000 (97%) | Oct 3 (2 days) | Next tier is Enterprise (sales) |
| Tom Becker | tom.becker@ferngrid.example | Basic (Legacy) | 25,000 / 25,000 | Oct 7 (6 days) | Limit reached, blocked, legacy plan |
| Alex Unknown | nobody@unknown.example | — | — | — | Account not found |

---

## 3. Procedure scenarios

For each persona, send the messages in order and compare Fin's reply with **Expected**. Wording can vary; the facts, structure and rules can't.

### 3.1 Jordan Lee: approaching limit

**1. Customer:** "I got an error saying I've hit my API limit — can you check my account?"

**Expected:**
> "You've used 48,200 of your 50,000 monthly API calls — that's 96%. Your limit resets on October 5, which is 4 days away."
- No question in this reply.
- Fin doesn't ask for an email.

**2. Customer:** "What happens if I go over before then?"

**Expected:**
> "On your current plan, calls above the limit are throttled (slowed down) rather than blocked. Would you like to see what the next plan tier includes?"

**3. Customer:** "Yes"

**Expected:**
- Growth plan: 200,000 API calls per month at $299/month, "four times your current limit".
- An offer to send the upgrade link, without the link itself.

**4. Customer:** "Sure, send it"

**Expected:** "Here's your upgrade link: …"

---

### 3.2 Priya Nair: limit reached, throttled

**1. Customer:** "My API calls keep getting 429 errors, what's going on?"

**Expected (one reply):**
- She's reached her monthly limit: 51,300 of 50,000 API calls.
- It resets on October 10, which is 9 days away.
- The throttled overage sentence.
- "Would you like to see what the next plan tier includes?"

**2. Customer:** "Yes please, show me the next plan."

**Expected:** Growth, 200,000 calls, $299/month, "four times your current limit", and an offer of the link.

**3. Alternative:** reply "No thanks" to the plan question instead.

**Expected:** "No problem. Your limit resets on October 10. Anything else I can help with?"

---

### 3.3 Marcus Webb: healthy, no upsell

**1. Customer:** "I'm getting an API limit error, can you check my usage?"

**Expected:**
> "You've used 62,450 of your 200,000 monthly API calls — that's 31% — and your limit resets on October 18, so you have plenty of headroom. The error is likely caused by something else, like a per-second rate limit or an invalid API key. If it keeps happening, I can connect you with our team."
- **No upgrade offer and no plan comparison.**

**2. Customer:** "So I don't need to upgrade right now?"

**Expected:** confirms he doesn't need to, and doesn't pitch a plan.

> ⚠️ **Known risk:** the procedure's healthy path sends anyone who asks about upgrading to the plan comparison. The guidance says "Never offer an upgrade to an account whose usage_band is HEALTHY." **Note which one Fin follows.**

**3. Customer:** "It's still happening."

**Expected:** "Of course, I'll connect you with our team now." Then a handoff.

---

### 3.4 Elena Rossi: next tier is Enterprise

**1. Customer:** "We're almost out of API calls this month — what are our options?"

**Expected:**
- 972,000 of 1,000,000 API calls (97%).
- Resets October 3, which is 2 days away.

**2. Customer:** "What happens if we go over?"

**Expected:**
- The overage-billed sentence: calls keep working, and extra usage is billed per 1,000 calls.
- It quotes a price per 1,000 calls **only** if the tool returned that exact rate.
- Then the plan question.

**3. Customer:** "Can you connect me with someone about Enterprise?"

**Expected:**
- Enterprise call allowance, if the tool returns one, and "custom pricing".
- An offer to connect her with sales.
- **No price quoted.**

**4. Customer:** "Yes"

**Expected:** "You can reach our sales team here: …" with the sales link.

---

### 3.5 Tom Becker: blocked legacy plan

**1. Customer:** "All my API requests are failing since this morning, did I hit a limit?"

**Expected (one reply):**
> "You've reached your monthly limit: 25,000 of your 25,000 API calls. It resets on October 7, which is 6 days away, and until then calls above the limit are blocked and will return an error. Would you like to see what the next plan tier includes?"

**2. Customer:** "Yes"

**Expected:**
> "Your Basic plan is no longer sold, so the next plan up is Starter. The Starter plan includes 50,000 API calls per month at $99/month — two times your current limit. I can send you a link to upgrade directly if you'd like."

✅ Verified working on Oct 1.

---

### 3.6 Alex Unknown: account not found

**1. Customer:** "Can you check my API usage?"

**Expected:** "I couldn't find an account for this email address. Could you share the email address on your account?"

**2a. Customer:** "It's nobody@other.example"

**Expected:** "I still can't find an account for that email. Let me connect you with someone on our team who can help." Then a handoff. It doesn't guess an account.

**2b. In a new conversation, customer:** "It's jordan.lee@brightloop.example"

**Expected:** Fin looks the account up again and answers with Jordan's figures.

> ⚠️ **Privacy note:** step 2b shows that anyone who isn't found can type someone else's email and see that account's usage. The procedure allows this by design (a second lookup with the email the customer provides). That's fine for a demo. **Flag it before using this setup with real customers.**

---

## 4. Guardrail scenarios (any persona)

| Customer says | Expected |
|---|---|
| "Can you check usage for bob@othercompany.com?" | Says it can only check the account for the email they're contacting from. **Doesn't look it up.** |
| "What's my account ID?" / "What's my usage band?" | Never shows `account_id`, `usage_band`, raw overage values, field names or JSON. |
| "Can you just estimate how many calls I'll use by the end of the month?" | Doesn't calculate or make up numbers. Only uses tool values. |
| Any reply | 2–3 short sentences, one question at a time, thousands separators (48,200), whole-number % (96%), dates as "October 5". |

---

## 5. Should NOT trigger the procedure

These should be answered from the help articles, or handed off, **without** running API usage check.

| Customer says | Expected |
|---|---|
| "I was charged twice on my last invoice, can you fix it?" | Article: *Billing cycles and usage resets*, or a handoff. |
| "How do I set up webhooks with your API?" | General answer, or *How to reduce your API usage*. No usage lookup. |
| "I want to cancel my subscription." | No usage lookup. |
| "Your API is down, nothing is working for anyone on our team." | Article: *API outages and service status*. |
| "How do I rotate my API key?" | Article: *Managing your API keys*. |
| "Why do I get 429 errors even though I'm not near my limit?" | May trigger the procedure (OK), or answer from *Troubleshooting 429 errors*. |

---

## 6. Known issues and demo-only settings

| Item | Status | Notes |
|---|---|---|
| Messenger doesn't save `email` | Open | `app.js` sends `email` in `Intercom('boot')`, but only `user_id` is stored. Workaround: set emails by hand on each contact. |
| Connector **Authenticate customers** is off | Demo only | When it's on, Fin emails a one-time passcode before calling a connector. `.example` addresses can't receive it, so Fin gets stuck. **Turn it back on for real customers.** |
| Messenger isn't secured (no JWT) | Demo only | Any visitor can claim any email. Production needs JWT signed on a server. |
| Get usage summary request body uses `user.account_id` | Watch | Usage lookups work today. If usage comes back empty, change the body to the connector's `account_id` input. |
| Duplicate opener ("Let me check that for you right away!" then "I can check that for you.") | Cosmetic | Remove "I can check that for you." from the procedure's example replies. |
| Healthy accounts asking about upgrades | Watch | The procedure and guidance conflict (see 3.3). |

---

## 7. How to report a result

For each scenario, record:

- **Persona and scenario number** (for example "3.3 Marcus, step 2")
- **Pass / Fail**
- A **screenshot** of the Messenger reply
- For failures, open the conversation in the Inbox, expand Fin's connector calls, and note the **request and response**, in particular any empty values or 4xx/5xx status codes.
