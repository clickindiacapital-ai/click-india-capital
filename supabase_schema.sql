-- Click Capital Loan Advisory Operating System - Schema Setup

-- DROP EXISTING TABLES (Clean Slate)
DROP TABLE IF EXISTS public.revenues CASCADE;
DROP TABLE IF EXISTS public.followups CASCADE;
DROP TABLE IF EXISTS public.loan_comparisons CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.eligibility_rules CASCADE;
DROP TABLE IF EXISTS public.lenders CASCADE;
DROP TABLE IF EXISTS public.lead_sources CASCADE;
DROP TABLE IF EXISTS public.customer_messages CASCADE;
DROP TABLE IF EXISTS public.consulting_sessions CASCADE;
DROP TABLE IF EXISTS public.customer_timeline CASCADE;
DROP TABLE IF EXISTS public.customer_documents CASCADE;
DROP TABLE IF EXISTS public.loan_rejections CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- 1. Customers Table (Massively Expanded)
CREATE TABLE public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Personal
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    dob DATE,
    age INTEGER,
    city TEXT,
    state TEXT,
    -- Professional
    employment_type TEXT,
    employer_name TEXT,
    designation TEXT,
    experience_years INTEGER,
    industry TEXT,
    -- Financial
    monthly_income NUMERIC DEFAULT 0,
    emi_obligations NUMERIC DEFAULT 0,
    credit_score INTEGER,
    existing_loans_count INTEGER DEFAULT 0,
    credit_card_outstanding NUMERIC DEFAULT 0,
    -- Loan Matchmaking specific
    loan_type TEXT,
    loan_amount NUMERIC,
    lead_source TEXT,
    lead_status TEXT DEFAULT 'New', -- New, Contacted, Eligibility Checked, Matched, Forwarded, Converted, Closed
    lead_temperature TEXT DEFAULT 'Cold', -- Hot, Warm, Cold
    -- Goal & Classification
    primary_goal TEXT,
    tags TEXT[],
    borrow_readiness_score INTEGER,
    loan_health_metrics JSONB DEFAULT '{"income_stability": 0, "credit_behaviour": 0, "emi_burden": 0, "documentation": 0}'::jsonb,
    -- OS Aggregates
    total_loans_disbursed NUMERIC DEFAULT 0,
    active_loans INTEGER DEFAULT 0,
    lifetime_value NUMERIC DEFAULT 0,
    last_contact_date TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable insert for anon users" ON public.customers FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 2. Leads Table (Linked to pipeline stages)
CREATE TABLE public.leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company_name TEXT,
    loan_type TEXT,
    loan_amount NUMERIC,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'NEW', -- NEW, CONTACTED, ELIGIBILITY_ASSESSED, DOCUMENTS_PENDING, SUBMITTED, APPROVED, REJECTED, DISBURSED
    source TEXT NOT NULL,
    urgent_action_required BOOLEAN DEFAULT false
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for anon users" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.leads FOR UPDATE TO authenticated USING (true);

-- 3. Consultations Table
CREATE TABLE public.consultations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    type TEXT NOT NULL, -- 'WHATSAPP_49', 'VOICE_VIDEO_199', 'BLUEPRINT_1500'
    amount_paid NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    scheduled_for TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    notes TEXT,
    recommendations TEXT,
    follow_up_action TEXT,
    outcome TEXT
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.consultations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Customer Timeline Table
CREATE TABLE public.customer_timeline (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB
);

ALTER TABLE public.customer_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.customer_timeline FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Customer Documents Table
CREATE TABLE public.customer_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    document_type TEXT NOT NULL, -- 'PAN', 'AADHAAR', 'SALARY_SLIP', etc.
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- 'UPLOADED', 'PENDING', 'EXPIRED'
    uploaded_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.customer_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.customer_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Loan Rejections Table
CREATE TABLE public.loan_rejections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    lead_id UUID REFERENCES public.leads(id),
    rejection_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    reason_category TEXT NOT NULL,
    suggested_actions TEXT,
    alternative_products TEXT,
    alternative_lenders TEXT
);

ALTER TABLE public.loan_rejections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.loan_rejections FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Referrals Table
CREATE TABLE public.referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES public.customers(id) NOT NULL,
    referred_id UUID REFERENCES public.customers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    revenue_generated NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING'
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.referrals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Customer Messages Table (For Communication Center)
CREATE TABLE public.customer_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    lead_id UUID REFERENCES public.leads(id),
    sender_id UUID NOT NULL,
    sender_type TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'TEXT',
    message_priority TEXT NOT NULL DEFAULT 'NORMAL',
    is_read BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.customer_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.customer_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.customer_messages FOR UPDATE TO authenticated USING (true);

