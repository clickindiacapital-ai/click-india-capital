import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Loader2 } from 'lucide-react';
import { customerService } from '../services/supabaseClient';

export default function Customers({ onSelectCustomer }: { onSelectCustomer?: (id: string) => void }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    const { data } = await customerService.getAllCustomers();
    setCustomers(data || []);
    setIsLoading(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your onboarded clients and view their history.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="flex-1 p-8 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Client Name</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Active Loans</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Disbursed</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">LTV</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-blue-500" size={24} />
                        <span>Loading customers...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No customers found. Try adjusting your search or add a new customer.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(customer => (
                    <tr 
                      key={customer.id} 
                      onClick={() => onSelectCustomer && onSelectCustomer(customer.id)}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{customer.name}</p>
                            <p className="text-xs text-slate-500">Joined {new Date(customer.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-slate-900">{customer.phone}</p>
                        <p className="text-xs text-slate-500">{customer.email}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          {customer.active_loans} Active
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-slate-900">₹{(customer.total_loans_disbursed || 0).toLocaleString('en-IN')}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-bold text-blue-600">₹{(customer.lifetime_value || 0).toLocaleString('en-IN')}</p>
                      </td>
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
                              const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
                              const greeting = `Hello ${customer.name}, Sameer here from Click India Capital. I am following up on your loan inquiry. How can I assist you today?`;
                              window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(greeting)}`, '_blank');
                            }}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center"
                            title="Chat on WhatsApp"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.12 .953 11.5 .953c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.46 3.393 1.332 4.888L1.93 21.056l4.717-1.229c.001-.001.002-.001.002-.001zm11.758-6.72c-.3-.149-1.774-.863-2.046-.961-.273-.099-.472-.149-.669.149-.198.299-.766.961-.94 1.159-.173.199-.348.223-.648.075-.3-.15-1.266-.46-2.41-1.472-.89-.785-1.49-1.755-1.665-2.053-.173-.297-.018-.458.13-.606.134-.133.3-.347.45-.52.149-.172.2-.297.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.587-.916-2.182-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.774-.719 2.022-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                            </svg>
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreVertical size={18} />
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
    </div>
  );
}
