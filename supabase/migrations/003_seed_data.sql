-- =============================================================================
-- 003_seed_data.sql
-- Seed data for Sunil Chawla Platform
-- =============================================================================

-- Site Settings (admin-toggleable features & placeholders)
INSERT INTO public.site_settings (key, value, description) VALUES
('practice_info', '{
  "name": "Sunil Chawla",
  "firm_name": "SUNIL CHAWLA & ASSOCIATES",
  "title": "Advocate & Tax Consultant",
  "qualifications": "B.A. LL.B. (Hons), DAVV Indore",
  "experience_years": 22,
  "phone": "9872355007",
  "email": "sunilkumarchawla@gmail.com",
  "address": "42, Street No. 1B7, Santokh Nagar, Shiv Puri, near Masjid, Vishnupuri, New Shiv Puri, Ludhiana, Punjab 141008, India",
  "city": "Ludhiana, Punjab",
  "hours": "8:30 AM – 10:30 PM",
  "cases_handled": "[CASES HANDLED]",
  "social_links": "[SOCIAL LINKS]"
}'::jsonb, 'Core practice details and placeholders'),
('feature_flags', '{
  "enable_booking": true,
  "enable_queries": true,
  "enable_store": true,
  "enable_notice_decoder": true,
  "enable_health_check": true,
  "enable_ai_assistant": true,
  "enable_voice_query": true,
  "enable_due_date_ticker": true,
  "enable_callback_request": true,
  "enable_hindi_toggle": true,
  "enable_3d_scene": true
}'::jsonb, 'Admin toggles for switching features on/off'),
('tax_calculator_rates', '{
  "gst_late_fee_per_day_nil": 20,
  "gst_late_fee_per_day_regular": 50,
  "gst_interest_rate_pa": 18,
  "gst_max_late_fee": 5000
}'::jsonb, 'Admin-editable rates for free tax estimators')
ON CONFLICT (key) DO NOTHING;

-- Service Categories
INSERT INTO public.service_categories (slug, name_en, name_hi, description_en, sort_order) VALUES
('gst-indirect-tax', 'GST and Indirect Tax', 'जीएसटी और अप्रत्यक्ष कर', 'Registration, monthly/annual returns, VAT legacy matters, GST dispute resolution and Bar licence applications.', 1),
('income-tax-direct-tax', 'Income Tax and Direct Tax', 'आयकर और प्रत्यक्ष कर', 'ITR filing, strategic income tax planning, direct/indirect advisory and partnership firm taxation.', 2),
('litigation-corporate', 'Litigation and Corporate', 'मुकदमेबाजी और कॉर्पोरेट', 'Revenue court representation, drafting compliance replies, appeal notices, company incorporation via MCA portal and legacy committee matters.', 3)
ON CONFLICT (slug) DO NOTHING;

-- Services
INSERT INTO public.services (
  category_id, slug, title_en, title_hi, short_description_en, full_description_en,
  whats_included, documents_required, turnaround_time, price_inr, price_display, is_featured, is_retainer, billing_interval, sort_order
)
SELECT
  c.id,
  s.slug,
  s.title_en,
  s.title_hi,
  s.short_desc,
  s.full_desc,
  s.included::jsonb,
  s.docs::jsonb,
  s.turnaround,
  s.price_inr,
  '[SERVICE PRICES]',
  s.is_featured,
  s.is_retainer,
  s.billing_interval,
  s.sort_order
