-- =============================================================================
-- 002_rls_policies.sql
-- Row Level Security policies for all tables in public schema
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'user_roles', 'service_categories', 'services', 'consultation_types',
    'availability_rules', 'blackout_dates', 'bookings', 'slot_holds', 'waitlist',
    'queries', 'query_messages', 'orders', 'order_items', 'payments', 'invoices',
    'subscriptions', 'coupons', 'cases', 'case_timeline', 'documents',
    'document_requests', 'messages', 'leads', 'testimonials', 'blog_posts',
    'faqs', 'compliance_dates', 'reminder_subscriptions', 'referrals',
    'newsletter_subscribers', 'notifications', 'audit_logs', 'ai_chat_logs',
    'site_settings', 'health_check_results', 'notice_scans', 'case_stories',
    'industry_pages', 'deadline_rules', 'video_explainers', 'entity_groups',
    'filing_status', 'quotes', 'callback_requests'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- Profiles: users read/update own profile; admins read all
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles: admins only (users can read their own role)
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- Public read-only catalogs (active/published items) + admin full access
CREATE POLICY "service_categories_public_read" ON public.service_categories
  FOR SELECT USING ((is_active = TRUE AND deleted_at IS NULL) OR public.is_admin());
CREATE POLICY "service_categories_admin" ON public.service_categories
  FOR ALL USING (public.is_admin());

CREATE POLICY "services_public_read" ON public.services
  FOR SELECT USING ((is_active = TRUE AND deleted_at IS NULL) OR public.is_admin());
CREATE POLICY "services_admin" ON public.services
  FOR ALL USING (public.is_admin());

CREATE POLICY "consultation_types_public_read" ON public.consultation_types
  FOR SELECT USING ((is_active = TRUE AND deleted_at IS NULL) OR public.is_admin());
CREATE POLICY "consultation_types_admin" ON public.consultation_types
  FOR ALL USING (public.is_admin());

CREATE POLICY "availability_rules_public_read" ON public.availability_rules
  FOR SELECT USING (TRUE);
CREATE POLICY "availability_rules_admin" ON public.availability_rules
  FOR ALL USING (public.is_admin());

CREATE POLICY "blackout_dates_public_read" ON public.blackout_dates
  FOR SELECT USING (TRUE);
CREATE POLICY "blackout_dates_admin" ON public.blackout_dates
  FOR ALL USING (public.is_admin());

CREATE POLICY "blog_posts_public_read" ON public.blog_posts
  FOR SELECT USING ((is_published = TRUE AND deleted_at IS NULL) OR public.is_admin());
CREATE POLICY "blog_posts_admin" ON public.blog_posts
  FOR ALL USING (public.is_admin());

CREATE POLICY "faqs_public_read" ON public.faqs
  FOR SELECT USING ((is_published = TRUE AND deleted_at IS NULL) OR public.is_admin());
CREATE POLICY "faqs_admin" ON public.faqs
  FOR ALL USING (public.is_admin());

CREATE POLICY "testimonials_public_read" ON public.testimonials
  FOR SELECT USING ((is_approved = TRUE AND deleted_at IS NULL) OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "testimonials_insert_auth" ON public.testimonials
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "testimonials_admin" ON public.testimonials
  FOR ALL USING (public.is_admin());

CREATE POLICY "compliance_dates_public_read" ON public.compliance_dates
  FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "compliance_dates_admin" ON public.compliance_dates
  FOR ALL USING (public.is_admin());

CREATE POLICY "case_stories_public_read" ON public.case_stories
  FOR SELECT USING ((is_published = TRUE AND deleted_at IS NULL) OR public.is_admin());
CREATE POLICY "case_stories_admin" ON public.case_stories
  FOR ALL USING (public.is_admin());

CREATE POLICY "industry_pages_public_read" ON public.industry_pages
  FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "industry_pages_admin" ON public.industry_pages
  FOR ALL USING (public.is_admin());

CREATE POLICY "deadline_rules_public_read" ON public.deadline_rules
  FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "deadline_rules_admin" ON public.deadline_rules
  FOR ALL USING (public.is_admin());

CREATE POLICY "video_explainers_public_read" ON public.video_explainers
  FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "video_explainers_admin" ON public.video_explainers
  FOR ALL USING (public.is_admin());

CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (TRUE);
CREATE POLICY "site_settings_admin" ON public.site_settings
  FOR ALL USING (public.is_admin());

-- User-scoped operational tables (clients see own, admins see all)
CREATE POLICY "bookings_own_or_admin" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "bookings_admin" ON public.bookings
  FOR ALL USING (public.is_admin());

CREATE POLICY "queries_own_or_public_or_admin" ON public.queries
  FOR SELECT USING (is_public_qa = TRUE OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "queries_admin" ON public.queries
  FOR ALL USING (public.is_admin());

CREATE POLICY "query_messages_own_or_admin" ON public.query_messages
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.queries q WHERE q.id = query_id AND q.user_id = auth.uid()
    )
  );
CREATE POLICY "query_messages_insert_own_or_admin" ON public.query_messages
  FOR INSERT WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.queries q WHERE q.id = query_id AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "orders_own_or_admin" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_admin" ON public.orders
  FOR ALL USING (public.is_admin());

CREATE POLICY "order_items_own_or_admin" ON public.order_items
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "payments_own_or_admin" ON public.payments
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "invoices_own_or_admin" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "subscriptions_own_or_admin" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "cases_own_or_admin" ON public.cases
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "cases_admin" ON public.cases
  FOR ALL USING (public.is_admin());

CREATE POLICY "case_timeline_own_or_admin" ON public.case_timeline
  FOR SELECT USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.user_id = auth.uid()
    )
  );
CREATE POLICY "case_timeline_admin" ON public.case_timeline
  FOR ALL USING (public.is_admin());

CREATE POLICY "documents_own_or_admin" ON public.documents
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "document_requests_own_or_admin" ON public.document_requests
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "messages_own_or_admin" ON public.messages
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "notifications_own_or_admin" ON public.notifications
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "referrals_own_or_admin" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR public.is_admin());

CREATE POLICY "entity_groups_own_or_admin" ON public.entity_groups
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "filing_status_own_or_admin" ON public.filing_status
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "health_check_own_or_admin" ON public.health_check_results
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "notice_scans_own_or_admin" ON public.notice_scans
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "quotes_own_or_admin" ON public.quotes
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Admin-only operational tables (server-side service role handles public inserts via API routes)
CREATE POLICY "slot_holds_admin" ON public.slot_holds FOR ALL USING (public.is_admin());
CREATE POLICY "waitlist_admin" ON public.waitlist FOR ALL USING (public.is_admin());
CREATE POLICY "coupons_admin" ON public.coupons FOR ALL USING (public.is_admin());
CREATE POLICY "leads_admin" ON public.leads FOR ALL USING (public.is_admin());
CREATE POLICY "reminder_subs_admin" ON public.reminder_subscriptions FOR ALL USING (public.is_admin());
CREATE POLICY "newsletter_admin" ON public.newsletter_subscribers FOR ALL USING (public.is_admin());
CREATE POLICY "audit_logs_admin" ON public.audit_logs FOR ALL USING (public.is_admin());
CREATE POLICY "ai_chat_logs_admin" ON public.ai_chat_logs FOR ALL USING (public.is_admin());
CREATE POLICY "callback_requests_admin" ON public.callback_requests FOR ALL USING (public.is_admin());
