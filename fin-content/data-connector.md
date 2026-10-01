# Data connector: "Look up account usage"

This connector lets Fin read a persona's plan and usage from the demo backend, the same Snowflake demo data the website mirrors. Set it up in Intercom's data connector settings (**Settings → Integrations → Data connectors**, or under **Fin AI Agent**, depending on your workspace).

The website only sends Intercom each persona's **email, name and company**. The connector must look customers up **by email**.

## Name

```
Look up account usage
```

## Description (tells Fin when to use it)

```
Looks up a Successful SaaS customer's account by email address. Returns their company, plan, API calls used this billing cycle, monthly API call limit, calls remaining, reset date and what happens when they reach the limit. Use it whenever the customer asks about API usage, API limits, 429 errors, failing API requests, their plan or when their usage resets.
```

## Input

| Name | Type | Source | Description |
| --- | --- | --- | --- |
| `email` | string | The customer's email attribute. If the customer gives a different email in the conversation, use that instead. | Email address on the Successful SaaS account |

The connector should send the request without asking the customer first. These are read-only lookups, so no confirmation step is needed.

## Expected response

Map whatever your backend returns to roughly these fields. The names don't need to match exactly. What matters is that Fin gets these facts in clear, labelled fields.

```json
{
  "found": true,
  "name": "Jordan Lee",
  "company": "Brightloop",
  "plan": "Starter",
  "calls_used": 48200,
  "monthly_limit": 50000,
  "calls_remaining": 1800,
  "percent_used": 96.4,
  "reset_date": "2026-10-05",
  "days_until_reset": 4,
  "limit_behaviour": "throttled"
}
```

- **`reset_date`** must be *today + resetInDays*. The website uses the same rule, so Fin and the dashboard always show the same date. Check that the backend's "today" uses the same timezone as the presenter's browser.
- **`limit_behaviour`** is one of `throttled` (Starter, Growth), `billed` (Scale) or `blocked` (Basic (Legacy)).
- **Not found** (for example `nobody@unknown.example`): return `{"found": false}` with HTTP 200. Don't return an error status. Fin reads `found: false` and asks for the account email, as Guidance rule 4 tells it to.

## Test values

Before going live, run the connector's test with these emails:

| Email | Expected result |
| --- | --- |
| jordan.lee@brightloop.example | Starter, 48,200 / 50,000, throttled, resets in 4 days |
| priya.nair@tallyfox.example | Starter, 51,300 / 50,000, throttled, resets in 9 days |
| marcus.webb@quillstack.example | Growth, 62,450 / 200,000, throttled, resets in 17 days |
| elena.rossi@cobaltline.example | Scale, 972,000 / 1,000,000, billed, resets in 2 days |
| tom.becker@ferngrid.example | Basic (Legacy), 25,000 / 25,000, blocked, resets in 6 days |
| nobody@unknown.example | `found: false` |