FROM (VALUES
  ('gst-indirect-tax', 'new-gst-registration', 'New GST Registration', 'नया जीएसटी पंजीकरण',
   'End-to-end GSTIN registration for proprietorships, partnerships, LLPs and companies.',
   'Complete documentation verification, ARN tracking, clarification replies and GSTIN certificate issuance.',
   '["Eligibility & composition scheme check","Application filing on GST portal","Department query / SCN reply if raised","GSTIN certificate & HSN/SAC mapping"]',
   '["PAN Card of Business/Promoters","Aadhaar Card & Photograph","Business Address Proof (Electricity Bill + Rent Agreement/NOC)","Bank Account Cancelled Cheque / Statement"]',
   '3–7 working days', 2500, false, false, 'one_time', 1),
  ('gst-indirect-tax', 'gst-return-filing', 'GST Return Filing (GSTR-1, 3B, 9)', 'जीएसटी रिटर्न फाइलिंग',
   'Accurate monthly/quarterly GSTR-1, GSTR-3B reconciliation and annual GSTR-9 filing.',
   'GSTR-2B vs books reconciliation, ITC eligibility audit and timely filing to avoid late fees and notices.',
   '["GSTR-1 outward supply filing","GSTR-2B ITC reconciliation","GSTR-3B computation & filing","Monthly compliance summary"]',
   '["Sales & Purchase Register (Excel/Tally)","Bank Statements","Credit/Debit Notes","E-way Bill Summary"]',
   'Monthly / Annual', 1500, false, true, 'monthly', 2),
  ('gst-indirect-tax', 'vat-returns-legacy', 'VAT Returns & Legacy Assessments', 'वैट रिटर्न और पूर्व मूल्यांकन',
   'Representation and compliance for pending VAT assessments, C-Form issues and legacy disputes.',
   'Dedicated handling of pre-GST VAT assessments, statutory form reconciliations and state commercial tax proceedings.',
   '["Assessment file review","C-Form / F-Form reconciliation","Departmental representation","Rectification & appeal support"]',
   '["Historical VAT Returns","Assessment Order / Notice Copy","Statutory Forms (C/F/H)","Purchase & Sales Ledgers"]',
   'Case-dependent', 5000, false, false, 'one_time', 3),
  ('gst-indirect-tax', 'bar-licence-applications', 'Bar Licence & Excise Documentation', 'बार लाइसेंस आवेदन',
   'Documentation, tax clearance and compliance support for bar licence applications.',
   'Structured tax compliance, NOC documentation and procedural support for hospitality and bar licence applications.',
   '["Checklist & eligibility review","Tax clearance & net-worth certificates","Application dossier preparation","Follow-up compliance"]',
   '["Applicant KYC & PAN","Premises Lease / Ownership Papers","ITR & GST Compliance Records","Municipal / Fire NOCs"]',
   '7–14 working days', 10000, false, false, 'one_time', 4),
  ('income-tax-direct-tax', 'itr-filing-advisory', 'ITR Filing & Income Tax Planning', 'आयकर रिटर्न फाइलिंग और योजना',
   'Comprehensive ITR filing for individuals, professionals, HUFs, firms and corporates.',
   'AIS/TIS reconciliation, capital gains computation, old vs new regime optimisation and tax-saving structuring.',
   '["AIS, TIS & Form 26AS reconciliation","Old vs New Regime comparison","Deduction & capital gains optimisation","E-verification & acknowledgement"]',
   '["PAN & Aadhaar","Form 16 / 16A","Bank & Demat Statements","Balance Sheet & P&L (if business)"]',
   '2–4 working days', 2000, false, false, 'one_time', 5),
  ('income-tax-direct-tax', 'partnership-firm-taxation', 'Partnership Firm & Corporate Taxation', 'साझेदारी फर्म कराधान',
   'Tax structuring, partner remuneration/interest compliance and direct-indirect advisory.',
   'Complete direct and indirect tax advisory for partnership firms, LLPs and private limited entities.',
   '["Partnership deed tax-clause review","Section 40(b) remuneration & interest computation","Advance tax planning","Annual return & audit coordination"]',
   '["Partnership Deed / MOA & AOA","Trial Balance & Ledgers","Partner PAN & Capital Accounts","Prior Year ITRs"]',
   '5–7 working days', 4500, false, false, 'one_time', 6),
  ('litigation-corporate', 'tax-litigation-revenue-court', 'Tax Litigation & Revenue Court Representation', 'कर मुकदमेबाजी और राजस्व न्यायालय प्रतिनिधित्व',
   'Representation before GST/VAT authorities, appellate tribunals and revenue courts.',
   'Saving the dealer, one case at a time. Grounded representation in GST, Income Tax, VAT and revenue court matters.',
   '["Detailed case & order analysis","Grounds of appeal & legal drafting","Personal hearings & oral arguments","Stay application & recovery protection"]',
   '["Show Cause Notice / Assessment Order","Earlier Replies & Submissions","Supporting Invoices & E-way Bills","Authorisation / Vakalatnama"]',
   'As per statutory schedule', 15000, true, false, 'one_time', 7),
  ('litigation-corporate', 'notice-reply-drafting', 'Litigation Compliance Replies & Appeal Notices', 'नोटिस उत्तर और अपील प्रारूपण',
   'Structured legal replies to DRC-01, ASMT-10, Section 73/74 and Income Tax notices.',
   'Thorough factual and statutory drafting to address show-cause notices, audit objections and assessment appeals.',
   '["Notice & annexure audit","Reconciliation statement preparation","Legal reply drafting with statutory citations","Portal submission & acknowledgement"]',
   '["Copy of Notice / Order","Relevant Return & Ledger Extracts","GSTR-2B / 26AS Mismatch Data"]',
   '2–5 working days', 7500, true, false, 'one_time', 8),
  ('litigation-corporate', 'company-incorporation-mca', 'Company Incorporation & MCA Compliance', 'कंपनी निगमन और एमसीए अनुपालन',
   'End-to-end company setup: tax documentation, testing, MCA portal filing and ongoing compliance.',
   'SPICe+ filing on the MCA portal, MOA/AOA drafting, PAN/TAN/GST registration and post-incorporation tax setup.',
   '["Name reservation (RUN / SPICe+)","DSC, DIN & MOA/AOA drafting","MCA portal filing & Certificate of Incorporation","PAN, TAN, GST & bank setup support"]',
   '["Director PAN, Aadhaar & Passport/DL","Passport-size Photos","Registered Office Utility Bill & NOC","Proposed Business Objects"]',
   '7–12 working days', 9000, false, false, 'one_time', 9)
) AS s(cat_slug, slug, title_en, title_hi, short_desc, full_desc, included, docs, turnaround, price_inr, is_featured, is_retainer, billing_interval, sort_order)
JOIN public.service_categories c ON c.slug = s.cat_slug
ON CONFLICT (slug) DO NOTHING;

