import React, { useState, useEffect } from 'react';
import { Loader2, Plus, AlertCircle, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { leadService } from '../services/supabaseClient';

const COLUMNS = [
  { id: 'new', title: 'New Leads', icon: Plus, color: 'blue' },
  { id: 'document_collection', title: 'Document Collection', icon: FileText, color: 'orange' },
  { id: 'underwriting', title: 'Underwriting', icon: AlertCircle, color: 'purple' },
  { id: 'approved', title: 'Approved', icon: CheckCircle2, color: 'emerald' },
  { id: 'rejected', title: 'Rejected', icon: XCircle, color: 'red' },
];

export default function LoanApplications() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    const { data } = await leadService.getAllLeads();
    setLeads(data || []);
    setIsLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    // Optimistically update UI
    setLeads(currentLeads => 
      currentLeads.map(lead => 
        lead.id === leadId ? { ...lead, status: statusId } : lead
      )
    );

    // Persist to DB
    await leadService.updateLead(leadId, { status: statusId });
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-8 py-6 border-b border-slate-200 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Loan Applications Pipeline</h1>
        <p className="text-slate-500 text-sm mt-1">Drag and drop leads to progress them through the application lifecycle.</p>
      </div>

      <div className="flex-1 p-8 overflow-x-auto">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
            <p>Loading pipeline data...</p>
          </div>
        ) : (
          <div className="flex gap-6 h-full min-w-max pb-4">
            {COLUMNS.map(column => {
              const columnLeads = leads.filter(l => (l.status || 'new') === column.id);
              const Icon = column.icon;

              return (
                <div 
                  key={column.id} 
                  className="w-80 flex flex-col bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className={`p-4 bg-white border-b border-slate-200 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full bg-${column.color}-100 text-${column.color}-600 flex items-center justify-center`}>
                        <Icon size={16} />
                      </div>
                      <h3 className="font-bold text-slate-800">{column.title}</h3>
                    </div>
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900">{lead.phone}</h4>
                          {lead.urgent_action_required && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs text-slate-500 font-medium">
                            Type: {lead.loan_type?.replace('_', ' ') || 'UNSPECIFIED'}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Status: {lead.employment_status || 'Unknown'}
                          </p>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                          <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                          <button className="hover:text-blue-600 transition-colors">View Details</button>
                        </div>
                      </div>
                    ))}
                    {columnLeads.length === 0 && (
                      <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-400 font-medium">Drop leads here</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
