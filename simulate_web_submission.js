require('dotenv').config({ path: './apps/web/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function simulateSubmission() {
  console.log('Simulating a new lead submission from the website...');
  
  // Authenticate as a user to bypass RLS, simulating a user or using service role if available
  // But wait, the web app doesn't auth users before they submit a form! 
  // If we want the web app to submit, we must fix the RLS. Let's try to authenticate using admin just to prove it works, or see if it fails anonymously.
  
  // First, let's test anonymous insertion for LEADS (which has anon insert policy)
  const { data: leadData, error: leadError } = await supabase.from('leads').insert([{
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '9876543210',
    loan_type: 'Personal Loan',
    status: 'NEW',
    source: 'Borrow Readiness Check',
    urgent_action_required: false
  }]).select();

  if (leadError) {
    console.error('Failed to insert lead anonymously:', leadError);
  } else {
    console.log('Successfully inserted lead anonymously!', leadData);
  }
}

simulateSubmission();