-- Consultation Types
INSERT INTO public.consultation_types (slug, title_en, title_hi, description_en, duration_minutes, price_inr, is_paid, sort_order) VALUES
('quick-call', 'Quick Call', 'त्वरित कॉल', 'Brief 15-minute initial orientation call to understand your query and scope.', 15, 0, FALSE, 1),
('standard-consultation', 'Standard Consultation', 'मानक परामर्श', 'Focused 30-minute consultation on GST, Income Tax, or compliance strategy.', 30, 1000, TRUE, 2),
('deep-dive-case-review', 'Deep-Dive Case Review', 'गहन केस समीक्षा', '60-minute detailed review of returns, ledgers, notices, or tax structuring.', 60, 2500, TRUE, 3),
('notice-litigation-strategy', 'Notice / Litigation Strategy Session', 'नोटिस / मुकदमेबाजी रणनीति सत्र', '60-minute urgent review of Show Cause Notices, DRC-01, assessment orders or appeals.', 60, 3000, TRUE, 4),
('business-company-setup', 'Business / Company Setup Planning', 'व्यवसाय / कंपनी स्थापना योजना', '45-minute planning session for new entity structure, MCA filing and GST setup.', 45, 1500, TRUE, 5)
ON CONFLICT (slug) DO NOTHING;

