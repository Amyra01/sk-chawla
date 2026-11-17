-- =============================================================================
-- 001_initial_schema.sql
-- Complete PostgreSQL / Supabase schema for Sunil Chawla Platform
-- Includes all Section 5 & Section 10 tables, indexes, FKs, timestamps, soft deletes
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper trigger function to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- 1. Profiles & Roles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  pan_encrypted TEXT,
  gstin_encrypted TEXT,
  billing_address JSONB DEFAULT '{}'::jsonb,
  notification_preferences JSONB DEFAULT '{"email": true, "whatsapp": true, "sms": false}'::jsonb,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  dpdp_consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- -----------------------------------------------------------------------------
-- 2. Service Categories & Services Store
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  short_description_en TEXT NOT NULL,
  short_description_hi TEXT,
  full_description_en TEXT,
  full_description_hi TEXT,
  whats_included JSONB NOT NULL DEFAULT '[]'::jsonb,
  documents_required JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  turnaround_time TEXT,
  price_inr NUMERIC(12,2),
  price_display TEXT DEFAULT '[SERVICE PRICES]',
  is_starting_at BOOLEAN NOT NULL DEFAULT TRUE,
  sac_code TEXT DEFAULT '998213',
  hsn_code TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_retainer BOOLEAN NOT NULL DEFAULT FALSE,
  billing_interval TEXT CHECK (billing_interval IN ('one_time', 'monthly', 'quarterly', 'annual')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 3. Consultation Types, Availability, Blackout Dates, Bookings, Slot Holds, Waitlist
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  description_en TEXT,
  description_hi TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price_inr NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_modes TEXT[] NOT NULL DEFAULT ARRAY['google_meet', 'phone', 'in_office'],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  buffer_minutes INT NOT NULL DEFAULT 15,
  daily_booking_cap INT NOT NULL DEFAULT 8,
  min_notice_hours INT NOT NULL DEFAULT 4,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blackout_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.slot_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  session_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  released BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_slot_holds_active ON public.slot_holds (slot_start, slot_end, expires_at) WHERE released = FALSE;

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  consultation_type_id UUID NOT NULL REFERENCES public.consultation_types(id),
  mode TEXT NOT NULL CHECK (mode IN ('google_meet', 'phone', 'in_office')),
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  gstin_encrypted TEXT,
  topic TEXT NOT NULL,
  description TEXT,
  attachment_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  google_event_id TEXT,
  meet_link TEXT,
  manage_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'confirmed', 'rescheduled', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'free', 'paid', 'refunded')),
  amount_inr NUMERIC(10,2) NOT NULL DEFAULT 0,
  agenda TEXT,
  post_meeting_summary TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  dpdp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_24h_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_1h_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON public.bookings (slot_start, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings (user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desired_date DATE NOT NULL,
  consultation_type_id UUID REFERENCES public.consultation_types(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  notified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. Queries & Ticketing System
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('GST', 'ITR', 'VAT', 'Litigation', 'Company Setup', 'Other')),
  urgency TEXT NOT NULL DEFAULT 'Normal' CHECK (urgency IN ('Normal', 'Urgent')),
  subject TEXT,
  question TEXT NOT NULL,
  attachment_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'Received' CHECK (status IN ('Received', 'Under Review', 'Answered', 'Closed')),
  is_paid_opinion BOOLEAN NOT NULL DEFAULT FALSE,
  is_public_qa BOOLEAN NOT NULL DEFAULT FALSE,
  public_qa_consent BOOLEAN NOT NULL DEFAULT FALSE,
  anonymised_question TEXT,
  anonymised_answer TEXT,
  notice_deadline DATE,
  dpdp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_queries_ticket ON public.queries (ticket_id);

CREATE TABLE IF NOT EXISTS public.query_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES public.queries(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin')),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachment_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. Store: Orders, Order Items, Payments, Invoices, Subscriptions, Coupons
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_inr NUMERIC(10,2) DEFAULT 0,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_gstin_encrypted TEXT,
  subtotal_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  gst_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  addons JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  razorpay_order_id TEXT,
  dpdp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  sac_code TEXT DEFAULT '998213',
  quantity INT NOT NULL DEFAULT 1,
  unit_price_inr NUMERIC(12,2) NOT NULL,
  total_price_inr NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  amount_inr NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  webhook_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_gstin TEXT DEFAULT '[GSTIN]',
  buyer_gstin_encrypted TEXT,
  sac_code TEXT DEFAULT '998213',
  hsn_code TEXT,
  subtotal_inr NUMERIC(12,2) NOT NULL,
  cgst_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  sgst_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  igst_inr NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_inr NUMERIC(12,2) NOT NULL,
  pdf_storage_path TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  razorpay_subscription_id TEXT UNIQUE,
  plan_name TEXT NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('monthly', 'quarterly', 'annual')),
  amount_inr NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'active', 'paused', 'cancelled', 'completed')),
  current_start TIMESTAMPTZ,
  current_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. Cases, Timeline, Documents, Document Requests & Client Messaging
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'Initiated' CHECK (stage IN ('Initiated', 'Documents Requested', 'In Progress', 'Filed / Replied', 'Hearing Scheduled', 'Completed')),
  next_hearing_date DATE,
  reply_deadline DATE,
  appeal_limit_date DATE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.case_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  folder TEXT NOT NULL DEFAULT 'General',
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  is_signed_auth BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Received', 'Verified')),
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'admin')),
  body TEXT NOT NULL,
  attachment_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. CRM Leads, Testimonials, Blog, FAQs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'whatsapp', 'referral', 'booking', 'query', 'health_check', 'notice_decoder', 'calculator', 'checklist', 'ai_chat', 'callback')),
  stage TEXT NOT NULL DEFAULT 'New' CHECK (stage IN ('New', 'Contacted', 'Consulted', 'Converted', 'Lost')),
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  follow_up_at TIMESTAMPTZ,
  dpdp_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  company_or_role TEXT,
  service_name TEXT,
  quote TEXT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  excerpt_en TEXT NOT NULL,
  excerpt_hi TEXT,
  content_md_en TEXT NOT NULL,
  content_md_hi TEXT,
  category TEXT NOT NULL,
  reading_time_minutes INT NOT NULL DEFAULT 4,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'General',
  question_en TEXT NOT NULL,
  question_hi TEXT,
  answer_en TEXT NOT NULL,
  answer_hi TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- -----------------------------------------------------------------------------
