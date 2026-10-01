# Demo script: Fin on Successful SaaS

The presenter's run-of-show. The main story is **Jordan**, which takes about 4 minutes. The other personas are optional encores, each showing a different thing Fin can do.

## Before the call (about 10 minutes)

- [ ] `python3 -m http.server 8000`, then open http://localhost:8000. Or use your hosted URL.
- [ ] The Messenger launcher appears in the bottom-right corner. If it doesn't, see *Recovery* below.
- [ ] Knowledge articles from `knowledge/` are published and Fin is set to use them.
- [ ] Guidance rules from `fin-guidance.md` are switched on.
- [ ] The "Look up account usage" connector passes its test for every email in `data-connector.md`.
- [ ] Do a dry run with Jordan, then press **Reset conversation**.
- [ ] Close the dry-run conversations in the Inbox so the Messenger opens clean.
- [ ] Open the demo panel (Shift + D), select Jordan, then close the panel before sharing your screen.
- [ ] Optional: in the Messenger settings, set a greeting such as *"Hi {first name} 👋 I'm Fin, the Successful SaaS AI agent. Ask me anything about your account."*

Reset dates are *today + N days*. The dates below assume a demo on **Oct 1**, so adjust them to your demo date.

---

## Main story: Jordan Lee (Brightloop, Starter)

**The story:** "Jordan is a developer at Brightloop. Their integration has just started showing API limit errors, and the dashboard has a red warning."

1. **Point at the page:** the warning banner says 96% used, the Plan & usage card shows 48,200 / 50,000, and the reset date is Oct 5, in 4 days. "This is what the customer sees. Now watch Fin see the same thing."
2. **Open the Messenger and paste the opener:**
   > I got an error saying I've hit my API limit — can you check my account?

   **Expected from Fin:** it greets Jordan by name and looks up the account. It says Jordan has used 48,200 of 50,000 calls (96%), has 1,800 left, and that usage resets on Oct 5 (in 4 days).

   **Talking point:** "No 'what's your email?', no 'which plan are you on?'. Fin knows who's signed in and pulled live account data."
3. **Follow-up:**
   > What happens if I go over before then?

   **Expected:** Fin says Starter is throttled at the limit, so requests keep flowing at a reduced rate and anything above that rate returns a 429. It recommends Growth (200,000 calls, $299/month), says the upgrade takes effect straight away, and links to billing.

   **Talking point:** "It's answering from *your* help content and policies. The upsell is contextual: it only appears because Jordan really is near the limit."
4. **Close:** "That's a resolved conversation, with an expansion opportunity, and no human involved."

---

## Encores (choose by audience)

Switch persona in the demo panel (Shift + D). The Messenger restarts as the new user.

### Priya Nair: over the limit, throttled (Tallyfox, Starter)
> My API calls keep getting 429 errors, what's going on?

**Expected:** Priya is 1,300 calls over the limit (51,300 / 50,000, 102%), so requests are being throttled until Oct 10 (in 9 days).

> Yes please, show me the next plan.

**Expected:** Growth, 200,000 calls, $299/month, effective straight away. With Growth, Priya has 148,700 calls left this cycle.

**Shows:** diagnosing the root cause, then a clear path to fix it.

### Marcus Webb: healthy, no upsell (Quillstack, Growth)
> I'm getting an API limit error, can you check my usage?

**Expected:** Marcus is well within the limit (62,450 / 200,000, 31%). Fin explains that the 429 is probably the 50 requests per second rate limit and suggests backoff and the `Retry-After` header.

> So I don't need to upgrade right now?

**Expected:** "No, you don't need to upgrade."

**Shows:** Fin is honest. It doesn't push an upgrade when the customer doesn't need one, and that builds trust.

### Elena Rossi: route to sales (Cobaltline, Scale)
> We're almost out of API calls this month — what are our options?

**Expected:** 972,000 / 1,000,000 (97%) used, 28,000 left, resets Oct 3 (in 2 days). Scale isn't throttled, so going over means overage at $0.90 per 1,000 calls. Fin then mentions Enterprise.

> Can you connect me with someone about Enterprise?

**Expected:** Fin hands over to the team with a summary of company, plan, usage and reset date.

**Shows:** Fin recognises a sales opportunity and hands it over with context. Switch to the Inbox and show the handover summary if you can.

### Tom Becker: blocked legacy plan (Ferngrid, Basic (Legacy))
> All my API requests are failing since this morning, did I hit a limit?

**Expected:** Yes. Tom has used 25,000 of 25,000 calls, and on Basic (Legacy) every request is blocked until Oct 7 (in 6 days).

> Can I move to a current plan to unblock things?

**Expected:** Starter, 50,000 calls, $99/month, throttled rather than blocked. It works straight away, and Tom can't switch back to Legacy.

**Shows:** Fin handles plan-specific edge cases and helps move customers off legacy plans.

### Alex Unknown: account not found
> Can you check my API usage?

**Expected:** Fin can't find an account for the signed-in email, so it asks for the email on the account.

> It's jordan.lee@brightloop.example

**Expected:** Fin looks the account up again and answers with Jordan's figures.

**Shows:** Fin recovers gracefully when its data is missing.

**Talking point (say it before anyone asks):** "In production you'd keep identity verification on, so Fin only shares account data with a verified user. We've switched it off here just so I can change personas live."

---

## Recovery

| Problem | Fix |
| --- | --- |
| No Messenger launcher | Check that the domain is trusted in the Messenger security settings and identity verification is off. Look in the browser console for errors. Hard-refresh the page. |
| Fin answers as the previous persona | Press **Reset conversation**. If that doesn't work, refresh the page. The persona is saved. |
| Fin asks for an email for a known persona | The connector didn't find the user. Check the connector's test for that email, and check that the email attribute is set on the user. |
| Reset date is off by one day | The backend and the browser disagree about "today", which can happen around midnight or across timezones. Line up the backend's timezone with yours. |
| Fin offers an upgrade to Marcus | Check that Guidance rule 6 is switched on. |
| Old conversations show in the Messenger | Close them in the Inbox before the demo. |