-- Default Availability Rules (Mon-Sat 10:30 AM - 6:30 PM IST)
INSERT INTO public.availability_rules (day_of_week, start_time, end_time, buffer_minutes, daily_booking_cap, min_notice_hours, is_active) VALUES
(1, '10:30', '18:30', 15, 8, 4, TRUE),
(2, '10:30', '18:30', 15, 8, 4, TRUE),
(3, '10:30', '18:30', 15, 8, 4, TRUE),
(4, '10:30', '18:30', 15, 8, 4, TRUE),
(5, '10:30', '18:30', 15, 8, 4, TRUE),
(6, '11:00', '16:00', 15, 5, 4, TRUE)
ON CONFLICT DO NOTHING;

-- FAQs
INSERT INTO public.faqs (category, question_en, answer_en, sort_order) VALUES
('General', 'Does submitting a query or booking form create an advocate-client relationship?', 'No. Submitting a form or sending a query on this website is purely informational and does not create an advocate-client relationship until formal engagement is confirmed.', 1),
('GST & Notices', 'What should I do immediately after receiving a GST Show Cause Notice (DRC-01)?', 'Note the date of communication and the reply deadline immediately. Gather your GSTR-1, GSTR-3B, GSTR-2B reconciliation and supporting invoices, and book a Notice Strategy Session or upload the notice via our Notice Review Desk.', 2),
('Consultations', 'Are consultations available online for clients outside [CITY]?', 'Yes. All consultations can be conducted via Google Meet video call or phone, with timings displayed in IST (and a clear timezone note for NRI clients).', 3),
('Security & Privacy', 'How are my PAN, GSTIN and financial documents protected?', 'Sensitive identifiers are encrypted at rest, uploaded documents are stored in private encrypted buckets accessible only via short-lived signed URLs, and all data handling follows India''s DPDP Act 2023.', 4)
ON CONFLICT DO NOTHING;

-- Compliance Dates (Sample admin-editable upcoming dates)
INSERT INTO public.compliance_dates (title, category, form_code, due_date, applicable_to, description) VALUES
('GSTR-1 Monthly Return', 'GST', 'GSTR-1', '2026-12-11', 'Regular monthly taxpayers', 'Statement of outward supplies for the preceding month.'),
('GSTR-3B Monthly Return & Tax Payment', 'GST', 'GSTR-3B', '2026-12-20', 'Regular monthly taxpayers', 'Summary return and self-assessed GST tax payment.'),
('Advance Tax 3rd Instalment', 'Income Tax', 'Challan 280', '2026-12-15', 'All assessees liable to advance tax', '75% of estimated annual income tax liability.'),
('GSTR-9 Annual Return', 'GST', 'GSTR-9', '2026-12-31', 'Taxpayers with turnover above ₹2 Cr', 'Annual GST reconciliation return for FY 2025-26.')
ON CONFLICT DO NOTHING;

-- Deadline Rules (Appeal & Reply Time-Limit Calculator)
INSERT INTO public.deadline_rules (slug, order_or_notice_type, statute, days_allowed, is_months, months_allowed, notes) VALUES
('gst-asmt-10', 'ASMT-10 Scrutiny Notice', 'CGST Act, 2017 (Sec 61)', 30, FALSE, NULL, 'Typical 30-day window (or date specified in the notice).'),
('gst-drc-01-73', 'DRC-01 Show Cause Notice (Sec 73)', 'CGST Act, 2017 (Sec 73)', 30, FALSE, NULL, 'Reply window to avoid penalty escalation; confirm exact date on notice.'),
('gst-appeal-sec-107', 'Appeal to Appellate Authority (APL-01)', 'CGST Act, 2017 (Sec 107)', 90, TRUE, 3, '3 months from date of communication of order (condonable by 1 month).'),
('it-appeal-cit', 'Appeal to CIT(A) (Form 35)', 'Income-tax Act, 1961 (Sec 249)', 30, FALSE, NULL, '30 days from date of service of assessment order / demand notice.')
ON CONFLICT (slug) DO NOTHING;

