export interface ServiceItem {
  id: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  whatsIncluded: string[];
  documentsRequired: string[];
  turnaroundTime: string;
  priceInr: number;
  priceDisplay: string;
  sacCode: string;
  isFeatured?: boolean;
  isRetainer?: boolean;
  billingInterval?: "one_time" | "monthly" | "quarterly" | "annual";
  faqs: Array<{ q: string; a: string }>;
}

export interface ConsultationTypeItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationMinutes: number;
  priceInr: number;
  isPaid: boolean;
  allowedModes: Array<"google_meet" | "phone" | "in_office">;
}

export const FALLBACK_CONSULTATION_TYPES: ConsultationTypeItem[] = [
  {
    id: "ct-1",
    slug: "quick-call",
    title: "Quick Call",
    description:
      "Brief 15-minute initial orientation call to understand your query and scope.",
    durationMinutes: 15,
    priceInr: 0,
    isPaid: false,
    allowedModes: ["phone", "google_meet"],
  },
  {
    id: "ct-2",
    slug: "standard-consultation",
    title: "Standard Consultation",
    description:
      "Focused 30-minute consultation on GST, Income Tax, or compliance strategy.",
    durationMinutes: 30,
    priceInr: 1000,
    isPaid: true,
    allowedModes: ["google_meet", "phone", "in_office"],
  },
  {
    id: "ct-3",
    slug: "deep-dive-case-review",
    title: "Deep-Dive Case Review",
    description:
      "60-minute detailed review of returns, ledgers, notices, or tax structuring.",
    durationMinutes: 60,
    priceInr: 2500,
    isPaid: true,
    allowedModes: ["google_meet", "in_office"],
  },
  {
    id: "ct-4",
    slug: "notice-litigation-strategy",
    title: "Notice / Litigation Strategy Session",
    description:
      "60-minute urgent review of Show Cause Notices, DRC-01, assessment orders or appeals.",
    durationMinutes: 60,
    priceInr: 3000,
    isPaid: true,
    allowedModes: ["google_meet", "in_office"],
  },
  {
    id: "ct-5",
    slug: "business-company-setup",
    title: "Business / Company Setup Planning",
    description:
      "45-minute planning session for new entity structure, MCA filing and GST setup.",
    durationMinutes: 45,
    priceInr: 1500,
    isPaid: true,
    allowedModes: ["google_meet", "phone", "in_office"],
  },
];