-- 9. Lenders Table (Lender Master)
DROP TABLE IF EXISTS public.lenders CASCADE;
CREATE TABLE public.lenders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    lender_name TEXT NOT NULL,
    logo_url TEXT,
    loan_type TEXT[], -- e.g., ['Personal Loan', 'Business Loan', 'Home Loan']
    min_income NUMERIC DEFAULT 0,
    max_age INTEGER DEFAULT 60,
    min_age INTEGER DEFAULT 21,
    max_foir NUMERIC DEFAULT 100, -- Maximum Fixed Obligation to Income Ratio
    employment_type TEXT[], -- ['Salaried', 'Self-Employed']
    interest_rate NUMERIC NOT NULL,
    processing_fee NUMERIC NOT NULL DEFAULT 0,
    tenure_range TEXT, -- e.g., '12-60 months'
    active BOOLEAN DEFAULT true,
    notes TEXT
);

ALTER TABLE public.lenders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for everyone" ON public.lenders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.lenders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Lenders
INSERT INTO public.lenders (lender_name, min_income, max_foir, employment_type, loan_type, interest_rate, processing_fee, tenure_range, notes)
VALUES 
('HDFC Bank', 30000, 50, ARRAY['Salaried', 'Self-Employed'], ARRAY['Home Loan', 'Personal Loan', 'Business Loan'], 10.50, 1.5, '12-60 months', 'Preferred prime lender for salaried professionals.'),
('ICICI Bank', 25000, 50, ARRAY['Salaried', 'Self-Employed'], ARRAY['Home Loan', 'Personal Loan', 'Vehicle Loan'], 10.75, 2.0, '12-72 months', 'Fast processing for pre-approved customers.'),
('Axis Bank', 25000, 55, ARRAY['Salaried', 'Self-Employed'], ARRAY['Personal Loan', 'Business Loan'], 11.25, 2.0, '12-60 months', 'Good for medium sized loans.'),
('Federal Bank', 20000, 60, ARRAY['Salaried', 'Self-Employed'], ARRAY['Personal Loan'], 11.50, 2.5, '12-48 months', 'Flexible policies for lower income segments.');

-- 9.1 Eligibility Rules Table
CREATE TABLE public.eligibility_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lender_id UUID REFERENCES public.lenders(id) NOT NULL,
    rule_type TEXT NOT NULL, -- 'INCOME', 'AGE', 'FOIR', 'EMPLOYMENT'
    operator TEXT NOT NULL, -- '>', '<', '=', 'BETWEEN'
    value_1 TEXT NOT NULL,
    value_2 TEXT,
    score_modifier INTEGER DEFAULT 0 -- e.g., +10 to match score if passed
);

ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.eligibility_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9.2 Matches Table
CREATE TABLE public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    lender_id UUID REFERENCES public.lenders(id) NOT NULL,
    match_score INTEGER NOT NULL,
    eligibility_status TEXT NOT NULL DEFAULT 'Tentative',
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.matches FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9.3 Loan Comparisons Table
CREATE TABLE public.loan_comparisons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    compared_lenders JSONB NOT NULL, -- Array of lender IDs and their stats at the time
    selected_lender_id UUID REFERENCES public.lenders(id),
    status TEXT NOT NULL DEFAULT 'Generated' -- 'Generated', 'Selected'
);

ALTER TABLE public.loan_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.loan_comparisons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9.4 Follow Ups Table
CREATE TABLE public.followups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    follow_up_date DATE NOT NULL,
    follow_up_time TIME,
    remarks TEXT,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Completed', 'Missed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.followups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9.5 Revenues Table
CREATE TABLE public.revenues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) NOT NULL,
    lender_id UUID REFERENCES public.lenders(id) NOT NULL,
    loan_type TEXT NOT NULL,
    loan_amount NUMERIC NOT NULL,
    revenue_earned NUMERIC NOT NULL DEFAULT 0,
    revenue_status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Received'
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.revenues FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9.6 Lead Sources Table
CREATE TABLE public.lead_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_name TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users" ON public.lead_sources FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Lead Sources
INSERT INTO public.lead_sources (source_name) VALUES ('Google'), ('Facebook'), ('WhatsApp'), ('Organic'), ('Referral');

