import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { generateUUID } from '../utils/uuid';
import { 
  User, FileText, Check, Lock, AlertCircle, LogOut, 
  UploadCloud, TrendingUp, MapPin, Activity, ShieldCheck,
  ChevronRight, Calendar, Landmark, Sparkles
} from 'lucide-react';

export default function ClientPortal() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Dashboard states
  const [customer, setCustomer] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [matchedLenders, setMatchedLenders] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'VAULT'>('DASHBOARD');
  
  // New profile form states (for users logged in without a profile)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regEmployment, setRegEmployment] = useState('Salaried');
  const [regIncome, setRegIncome] = useState('');
  const [regEmi, setRegEmi] = useState('0');
  const [regCreditScore, setRegCreditScore] = useState('700');
  const [regGoal, setRegGoal] = useState('Buy a Home');
  
  // Upload status states
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchCustomerData(session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchCustomerData(session.user.email);
      } else {
        setCustomer(null);
        setDocuments([]);
        setMatchedLenders([]);
        setTimeline([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCustomerData = async (userEmail: string) => {
    setLoading(true);
    try {
      // 1. Fetch Customer Record
      const { data: cData, error: cError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', userEmail)
        .maybeSingle();

      if (cError) throw cError;

      if (cData) {
        setCustomer(cData);
        
        // 2. Fetch Documents Metadata
        const { data: dData } = await supabase
          .from('customer_documents')
          .select('*')
          .eq('customer_id', cData.id)
          .order('uploaded_at', { ascending: false });
        
        setDocuments(dData || []);

        // 3. Fetch Timeline Events
        const { data: tData } = await supabase
          .from('customer_timeline')
          .select('*')
          .eq('customer_id', cData.id)
          .order('event_date', { ascending: false });

        setTimeline(tData || []);

        // 4. Run Credit Policy Matching Engine
        await runCreditMatching(cData);
      } else {
        setCustomer(null);
      }
    } catch (err) {
      console.error('Error fetching customer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const runCreditMatching = async (customerProfile: any) => {
    try {
      const { data: policies, error } = await supabase
        .from('lender_policies')
        .select('*')
        .eq('active', true);
      
      if (policies && !error) {
        const score = customerProfile.credit_score || 0;
        const income = customerProfile.monthly_income || 0;
        const emi = customerProfile.emi_obligations || 0;
        const foir = income > 0 ? (emi / income) : 0;
        const userFoirPct = foir * 100;
        
        // Map common inputs to db options
        const userLoanType = customerProfile.primary_goal?.includes('Home') ? 'Home Loan' :
                             customerProfile.primary_goal?.includes('Vehicle') ? 'Vehicle Loan' :
                             customerProfile.primary_goal?.includes('Business') ? 'Business Loan' : 'Personal Loan';

        const normalizedEmployment = customerProfile.employment_type === 'SelfEmployed' || customerProfile.employment_type === 'self_employed' ? 'Self-Employed' : 'Salaried';

        const lenders = policies.map((policy: any) => {
          const cibilOk = score >= policy.min_cibil;
          const incomeOk = income >= policy.min_income;
          const foirOk = userFoirPct <= policy.max_foir_percentage;
          const employmentOk = policy.allowed_employment_types.includes(normalizedEmployment);
          const loanOk = policy.allowed_loan_types.includes(userLoanType);

          const passedChecks = [cibilOk, incomeOk, foirOk, employmentOk, loanOk].filter(Boolean).length;
          
          let matchStatus = 'Low Match';
          let matchColor = 'red';
          if (passedChecks === 5) {
            matchStatus = 'High Match';
            matchColor = 'emerald';
          } else if (passedChecks >= 3) {
            matchStatus = 'Moderate Match';
            matchColor = 'amber';
          }

          return {
            bank_name: policy.bank_name,
            base_rate: policy.base_interest_rate,
            status: matchStatus,
            color: matchColor,
            notes: policy.notes,
            cibilOk,
            incomeOk,
            foirOk,
            employmentOk,
            loanOk
          };
        });

        // Sort: High -> Moderate -> Low Match
        const matchOrder: Record<string, number> = { 'High Match': 1, 'Moderate Match': 2, 'Low Match': 3 };
        lenders.sort((a, b) => matchOrder[a.status] - matchOrder[b.status]);
        setMatchedLenders(lenders);
      }
    } catch (err) {
      console.error('Failed to query Credit Policy Matching Engine:', err);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLinkSent(false);
    setAuthError('');
    
    if (!email) return;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`
        }
      });

      if (error) {
        setAuthError(error.message);
      } else {
        setMagicLinkSent(true);
        // Log timeline event if user profile exists
        try {
          const { data: maybeCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (maybeCustomer) {
            await supabase.from('customer_timeline').insert([{
              customer_id: maybeCustomer.id,
              event_type: 'PORTAL_LOGIN_REQUEST',
              description: 'Requested login Magic Link.'
            }]);
          }
        } catch (_) {}
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred.');
    }
  };

  const handleRegisterProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!session?.user?.email) return;

    try {
      const customerId = generateUUID();
      const income = parseInt(regIncome) || 0;
      const emi = parseInt(regEmi) || 0;
      const score = parseInt(regCreditScore) || 700;
      
      // Compute score
      let totalScore = 50;
      if (score >= 750) totalScore += 25;
      else if (score >= 650) totalScore += 15;
      
      const foir = income > 0 ? (emi / income) : 0;
      if (foir <= 0.4) totalScore += 25;
      else if (foir <= 0.6) totalScore += 10;
      else totalScore -= 10;
      
      totalScore = Math.max(0, Math.min(100, totalScore));

      const loanHealth = {
        income_stability: regEmployment === 'Salaried' ? 9 : 7,
        credit_behaviour: score >= 750 ? 9 : score >= 650 ? 7 : 4,
        emi_burden: foir <= 0.4 ? 9 : foir <= 0.6 ? 6 : 3,
        documentation: 6
      };

      // Create profile record
      const { error: insertError } = await supabase
        .from('customers')
        .insert([{
          id: customerId,
          name: regName,
          email: session.user.email,
          phone: regPhone,
          city: regCity,
          employment_type: regEmployment,
          monthly_income: income,
          emi_obligations: emi,
          credit_score: score,
          primary_goal: regGoal,
          borrow_readiness_score: totalScore,
          loan_health_metrics: loanHealth,
          tags: ['portal_signup']
        }]);

      if (insertError) throw insertError;

      // Add timeline event
      await supabase.from('customer_timeline').insert([{
        customer_id: customerId,
        event_type: 'PROFILE_CREATED',
        description: 'Client profile registered via Secure Portal.'
      }]);

      // Refresh customer data
      await fetchCustomerData(session.user.email);
    } catch (err: any) {
      console.error(err);
      alert('Error creating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file || !customer) return;

    setUploadingDocType(docType);
    setUploadMessage(null);

    try {
      // 1. Upload file to Supabase Storage
      const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${customer.id}/${docType}_${cleanFileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('customer-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 2. Add or update record in database customer_documents
      const existingDoc = documents.find(d => d.document_type === docType);
      
      if (existingDoc) {
        const { error: dbError } = await supabase
          .from('customer_documents')
          .update({
            file_url: filePath,
            status: 'UPLOADED',
            uploaded_at: new Date().toISOString()
          })
          .eq('id', existingDoc.id);

        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('customer_documents')
          .insert([{
            customer_id: customer.id,
            document_type: docType,
            file_url: filePath,
            status: 'UPLOADED',
            uploaded_at: new Date().toISOString()
          }]);

        if (dbError) throw dbError;
      }

      // 3. Log event in timeline
      await supabase.from('customer_timeline').insert([{
        customer_id: customer.id,
        event_type: 'DOCUMENT_UPLOAD',
        description: `Uploaded document: ${docType} (${file.name})`
      }]);

      setUploadMessage({
        type: 'success',
        text: `${docType} uploaded successfully!`
      });

      // Refresh data
      fetchCustomerData(session.user.email);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadMessage({
        type: 'error',
        text: `Upload failed: ${err.message || 'Storage error'}`
      });
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  const getDocStatusBadge = (docType: string) => {
    const doc = documents.find(d => d.document_type === docType);
    if (!doc) {
      return (
        <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
          Pending
        </span>
      );
    }

    switch (doc.status) {
      case 'VERIFIED':
        return (
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <Check size={12} /> Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <AlertCircle size={12} /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            Uploaded
          </span>
        );
    }
  };

  const docLabels: Record<string, string> = {
    'PAN': 'PAN Card',
    'AADHAAR': 'Aadhaar Card',
    'SALARY_SLIP': 'Salary Slips (Last 3 Months)',
    'BANK_STATEMENT': 'Bank Statement (Last 6 Months)',
    'ITR': 'ITR Filings (Last 2 Years)'
  };

  // Rendering Loading View
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Loading secure space...</p>
        </div>
      </div>
    );
  }

  // Rendering Login Page (If not logged in)
  if (!session) {
    return (
      <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-900/40">
              C
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">CLICK INDIA</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Client Portal</p>
            </div>
          </div>

          <div className="bg-[#0A111F] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-black tracking-tighter mb-2">Secure Login</h2>
              <p className="text-sm text-gray-400 font-medium">
                Enter your email address to receive a passwordless login link in your inbox. No passwords required.
              </p>
            </div>

            {magicLinkSent ? (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-lg font-bold">Check Your Email!</h3>
                <p className="text-sm text-gray-400">
                  We have sent a secure Magic Link to <strong className="text-white">{email}</strong>. Click the link in that email to log in instantly.
                </p>
                <button
                  onClick={() => setMagicLinkSent(false)}
                  className="text-xs text-blue-500 hover:text-blue-400 font-bold uppercase tracking-wider mt-4 block mx-auto underline cursor-pointer"
                >
                  Change Email or Resend
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLinkLogin} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium outline-none focus:border-blue-600 transition-all placeholder:text-gray-700"
                  />
                </div>

                {authError && (
                  <div className="px-5 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-xs font-bold text-red-400">{authError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!email}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/40 cursor-pointer"
                >
                  Send Login Link
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-[10px] text-gray-700 font-bold uppercase tracking-widest mt-8">
            Secured by Supabase Authentication · Click India Capital
          </p>
        </div>
      </div>
    );
  }

  // Rendering Register Profile view (If logged in but doesn't exist in customer DB table)
  if (!customer) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 md:p-10 bg-white rounded-3xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={30} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Complete Your Profile</h2>
          <p className="text-slate-500 text-sm mt-2">
            No active borrow readiness profile was found for <span className="font-bold text-slate-800">{session.user.email}</span>. Please complete registration below to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleRegisterProfile} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
              <input type="text" value={regName} onChange={e => setRegName(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">WhatsApp / Phone</label>
              <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="9876543210" pattern="[0-9]{10}" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">City</label>
              <input type="text" value={regCity} onChange={e => setRegCity(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="Mumbai" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Employment</label>
              <select value={regEmployment} onChange={e => setRegEmployment(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="Salaried">Salaried Professional</option>
                <option value="Self-Employed">Self-Employed / Business</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Monthly Income (₹)</label>
              <input type="number" value={regIncome} onChange={e => setRegIncome(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="50000" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Current EMIs (₹)</label>
              <input type="number" value={regEmi} onChange={e => setRegEmi(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="5000" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Credit Score</label>
              <input type="number" value={regCreditScore} onChange={e => setRegCreditScore(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="750" min="300" max="900" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Primary Goal</label>
            <select value={regGoal} onChange={e => setRegGoal(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Buy a Home">🏠 Buy a Home</option>
              <option value="Buy a Vehicle">🚗 Buy a Vehicle</option>
              <option value="Grow Business">💼 Grow Business</option>
              <option value="Debt Consolidation">💳 Debt Consolidation</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md mt-4 cursor-pointer"
          >
            Create My Dashboard
          </button>
          
          <button 
            type="button" 
            onClick={handleLogout}
            className="w-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition-all text-sm mt-1 cursor-pointer"
          >
            Log Out / Switch Account
          </button>
        </form>
      </div>
    );
  }

  // Calculate user ratios
  const foirPct = customer.monthly_income > 0 ? (customer.emi_obligations / customer.monthly_income) * 100 : 0;

  // Rendering Main Client Portal Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Dashboard Top Header */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white mb-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">{customer.name}</h1>
            <p className="text-slate-400 font-medium text-sm flex items-center gap-2 mt-1">
              <span>{customer.email}</span>
              <span className="w-1 h-1 bg-slate-600 rounded-full" />
              <span>{customer.phone}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 hover:text-white px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm cursor-pointer"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-left font-bold text-sm uppercase tracking-wider ${
              activeTab === 'DASHBOARD' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TrendingUp size={18} />
            My Readiness Score
          </button>
          
          <button
            onClick={() => setActiveTab('VAULT')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-left font-bold text-sm uppercase tracking-wider ${
              activeTab === 'VAULT' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Lock size={18} />
            Secure Document Vault
          </button>
          
          {/* Quick Profile summary */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Profile Snapshot</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Employment:</span>
                <span className="font-bold text-slate-800">{customer.employment_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Income:</span>
                <span className="font-bold text-slate-800">₹{customer.monthly_income?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EMI Obligation:</span>
                <span className="font-bold text-slate-800">₹{customer.emi_obligations?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Credit Score:</span>
                <span className="font-bold text-slate-800">{customer.credit_score || 'N/A'}</span>
              </div>
              {customer.city && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1"><MapPin size={12} /> {customer.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {activeTab === 'DASHBOARD' && (
            <div className="space-y-6">
              
              {/* Score Summary Card */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="md:col-span-1 flex flex-col items-center text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Borrow Readiness Score</p>
                  
                  {/* Gauge */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="60" className="stroke-slate-100" strokeWidth="12" fill="transparent" />
                      <circle 
                        cx="72" 
                        cy="72" 
                        r="60" 
                        className={`transition-all duration-1000 ${
                          customer.borrow_readiness_score >= 80 ? 'stroke-emerald-500' :
                          customer.borrow_readiness_score >= 60 ? 'stroke-amber-500' : 'stroke-red-500'
                        }`} 
                        strokeWidth="12" 
                        fill="transparent" 
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - customer.borrow_readiness_score / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-900">{customer.borrow_readiness_score}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Points</span>
                    </div>
                  </div>
                  
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mt-4 ${
                    customer.borrow_readiness_score >= 80 ? 'bg-emerald-50 text-emerald-700' :
                    customer.borrow_readiness_score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {customer.borrow_readiness_score >= 80 ? 'Excellent Status' :
                     customer.borrow_readiness_score >= 60 ? 'Needs Attention' : 'High Rejection Risk'}
                  </span>
                </div>

                {/* Score breakdown metrics */}
                <div className="md:col-span-2 space-y-5">
                  <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">Financial Fitness Parameters</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Income Stability', val: customer.loan_health_metrics?.income_stability || 0, color: 'blue' },
                      { label: 'Credit Behavior', val: customer.loan_health_metrics?.credit_behaviour || 0, color: 'purple' },
                      { label: 'Debt EMI Burden (FOIR)', val: customer.loan_health_metrics?.emi_burden || 0, color: 'orange' },
                      { label: 'Documents Readiness', val: customer.loan_health_metrics?.documentation || 0, color: 'emerald' }
                    ].map((m, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <span>{m.label}</span>
                          <span className="text-slate-800">{m.val}/10</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-${m.color}-500 rounded-full`} 
                            style={{ width: `${(m.val / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matched Lenders policies */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Landmark className="text-blue-500" />
                  <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Matched Lender Scenarios</h3>
                </div>
                
                {matchedLenders.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4">No bank policies currently matched or set active.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {matchedLenders.map((lender, i) => (
                      <div key={i} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="font-black text-base text-slate-900">{lender.bank_name}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              lender.status === 'High Match' ? 'bg-emerald-100 text-emerald-700' :
                              lender.status === 'Moderate Match' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {lender.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs mt-1 max-w-lg">{lender.notes || 'Tentative approval based on credit parameters.'}</p>
                          
                          {/* Parameter details */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span className={lender.cibilOk ? 'text-emerald-600' : 'text-red-500'}>CIBIL: {lender.cibilOk ? '✔ Pass' : '✘ Fail'}</span>
                            <span className={lender.foirOk ? 'text-emerald-600' : 'text-red-500'}>FOIR: {lender.foirOk ? '✔ Pass' : '✘ Fail'}</span>
                            <span className={lender.incomeOk ? 'text-emerald-600' : 'text-red-500'}>Income: {lender.incomeOk ? '✔ Pass' : '✘ Fail'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Indicative Interest Rate</p>
                          <p className="text-2xl font-black text-blue-600 mt-1">Starting @ {lender.base_rate}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Debt Advice Suggestions */}
              <div className="bg-blue-50 border border-blue-100 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-5 text-blue-900">
                  <ShieldCheck size={22} />
                  <h3 className="font-black text-lg uppercase tracking-tight">Credit Improvement Advisory</h3>
                </div>
                <ul className="space-y-3.5">
                  {foirPct > 45 && (
                    <li className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span><strong>High EMI Ratio (FOIR is {foirPct.toFixed(1)}%):</strong> You are dedicating more than 40% of your earnings to debt. Consider paying off credit card balances or prepaying short loans before applying to top-tier banks.</span>
                    </li>
                  )}
                  {customer.credit_score < 720 && (
                    <li className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span><strong>Subprime Credit Score ({customer.credit_score}):</strong> Prime lenders like HDFC and SBI look for score ranges above 730+. Ensure zero delayed payments on existing cards for the next 3 months to boost your rating.</span>
                    </li>
                  )}
                  {customer.employment_type === 'Self-Employed' && (
                    <li className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span><strong>Self-Employed Documentation Checklist:</strong> Make sure you have at least 2 consecutive years of ITR filings showing matching business profits alongside current GST certifications ready.</span>
                    </li>
                  )}
                  {foirPct <= 45 && customer.credit_score >= 720 && (
                    <li className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <span><strong>Strong Eligibility Status:</strong> Your ratios are well-balanced! Proceed to upload your verification documents to the vault so we can package your file for submission to SBI or HDFC.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'VAULT' && (
            <div className="space-y-6">
              
              {/* Document vault wrapper */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <div className="mb-6">
                  <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Your Private Vault</h3>
                  <p className="text-slate-500 text-sm mt-1">Upload files securely. Uploaded documents are encrypted and accessible only to you and Sameer Krishnan (Advisory Lead).</p>
                </div>

                {uploadMessage && (
                  <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${
                    uploadMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                  }`}>
                    <AlertCircle className="mt-0.5 shrink-0" size={16} />
                    <p className="text-sm font-medium">{uploadMessage.text}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {['PAN', 'AADHAAR', 'SALARY_SLIP', 'BANK_STATEMENT', 'ITR'].map((docType) => {
                    const dbDoc = documents.find(d => d.document_type === docType);
                    const isUploading = uploadingDocType === docType;
                    const isLocked = dbDoc?.status === 'VERIFIED';
                    
                    return (
                      <div key={docType} className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{docLabels[docType]}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                              {getDocStatusBadge(docType)}
                              {dbDoc?.uploaded_at && (
                                <>
                                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                  <span>Uploaded on {new Date(dbDoc.uploaded_at).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isUploading ? (
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wide">
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              Uploading...
                            </div>
                          ) : isLocked ? (
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                              <Lock size={12} /> Verified & Locked
                            </span>
                          ) : (
                            <label className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                              <UploadCloud size={14} />
                              {dbDoc ? 'Replace File' : 'Upload File'}
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => handleFileUpload(e, docType)}
                                accept=".pdf,.png,.jpg,.jpeg"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Timeline Log */}
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="text-blue-500" />
                  <h3 className="font-black text-xl text-slate-900 uppercase tracking-tight">Timeline Log</h3>
                </div>

                <div className="relative border-l-2 border-slate-100 pl-4 ml-3 space-y-6">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative">
                      {/* circle */}
                      <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 bg-blue-100 border-2 border-blue-600 rounded-full" />
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                          <span>{event.event_type}</span>
                          <span className="text-[10px] font-medium tracking-normal text-slate-400 flex items-center gap-1"><Calendar size={10} /> {new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                  {timeline.length === 0 && (
                    <p className="text-slate-500 text-sm py-2">No timeline logged yet. Upload files to start tracking.</p>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
