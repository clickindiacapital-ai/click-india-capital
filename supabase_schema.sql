-- Click Capital Loan Advisory Operating System - Schema Setup

-- DROP EXISTING TABLES (Clean Slate)
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
