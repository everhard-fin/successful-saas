# Troubleshooting API errors

## 429 Too Many Requests: monthly limit reached

The message says **"Monthly API limit reached"**. You've used your plan's monthly allowance. See *What happens when you reach your monthly API limit*.

## 429 Too Many Requests, but you're under your monthly limit

If your dashboard shows you're **under** your monthly limit, the 429 is a short-term **rate limit**, not your monthly allowance. It happens when you send a large burst of requests in a few seconds.

- Every plan allows up to **50 requests per second**.
- The response includes a `Retry-After` header that tells you how many seconds to wait.
- Fix it by retrying with exponential backoff, or by spreading requests out over time.

Upgrading doesn't change the per-second rate limit, so you don't need to upgrade to fix this error.

## 401 Unauthorized

Your API key is missing, wrong or revoked. Check the key under **Settings → API keys**.

## 5xx errors

Something went wrong on our side. Check **Status** in the page footer, then retry with backoff.
