import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bnvuxyhytvacztdmmtdq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudnV4eWh5dHZhY3p0ZG1tdGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNDk5ODksImV4cCI6MjA5NjkyNTk4OX0.6E2vq8Ly5vLiDwuJlZOpR-67CvKvyUzNURWfqy3Kp9M'
);

async function simulateSubmission() {
  console.log('Simulating a new lead submission from the website...');
  
  // We first need to authenticate since the customer table is strictly protected by RLS
  let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'clickindiacapital@gmail.com',
    password: 'password123'
  });

  if (authError) {
    // Try sign up
    const res = await supabase.auth.signUp({
      email: 'clickindiacapital@gmail.com',
      password: 'password123'
    });
    authError = res.error;
    authData = res.data;
  }

  if (authError) {
    console.error('Authentication failed:', authError.message);
    return;
  }

  // Create Customer
  const { data: customerData, error: customerError } = await supabase.from('customers').insert([{
    name: 'Rahul Verma',
    phone: '9876543210',
    email: 'rahul.verma@example.com',
    city: 'Mumbai',
    employment_type: 'Salaried',
    monthly_income: 85000,
    emi_obligations: 25000,
    credit_score: 680,
    primary_goal: 'Buy a Home',
    borrow_readiness_score: 72,
    tags: ['Fear of rejection'],
    loan_health_metrics: {
      income_stability: 9,
      credit_behaviour: 7,
      emi_burden: 6,
      documentation: 8
    }
  }]).select().single();

  if (customerError) {
    console.error('Failed to create customer profile:', customerError);
    return;
  }
  
  console.log('Created CRM Profile:', customerData.id);

  // Create Lead
  const { data: leadData, error: leadError } = await supabase.from('leads').insert([{
    customer_id: customerData.id,
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '9876543210',
    loan_type: 'Home Loan',
    status: 'NEW',
    source: 'Borrow Readiness Check',
    urgent_action_required: true,
    message: 'Generated via the new website Borrow Readiness assessment.'
  }]).select().single();

  if (leadError) {
    console.error('Failed to insert lead into pipeline:', leadError);
  } else {
    console.log('Successfully dropped lead into CRM pipeline!', leadData.id);
  }
}

simulateSubmission();