-- Industry Solutions Pages
INSERT INTO public.industry_pages (slug, title_en, subtitle_en, pain_points, relevant_service_slugs, documents_needed, sort_order) VALUES
('jewellery-and-bullion', 'Jewellery & Bullion', 'GST, hallmarking & high-value transaction compliance for jewellers and bullion dealers.',
 '["3% GST rate & making-charges valuation nuances","High-value cash & TCS / SFT reporting limits","Old-gold exchange & composite supply documentation","Legacy VAT & state-level audit reconciliations"]'::jsonb,
 ARRAY['gst-return-filing', 'tax-litigation-revenue-court', 'itr-filing-advisory'],
 '["Stock & Melting Registers","Old-Gold Purchase Vouchers","GSTR-1 & 3B Filings","Bank & Bullion Invoices"]'::jsonb, 1),
('textiles-and-fabrics', 'Textiles & Fabrics', 'Inverted duty structure, e-way bill and job-work compliance for textile businesses.',
 '["Inverted duty structure & ITC refund tracking","Job-work ITC-04 compliance & challan tracking","E-way bill transit checks & detention defence","Seasonal credit-note & discount adjustments"]'::jsonb,
 ARRAY['gst-return-filing', 'notice-reply-drafting', 'tax-litigation-revenue-court'],
 '["Job-work Challans","E-way Bills & Lorry Receipts","ITC-04 Statements","Purchase & Sales Registers"]'::jsonb, 2),
('manufacturers-industrial', 'Manufacturers & Industrial Suppliers', 'Input tax credit audits, capital goods GST and factory compliance.',
 '["Capital goods ITC & Rule 42/43 reversals","GSTR-2B vs books mismatch notices","HSN classification disputes","Partnership/corporate tax audit coordination"]'::jsonb,
 ARRAY['gst-return-filing', 'partnership-firm-taxation', 'notice-reply-drafting'],
 '["Fixed Asset Register","Bill of Materials","GSTR-2B & Purchase Register","Factory Licences"]'::jsonb, 3),
('traders-and-wholesalers', 'Traders & Wholesalers', 'High-volume invoicing, e-invoicing thresholds and margin-safe tax planning.',
 '["E-invoicing & QR code applicability","Supplier non-filing blocking buyer ITC (Sec 16(2)(aa))","Credit/debit note timing under Sec 34","Advance tax & working-capital tax planning"]'::jsonb,
 ARRAY['new-gst-registration', 'gst-return-filing', 'itr-filing-advisory'],
 '["Sales & Purchase Registers","Tally / Accounting Backup","GSTR-2B Reconciliation","Bank Statements"]'::jsonb, 4),
('exporters-and-importers', 'Exporters & Importers', 'LUT filings, zero-rated supply refunds and customs-GST matching.',
 '["LUT renewal & zero-rated export documentation","ICEGATE vs GSTR-1 shipping bill mismatches","IGST refund holds & deficiency memos","Foreign remittance (FIRC/BRC) tracking"]'::jsonb,
 ARRAY['gst-return-filing', 'notice-reply-drafting', 'tax-litigation-revenue-court'],
 '["Shipping Bills & Bills of Lading","FIRC / e-BRC Copies","LUT Acknowledgement","Import Bills of Entry"]'::jsonb, 5),
('partnership-firms-startups', 'Partnership Firms & Startups', 'Entity structuring, MCA incorporation, partner remuneration and compliance.',
 '["Choosing Proprietorship vs Partnership vs Pvt Ltd","Partner remuneration & interest limits u/s 40(b)","MCA annual filings & DIR-3 KYC","First-time GST & Income Tax setup"]'::jsonb,
 ARRAY['company-incorporation-mca', 'partnership-firm-taxation', 'new-gst-registration'],
 '["Partnership Deed / MOA & AOA","Promoter PAN & Aadhaar","Capital Contribution Details","Registered Office Proof"]'::jsonb, 6)
ON CONFLICT (slug) DO NOTHING;

