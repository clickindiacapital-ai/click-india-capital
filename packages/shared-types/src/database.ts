export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost';

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  loan_type?: string;
  loan_amount?: number;
  message?: string;
  status: LeadStatus;
  source: string; // e.g., 'website_contact', 'whatsapp_widget', 'eligibility_calculator'
}

export type ConsultingServiceType = 'whatsapp_diagnosis' | 'expert_call' | 'loan_blueprint';

export interface ConsultingSession {
  id: string;
  created_at: string;
  client_name: string;
  client_email: string;
  service_type: ConsultingServiceType;
  topmate_booking_id?: string;
  amount_paid: number;
  status: 'pending' | 'completed' | 'cancelled';
  scheduled_for?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  total_loans_disbursed: number;
  active_loans: number;
  lifetime_value: number;
  last_contact_date?: string;
}

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>;
      };
      consulting_sessions: {
        Row: ConsultingSession;
        Insert: Omit<ConsultingSession, 'id' | 'created_at'>;
        Update: Partial<Omit<ConsultingSession, 'id' | 'created_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at'>;
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>;
      };
    };
  };
}
