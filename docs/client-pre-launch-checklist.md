# Casa Venturas website — pre-launch checklist

All the remaining things we need from you before flipping the website's new inline checkout from **dev-mock** (no real bookings) to **live** (real payments + real bookings in your Bókun dashboard).

**Status key:**
- ✅ already done (or not needed)
- 🟠 required before flipping to live
- 🟡 strongly recommended
- 🟢 nice-to-have (can be done after launch)

---

## 1. Bókun configuration

### ✅ Already done

- Bókun account active, 3 tours published (El Yunque #448405, Catamaran #1134501, Salsa #680641)
- API key created (Casa Venturas Website API) + Admin role
- 77 pickup locations listed for El Yunque, with per-hotel `askForRoomNumber` flag
- Pricing categories (Adult / Child) set on El Yunque and Catamaran; Adult-only on Salsa
- Cancellation policy: 24h full refund (Standard Viator policy)
- Stripe payment provider connected (STRIPE_TOKEN)

### 🟠 Required before flipping to live

1. **Regenerate the Bókun API Secret Key**
   *Why: the current one was shared via WhatsApp during setup. Industry practice requires a fresh secret before prod.*
   - Settings → Developer API → "Casa Venturas Website API"
   - Click **Regenerate** (or Delete + recreate)
   - Send us the new pair (access + secret) privately

2. **Create a dedicated Booking Channel** (currently using "Internal Channel")
   *Why: clean commission tracking, per-channel pricing rules, ready for multi-OTA scaling.*
   - See [bokun-create-dedicated-channel.md](./bokun-create-dedicated-channel.md)
   - Expected time: 3 min
   - Send us the new `BOOKING_CHANNEL_UUID`

3. **Point Bókun's checkout to our legal pages**
   - Settings → Company Profile → Legal URLs (wording varies)
   - Terms & Conditions URL: `https://micasaventuras.com/terms`
   - Privacy Policy URL: `https://micasaventuras.com/privacy`
   - Both pages are already published. No content to write.

### 🟡 Strongly recommended

4. **Enable custom pickup for El Yunque** (let guests enter addresses outside the 77-hotel list)
   - See [bokun-enable-custom-pickup.md](./bokun-enable-custom-pickup.md)
   - Expected time: 1 min
   - Our website will automatically show the "Enter custom address" link once you toggle it ON

5. **Configure webhooks Bókun → your automation (if any)**
   - Settings → Notifications → Webhooks → Add URL
   - Events: `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `BOOKING_UPDATED`
   - Target URL: your n8n / Zapier / Make webhook (if you have one)
   - If you don't use automation: skip — Bókun's built-in confirmation emails are enough.

### 🟢 Nice-to-have

6. **Clean up the `requirements` HTML field on Catamaran**
   *The content looks truncated / malformed in the API response (~368 chars of partial HTML). We can still display it but it'll render prettier if you re-save the field in Bókun's rich-text editor.*

7. **Add `bookingQuestions` if you want to ask anything custom**
   *Empty today. Example: "Any dietary restrictions?", "Celebration occasion?". Anything you add will automatically appear in our checkout form (no code change needed).*

---

## 2. Stripe configuration

### ✅ Already in place

- Stripe account connected via Bókun (Casa Venturas Stripe, `STRIPE_TOKEN` provider)
- Publishable key retrieved from Bókun's API response

### 🟠 Required before flipping to live

8. **Verify Stripe account is activated for payouts**
   - See [bokun-retrieve-stripe-keys.md](./bokun-retrieve-stripe-keys.md) Step 4
   - If you see a red banner asking for KYC → complete it
   - Otherwise bookings will be accepted but funds held in escrow

9. **Confirm which Stripe account email you use**
   *So you can log into dashboard.stripe.com in case of refund or dispute.*

### 🟡 Strongly recommended

10. **Do a real test booking with a small-amount tour** (after we flip to live)
    - Use the Salsa tour ($65 — lowest risk) with your own credit card
    - Confirm the booking appears in your Bókun dashboard
    - Confirm the money lands in your Stripe dashboard
    - Then **cancel/refund** the booking from Bókun to return the funds
    - Takes ~5 minutes, costs $65 momentarily (refunded)

### 🟢 Nice-to-have

11. **Consider migrating from Stripe Token → Stripe Connect in Bókun**
    *Why: better 3DS SCA support for European cards, enables Apple Pay / Google Pay through Bókun's widget, cleaner reporting.*
    *How: Bókun → Settings → Payment Providers → Stripe → "Upgrade to Stripe Connect" button.*
    *Timing: after launch, no urgency.*

---

## 3. Communication channels

### ✅ Already configured

- Email: micasaventuras@gmail.com
- Phone: +1 929 372 4529
- TripAdvisor listing verified (1,458 reviews, 5.0★)

### 🟠 Required before prod

12. **Give us a WhatsApp Business number** (for guide dispatch + customer-facing support in confirmations)
    - Used in the post-booking email: *"Your guide will contact you on WhatsApp at +XXX"*
    - If you use your personal phone → just confirm it's the right number

### 🟡 Strongly recommended

13. **Decide the guide-to-tour assignment rule**
    *Example: "Eliu handles all El Yunque, Juelz is backup", "Zoe always does Salsa".*
    *Used by automation if we wire n8n later. Not blocking today.*

---

## 4. Domain / infrastructure

### ✅ Already done

- Domain: micasaventuras.com (redirecting from old Weebly → new site planned)
- Cloudflare Pages: OpenNext config committed (see `cv-next/docs/cloudflare-deploy.md`)
- Legal pages published: /terms, /privacy, /cookies

### 🟠 Required before prod

14. **Point `micasaventuras.com` DNS to Cloudflare Pages**
    *When we're ready to go live, we'll give you the exact CNAME / A records to set. Transition time: ~10 minutes of propagation + 30 min certificate provisioning.*

### 🟢 Nice-to-have

15. **Transfer the old Weebly subscription to a cheaper plan or cancel it**
    *After go-live, the Weebly site can be archived. Saves the monthly Weebly fee.*

---

## 4b. TripAdvisor + OTA cleanup (discovered via /audit-index-biz 2026-04-23)

*Context: your SEO authority lives on the old Weebly `micasaventuras.com` right now — 1,458 reviews, ranked #10 of 152 Tours and #1 of 99 Transportation Services in San Juan. At DNS cutover these signals do not auto-transfer. The actions below lock in the transfer and remove outdated listings before the new site goes live.*

### 🟠 Required before DNS flip

A2. **Claim TripAdvisor Business listing**
    - Owner URL: https://www.tripadvisor.com/Attraction_Review-g147320-d21156167-Reviews-Casa_Venturas-San_Juan_Puerto_Rico.html
    - On TripAdvisor → "Claim your listing" → verify via email (`micasaventuras@gmail.com`)
    - Once verified: **update the "Website" field** to `https://casaventuras.com`
      (Even if DNS is not yet configured — TripAdvisor stores the value and it becomes active automatically at cutover.)
    - Expected time: 30 min (verification email can take up to 24 h)

A3. **Optimize the Catamaran product listing** (TripAdvisor product d34092341)
    - URL: https://www.tripadvisor.com/AttractionProductReview-g147319-d34092341-Private_Luxury_Sailing_Catamaran_Day_to_Vieques-Puerto_Rico.html
    - Long description, 1000+ words (mention: 40-ft Bali, Punta Arena, Humacao marina, up to 12 guests, sunset return, professional crew)
    - 20+ HD photos (reuse `/public/images/tours/catamaran/*` from the website)
    - Minimum 3 Q&A (minimum age, bathroom on board, seasickness)
    - Tags: Full Day, Private, Luxury, Small Group, Sailing
    - Expected time: 2 h

A7. **Dereference the decommissioned Surf + Rum Distillery tours** (see decision D-022)
    These tours are no longer operated. They still appear on:
    - **Viator**: search "Casa Venturas" → Partner Support ticket to delist Surf + Rum
    - **Groupon**: https://www.groupon.com/deals/viator-casa-venturas → verify no Surf/Rum residual
    - **KAYAK Travel Guides**: confirm only El Yunque + Catamaran + Salsa are referenced
    - **TripAdvisor Business** (once A2 claim is approved): delete the obsolete Surf/Rum product entries
    - Expected time: 1 h active work (OTA-side turnaround typically 5–7 business days)

### 🟡 Strongly recommended

A-map. **Plan the 301 redirect map Weebly → new site** (see decision D-022)
    - At DNS cutover, a redirect map from every Weebly URL to its Next.js equivalent will be activated
    - Surf + Rum pages → HTTP 410 Gone (officially decommissioned, do not try to preserve their authority)
    - Full mapping to be prepared in a follow-up doc `docs/weebly-migration-301.md` before DNS flip

---

## 5. Summary — what to send us

When all 🟠 items are checked, reply with:

```
1. New BOKUN_ACCESS_KEY       = ______________________________________
2. New BOKUN_SECRET_KEY       = ______________________________________  🔒 private
3. New BOOKING_CHANNEL_UUID   = ______________________________________
4. Stripe Publishable Key     = pk_live_  (confirm it matches what we have)
5. Stripe account status      = (verified / pending KYC)
6. WhatsApp Business number   = +_____________________________________
7. Ready to flip to live?     = (yes / not yet, we want to verify X first)
```

Once we get this, we flip `CHECKOUT_MODE=live` in the website config, deploy, and you can start taking real bookings directly from your own website — 0% platform commission on these (vs 20–25% on Viator/TripAdvisor).

---

*Casa Venturas × pre-launch checklist v1.0 — live flip when 🟠 items done*
