# Orbitly — Fin demo dashboard

A static, single-page fake customer dashboard for **Orbitly**, a fictional API company, with the Intercom Messenger embedded. A hidden presenter panel switches between test personas so Fin sees a different logged-in user each time.

All brands, people and emails are synthetic.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page markup |
| `styles.css` | Glassmorphism theme, animated background, responsive layout |
| `app.js` | Personas, dashboard rendering, demo panel, Messenger boot |

No build step, framework or backend. The only external resources are the Intercom Messenger script and the Inter font from Google Fonts.

## Run locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly also works, but the Messenger and clipboard behave best over `http://localhost`.

## Set the Messenger app_id

At the top of `app.js`:

```js
const INTERCOM_APP_ID = "REPLACE_ME";
```

Replace `REPLACE_ME` with the demo workspace's app_id (Intercom → Settings → Installation → Web). This is a public identifier, not a secret. Until it's set, the page shows a warning toast and doesn't load the Messenger.

The workspace region is set by `INTERCOM_API_BASE` just below it. US is the default; uncomment the EU or AU line if your workspace is hosted there.

## Allow the site's domain in Intercom

The Messenger only loads on domains your workspace trusts:

1. Go to **Settings → Messenger → Security** (in some workspaces: **Settings → Installation → Web → Security / Trusted domains**).
2. Add every origin you'll demo from, for example `http://localhost:8000` and the URL of your static host.
3. Save, then reload the page.

## Identity verification must be OFF in the demo workspace

Persona switching boots the Messenger with a `user_id` and `email` from the browser, and there's no `user_hash`. If identity verification is enforced, Intercom rejects these boots and the Messenger won't load.

Use a dedicated demo workspace with identity verification turned off. Real deployments should keep identity verification **on** and generate `user_hash` on the server (an HMAC of the user ID with the workspace secret). Never put that secret in front-end code.

## Running the demo

- Press **Shift + D** or click the small **Demo** pill (bottom left) to open the presenter panel. It's hidden by default.
- Click a persona to switch. The dashboard updates, the Messenger shuts down and reboots as that user, and the choice is saved in `localStorage`, so it survives a refresh.
- Use **Copy** next to an opener or follow-up line, then paste it into the Messenger.
- **Reset conversation** reboots the Messenger for the current persona. Past conversations for that user stay in their Messenger history. Close them in the Inbox if you want a completely clean slate.

Reset dates are worked out as *today + `resetInDays`* using the browser's local date, the same rule the backend uses. If the backend computes "today" in a different timezone, the two can disagree by a day around midnight.

| Persona | Plan | Usage | Scenario |
| --- | --- | --- | --- |
| Jordan Lee | Starter | 48,200 / 50,000 | Approaching limit (main script) |
| Priya Nair | Starter | 51,300 / 50,000 | Limit reached, throttled |
| Marcus Webb | Growth | 62,450 / 200,000 | Healthy, no upsell |
| Elena Rossi | Scale | 972,000 / 1,000,000 | Next tier is Enterprise (sales) |
| Tom Becker | Basic (Legacy) | 25,000 / 25,000 | Limit reached, blocked legacy plan |
| Alex Unknown | Starter | 0 / 50,000 | Email not found, so Fin asks for an email |