-- 8. Compliance Calendar, Reminders, Referrals, Newsletter, Notifications, Audit, AI Logs, Settings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('GST', 'Income Tax', 'VAT', 'MCA', 'Other')),
  form_code TEXT NOT NULL,
  due_date DATE NOT NULL,
  applicable_to TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reminder_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_date_id UUID REFERENCES public.compliance_dates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'whatsapp', 'both')),
  dpdp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  discount_credit_inr NUMERIC(10,2) NOT NULL DEFAULT 500,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'credited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  list_type TEXT NOT NULL DEFAULT 'gst_updates',
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirm_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  unsubscribed_at TIMESTAMPTZ,
  dpdp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_message TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  handed_off BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. Section 10 Signature Feature Tables
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.health_check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  answers JSONB NOT NULL,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  risk_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  dpdp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notice_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  file_name TEXT NOT NULL,
  storage_path TEXT,
  extracted_notice_type TEXT,
  extracted_section TEXT,
  date_issued DATE,
  reply_deadline DATE,
  issuing_authority TEXT,
  plain_english_summary JSONB,
  linked_query_id UUID REFERENCES public.queries(id) ON DELETE SET NULL,
  dpdp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.case_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  problem_summary TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  outcome_summary TEXT NOT NULL,
  client_consent_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.industry_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  subtitle_en TEXT,
  pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  relevant_service_slugs TEXT[] DEFAULT ARRAY[]::TEXT[],
  documents_needed JSONB NOT NULL DEFAULT '[]'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.deadline_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  order_or_notice_type TEXT NOT NULL,
  statute TEXT NOT NULL,
  days_allowed INT NOT NULL,
  is_months BOOLEAN NOT NULL DEFAULT FALSE,
  months_allowed INT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.video_explainers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_hi TEXT,
  topic TEXT NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 60,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  transcript TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.entity_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_name TEXT NOT NULL,
  gstin_encrypted TEXT NOT NULL,
  gstin_masked TEXT NOT NULL,
  state_code TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.filing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_group_id UUID NOT NULL REFERENCES public.entity_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_label TEXT NOT NULL, -- e.g. '2026-10'
  return_type TEXT NOT NULL CHECK (return_type IN ('GSTR-1', 'GSTR-3B', 'GSTR-9', 'ITR')),
  status TEXT NOT NULL CHECK (status IN ('filed', 'pending', 'overdue')),
  filed_at TIMESTAMPTZ,
  acknowledgement_no TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (entity_group_id, period_label, return_type)
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_scope TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  quoted_amount_inr NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'sent', 'accepted', 'paid', 'expired')),
  pay_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  dpdp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.callback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  topic TEXT,
  within_business_hours BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'called', 'missed')),
  dpdp_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attach updated_at triggers to tables that have updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'service_categories', 'services', 'consultation_types',
    'availability_rules', 'bookings', 'queries', 'orders', 'payments',
    'subscriptions', 'cases', 'document_requests', 'leads', 'blog_posts',
    'faqs', 'compliance_dates', 'case_stories', 'industry_pages',
    'deadline_rules', 'video_explainers', 'entity_groups', 'filing_status',
    'quotes'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;
      CREATE TRIGGER trg_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', t, t, t, t);
  END LOOP;
END $$;
