# What happens when you reach your monthly API limit

Each plan has a monthly API call limit. You can see how much you've used on your **Overview** page under **Plan & usage**.

## Warnings before you reach the limit

When you've used **80%** of your monthly calls, your dashboard shows a usage warning. For example: "Warning: you've used 96% of your monthly API calls."

## What happens at the limit depends on your plan

**Starter and Growth: throttled.**
When you reach your limit, we keep serving your requests at a reduced rate of up to 1 request per second. Requests above that rate get a `429 Too Many Requests` response. Your integration keeps working, just more slowly. You'll see more and more 429 errors as your traffic rises.

**Scale: billed for overage.**
Scale is never throttled. Calls over your 1,000,000 limit are billed at **$0.90 per 1,000 calls**, rounded up to the next 1,000. The overage appears on your next invoice. For example, 50,000 calls over the limit costs $45.

**Basic (Legacy): blocked.**
When you reach your limit, **all** API requests get a `429 Too Many Requests` response until the limit resets or you move to a current plan. See *Legacy plans*.

**Enterprise:** limits and overage terms are set in your contract.

## The 429 error

When you're throttled or blocked because of your monthly limit, the API returns:

```
429 Too Many Requests — Monthly API limit reached
```

Your dashboard shows the same message in a red banner.

## How to get back to full speed

You have two options:

1. **Upgrade your plan.** Your new limit applies straight away, and throttling or blocking stops within a minute. Go to https://billing.example.com.
2. **Wait for your limit to reset** at the start of your next billing cycle. See *Billing cycles and usage resets*.

We can't reset your usage early or raise the limit on your current plan.
