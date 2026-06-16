import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnvuxyhytvacztdmmtdq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudnV4eWh5dHZhY3p0ZG1tdGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDk5ODksImV4cCI6MjA5NjkyNTk4OX0.6E2vq8Ly5vLiDwuJlZOpR-67CvKvyUzNURWfqy3Kp9M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Authenticating...');
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: 'clickindiacapital@gmail.com',
    password: 'password123' // The user said they set a password earlier
  });
  
  if (authError) {
    // Try signing up if login fails
    await supabase.auth.signUp({
      email: 'clickindiacapital@gmail.com',
      password: 'password123'
    });
  }

  console.log('Inserting dummy customer...');
  
  const { data: customer, error: customerError } = await supabase.from('customers').insert([{
    name: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    dob: '1985-06-15',
    city: 'Mumbai',
    state: 'Maharashtra',
    employment_type: 'Salaried',
    employer_name: 'Tech Mahindra',
    designation: 'Senior Software Engineer',
    experience_years: 8,
    industry: 'IT',
    monthly_income: 125000,
    emi_obligations: 25000,
    credit_score: 780,
    existing_loans_count: 1,
    credit_card_outstanding: 45000,
    primary_goal: 'Buy a Home',
    tags: ['Premium', 'Home Buyer', 'IT Professional'],
    borrow_readiness_score: 85,
    loan_health_metrics: {
      income_stability: 9,
      credit_behaviour: 8,
      emi_burden: 8,
      documentation: 9
    },
    total_loans_disbursed: 0,
    active_loans: 1,
    lifetime_value: 0
  }]).select().single();

  if (customerError) {
    console.error('Error inserting customer:', customerError);
    return;
  }

  console.log('Customer inserted with ID:', customer.id);

  console.log('Inserting dummy lead...');
  const { error: leadError } = await supabase.from('leads').insert([{
    customer_id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company_name: customer.employer_name,
    loan_type: 'HOME_LOAN',
    loan_amount: 7500000,
    status: 'NEW',
    source: 'Website',
    urgent_action_required: true
  }]);

  if (leadError) {
    console.error('Error inserting lead:', leadError);
  } else {
    console.log('Lead inserted successfully.');
  }

  console.log('Inserting timeline event...');
  await supabase.from('customer_timeline').insert([{
    customer_id: customer.id,
    event_type: 'Lead Created',
    description: 'Customer requested a home loan consultation via the website.'
  }]);

  console.log('Inserting dummy consultation...');
  await supabase.from('consultations').insert([{
    customer_id: customer.id,
    type: 'BLUEPRINT_1500',
    amount_paid: 1500,
    status: 'PENDING',
    scheduled_for: new Date(Date.now() + 86400000).toISOString(),
    duration_minutes: 45
  }]);

  console.log('Seed completed successfully!');
}

seed();
