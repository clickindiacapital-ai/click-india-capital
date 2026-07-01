export type UserRole = 'ADMIN' | 'DSA' | 'CUSTOMER' | 'DEALER' | 'SUPPORT';

export type LeadStatus = 
  | 'NEW_LEAD'
  | 'DIAGNOSIS_PENDING'
  | 'CONSULTATION_SCHEDULED'
  | 'CONSULTATION_COMPLETED'
  | 'BLUEPRINT_GENERATED'
  | 'EXECUTION_IN_PROGRESS'
  | 'REFINANCE_REVIEW'
  | 'RETENTION_STAGE'
  | 'MARKETPLACE_ELIGIBLE'
  | 'REJECTED'
  | 'DISBURSED';

export type CustomerLifecycleState =
  | 'NEW_ENQUIRY'
  | 'HIGH_STRESS_CUSTOMER'
  | 'CONSULTATION_ACTIVE'
  | 'BLUEPRINT_IN_PROGRESS'
  | 'EXECUTION_STAGE'
  | 'REFINANCE_CANDIDATE'
  | 'RETENTION_RISK'
  | 'MARKETPLACE_ELIGIBLE'
  | 'LONG_TERM_RELATIONSHIP';

export interface IntelligenceMetrics {
  priority_score: number;       // 0-100
  engagement_score: number;     // 0-100
  retention_score: number;      // 0-100
  urgency_score: number;        // 0-100
  last_updated: string;
}

export interface ConsultationIntelligence {
  pain_points: string[];
  debt_categories: string[];
  emi_burden: number;
  rejection_reasons?: string[];
  financial_goals: string[];
  lender_compatibility: Record<string, number>; // lender_id -> score
}

export type TaskStatus = 'CREATED' | 'ASSIGNED' | 'PENDING' | 'ESCALATED' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  title: string;
  description?: string;
  entity_type: 'LEAD' | 'CUSTOMER' | 'CONSULTATION' | 'DOCUMENT' | 'SYSTEM' | 'LIFECYCLE' | 'AGENT';
  entity_id: string;
  assigned_to?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type KYCStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface LeadData {
  id?: string;
  customer_id?: string;
  full_name?: string;
  email?: string;
  phone: string;
  loan_type: string;
  loan_amount: number;
  monthly_income: number;
  employment_type: string;
  city: string;
  pincode?: string;
  lead_score: number;
  status: LeadStatus;
  urgency?: string;
  credit_report_status?: 'PENDING' | 'UPLOADED' | 'PARSED' | 'FAILED';
  credit_report_url?: string;
  bureau_score?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id?: string;
  full_name: string;
  phone: string;
  email: string;
  role: UserRole;
  kyc_status: KYCStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Asset {
  id: string;
  owner_id: string;
  type: 'VEHICLE' | 'PROPERTY' | 'INSURANCE' | 'DOCUMENT';
  name: string;
  value?: number;
  documents: string[]; // URLs
  metadata: Record<string, any>;
  created_at: string;
}

export type AgentStatus = 'IDLE' | 'ANALYZING' | 'RECOMMENDING' | 'COMPLETED' | 'ERROR';

export interface AgentIdentity {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
}

export interface AgentRecommendation {
  id: string;
  agent_id: string;
  trigger_event_id: string;
  entity_type: 'LEAD' | 'CUSTOMER' | 'CONSULTATION' | 'DOCUMENT';
  entity_id: string;
  recommendation_type: 'FOLLOW_UP' | 'PRIORITIZATION' | 'CLASSIFICATION' | 'SUMMARY' | 'ESCALATION';
  content: any;
  confidence: number; // 0-1
  reasoning: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  created_at: string;
}

// Phase 7: Communication Infrastructure
export type MessagePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type MessageType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'SYSTEM_ALERT';
export type SenderType = 'CUSTOMER' | 'AGENT' | 'AI_AGENT' | 'SYSTEM';
export type EscalationState = 'NONE' | 'PENDING' | 'ESCALATED' | 'RESOLVED';

export interface CustomerMessage {
  id: string;
  customer_id: string;
  lead_id?: string;
  sender_id?: string;
  sender_type: SenderType;
  content: string;
  message_type: MessageType;
  message_priority: MessagePriority;
  attachment_url?: string;
  is_read: boolean;
  escalation_state: EscalationState;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  read_status: boolean;
  created_at: string;
}
