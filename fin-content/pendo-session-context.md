# Pendo session context for Fin

Fin calls Pendo's `getSessionActivity` tool, through a data connector, to see what a visitor did just before asking for help: pages, tagged features, tagged track events, frustration signals and (optionally) console and network errors. Untagged clicks are left out.

The demo site shows all of this live in the **Session lens** (left sidebar, **Shift + P**). It works with or without Pendo installed; with Pendo installed, Fin reads the real session.

Sources: Pendo's [Set up Fin in Agent Toolkit (beta)](https://support.pendo.io/hc/en-us/articles/53374652713371-Set-up-Fin-in-Agent-Toolkit-beta) and [Improve Fin resolution rate with session context (beta)](https://support.pendo.io/hc/en-us/articles/50288421049499-Improve-Fin-resolution-rate-with-session-context-beta).

## 1. Install Pendo on the site

1. In Pendo, create a web app for the demo site and copy its **API key** from the install settings.
2. Set `PENDO_API_KEY` at the top of `pendo.js`. Switch `PENDO_CDN` to the EU line if the subscription is on EU.
3. Deploy, open the site and check the lens shows **Pendo agent live**.

The site identifies visitors with `visitor.id = email` and `account.id = company`. The Messenger boots with `user_id = email`, so the IDs already match.

## 2. Tag pages, features and track events

Fin only sees what's tagged, and uses the names you give. Create these in Pendo so they match the lens.

| Type | Name | Rule |
| --- | --- | --- |
| Page | Overview Page | URL contains `#/overview`, or no hash |
| Page | Integrations Page | URL contains `#/integrations` |
| Page | Billing Page | URL contains `#/billing` |
| Feature | Connect Slack Button | `[data-pendo-feature="Connect Slack Button"]` |
| Feature | Connect Zapier Button | `[data-pendo-feature="Connect Zapier Button"]` |
| Feature | Manage Plan Button | `[data-pendo-feature="Manage Plan Button"]` |
| Feature | View Billing Button | `[data-pendo-feature="View Billing Button"]` |
| Feature | Help Link | `[data-pendo-feature="Help Link"]` |
| Feature | Pricing Upgrade Button | `[data-pendo-feature="Pricing Upgrade Button"]` |
| Track event | Integration Connect Failed | Sent by `pendo.track()`; tag it under **Track Events** once it first arrives |
| Track event | Integration Connected | Same |

Every tagged element carries a `data-pendo-feature` attribute, so the CSS rule is always `[data-pendo-feature="<name>"]`.

## 3. Set up the Fin agent in Pendo Agent Toolkit

Needs Pendo subscription admin, webhooks on, and agent 2.336.0 or later.

1. **Agent Toolkit → Add AI agent → Fin.** Name it, add the demo web app under **Accessible apps**, accept the beta notice.
2. **In-conversation help.** Turn on **MCP server**, then copy the OAuth token URL, Client ID, Client secret and Scope. Store the secret now; it can't be viewed again.
3. In Intercom, create an authentication token: **OAuth**, the token URL, Client ID and secret, scope `read:me`, **Form encoded**. Test for `200 OK`.
4. In Intercom **Data connectors → Custom MCP**, add the **MCP server URL** with that token. Test it. This step is easy to miss, and Fin can't reach Pendo without it.
5. **Proactive help** is optional for this demo. Skip it unless you also want nudges.
6. **Sync Visitor IDs.** Run `pendo.checkIntegrationIdMatch('intercom')` in the browser console on the demo site. They match, so answer **Yes**.
7. Review and select **Add AI agent**.

## 4. Turn on session context

1. In Pendo, turn on **Subscription settings → AI access → Semantic search**. Without it the integration isn't available.
2. In Intercom **Settings → Integrations → Data connectors**, open **New Pendo Support Agent MCP connector**, pick `getSessionActivity` and **Add connectors**.
3. **Edit** it and add a data input mapped to the contact's **User ID**. In **Body**, put that attribute in `"arguments":{"visitorId":""}`.
4. Test with `jordan.lee@brightloop.example` after you've clicked around the site as Jordan.
5. Turn on **Directly** under the Fin tab, then **Set live**.
6. Optional, but it makes the Slack story land: in Pendo **Agent Toolkit → your agent → Session context**, turn on **Collect all console and network errors** (type `I accept`). Needs agent 2.338.0 or later.

## 5. Fin guidance

Add this under **Fin AI Agent → Guidance**:

> When a customer reports a problem with something in the product, check their recent session activity first. Refer to what they were doing in plain words, for example "I can see you tried to connect Slack a few times on the Integrations page". Don't ask them to repeat steps the session shows they already tried. If the session shows an error, explain what it means and what to do next. Don't quote raw error codes or URLs unless the customer asks.

Also publish `knowledge/08-connecting-slack.md` so Fin knows what `admin_approval_required` means.

## The demo, with no script

1. Pick a persona (Shift + D). The lens starts a fresh session for that visitor.
2. Go to **Integrations** and click **Connect** on Slack. It fails with a vague message. Click **Try again** a few times quickly.
3. Watch the lens fill: page view, feature clicks, network and console errors, an error click, a rage click and a track event. Nav clicks show up struck through: untagged, so Fin never sees them.
4. Open the Messenger. The flow at the top of the lens plays: Messenger → Fin → data connector → Pendo, with the events coming back.
5. Ask "Slack isn't working". Fin should say it can see the failed attempts and explain the Slack admin approval, instead of telling you to try again.

The flow animation is an illustration that plays when the Messenger opens. The Messenger doesn't expose when Fin actually calls the connector, so check the conversation's details in the Inbox for the real call.
