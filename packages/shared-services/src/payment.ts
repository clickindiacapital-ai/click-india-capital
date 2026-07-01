import { getSupabase } from './supabase';

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
}

export interface UPIConfig {
  vpa: string;
  name: string;
  currency: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const paymentService = {
  async loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  async createOrder(amount: number, currency: string = 'INR', metadata: any = {}, lead_id?: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { amount, currency, metadata, lead_id }
    });

    if (error) throw error;
    return data;
  },

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    lead_id?: string;
  }) {
    const supabase = getSupabase();
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: paymentData
    });

    if (error) throw error;
    return data;
  },

  async processPayment(options: Omit<RazorpayOptions, 'handler'>): Promise<any> {
    // Handle Dummy Mode for testing without keys
    if (options.key === 'DUMMY') {
      console.log('--- PAYMENTS DUMMY MODE ENABLED ---');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            razorpay_order_id: 'dummy_order_123',
            razorpay_payment_id: 'dummy_payment_456',
            razorpay_signature: 'dummy_signature_789'
          });
        }, 2000);
      });
    }

    const success = await this.loadScript();
    if (!success) {
      throw new Error('Razorpay SDK failed to load. Are you online?');
    }

    return new Promise((resolve, reject) => {
      const rzpOptions: RazorpayOptions = {
        ...options,
        handler: (response: any) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          }
        }
      } as any;

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    });
  },

  // 4. MANUAL UPI SUBMISSION (PHASE 9)
  async submitManualPayment(data: {
    userId?: string;
    phone?: string;
    leadId: string;
    amount: number;
    utrNumber: string;
    payerName?: string;
  }) {
    const { getSupabase } = await import('./supabase');
    const supabase = getSupabase();

    // Check for duplicate UTR (PHASE 9 Hardening)
    const { data: existing } = await supabase
      .from('payment_submissions')
      .select('id')
      .eq('utr_number', data.utrNumber)
      .single();

    if (existing) {
      return { error: { message: 'This UTR number has already been submitted for verification.' } };
    }

    const { data: result, error } = await supabase.from('payment_submissions').insert([{
      user_id: data.userId,
      phone: data.phone,
      lead_id: data.leadId,
      amount: data.amount,
      utr_number: data.utrNumber,
      payer_name: data.payerName,
      status: 'PENDING_VERIFICATION'
    }]).select().single();

    if (result && !error) {
       // Trigger Operational Alert (PHASE 9)
       const { notificationService } = await import('./supabase');
       await notificationService.dispatchOperationalAlert(
         'PAYMENT_SUBMITTED',
         `UPI Payment Submitted (₹${result.amount}) - UTR: ${result.utr_number}`,
         { submission_id: result.id, lead_id: result.lead_id }
       );
    }

    return { data: result, error };
  },

  async getPendingVerifications() {
    const supabase = getSupabase();
    return await supabase
      .from('payment_submissions')
      .select('*, users(full_name, phone), loan_leads(loan_type)')
      .eq('status', 'PENDING_VERIFICATION')
      .order('created_at', { ascending: false });
  },

  async verifyManualPayment(submissionId: string, status: 'APPROVED' | 'REJECTED', adminId: string) {
    const supabase = getSupabase();
    const { data: submission, error: subError } = await supabase
      .from('payment_submissions')
      .update({
        status,
        verified_at: new Date().toISOString(),
        verified_by: adminId
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (subError) throw subError;

    // If approved, update lead status
    if (status === 'APPROVED' && submission.lead_id) {
      await supabase
        .from('loan_leads')
        .update({ 
          lifecycle_stage: 'CONSULTATION',
          status: 'QUALIFIED',
          urgent_action_required: true 
        })
        .eq('id', submission.lead_id);
    }

    return submission;
  },

  // DYNAMIC UPI QR GENERATION (PHASE 2)
  generateUPILink(config: UPIConfig, amount: number, transactionNote: string): string {
    const { vpa, name, currency } = config;
    const encodedName = encodeURIComponent(name);
    const encodedNote = encodeURIComponent(transactionNote);
    
    // Format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=CURRENCY&tn=NOTE
    return `upi://pay?pa=${vpa}&pn=${encodedName}&am=${amount}&cu=${currency}&tn=${encodedNote}`;
  }
};
