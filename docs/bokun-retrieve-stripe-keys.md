# Retrieving your Stripe keys (verification only)

**Short version:** the website **does not need your Stripe Secret Key**. Payments are charged by Bókun using the Stripe connection you set up during Bókun onboarding. We only use your **Publishable Key** (which is, by design, safe to expose) — and we already have it from Bókun's API response.

This document is for **verification + security hygiene** — so you can:

1. Confirm the Publishable Key we wired into the website actually belongs to your Stripe account.
2. Keep the Secret Key on file in case you want to migrate later (e.g. refund automation, direct Stripe Checkout, reporting integrations).

---

## What the website currently uses

| Key | Used by the website? | Why |
|---|---|---|
| **Publishable Key** `pk_live_...` | ✅ yes, **client-side only** | Tokenize card → send token to Bókun. Cannot charge. Safe to expose. |
| **Secret Key** `sk_live_...` | ❌ never | Bókun holds its own copy in their backend to charge the card. We don't need it. |
| **Webhook Signing Secret** `whsec_...` | ❌ not today | Would only be needed if we listen to Stripe events directly (e.g. refunds). Bókun handles this for us. |

> 🔒 If anyone ever asks for your **Secret Key** to "integrate with the website", that's a red flag — our integration does not need it.

---

## Step 1 — Access your Stripe dashboard

Your Stripe account was created when you set up Bókun Pay / Stripe Token integration (via **Bókun → Settings → Payment Providers**).

To get into it:

1. Go to **[dashboard.stripe.com](https://dashboard.stripe.com)**
2. Sign in with the email you used during Bókun's payment onboarding
3. If you've never logged in before, click **"Forgot password?"** to set one

> If you don't remember which email, ask Bókun support ([support@bokun.io](mailto:support@bokun.io)) — they'll tell you.

## Step 2 — Find the Publishable Key

1. In the left sidebar click **Developers → API keys** (or go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys))
2. In the **"Standard keys"** table, find the row labeled **"Publishable key"**
3. Make sure the toggle at the top-right is set to **"Live mode"** (not "Test mode")
4. Copy the value — it looks like:
   ```
   pk_live_51ITpwpBf8w9DbxGlKqObExWn3FbK5...
   ```

✅ **Compare the prefix** to what we have wired today in the website:
```
pk_live_51ITpwpBf8w9DbxGl... (truncated — full key stored in Cloudflare Workers env vars and local .env.local)
```

If they match → nothing to do.
If they differ → your account has rotated keys. Send us the new value so we can update the `.env` file.

## Step 3 — (Optional) Note the Secret Key — do NOT send it to us

If you ever want to keep the Secret Key on file for future features:

1. Same page: **Developers → API keys**
2. Find **"Secret key"** → click **"Reveal live key"**
3. It looks like:
   ```
   sk_live_51ITpwp...
   ```
4. Store it in a password manager (1Password, Bitwarden, your LastPass vault) — **do not email or share it via WhatsApp**.

> 🚫 The website does not use this key. Do not put it in `.env` or GitHub. If it ever leaks, click **"Roll key"** in the Stripe dashboard immediately — Bókun's charges will NOT be affected (Bókun uses their own Connect flow).

## Step 4 — Verify your Stripe account is activated for payouts

While you're in the Stripe dashboard, quickly confirm:

1. Top-left: your account name should appear (e.g. *"Casa Venturas"*)
2. Go to **Balance → Overview** or **Payments → Overview**
3. You should see either past payouts or "No payments yet"
4. If there's a red banner saying **"Action required — verify your identity"** or **"KYC pending"** → complete it. Otherwise all new bookings will be held until Stripe verifies you.

---

## What Bókun does with Stripe (for context)

Here's how a payment actually flows:

```
1. Customer fills our checkout form on micasaventuras.com
   ▼
2. Stripe.js (loaded with pk_live_) tokenizes the card client-side
   → returns tok_abc123 (valid ~15 min, only useful for Bókun's Stripe connection)
   ▼
3. Our server POSTs to Bokun /checkout.json/submit with tok_abc123
   ▼
4. Bokun uses its own sk_live_ (which YOU gave them during setup) to:
   - Create a PaymentIntent on your Stripe account
   - Charge the card
   - Transfer funds to your Stripe balance
   ▼
5. Bokun returns the booking confirmation to us
   ▼
6. Customer sees "Booking confirmed" on our website
   Money lands in YOUR Stripe account → paid out to YOUR bank per your Stripe payout schedule
```

**We never hold your money.** Funds always go directly from the customer's card to your Stripe account, with Bókun as the payment processor.

---

## What to send us

Only if something changed vs what we have today:

```
Publishable key (pk_live_...) — if it rotated on your side:
  ________________________________________________________________
```

That's it. We don't need anything else. Secret keys, webhook secrets, account tokens → **keep them private in your Stripe dashboard + password manager**.

---

*Casa Venturas × Stripe — retrieval guide v1.0*