export const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: "srv-1",
    slug: "new-gst-registration",
    categorySlug: "gst-indirect-tax",
    categoryName: "GST and Indirect Tax",
    title: "New GST Registration",
    shortDescription:
      "End-to-end GSTIN registration for proprietorships, partnerships, LLPs and companies.",
    fullDescription:
      "Complete documentation verification, ARN tracking, clarification replies and GSTIN certificate issuance.",
    whatsIncluded: [
      "Eligibility & composition scheme check",
      "Application filing on GST portal",
      "Department query / SCN reply if raised",
      "GSTIN certificate & HSN/SAC mapping",
    ],
    documentsRequired: [
      "PAN Card of Business / Promoters",
      "Aadhaar Card & Photograph",
      "Business Address Proof (Electricity Bill + Rent Agreement/NOC)",
      "Bank Account Cancelled Cheque / Statement",
    ],
    turnaroundTime: "3–7 working days",
    priceInr: 2500,
    priceDisplay: "[SERVICE PRICES]",
    sacCode: "998213",
    faqs: [
      {
        q: "Is physical verification required?",
        a: "Depending on Aadhaar authentication and risk parameters, the department may conduct site verification.",
      },
    ],
  },
  {
    id: "srv-2",
    slug: "gst-return-filing",
    categorySlug: "gst-indirect-tax",
    categoryName: "GST and Indirect Tax",
    title: "GST Return Filing (GSTR-1, GSTR-3B, GSTR-9)",
    shortDescription:
      "Accurate monthly/quarterly GSTR-1, GSTR-3B reconciliation and annual GSTR-9 filing.",
    fullDescription:
      "GSTR-2B vs books reconciliation, ITC eligibility audit and timely filing to avoid late fees and notices.",
    whatsIncluded: [
      "GSTR-1 outward supply filing",
      "GSTR-2B ITC reconciliation",
      "GSTR-3B computation & filing",
      "Monthly compliance summary",
    ],
    documentsRequired: [
      "Sales & Purchase Register (Excel/Tally)",
      "Bank Statements",
      "Credit/Debit Notes",
      "E-way Bill Summary",
    ],
    turnaroundTime: "Monthly / Annual",
    priceInr: 1500,
    priceDisplay: "[SERVICE PRICES]",
    sacCode: "998213",
    isRetainer: true,
    billingInterval: "monthly",
    faqs: [
      {
        q: "Can multiple GSTINs be bundled?",
        a: "Yes, multi-GSTIN retainer plans are available for group entities and branches.",
      },
    ],
  },
  {
    id: "srv-3",
    slug: "vat-returns-legacy",
    categorySlug: "gst-indirect-tax",
    categoryName: "GST and Indirect Tax",
    title: "VAT Returns & Legacy Assessments",
    shortDescription:
      "Representation and compliance for pending VAT assessments, C-Form issues and legacy disputes.",
    fullDescription:
      "Dedicated handling of pre-GST VAT assessments, statutory form reconciliations and state commercial tax proceedings.",
    whatsIncluded: [
      "Assessment file review",
      "C-Form / F-Form reconciliation",
      "Departmental representation",
      "Rectification & appeal support",
    ],
    documentsRequired: [
      "Historical VAT Returns",
      "Assessment Order / Notice Copy",
      "Statutory Forms (C/F/H)",
      "Purchase & Sales Ledgers",
    ],
    turnaroundTime: "Case-dependent",
    priceInr: 5000,
    priceDisplay: "[SERVICE PRICES]",
    sacCode: "998213",
    faqs: [],
  },
  {
    id: "srv-4",
    slug: "bar-licence-applications",
    categorySlug: "gst-indirect-tax",
    categoryName: "GST and Indirect Tax",
    title: "Bar Licence Applications",
    shortDescription:
      "Tax clearance, compliance dossiers and documentation for bar licence applications.",
    fullDescription:
      "Structured tax compliance, net-worth certification coordination and procedural support for hospitality and bar licence applications.",
    whatsIncluded: [
      "Checklist & eligibility review",
      "Tax clearance & compliance records",
      "Application dossier preparation",
      "Follow-up compliance",
    ],
    documentsRequired: [
      "Applicant KYC & PAN",
      "Premises Lease / Ownership Papers",
      "ITR & GST Compliance Records",
      "Municipal / Fire NOCs",
    ],
    turnaroundTime: "7–14 working days",
    priceInr: 10000,
    priceDisplay: "[SERVICE PRICES]",
    sacCode: "998213",
    faqs: [],
  },
  {
    id: "srv-5",
    slug: "itr-filing-advisory",
    categorySlug: "income-tax-direct-tax",
    categoryName: "Income Tax and Direct Tax",
    title: "ITR Filing & Income Tax Planning",
    shortDescription:
      "Comprehensive ITR filing for individuals, professionals, firms and corporates with Old vs New regime analysis.",
    fullDescription:
      "AIS/TIS reconciliation, capital gains computation, old vs new regime optimisation and tax-saving structuring.",
    whatsIncluded: [
      "AIS, TIS & Form 26AS reconciliation",
      "Old vs New Regime comparison",
      "Deduction & capital gains computation",
      "E-verification & acknowledgement",
    ],
    documentsRequired: [
      "PAN & Aadhaar",
      "Form 16 / 16A",
      "Bank & Demat Statements",
      "Balance Sheet & P&L (if business)",
    ],
    turnaroundTime: "2–4 working days",
    priceInr: 2000,
    priceDisplay: "[SERVICE PRICES]",
    sacCode: "998213",
    faqs: [],
  },
  {
    id: "srv-6",
    slug: "partnership-firm-taxation",
    categorySlug: "income-tax-direct-tax",
    categoryName: "Income Tax and Direct Tax",
    title: "Partnership Firm Taxation & Advisory",
    shortDescription:
      "Direct and indirect taxation advisory, partner remuneration compliance and annual filings.",
    fullDescription:
      "Complete direct and indirect tax advisory for partnership firms, LLPs and private limited entities.",
    whatsIncluded: [
      "Partnership deed tax-clause review",
      "Section 40(b) remuneration & interest computation",
      "Advance tax planning",
      "Annual return & audit coordination",
    ],
    documentsRequired: [
      "Partnership Deed / MOA & AOA",
      "Trial Balance & Ledgers",
      "Partner PAN & Capital Accounts",
      "Prior Year ITRs",
    ],
    turnaroundTime: "5–7 working days",
    priceInr: 4500,
    priceDisplay: "[SERVICE PRICES]",
    sacCode: "998213",
    faqs: [],
  },
  {
    id: "srv-7",
    slug: "tax-litigation-revenue-court",
    categorySlug: "litigation-corporate",
    categoryName: "Litigation and Corporate",
    title: "Tax Litigation & Revenue Court Representation",
    shortDescription:
      "Saving the dealer, one case at a time. Representation before GST/VAT authorities and revenue courts.",
    fullDescription:
      "Grounded representation in GST, Income Tax, VAT and revenue court matters, including stay applications and appellate hearings.",
    whatsIncluded: [
      "Detailed case & order analysis",
      "Grounds of appeal & legal drafting",
      "Personal hearings & oral arguments",
      "Stay application & recovery protection",
    ],
    documentsRequired: [
      "Show Cause Notice / Assessment Order",
      "Earlier Replies & Submissions",
      "Supporting Invoices & E-way Bills",
      "Authorisation / Vakalatnama",
    ],
    turnaroundTime: "As per statutory schedule",
    priceInr: 15000,
    priceDisplay: "[SERVICE PRICES]",
    sacCode: "998211",
    isFeatured: true,
    faqs: [],
  },
  {
    id: "srv-8",
    slug: "notice-reply-drafting",
    categorySlug: "litigation-corporate",
    categoryName: "Litigation and Corporate",
    title: "Notice Reply Drafting & Appeal Notices",
    shortDescription:
      "Structured legal replies to DRC-01, ASMT-10, Section 73/74 and Income Tax assessment notices.",
    fullDescription:
      "Thorough factual and statutory drafting to address show-cause notices, audit objections and assessment appeals.",
    whatsIncluded: [
      "Notice & annexure audit",
      "Reconciliation statement preparation",
      "Legal reply drafting with statutory citations",
      "Portal submission & acknowledgement",
    ],
    documentsRequired: [
      "Copy of Notice / Order",
      "Relevant Return & Ledger Extracts",
      "GSTR-2B / 26AS Mismatch Data",
    ],
    turnaroundTime: "2–5 working days",
    priceInr: 7500,
    priceDisplay: "[SERVICE PRICES]",
    sacCode: "998211",
    isFeatured: true,
    faqs: [],
  },
  {
    id: "srv-9",
    slug: "company-incorporation-mca",
    categorySlug: "litigation-corporate",
    categoryName: "Litigation and Corporate",
    title: "Company Incorporation & MCA Portal Filing",
    shortDescription:
      "Tax documentation, testing, MCA portal filing and ongoing corporate compliance.",
    fullDescription:
      "SPICe+ filing on the MCA portal, MOA/AOA drafting, PAN/TAN/GST registration and post-incorporation tax setup.",
    whatsIncluded: [
      "Name reservation (RUN / SPICe+)",
      "DSC, DIN & MOA/AOA drafting",
      "MCA portal filing & Certificate of Incorporation",
      "PAN, TAN, GST & ongoing compliance setup",
    ],
    documentsRequired: [
      "Director PAN, Aadhaar & Passport/DL",
      "Passport-size Photos",
      "Registered Office Utility Bill & NOC",
      "Proposed Business Objects",
    ],
    turnaroundTime: "7–12 working days",
    priceInr: 9000,
    priceDisplay: "[SERVICE PRICES]",
    sacCode: "998213",
    faqs: [],
  },
];

