import React, { useState, useEffect } from 'react';
import { Share2, Plus, Trash2, Send, AlertTriangle, CheckCircle, Smartphone, Users, HelpCircle, RefreshCw, X, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import supabase from '../services/supabaseClient';

interface Prospect {
  phone: string;
  status: 'PENDING' | 'SENT_1' | 'SENT_2' | 'ARCHIVED_NO_REPLY';
  sentAt?: string;
}

interface Campaign {
  id: string;
  name: string;
  prospects: Prospect[];
  templates: string[]; // Array of template text variants to rotate through
}

export default function OutreachCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [newCampaignName, setNewCampaignName] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [rawNumbers, setRawNumbers] = useState<string>('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SENT_1' | 'SENT_2' | 'ARCHIVED_NO_REPLY'>('ALL');
  
  // Daily tracker state
  const [dailySentCount, setDailySentCount] = useState<number>(0);
  const maxDailyLimit = 80;

  // Blocklist and cooldown states
  const [blockedPhones, setBlockedPhones] = useState<string[]>([]);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [importSummary, setImportSummary] = useState<{
    show: boolean;
    processed: number;
    duplicates: number;
    blocked: number;
    imported: number;
  } | null>(null);

  // Local system hour check for office hours lock (10 AM to 5 PM)
  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());

  useEffect(() => {
    const hourTimer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(hourTimer);
  }, []);

  const isLockedTime = currentHour < 10 || currentHour >= 17;

  const defaultTemplates = [
    `Hello, Sameer Krishnan here from Click India Capital. \nWe help business owners and salaried professionals check their actual bank loan eligibility and fix profile issues before applying to prime lenders like HDFC and SBI. \nIf you are planning to apply for a Home, Business, or Vehicle loan soon, you can run a free 2-minute eligibility check on our platform:\n👉 clickindiacapital.in`,
    `Hi! Sameer Krishnan from Click India Capital. \nBefore applying for any Home, Business, or Vehicle loan, it is crucial to check your bank eligibility score to avoid standard rejections. \nCheck your readiness and get your matched banks for free in 2 minutes here:\n👉 clickindiacapital.in`,
    `Greetings! This is Sameer Krishnan from Click India Capital. \nWe help borrowers check and fix their bank loan eligibility profiles before submitting to HDFC or SBI. \nRun a quick, free 2-minute borrow readiness check here:\n👉 clickindiacapital.in`,
    `Hello! Sameer Krishnan here. Confused about bank eligibility criteria? \nAt Click India Capital, we evaluate your financial profile against 20+ lenders to check matches. \nStart your free eligibility check here in 2 minutes:\n👉 clickindiacapital.in`,
    `Hi, this is Sameer from Click India Capital. \nDid you know that 30% of loans get rejected due to basic profile errors? We help you detect and correct them beforehand. \nFind your eligible lenders instantly for free:\n👉 clickindiacapital.in`,
    `Greetings! Sameer Krishnan here from Click India Capital. \nWe specialize in home, vehicle, and business loan advisory. Get a clear view of your loan health score before approaching banks. \nCheck your readiness today:\n👉 clickindiacapital.in`,
    `Hi there! Sameer here. Looking for a home, business, or auto loan? \nAvoid multiple hard inquiries that lower your credit score. Check your bank eligibility matches for free on our platform first:\n👉 clickindiacapital.in`,
    `Hello, Sameer Krishnan here. We offer founder-led advisory services to secure the best loan match. \nCheck your borrow readiness score and get your tailored document checklist here:\n👉 clickindiacapital.in`
  ];

  // Initial load
  useEffect(() => {
    fetchBlocklist();

    const savedCampaigns = localStorage.getItem('crm_outreach_campaigns');
    if (savedCampaigns) {
      try {
        const parsed = JSON.parse(savedCampaigns);
        
        // Upgrade campaign models if they use single 'template' instead of 'templates'
        // And upgrade prospect status 'SENT' to 'SENT_1'
        const upgraded = parsed.map((c: any) => {
          let prospects = c.prospects || [];
          prospects = prospects.map((p: any) => {
            if (p.status === 'SENT') {
              return { ...p, status: 'SENT_1' };
            }
            return p;
          });

          if (c.template && !c.templates) {
            return {
              id: c.id,
              name: c.name,
              prospects,
              templates: [c.template, ...defaultTemplates.slice(1)]
            };
          }
          if (!c.templates || c.templates.length === 0) {
            return {
              ...c,
              prospects,
              templates: [...defaultTemplates]
            };
          }
          return { ...c, prospects };
        });

        setCampaigns(upgraded);
        if (upgraded.length > 0) {
          setSelectedCampaignId(upgraded[0].id);
        }
      } catch (e) {
        console.error('Failed to parse campaigns', e);
      }
    } else {
      // Create a default campaign if none exists
      const defaultCampaign: Campaign = {
        id: 'default',
        name: 'Default Cold Outreach',
        prospects: [],
        templates: [...defaultTemplates]
      };
      setCampaigns([defaultCampaign]);
      setSelectedCampaignId('default');
      localStorage.setItem('crm_outreach_campaigns', JSON.stringify([defaultCampaign]));
    }

    // Load daily sent count
    const today = new Date().toDateString();
    const savedDaily = localStorage.getItem('crm_outreach_daily_sent');
    if (savedDaily) {
      try {
        const { date, count } = JSON.parse(savedDaily);
        if (date === today) {
          setDailySentCount(count);
        } else {
          // Reset count for a new day
          setDailySentCount(0);
          localStorage.setItem('crm_outreach_daily_sent', JSON.stringify({ date: today, count: 0 }));
        }
      } catch (e) {
        console.error('Failed to parse daily sent count', e);
      }
    }
  }, []);

  // Cooldown countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(phone => {
          if (next[phone] > 0) {
            next[phone] -= 1;
            changed = true;
          } else {
            delete next[phone];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchBlocklist = async () => {
    try {
      const { data, error } = await supabase
        .from('do_not_contact')
        .select('phone');
      if (error) throw error;
      if (data) {
        setBlockedPhones(data.map((item: any) => item.phone));
      }
    } catch (err) {
      console.error('Failed to fetch blocklist:', err);
    }
  };

  // Save campaigns helper
  const saveCampaigns = (updatedCampaigns: Campaign[]) => {
    setCampaigns(updatedCampaigns);
    localStorage.setItem('crm_outreach_campaigns', JSON.stringify(updatedCampaigns));
  };

  const activeCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Create Campaign
  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) return;
    const newCamp: Campaign = {
      id: 'campaign_' + Date.now(),
      name: newCampaignName.trim(),
      prospects: [],
      templates: [...defaultTemplates]
    };
    const updated = [...campaigns, newCamp];
    saveCampaigns(updated);
    setSelectedCampaignId(newCamp.id);
    setNewCampaignName('');
    setShowCreateModal(false);
  };

  // Delete Campaign
  const handleDeleteCampaign = (id: string) => {
    if (campaigns.length <= 1) {
      alert('You must keep at least one campaign.');
      return;
    }
    if (confirm('Are you sure you want to delete this campaign and all its contacts?')) {
      const updated = campaigns.filter(c => c.id !== id);
      saveCampaigns(updated);
      setSelectedCampaignId(updated[0].id);
    }
  };

  // Import prospects with blocklist check
  const handleImportProspects = async () => {
    if (!rawNumbers.trim() || !activeCampaign) return;
    
    // Parse input
    const numbersArray = rawNumbers
      .split(/[\n,]/)
      .map(num => num.replace(/[^0-9]/g, ''))
      .filter(num => num.length >= 10); // Minimum 10 digits
      
    // Deduplicate
    const uniqueIncoming = Array.from(new Set(numbersArray));
    const totalProcessed = uniqueIncoming.length;

    // Standardize to prepend country code if 10 digits
    const formattedIncoming = uniqueIncoming.map(num => num.length === 10 ? '91' + num : num);

    // Get latest blocklist from DB
    let currentBlocklist: string[] = [];
    try {
      const { data, error } = await supabase
        .from('do_not_contact')
        .select('phone');
      if (!error && data) {
        currentBlocklist = data.map((item: any) => item.phone);
        setBlockedPhones(currentBlocklist);
      }
    } catch (e) {
      console.error(e);
    }

    const dncSet = new Set(currentBlocklist);
    const existingPhones = new Set(activeCampaign.prospects.map(p => p.phone));

    let duplicatesCount = 0;
    let dncCount = 0;
    const cleanProspectsToImport: Prospect[] = [];

    formattedIncoming.forEach(phone => {
      if (existingPhones.has(phone)) {
        duplicatesCount++;
      } else if (dncSet.has(phone)) {
        dncCount++;
      } else {
        cleanProspectsToImport.push({
          phone,
          status: 'PENDING'
        });
      }
    });

    if (cleanProspectsToImport.length > 0) {
      const updatedProspects = [...activeCampaign.prospects, ...cleanProspectsToImport];
      const updatedCampaigns = campaigns.map(c => {
        if (c.id === selectedCampaignId) {
          return { ...c, prospects: updatedProspects };
        }
        return c;
      });
      saveCampaigns(updatedCampaigns);
    }

    setRawNumbers('');
    setImportSummary({
      show: true,
      processed: totalProcessed,
      duplicates: duplicatesCount,
      blocked: dncCount,
      imported: cleanProspectsToImport.length
    });
  };

  // Update specific Template variant
  const handleUpdateTemplate = (index: number, text: string) => {
    if (!activeCampaign) return;
    const updatedTemplates = [...activeCampaign.templates];
    updatedTemplates[index] = text;

    const updatedCampaigns = campaigns.map(c => {
      if (c.id === selectedCampaignId) {
        return { ...c, templates: updatedTemplates };
      }
      return c;
    });
    saveCampaigns(updatedCampaigns);
  };

  // Add a new Template variant
  const handleAddTemplateVariant = () => {
    if (!activeCampaign) return;
    const updatedTemplates = [...activeCampaign.templates, 'New template variant text...'];
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === selectedCampaignId) {
        return { ...c, templates: updatedTemplates };
      }
      return c;
    });
    saveCampaigns(updatedCampaigns);
  };

  // Remove a Template variant
  const handleRemoveTemplateVariant = (index: number) => {
    if (!activeCampaign) return;
    if (activeCampaign.templates.length <= 1) {
      alert('You must have at least one message template variant.');
      return;
    }
    const updatedTemplates = activeCampaign.templates.filter((_, idx) => idx !== index);
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === selectedCampaignId) {
        return { ...c, templates: updatedTemplates };
      }
      return c;
    });
    saveCampaigns(updatedCampaigns);
  };

  // Send WhatsApp Link Click with rotational template & 2-strike system
  const handleSendWhatsApp = (phone: string, indexInList: number) => {
    if (!activeCampaign) return;
    
    // Format phone
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    
    // Rotational template selection
    const templateIndex = indexInList % activeCampaign.templates.length;
    const selectedTemplate = activeCampaign.templates[templateIndex] || activeCampaign.templates[0];
    const encodedText = encodeURIComponent(selectedTemplate);
    
    // Launch Click to Chat
    window.open(`https://wa.me/${fullPhone}?text=${encodedText}`, '_blank');

    // Update status in campaign
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === selectedCampaignId) {
        const updatedProspects = c.prospects.map(p => {
          if (p.phone === phone) {
            let nextStatus: Prospect['status'] = 'SENT_1';
            if (p.status === 'SENT_1') {
              nextStatus = 'SENT_2';
            } else if (p.status === 'SENT_2') {
              nextStatus = 'ARCHIVED_NO_REPLY';
            }
            return { ...p, status: nextStatus, sentAt: new Date().toISOString() };
          }
          return p;
        });
        return { ...c, prospects: updatedProspects };
      }
      return c;
    });
    saveCampaigns(updatedCampaigns);

    // Update daily count
    const today = new Date().toDateString();
    const newCount = dailySentCount + 1;
    setDailySentCount(newCount);
    localStorage.setItem('crm_outreach_daily_sent', JSON.stringify({ date: today, count: newCount }));

    // Start a random cooldown timer (30 to 90 seconds)
    const randomCooldown = Math.floor(Math.random() * (90 - 30 + 1)) + 30;
    setCooldowns(prev => ({ ...prev, [phone]: randomCooldown }));
  };

  // Reset Campaign progress
  const handleResetProgress = () => {
    if (!activeCampaign) return;
    if (confirm('Are you sure you want to reset all prospects in this campaign back to pending status?')) {
      const updatedCampaigns = campaigns.map(c => {
        if (c.id === selectedCampaignId) {
          const resetProspects = c.prospects.map(p => ({ ...p, status: 'PENDING' as const, sentAt: undefined }));
          return { ...c, prospects: resetProspects };
        }
        return c;
      });
      saveCampaigns(updatedCampaigns);
    }
  };

  // Stats calculation
  const totalProspects = activeCampaign?.prospects.length || 0;
  const sentCount = activeCampaign?.prospects.filter(p => p.status !== 'PENDING').length || 0;
  const pendingCount = totalProspects - sentCount;

  // Spam opt-out rate calculation
  const campaignPhones = activeCampaign?.prospects.map(p => p.phone) || [];
  const blockedCountInCampaign = campaignPhones.filter(phone => blockedPhones.includes(phone)).length;
  const optOutRate = campaignPhones.length > 0 ? (blockedCountInCampaign / campaignPhones.length) * 100 : 0;

  // Filtered list
  const displayProspects = (activeCampaign?.prospects || []).filter(p => {
    if (filter === 'PENDING') return p.status === 'PENDING';
    if (filter === 'SENT_1') return p.status === 'SENT_1';
    if (filter === 'SENT_2') return p.status === 'SENT_2';
    if (filter === 'ARCHIVED_NO_REPLY') return p.status === 'ARCHIVED_NO_REPLY';
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cold Outreach Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Manage bulk WhatsApp outreach lists safely with template rotation.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 font-semibold text-slate-700 text-sm"
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
          >
            <Plus size={16} />
            <span>New Campaign</span>
          </button>
          {selectedCampaignId !== 'default' && (
            <button 
              onClick={() => handleDeleteCampaign(selectedCampaignId)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete Active Campaign"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Warning and Stats Panel */}
      <div className="p-8 pb-4 flex-shrink-0 space-y-6">
        {/* Office Hours Safety Lock Banner */}
        {isLockedTime && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm animate-in slide-in-from-top-2 duration-300">
            <Clock className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-red-900 text-sm">🕒 Cold Outreach locked (Outside Office Hours)</h4>
              <p className="text-red-700 text-xs mt-1 leading-relaxed">
                Cold outreach campaigns are locked outside of active office hours (**10:00 AM – 5:00 PM**) to preserve account reputation and prevent late-night spam reports. Outreach sending is temporarily disabled.
              </p>
            </div>
          </div>
        )}

        {/* Safety Alert Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-amber-900 text-sm">Anti-Ban Protocol Activated (Multi-Template Rotation)</h4>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
              To prevent Meta from detecting patterns and suspending your account, the CRM automatically **rotates through different templates** as you click down the list. We also recommend keeping outreach below **50–80 messages per day**.
            </p>
          </div>
        </div>

        {/* Campaign Metrics & Daily Tracker */}
        <div className="grid grid-cols-5 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Prospects</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalProspects}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Messaged</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{sentCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Smartphone size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Queue</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{pendingCount}</p>
            </div>
          </div>

          {/* Daily Tracker Ring / Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sent Today</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-black ${dailySentCount >= maxDailyLimit ? 'text-red-600 animate-pulse' : dailySentCount >= 50 ? 'text-amber-600' : 'text-slate-900'}`}>
                    {dailySentCount}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ {maxDailyLimit} max</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${dailySentCount >= maxDailyLimit ? 'bg-red-100 text-red-700' : dailySentCount >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {dailySentCount >= maxDailyLimit ? 'Limit Reached' : 'Safe Zone'}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${dailySentCount >= maxDailyLimit ? 'bg-red-500' : dailySentCount >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min((dailySentCount / maxDailyLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Spam Risk Meter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Spam Risk Rate</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-black ${optOutRate >= 10 ? 'text-red-650' : optOutRate >= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {optOutRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">opt-out</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${optOutRate >= 10 ? 'bg-red-100 text-red-755' : optOutRate >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {optOutRate >= 10 ? 'High Risk' : optOutRate >= 5 ? 'Medium Risk' : 'Low Risk'}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${optOutRate >= 10 ? 'bg-red-500' : optOutRate >= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(optOutRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="flex-1 overflow-hidden px-8 pb-8 flex gap-6">
        
        {/* Left Column: Import and template configuration */}
        <div className="w-[450px] flex flex-col gap-6 flex-shrink-0 overflow-y-auto pr-1">
          {/* Numbers Import */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">1. Import Numbers</h3>
              <span className="text-[10px] text-slate-400 font-bold">One per line / comma separated</span>
            </div>
            <textarea
              rows={3}
              value={rawNumbers}
              onChange={(e) => setRawNumbers(e.target.value)}
              placeholder="e.g.&#10;9876543210&#10;9999888877"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono outline-none focus:border-blue-500 transition-all resize-none"
            />
            <button
              onClick={handleImportProspects}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              <span>Import to Campaign</span>
            </button>
          </div>

          {/* Rotational Templates Editor */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex-1 flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">2. Rotational Message Templates</h3>
              <button
                onClick={handleAddTemplateVariant}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add Variant
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[380px]">
              {(activeCampaign?.templates || []).map((tmpl, idx) => (
                <div key={idx} className="space-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Template Variant {idx + 1}</span>
                    {activeCampaign && activeCampaign.templates.length > 1 && (
                      <button
                        onClick={() => handleRemoveTemplateVariant(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove Variant"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={tmpl}
                    onChange={(e) => handleUpdateTemplate(idx, e.target.value)}
                    placeholder={`Template variant ${idx + 1} text...`}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs leading-relaxed outline-none focus:border-blue-500 transition-all resize-none text-slate-700 font-medium"
                  />
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
              🔄 The CRM automatically rotates through these variants sequentially. Contact 1 gets Variant 1, Contact 2 gets Variant 2, etc.
            </div>
          </div>
        </div>

        {/* Right Column: Contact list and sender console */}
        <div className="flex-grow bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
          {/* List Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Prospect Queue</h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                {displayProspects.length}
              </span>
            </div>
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'SENT_1', 'SENT_2', 'ARCHIVED_NO_REPLY'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${filter === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {f === 'SENT_1' ? 'INTRO' : f === 'SENT_2' ? 'FOLLOW-UP' : f === 'ARCHIVED_NO_REPLY' ? 'ARCHIVED' : f}
                </button>
              ))}
              <button
                onClick={handleResetProgress}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold ml-4 border border-slate-200"
                title="Reset campaign metrics"
              >
                <RefreshCw size={12} />
                <span>Reset Status</span>
              </button>
            </div>
          </div>

          {/* List Table */}
          <div className="flex-grow overflow-y-auto">
            {displayProspects.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <Smartphone className="w-12 h-12 text-slate-300 mb-4" />
                <h4 className="font-bold text-slate-800 text-sm">No prospects found</h4>
                <p className="text-slate-400 text-xs max-w-xs mt-1">Import some phone numbers on the left or change your filter selection.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/20 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="py-3 px-6">Phone Number</th>
                    <th className="py-3 px-6">Assigned Variant</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {displayProspects.map((prospect, idx) => {
                    const assignedVariantIdx = activeCampaign ? (idx % activeCampaign.templates.length) : 0;
                    const isBlocked = blockedPhones.includes(prospect.phone);
                    const cooldownLeft = cooldowns[prospect.phone] || 0;
                    
                    return (
                      <tr key={prospect.phone} className={`hover:bg-slate-50/50 transition-colors ${isBlocked ? 'bg-red-50/30' : ''}`}>
                        <td className="py-3.5 px-6 font-semibold text-slate-800 font-mono flex items-center gap-2">
                          <span>{prospect.phone}</span>
                          {isBlocked && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md text-[8px] font-bold uppercase flex items-center gap-0.5">
                              <ShieldAlert size={8} /> DNC Blocked
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[9px] font-bold">
                            Variant {assignedVariantIdx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            prospect.status === 'SENT_1' 
                              ? 'bg-blue-100 text-blue-800' 
                              : prospect.status === 'SENT_2'
                                ? 'bg-indigo-100 text-indigo-850'
                                : prospect.status === 'ARCHIVED_NO_REPLY'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-600'
                          }`}>
                            {prospect.status === 'SENT_1' 
                              ? 'Intro Sent' 
                              : prospect.status === 'SENT_2'
                                ? 'Follow-Up Sent'
                                : prospect.status === 'ARCHIVED_NO_REPLY'
                                  ? 'Archived (No Reply)'
                                  : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => handleSendWhatsApp(prospect.phone, idx)}
                            disabled={
                              isBlocked ||
                              prospect.status === 'ARCHIVED_NO_REPLY' ||
                              isLockedTime ||
                              cooldownLeft > 0 ||
                              (dailySentCount >= maxDailyLimit && prospect.status === 'PENDING')
                            }
                            className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5 transition-all ${
                              isBlocked
                                ? 'bg-red-50 text-red-400 border border-red-100 cursor-not-allowed'
                                : prospect.status === 'ARCHIVED_NO_REPLY'
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : isLockedTime
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : cooldownLeft > 0
                                      ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                                      : prospect.status === 'SENT_2'
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : prospect.status === 'SENT_1'
                                          ? 'bg-indigo-650 text-white shadow-sm shadow-indigo-700/20 hover:bg-indigo-500'
                                          : dailySentCount >= maxDailyLimit
                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                            : 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20 hover:bg-emerald-500'
                            }`}
                          >
                            {cooldownLeft > 0 ? (
                              <>
                                <Clock size={10} />
                                <span>Cooldown: {cooldownLeft}s</span>
                              </>
                            ) : (
                              <>
                                <Send size={10} />
                                <span>
                                  {isBlocked 
                                    ? 'Blocked' 
                                    : prospect.status === 'SENT_1' 
                                      ? 'Send Follow-Up' 
                                      : prospect.status === 'SENT_2' || prospect.status === 'ARCHIVED_NO_REPLY'
                                        ? 'Archived' 
                                        : isLockedTime
                                          ? 'Time Locked'
                                          : 'Send Intro'}
                                </span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Campaign Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl w-96 space-y-4 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Create Campaign</h3>
              <p className="text-slate-400 text-xs mt-1">Organize your cold prospects into distinct target lists.</p>
            </div>
            <input
              type="text"
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              placeholder="e.g. Real Estate Brokers List"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-semibold"
            />
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Summary Modal */}
      {importSummary && importSummary.show && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl w-[400px] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-950 text-base uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="text-blue-600" size={18} />
                <span>Import Summary</span>
              </h3>
              <button 
                onClick={() => setImportSummary(prev => prev ? { ...prev, show: false } : null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between font-semibold py-1">
                <span>Total Processed:</span>
                <span className="font-mono text-slate-900">{importSummary.processed}</span>
              </div>
              <div className="flex justify-between font-semibold py-1">
                <span>Duplicates Skipped:</span>
                <span className="font-mono text-amber-600">{importSummary.duplicates}</span>
              </div>
              <div className="flex justify-between font-semibold py-1">
                <span>DNC Blocklist Filtered:</span>
                <span className="font-mono text-red-500 font-bold">{importSummary.blocked}</span>
              </div>
              <div className="flex justify-between font-semibold py-1 border-t border-slate-100 pt-3 text-sm font-bold text-slate-800">
                <span>Successfully Imported:</span>
                <span className="font-mono text-emerald-600 font-black">{importSummary.imported}</span>
              </div>
            </div>

            <button
              onClick={() => setImportSummary(prev => prev ? { ...prev, show: false } : null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

