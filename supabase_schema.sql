-- Click Capital CRM Supabase Schema Migration

-- 1. Leads Table
CREATE TABLE public.leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company_name TEXT,
    loan_type TEXT,
    loan_amount NUMERIC,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    source TEXT NOT NULL
);

-- Enable RLS for leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for anon users" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.leads FOR UPDATE TO authenticated USING (true);

-- 2. Consulting Sessions Table
CREATE TABLE public.consulting_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    service_type TEXT NOT NULL,
    topmate_booking_id TEXT,
    amount_paid NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    scheduled_for TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

ALTER TABLE public.consulting_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.consulting_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for anon users" ON public.consulting_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.consulting_sessions FOR UPDATE TO authenticated USING (true);

-- 3. Customers Table
CREATE TABLE public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    total_loans_disbursed NUMERIC DEFAULT 0,
    active_loans INTEGER DEFAULT 0,
    lifetime_value NUMERIC DEFAULT 0,
    last_contact_date TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable update for authenticated users" ON public.customers FOR UPDATE TO authenticated USING (true);
