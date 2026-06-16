export type LeadStatus = 'NEW' | 'CONTACTED' | 'ELIGIBILITY_ASSESSED' | 'DOCUMENTS_PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'DISBURSED';

export interface Lead {
  id: string;
  created_at: string;
  customer_id?: string;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  loan_type?: string;
  loan_amount?: number;
  message?: string;
  status: LeadStatus;
  source: string;
  urgent_action_required?: boolean;
}

export interface Customer {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  dob?: string;
  city?: string;
  state?: string;
  employment_type?: string;
  employer_name?: string;
  designation?: string;
  experience_years?: number;
  industry?: string;
  monthly_income?: number;
  emi_obligations?: number;
  credit_score?: number;
  existing_loans_count?: number;
  credit_card_outstanding?: number;
  primary_goal?: string;
  tags?: string[];
  borrow_readiness_score?: number;
  loan_health_metrics?: {
    income_stability: number;
    credit_behaviour: number;
    emi_burden: number;
    documentation: number;
  };
  total_loans_disbursed: number;
  active_loans: number;
  lifetime_value: number;
  last_contact_date?: string;
}

export interface Consultation {
  id: string;
  created_at: string;
  customer_id?: string;
  type: 'WHATSAPP_49' | 'VOICE_VIDEO_199' | 'BLUEPRINT_1500';
  amount_paid: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  scheduled_for?: string;
  duration_minutes?: number;
  notes?: string;
  recommendations?: string;
  follow_up_action?: string;
  outcome?: string;
}

export interface CustomerTimelineEvent {
  id: string;
  customer_id: string;
  event_date: string;
  event_type: string;
  description: string;
  metadata?: any;
}

export interface CustomerDocument {
  id: string;
  customer_id: string;
  document_type: string;
  file_url?: string;
  status: 'UPLOADED' | 'PENDING' | 'EXPIRED';
  uploaded_at?: string;
}

export interface LoanRejection {
  id: string;
  customer_id: string;
  lead_id?: string;
  rejection_date?: string;
  reason_category: string;
  suggested_actions?: string;
  alternative_products?: string;
  alternative_lenders?: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id?: string;
  created_at: string;
  revenue_generated?: number;
  status: string;
}

export interface CustomerMessage {
  id: string;
  created_at: string;
  customer_id?: string;
  lead_id?: string;
  sender_id: string;
  sender_type: 'CUSTOMER' | 'AGENT' | 'AI_AGENT';
  content: string;
  message_type: 'TEXT' | 'DOCUMENT' | 'IMAGE';
  message_priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  is_read: boolean;
}

export type LeadData = Lead;

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at'>;
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>;
      };
      consultations: {
        Row: Consultation;
        Insert: Omit<Consultation, 'id' | 'created_at'>;
        Update: Partial<Omit<Consultation, 'id' | 'created_at'>>;
      };
      customer_timeline: {
        Row: CustomerTimelineEvent;
        Insert: Omit<CustomerTimelineEvent, 'id'>;
        Update: Partial<Omit<CustomerTimelineEvent, 'id'>>;
      };
      customer_documents: {
        Row: CustomerDocument;
        Insert: Omit<CustomerDocument, 'id'>;
        Update: Partial<Omit<CustomerDocument, 'id'>>;
      };
      loan_rejections: {
        Row: LoanRejection;
        Insert: Omit<LoanRejection, 'id'>;
        Update: Partial<Omit<LoanRejection, 'id'>>;
      };
      referrals: {
        Row: Referral;
        Insert: Omit<Referral, 'id' | 'created_at'>;
        Update: Partial<Omit<Referral, 'id' | 'created_at'>>;
      };
      customer_messages: {
        Row: CustomerMessage;
        Insert: Omit<CustomerMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<CustomerMessage, 'id' | 'created_at'>>;
      };
    };
  };
}
