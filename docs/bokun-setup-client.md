# Bókun — Setup Guide for Casa Venturas Website Integration

**Goal:** connect the Casa Venturas website to your Bókun account so visitors can check availability, book, and pay directly — with bookings flowing automatically into your Bókun dashboard.

**What you'll need:** admin access to your Bókun account. Total time: ~15 minutes.

At the end, you'll send us **4 things**: 2 API keys + 1 channel UUID + 3 product IDs.

---

## Step 1 — Create a Booking Channel

A "Booking Channel" is how Bókun tracks where bookings come from (in our case, your website).

1. Log in to Bókun → top-right menu → **Settings**
2. In the left sidebar: **Sales Tools → Booking Channels**
3. Click **+ Create new booking channel**
4. Fill in:
   - **Name**: `Casa Venturas Website`
   - **Type**: `OTA` (Online Travel Agent) — or `Direct Online Sales` if available
   - **Currency**: `USD`
   - **Language**: `English`
5. Click **Save**
6. Open the channel you just created and **copy the UUID** shown in the URL or details panel
   → looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

✅ **Keep this UUID** — we'll need it (call it `BOOKING_CHANNEL_UUID`).

---

## Step 2 — Create the API Key

1. Still in **Settings**, go to **Developer API** (sometimes under "Connections" or "Integrations")
2. Click **+ Create API Key**
3. Fill in:
   - **Name**: `Casa Venturas Website API`
   - **User Role**: `Admin` (or a custom role with `Book` + `Ops` permissions)
   - **Booking Channel**: select the one created at Step 1 (`Casa Venturas Website`)
   - **Allow offline payment**: ❌ **disabled** (not needed — Bókun's hosted checkout handles online payment; disabling enforces least-privilege on the API key)
4. Click **Save**
5. Bókun will show you **two keys**:
   - **Access Key** (public identifier)
   - **Secret Key** (⚠️ shown ONCE — copy immediately)

✅ **Keep both keys safe** — we'll need them (`BOKUN_ACCESS_KEY` + `BOKUN_SECRET_KEY`).

> ⚠️ **Important:** the Secret Key is only displayed once at creation. If you lose it, you must regenerate a new pair.

---

## Step 3 — Verify Your 3 Products Are Published

The website needs to connect to the 3 tours. Each must exist in Bókun and be **published**.

1. Go to **Products** (main top menu)
2. Make sure these 3 are **Active / Published**:
   - 🌿 **El Yunque Rainforest Tour** — $89/person
   - ⛵ **Catamaran Vieques** — $249/person
   - 💃 **Salsa Rooftop** — $65/person
3. For each one, click to open and **copy the Product ID** (shown in the URL or the details panel)
   → looks like: `123456` (numeric) or `exp-abc123` (alphanumeric, depends on plan)

✅ **Keep the 3 IDs** — example:
```
EL_YUNQUE_ID   = 123456
CATAMARAN_ID   = 123457
SALSA_ID       = 123458
```

> If a product doesn't exist yet, create it first (Products → + Create → Experience) with availability, pricing, cancellation policy. The website integration cannot work without a published product.

---

## Step 4a — Point Bókun to our legal pages

Bókun's checkout displays links to Terms & Privacy. Set them to our real pages:

1. **Settings → Company Profile** (or **Branding → Legal URLs**, wording varies by Bókun version)
2. Fill in:
   - **Terms & Conditions URL**: `https://micasaventuras.com/terms`
   - **Privacy Policy URL**: `https://micasaventuras.com/privacy`
3. Click **Save**

> ✅ These pages are already published on the website — no content work needed from you.

---

## Step 4 — Enable Webhooks (so we know when a booking is confirmed)

This lets your website's automation (emails, WhatsApp reminders, guide dispatch) trigger automatically on each new booking.

1. **Settings → Notifications → Webhooks** (or "Integrations → Webhooks")
2. Click **+ Add webhook**
3. Configure:
   - **URL**: *(we'll provide the exact n8n endpoint — e.g. `https://n8n.casaventuras.com/webhook/bokun`)*
   - **Events**: check at least:
     - ✅ `BOOKING_CONFIRMED`
     - ✅ `BOOKING_CANCELLED`
     - ✅ `BOOKING_UPDATED`
   - **Booking Channel**: `Casa Venturas Website`
4. Click **Save**

> 📌 **Send us the webhook URL later** — we'll give you the exact URL to paste in step 4.1 once the automation backend is deployed.

---

## Step 5 — Send Us Everything

Email everything to the developer (via WhatsApp or secure channel — **never** public email in plain text for the Secret Key).

### Checklist to send:

```
1. BOOKING_CHANNEL_UUID    = ________________________________________
2. BOKUN_ACCESS_KEY        = ________________________________________
3. BOKUN_SECRET_KEY        = ________________________________________  ⚠️ sensitive
4. EL_YUNQUE_PRODUCT_ID    = ________________________________________
5. CATAMARAN_PRODUCT_ID    = ________________________________________
6. SALSA_PRODUCT_ID        = ________________________________________
```

> 🔒 **Security reminder:** the Secret Key gives full booking/payment access to your Bókun account. Treat it like a password. If it ever leaks → regenerate a new one immediately in the Bókun dashboard.

---

## What happens next (developer side)

Once we have your 6 values:
1. We wire the website's booking form → Bókun REST API (real-time availability + pricing)
2. We embed the Bókun checkout widget for payment (hosted by Bókun — PCI compliant)
3. Webhooks from Bókun → n8n → email/WhatsApp confirmation to the guest
4. Your admin dashboard in Bókun shows all bookings in real-time (as it already does)

**End-user experience:**
- Visitor lands on `/tours/el-yunque`
- Sees live available dates + total price in your sidebar
- Clicks "Confirm booking" → Bókun checkout modal opens on the page
- Pays → instant confirmation email + booking appears in your Bókun dashboard

---

## Troubleshooting — common issues

| Problem | Fix |
|---|---|
| "API Key doesn't work" | Check: (a) key assigned to correct booking channel, (b) user role has `Book` + `Ops` permissions, (c) not expired. |
| "Product doesn't appear" | Product must be **Published** (not Draft). Availability + price must be set. |
| "No webhook received" | Test the webhook URL from Bókun's webhook settings ("Send test"). Firewall/URL typo are 90% of issues. |
| "Secret Key lost" | Regenerate a new API Key pair in Bókun. Old one is permanently invalidated. |

---

## References

- Bókun Developer Portal: https://bokun.dev
- REST API Documentation: https://api-docs.bokun.dev/rest-v1
- Official Bókun Help: https://docs.bokun.io/en/articles/327-using-bokun-s-api-and-web-services
- Support: support@bokun.io

---

*Casa Venturas × Bókun integration — setup guide v1.0*
