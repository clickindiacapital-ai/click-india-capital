import { LeadData, UserProfile } from '@click-india/shared-types';

export interface EligibilityResult {
  score: number; // 0 to 100
  status: 'QUALIFIED' | 'NEEDS_REHAB' | 'UNQUALIFIED';
  potentialSavings: number;
  recommendedLenders: string[];
  rejectionRisks: string[];
}

export const aiService = {
  // 1. ELIGIBILITY ENGINE: Loan Scoring & Matching (Insider "Actual Rules" Logic)
  calculateEligibility(data: any): EligibilityResult {
    // FOIR: Fixed Obligation to Income Ratio - The #1 Metric banks use
    const foir = (data.totalEMI / data.monthlyIncome) * 100;
    let score = 75; // Base Institutional Trust Score
    const risks: string[] = [];

    // FOIR Benchmarking (Insider Thresholds)
    if (foir > 60) {
      score -= 50;
      risks.push('Critical FOIR (>60%) - Automatic Bank Rejection');
    } else if (foir > 50) {
      score -= 30;
      risks.push('High DTI (Debt-to-Income) - High Rejection Risk');
    } else if (foir > 40) {
      score -= 15;
      risks.push('Moderate FOIR - Selective Approval Only');
    }

    // Rejection History Logic
    if (data.rejectionCount > 3) {
      score -= 40;
      risks.push('Cool-off period required (Too many hard enquiries)');
    } else if (data.rejectionCount > 0) {
      score -= 15;
      risks.push('Recent Rejection Flag - Bank Stance: Cautious');
    }

    // Savings Calculation based on Sameer's Rehabilitation Strategy
    // Usually, consolidation/refinance saves 30-50% for high-interest unsecured debt
    const estimatedSavingsPercent = foir > 50 ? 0.45 : 0.30;
    const potentialSavings = data.totalEMI * estimatedSavingsPercent;

    const status = score >= 65 ? 'QUALIFIED' : score >= 35 ? 'NEEDS_REHAB' : 'UNQUALIFIED';
    
    return {
      score: Math.max(0, score),
      status,
      potentialSavings,
      recommendedLenders: status === 'QUALIFIED' 
        ? ['HDFC Bank', 'ICICI Bank', 'Axis Bank'] 
        : ['IDFC First Bank', 'Protium', 'Specialized Debt Aggregators'],
      rejectionRisks: risks
    };
  },

  // 2. ASSET VALUATION: Car & Property Estimates
  estimateAssetValue(assetType: string, metadata: any) {
    // Simplified valuation logic (would be connected to real-time market APIs)
    if (assetType === 'VEHICLE') {
      const baseValue = metadata.originalPrice || 1000000;
      const age = new Date().getFullYear() - (metadata.year || 2020);
      return baseValue * Math.pow(0.85, age); // 15% annual depreciation
    }
    
    if (assetType === 'PROPERTY') {
      const area = metadata.sqft || 1000;
      const rate = metadata.cityRate || 5000;
      return area * rate;
    }

    return 0;
  },

  // 3. CRM INTELLIGENCE: Lead Prioritization
  predictConversionProbability(lead: any) {
    let probability = 0.5;
    
    // Higher urgency = higher probability
    if (lead.emotional_urgency > 8) probability += 0.2;
    
    // Higher tier consultation = higher commitment
    if (lead.consultation_tier === 'BLUEPRINT_1500') probability += 0.2;
    
    return Math.min(probability, 0.95);
  },

  // 4. MESSAGE SPINNING: Anti-Spam Variation (PHASE 2)
  async spinOutreachMessage(lead: LeadData): Promise<string> {
    // In production, this calls a Supabase Edge Function that uses Gemini
    // For MVP, we use a sophisticated template rotation to ensure variation
    const hooks = [
      `Hi ${lead.full_name || 'there'},`,
      `Hello! Regarding your enquiry,`,
      `Greetings from Click Capital.`
    ];

    const bodies = [
      `we noticed you might be facing some EMI pressure. We have a free recovery roadmap available.`,
      `we have some new insights on managing ${lead.loan_type} debt more effectively.`,
      `our team has analyzed your situation and found some potential interest savings.`
    ];

    const ctas = [
      `Reply 'YES' if you want me to send the details.`,
      `Would you like to see the plan?`,
      `Let me know if you are interested in a free consultation.`
    ];

    const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    return `${random(hooks)} ${random(bodies)} ${random(ctas)}`;
  }
};
