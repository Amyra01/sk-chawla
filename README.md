# Sunil Chawla — Advocate, Tax Advisor & Tax Consultant Platform

Production-ready Next.js 14 (App Router) + TypeScript + Tailwind CSS + Three.js (WebGL) + Supabase + Razorpay platform for **Mr. Sunil Chawla** (B.A. LL.B. Hons, DAVV Indore — 22+ years in GST, Income Tax, VAT & Tax Litigation).

---

## 1. Placeholders to Supply Before Launch
Never invent these values; replace them in `site_settings` (Supabase) and the corresponding UI/email templates once provided by Mr. Chawla:

- `[PHOTO]` — Portrait image in the Hero section
- `[PHONE]` — Office phone / WhatsApp number
- `[EMAIL]` — Office contact & support email
- `[ADDRESS]` — In-office consultation street address
- `[CITY]` — City & local SEO target
- `[HOURS]` — Office working hours
- `[GSTIN]` — Practice GSTIN for GST tax invoices
- `[CASES HANDLED]` — Verified case count (optional)
- `[SERVICE PRICES]` — Final fee schedule in Admin / `services` table
- `[TESTIMONIALS]` — Admin-approved client testimonials only
- `[SOCIAL LINKS]` — LinkedIn / Google Business Profile links
- `[BAR COUNCIL ENROLMENT NO.]` — Bar Council enrolment number for Footer & Trust Centre

---

## 2. Architecture & Folder Structure
```text
src/
  app/
    api/
      ai/chat/              # Claude AI assistant with strict non-advice guardrails
      bookings/             # Live availability (Google Calendar + slot_holds) & booking creation
      callbacks/            # 10-minute callback requests
      cron/reminders/       # Automated 24h/1h reminder job
      health-check/         # Compliance Health Check scoring & lead capture
      notice-decoder/       # AI OCR notice extraction & Urgent Notice ticket creation
      orders/checkout/      # Razorpay order + 18% GST calculation + GST invoice
      queries/              # Query ticketing (SC-YYYY-XXXXX) & status tracker
      reminders/            # Compliance due-date & newsletter subscriptions
      webhooks/razorpay/    # Signed HMAC-SHA256 idempotent webhook handler
    admin/                  # Admin Command Center (overview, pipeline, feature toggles, CSV export)
    ask-query/              # Query form with Voice-to-Query (EN/HI) + Ticket Tracker
    book/                   # 5-step Consultation Booking Wizard (IST + Meet + .ics)
    card/                   # Digital Visiting Card (vCard .vcf + QR code + print)
    compliance-calendar/    # Admin-editable GST/IT/VAT due dates & reminder signup
    health-check/           # 2-minute animated Business Compliance Health Check
    industries/             # 6 dedicated Industry Solutions sections
    insights/               # Knowledge Hub articles & search
    notice-decoder/         # Notice Review Desk with AI OCR
    portal/                 # Client Portal (OTP login, Multi-GSTIN grid, Document Vault, Meeting Room)
    services/               # Services Store & individual product pages
    tools/                  # Free Tax Tools & Appeal/Reply Time-Limit Calculator
    trust-centre/           # Credentials, DPDP Act 2023 & encryption governance
    privacy/, terms/, refund-policy/
  components/
    scene/
      Scene.ts              # Imperative Three.js r172+ WebGL scene class
      StageCanvas.tsx       # Dynamic client canvas wrapper with CSS no-WebGL fallback
      ProgressRail.tsx      # Vertical section progress dots
    home/                   # HomeClient & DealerJourneyMap
    layout/                 # Sticky Navbar + Live Due-Date Ticker + Footer
    providers/              # AppProvider (Cart, EN/HI Locale, Lenis, Cmd+K, Konami Easter Egg)
    store/                  # Slide-over CartDrawer with add-ons, coupons & 18% GST
    ui/                     # Preloader, CustomCursor, MagneticButton, TiltCard, CommandPalette, AiAssistantWidget
supabase/
  migrations/
    001_initial_schema.sql  # All Section 5 & Section 10 tables, indexes, FKs, soft deletes
    002_rls_policies.sql    # Row Level Security on every table + is_admin()
    003_seed_data.sql       # Seed categories, services, consultation types, FAQs, compliance dates
```

---

## 3. Tuning the 3D Motion Layer (`components/scene/Scene.ts`)
- **Camera Shots:** Edit `SECTION_SHOTS` in `src/components/scene/Scene.ts` (`pos` and `look` `THREE.Vector3` coordinates) to adjust framing for each section.
- **Colours:** Base background/fog is `#050505`, primary accent `#0A66FF`, secondary glow `#00D1FF`, gold `#D4AF37` (rupee tokens only), and red `#2a060a` (error flash only).
- **Quality Levels:** Pixel ratio is capped at `1.75`, frame delta is clamped to `0.05s`, and devices with `<= 4 GB` RAM or `<= 4` CPU cores automatically disable shadows and antialiasing. `prefers-reduced-motion` freezes ambient/drop animations and jumps camera shots cleanly.

---

## 4. Step-by-Step Setup & Deployment Guide
1. **Install & Run Locally**
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```
2. **Supabase Setup**
   - Create a Supabase project and copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` into `.env.local`.
   - Run `supabase/migrations/001_initial_schema.sql`, `002_rls_policies.sql`, and `003_seed_data.sql` in the Supabase SQL Editor.
   - Create a private storage bucket named `client-documents` for the Document Vault.
3. **Razorpay (Test Mode -> Live)**
   - Add `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`.
   - Point Razorpay Webhooks to `https://yourdomain.com/api/webhooks/razorpay` for `payment.captured`, `payment.failed`, and `refund.created`.
4. **Google Calendar OAuth**
   - Enable Google Calendar API in Google Cloud Console, configure OAuth credentials, and store `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN`.
5. **Email, WhatsApp, Anti-Spam & Claude AI**
   - Configure Resend (`RESEND_API_KEY`), WhatsApp Cloud API, Cloudflare Turnstile, Upstash Redis, and `ANTHROPIC_API_KEY`.
6. **Deploy to Vercel**
   - Connect the repository to Vercel, add all `.env.example` variables in Vercel Project Settings, and configure a Vercel Cron job hitting `/api/cron/reminders` with `Authorization: Bearer <CRON_SECRET>`.

---

## 5. Testing Checklist
- **Booking Race Conditions:** Open two tabs for the same IST slot; confirm the 10-minute `slot_holds` record blocks the second tab.
- **Payment Webhooks:** Send a signed Razorpay test webhook to `/api/webhooks/razorpay`; verify idempotency on duplicate delivery.
- **Failed Payments:** Trigger `payment.failed` and verify order status updates to `failed` and scene `fail()` flash triggers on client errors.
- **Refund Flow:** Trigger `refund.created` webhook and confirm `orders.status = 'refunded'`.
- **Reminder Jobs:** Call `GET /api/cron/reminders` with `Bearer $CRON_SECRET` and verify `reminder_24h_sent` updates.