export const FALLBACK_COMPLIANCE_DATES = [
  {
    id: "cd-1",
    title: "GSTR-1 Monthly Return",
    category: "GST",
    form_code: "GSTR-1",
    due_date: "2026-12-11",
    applicable_to: "Regular monthly taxpayers",
    description: "Statement of outward supplies for the preceding month.",
  },
  {
    id: "cd-2",
    title: "Advance Tax 3rd Instalment",
    category: "Income Tax",
    form_code: "Challan 280",
    due_date: "2026-12-15",
    applicable_to: "Assessees liable to advance tax",
    description: "75% of estimated annual income tax liability.",
  },
  {
    id: "cd-3",
    title: "GSTR-3B Monthly Return & Tax Payment",
    category: "GST",
    form_code: "GSTR-3B",
    due_date: "2026-12-20",
    applicable_to: "Regular monthly taxpayers",
    description: "Summary return and self-assessed GST tax payment.",
  },
  {
    id: "cd-4",
    title: "GSTR-9 Annual Return",
    category: "GST",
    form_code: "GSTR-9",
    due_date: "2026-12-31",
    applicable_to: "Taxpayers with turnover above ₹2 Cr",
    description: "Annual GST reconciliation return.",
  },
];

export const FALLBACK_FAQS = [
  {
    id: "faq-1",
    category: "General",
    question:
      "Does submitting a query or booking form create an advocate-client relationship?",
    answer:
      "No. Submitting a form or sending a query on this website is purely informational and does not create an advocate-client relationship until formal engagement is confirmed.",
  },
  {
    id: "faq-2",
    category: "GST & Notices",
    question:
      "What should I do immediately after receiving a GST Show Cause Notice (DRC-01)?",
    answer:
      "Note the date of communication and the reply deadline immediately. Gather your GSTR-1, GSTR-3B, GSTR-2B reconciliation and supporting invoices, and book a Notice Strategy Session or upload the notice via our Notice Review Desk.",
  },
  {
    id: "faq-3",
    category: "Consultations",
    question:
      "Are consultations available online for clients outside [CITY]?",
    answer:
      "Yes. All consultations can be conducted via Google Meet video call or phone, with timings displayed in IST (and a clear timezone note for NRI clients).",
  },
  {
    id: "faq-4",
    category: "Security & Privacy",
    question:
      "How are my PAN, GSTIN and financial documents protected?",
    answer:
      "Sensitive identifiers are encrypted at rest, uploaded documents are stored in private encrypted buckets accessible only via short-lived signed URLs, and all data handling follows India's DPDP Act 2023.",
  },
];
