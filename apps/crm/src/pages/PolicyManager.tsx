import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Edit2, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import supabase from '../services/supabaseClient';

type LenderPolicy = {
  id: string;
  bank_name: string;
  logo_url?: string;
  min_cibil: number;
  min_income: number;
  max_foir_percentage: number;
  allowed_employment_types: string[];
  allowed_loan_types: string[];
  base_interest_rate: number;
  active: boolean;
  notes?: string;
};

export default function PolicyManager() {
  const [policies, setPolicies] = useState<LenderPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form Fields
  const [bankName, setBankName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [minCibil, setMinCibil] = useState(650);
  const [minIncome, setMinIncome] = useState(20000);
  const [maxFoir, setMaxFoir] = useState(50);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(['Salaried', 'Self-Employed']);
  const [loanTypes, setLoanTypes] = useState<string[]>(['Home Loan', 'Personal Loan', 'Vehicle Loan', 'Business Loan']);
  const [baseRate, setBaseRate] = useState(8.5);
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lender_policies')
        .select('*')
        .order('bank_name', { ascending: true });
      if (error) throw error;
      setPolicies(data || []);
    } catch (err) {
      console.error('Error fetching policies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBankName('');
    setLogoUrl('');
    setMinCibil(650);
    setMinIncome(20000);
    setMaxFoir(50);
    setEmploymentTypes(['Salaried', 'Self-Employed']);
    setLoanTypes(['Home Loan', 'Personal Loan', 'Vehicle Loan', 'Business Loan']);
    setBaseRate(8.5);
    setIsActive(true);
    setNotes('');
    setIsEditing(false);
    setSelectedId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (policy: LenderPolicy) => {
    setBankName(policy.bank_name);
    setLogoUrl(policy.logo_url || '');
    setMinCibil(policy.min_cibil);
    setMinIncome(policy.min_income);
    setMaxFoir(policy.max_foir_percentage);
    setEmploymentTypes(policy.allowed_employment_types);
    setLoanTypes(policy.allowed_loan_types);
    setBaseRate(policy.base_interest_rate);
    setIsActive(policy.active);
    setNotes(policy.notes || '');
    setIsEditing(true);
    setSelectedId(policy.id);
    setIsModalOpen(true);
  };

  const handleToggleEmployment = (type: string) => {
    if (employmentTypes.includes(type)) {
      setEmploymentTypes(employmentTypes.filter(t => t !== type));
    } else {
      setEmploymentTypes([...employmentTypes, type]);
    }
  };

  const handleToggleLoanType = (type: string) => {
    if (loanTypes.includes(type)) {
      setLoanTypes(loanTypes.filter(t => t !== type));
    } else {
      setLoanTypes([...loanTypes, type]);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) return;

    setIsSaving(true);
    const policyPayload = {
      bank_name: bankName,
      logo_url: logoUrl || null,
      min_cibil: Number(minCibil),
      min_income: Number(minIncome),
      max_foir_percentage: Number(maxFoir),
      allowed_employment_types: employmentTypes,
      allowed_loan_types: loanTypes,
      base_interest_rate: Number(baseRate),
      active: isActive,
      notes: notes || null
    };

    try {
      if (isEditing && selectedId) {
        const { error } = await supabase
          .from('lender_policies')
          .update(policyPayload)
          .eq('id', selectedId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lender_policies')
          .insert([policyPayload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchPolicies();
    } catch (err) {
      console.error('Error saving policy:', err);
      alert('Failed to save credit policy.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this credit policy?')) return;
    try {
      const { error } = await supabase
        .from('lender_policies')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchPolicies();
    } catch (err) {
      console.error('Error deleting policy:', err);
    }
  };

  const filteredPolicies = policies.filter(p =>
    p.bank_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit Policy Rule Engine</h1>
          <p className="text-slate-500 text-sm mt-1">Configure credit guidelines, limits, and starting rates for matching lenders.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <Plus size={16} />
          <span>Add Lender Policy</span>
        </button>
      </div>

      <div className="flex-1 p-8 overflow-hidden flex flex-col">
        {/* Search */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search lenders..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Lender Name</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">CIBIL Criteria</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Min Income</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Max FOIR</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Starting Rate</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-blue-500" size={20} />
                        <span>Loading credit policies...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No credit policies found.
                    </td>
                  </tr>
                ) : (
                  filteredPolicies.map(policy => (
                    <tr key={policy.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-slate-900">{policy.bank_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{policy.notes || 'No description'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900">
                        {policy.min_cibil}+
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        ₹{policy.min_income.toLocaleString('en-IN')}/mo
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {policy.max_foir_percentage}%
                      </td>
                      <td className="py-4 px-6 font-bold text-blue-600">
                        {policy.base_interest_rate.toFixed(2)}%
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${policy.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {policy.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEditModal(policy)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit policy"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeletePolicy(policy.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete policy"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
              <h2 className="font-bold text-lg text-slate-900">
                {isEditing ? 'Modify Credit Policy' : 'Create Lender Policy'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSavePolicy} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lender/Bank Name</label>
                  <input 
                    type="text" 
                    required
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Base Interest Rate (%)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={baseRate}
                    onChange={e => setBaseRate(Number(e.target.value))}
                    placeholder="e.g. 8.45"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Min CIBIL Score</label>
                  <input 
                    type="number" 
                    required
                    value={minCibil}
                    onChange={e => setMinCibil(Number(e.target.value))}
                    placeholder="e.g. 700"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Min Monthly Income (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={minIncome}
                    onChange={e => setMinIncome(Number(e.target.value))}
                    placeholder="e.g. 25000"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Max FOIR Ratio (%)</label>
                  <input 
                    type="number" 
                    required
                    value={maxFoir}
                    onChange={e => setMaxFoir(Number(e.target.value))}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Allowed Employment Types */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allowed Employment</label>
                <div className="flex gap-4">
                  {['Salaried', 'Self-Employed'].map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={employmentTypes.includes(type)}
                        onChange={() => handleToggleEmployment(type)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allowed Loan Types */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allowed Loan Products</label>
                <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                  {['Home Loan', 'Personal Loan', 'Vehicle Loan', 'Business Loan'].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer py-1">
                      <input 
                        type="checkbox"
                        checked={loanTypes.includes(type)}
                        onChange={() => handleToggleLoanType(type)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Policy Notes / Description</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Details regarding property criteria, co-applicants, bank-specific rules..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">Lender is Active</label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="animate-spin" size={14} />}
                  <span>{isSaving ? 'Saving...' : 'Save Policy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