-- Anonymised Case Stories (Dignified, BCI-compliant)
INSERT INTO public.case_stories (slug, title, category, problem_summary, action_taken, outcome_summary, client_consent_verified, is_published, sort_order) VALUES
('gstr-2b-mismatch-reply', 'Addressing a Multi-Year GSTR-2B ITC Mismatch Notice', 'GST Litigation',
 'A mid-sized trading enterprise received a Section 73 show-cause notice proposing disallowance of input tax credit due to supplier filing delays across two financial years.',
 'Compiled invoice-wise reconciliations, obtained supplier payment proofs and CA certificates under Circular 183/15/2022-GST, and filed a structured reply with personal hearing representation.',
 'The adjudicating authority accepted the documentary evidence for verified transactions and significantly reduced the proposed demand. Every case is different.',
 TRUE, TRUE, 1),
('revenue-court-vat-assessment', 'Resolution of Legacy VAT Assessment & C-Form Dispute', 'VAT & Revenue Court',
 'An industrial supplier faced an ex-parte reassessment demand arising from uncollected statutory C-Forms for interstate sales.',
 'Filed a formal rectification and appeal petition, coordinated with out-of-state buyers to retrieve duplicate declarations, and presented the reconciled record before the appellate authority.',
 'The appellate forum remanded and revised the assessment based on the verified statutory forms. Every case is different.',
 TRUE, TRUE, 2)
ON CONFLICT (slug) DO NOTHING;

-- Video Explainers
INSERT INTO public.video_explainers (title_en, topic, duration_seconds, video_url, transcript, sort_order) VALUES
('What to Do First When You Receive a GST Notice', 'Notices', 60, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Step 1: Check the DIN and date of communication. Step 2: Note the statutory reply deadline. Step 3: Download the annexure and reconcile against your GSTR-2B and books before drafting a factual reply.', 1),
('Old vs New Income Tax Regime: Key Checklist', 'Income Tax', 58, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Compare your eligible deductions under Chapter VI-A and HRA against the lower slab rates of the New Regime before selecting your filing option for the financial year.', 2),
('Documents Needed for New GST Registration', 'Registration', 55, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Keep your PAN, Aadhaar, clear business address proof with electricity bill and rent agreement or NOC, and bank account proof ready to avoid ARN clarification delays.', 3)
ON CONFLICT DO NOTHING;

-- Sample Blog / Insights Articles
INSERT INTO public.blog_posts (slug, title_en, excerpt_en, content_md_en, category, reading_time_minutes, is_published, published_at) VALUES
('understanding-gst-drc-01-notices', 'Understanding GST DRC-01 Show Cause Notices: A Practical Checklist',
 'A calm, step-by-step guide to reading a DRC-01 notice, checking limitation periods and preparing your documentary reply.',
 '## 1. Verify the Notice Details\nCheck the Document Identification Number (DIN), issuing officer designation, and whether the notice is issued under Section 73 or Section 74 of the CGST Act.\n\n## 2. Track the Statutory Timeline\nAlways note the date of communication on the GST portal and calculate the reply deadline.\n\n## 3. Reconcile Before Replying\nPrepare a clean invoice-level reconciliation between GSTR-1, GSTR-3B, GSTR-2B and your audited books.\n\n*Disclaimer: This article is for general informational purposes only and does not constitute legal advice.*',
 'GST Updates', 5, TRUE, NOW()),
('income-tax-regime-comparison-fy', 'Old vs New Income Tax Regime: Choosing Structurally',
 'Key factors salaried individuals, professionals and business owners should weigh before filing their Income Tax Return.',
 '## Comparing Slab Rates vs Deductions\nWhile the New Tax Regime offers lower slab rates and a standard deduction, the Old Regime remains relevant for taxpayers with substantial housing loan interest, 80C, and 80D claims.\n\n*Disclaimer: General informational overview; consult your tax advisor for your specific computation.*',
 'Tax Planning', 4, TRUE, NOW())
ON CONFLICT (slug) DO NOTHING;
