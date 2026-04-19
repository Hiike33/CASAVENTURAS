# Bókun — Switch to a Dedicated Booking Channel

**Goal:** replace the generic "Internal Channel" with a dedicated `Casa Venturas Website` channel — cleaner stats, separate commission tracking, ready for multi-OTA distribution.

**When:** anytime before going live. Takes ~3 minutes.

**What you'll send us:** 1 value (the new `BOOKING_CHANNEL_UUID`).

---

## Step 1 — Create the new channel

1. Log in to Bókun → top-right → **Settings**
2. Left sidebar: **Sales Tools → Booking Channels**
3. Click **+ Create new booking channel**
4. Fill in:
   - **Name:** `Casa Venturas Website`
   - **Type:** `Direct Online Sales` (or `OTA` if Direct Online Sales not available)
   - **Currency:** `USD`
   - **Language:** `English`
5. Click **Save**

## Step 2 — Copy the new UUID

1. Open the channel you just created
2. Copy the UUID shown in the URL or the details panel
   → looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

✅ **Send us this new UUID** — we'll swap it in the website config.

## Step 3 — Reassign the API key to the new channel

1. Go to **Settings → Developer API**
2. Open **"Casa Venturas Website API"** (your existing key)
3. Change the **Booking Channel** dropdown from `Internal Channel` → `Casa Venturas Website`
4. Click **Save**

> ✅ No need to regenerate the keys — only the channel binding changes.

## Step 4 — Verify webhooks still point to the right channel

1. **Settings → Notifications → Webhooks**
2. Check each webhook's **Booking Channel** setting
3. If it says `Internal Channel` or `All channels` → edit → select `Casa Venturas Website`

---

## What changes after the switch

| Before (Internal) | After (dedicated) |
|---|---|
| All bookings mixed (phone + website + agent) | Website bookings tracked separately |
| Flat commission tracking | Per-channel commission rules |
| One pricing rule for everyone | Possible to give 10% off to direct website bookings |
| Harder multi-OTA scaling | Ready to add Viator/Expedia/GetYourGuide as their own channels |

## What doesn't change

- Your products (El Yunque, Catamaran, Salsa) — same, no edit needed
- Your API keys — same values, just rebound
- Your Bókun dashboard workflow — same
- Pricing — same prices unless you create channel-specific rules

---

## Rollback (just in case)

If anything goes wrong, rollback is trivial:

1. Go to **Developer API → Casa Venturas Website API**
2. Change **Booking Channel** back to `Internal Channel`
3. Click **Save**

You're back to the previous state in 30 seconds.

---

## Send to developer

```
New BOOKING_CHANNEL_UUID = ________________________________________
```

The developer will update `.env.local` and redeploy — no other action required from your side.

---

*Casa Venturas × Bókun — dedicated channel setup v1.0*