-- 10. Blog Posts Table (Insights CMS)
DROP TABLE IF EXISTS public.blog_posts CASCADE;
CREATE TABLE public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL, -- Supports markdown
    excerpt TEXT,
    category TEXT NOT NULL,
    image_url TEXT,
    author TEXT DEFAULT 'Advisory Lead',
    published BOOLEAN DEFAULT true
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for everyone" ON public.blog_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Blog Posts
INSERT INTO public.blog_posts (title, slug, content, excerpt, category, image_url, author)
VALUES 
('Why Personal Loans Get Rejected: 5 Mistakes to Avoid', 'why-personal-loans-get-rejected', '### Understanding Loan Rejections

Many borrowers find their loan applications rejected despite having a stable job and clean repayment records. Here are the 5 main credit policy reasons banks decline loans:

1. **High FOIR (Fixed Obligation to Income Ratio):** If your current EMIs exceed 50% of your monthly take-home salary, banks consider you over-leveraged.
2. **Recent Settlement/Written-off Accounts:** Any trace of "Settled" or "Written-off" loans on your credit report flags high credit risk.
3. **Multiple Recent Inquiries:** Applying with multiple lenders in a short span triggers "Hard Inquiries", which drops your credit score.
4. **Employment Stability:** Lenders require at least 1-2 continuous years with the same employer.
5. **Lack of Address/Identity Verification:** Incorrect documents or failed physical verifications are silent rejection reasons.

*Read our guide on how to restructure your debts before applying!*', 'Learn the 5 critical mistakes borrowers make that lead to automatic loan rejections by banks and NBFCs.', 'Advisory Guides', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60', 'Advisory Lead'),
('How FOIR Affects Your Home Loan Eligibility', 'how-foir-affects-home-loan-eligibility', '### What is FOIR?

Fixed Obligation to Income Ratio (FOIR) is a formula bank underwriters use to evaluate your disposable income. Here is how it is calculated:

$$FOIR = \frac{\text{Total Current EMIs} + \text{Proposed EMI}}{\text{Net Monthly Income}} \times 100$$

For example, if your income is ₹1,00,000 and your EMIs are ₹40,000, your FOIR is 40%. Most prime lenders like HDFC and SBI cap their home loan FOIR at **45% to 50%**.

### How to lower your FOIR:
- **Prepay small loans:** Clear outstanding personal loans or credit card EMIs before applying.
- **Include co-applicant income:** Adding your spouse or parents as co-applicants increases the total net income, lowering the ratio.
- Extend tenure:** Opting for a longer loan tenure reduces the monthly EMI payment, bringing your FOIR under the bank threshold.', 'A deep dive into Fixed Obligation to Income Ratio (FOIR) and how banks calculate your debt capacity.', 'Debt Strategy', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60', 'Advisory Lead');


-- 11. Storage Bucket & RLS Setup for Secure Client Portal
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-documents', 'customer-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage Objects (bucket: customer-documents)
-- Allows admins all privileges, and clients to read/insert/delete files in their own folder (folder name matches customer UUID).
CREATE POLICY "Admin full access on storage objects" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'customer-documents' AND auth.jwt() ->> 'email' = 'admin@clickindia.in')
    WITH CHECK (bucket_id = 'customer-documents' AND auth.jwt() ->> 'email' = 'admin@clickindia.in');

CREATE POLICY "Client insert own storage objects" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'customer-documents' AND
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id::text = (storage.foldername(name))[1]
            AND customers.email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Client read own storage objects" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'customer-documents' AND
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id::text = (storage.foldername(name))[1]
            AND customers.email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Client delete own storage objects" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'customer-documents' AND
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id::text = (storage.foldername(name))[1]
            AND customers.email = auth.jwt() ->> 'email'
        )
    );

-- Refined Customers Table RLS Policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.customers;

CREATE POLICY "Admin full access on customers" ON public.customers
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@clickindia.in')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@clickindia.in');

CREATE POLICY "Client read own profile" ON public.customers
    FOR SELECT TO authenticated
    USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Client update own profile" ON public.customers
    FOR UPDATE TO authenticated
    USING (email = auth.jwt() ->> 'email')
    WITH CHECK (email = auth.jwt() ->> 'email');

-- Refined Customer Documents RLS Policies
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.customer_documents;

CREATE POLICY "Admin full access on documents" ON public.customer_documents
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@clickindia.in')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@clickindia.in');

CREATE POLICY "Client read own documents" ON public.customer_documents
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = customer_documents.customer_id
            AND customers.email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Client insert own documents" ON public.customer_documents
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = customer_documents.customer_id
            AND customers.email = auth.jwt() ->> 'email'
        )
    );

CREATE POLICY "Client update own documents" ON public.customer_documents
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = customer_documents.customer_id
            AND customers.email = auth.jwt() ->> 'email'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.customers
            WHERE customers.id = customer_documents.customer_id
            AND customers.email = auth.jwt() ->> 'email'
        )
    );

-- 12. Global Do Not Contact (Blocklist) Table
DROP TABLE IF EXISTS public.do_not_contact CASCADE;
CREATE TABLE public.do_not_contact (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    reason TEXT DEFAULT 'OPT_OUT',
    source TEXT DEFAULT 'CRM_MANUAL'
);

-- RLS Policies for DNC Table
ALTER TABLE public.do_not_contact ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users on DNC" ON public.do_not_contact
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

