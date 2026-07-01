import { LeadData } from '@click-india/shared-types';

export interface SettlementStrategy {
  probability: number; // 0 to 1
  estimatedSettlementAmount: number;
  savings: number;
  strategyType: 'AGGRESSIVE' | 'STANDARD' | 'CONSERVATIVE';
  rejectionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  timeframeMonths: number;
}

export const settlementService = {
  calculateSettlementStrategy(lead: LeadData): SettlementStrategy {
    const totalDebt = lead.loan_amount || 0;
    const dpd = (lead.metadata as any)?.dpd || 0;
    const loanType = lead.loan_type;
    const creditorType = (lead.metadata as any)?.creditor_type || 'PRIVATE_BANK';

    let probability = 0.4; // Baseline
    let factor = 0.5; // Target settlement factor (50% of principal)

    // 1. DPD Factor: Banks only settle seriously after 90+ days
    if (dpd > 180) {
      probability += 0.4;
      factor = 0.3; // Can settle for 30%
    } else if (dpd > 90) {
      probability += 0.2;
      factor = 0.45;
    } else if (dpd > 0) {
      probability += 0.1;
      factor = 0.6;
    }

    // 2. Loan Type Factor: Unsecured is much easier to settle
    if (loanType === 'PERSONAL' || loanType === 'CREDIT_CARD') {
      probability += 0.2;
    } else if (loanType === 'BUSINESS') {
      probability += 0.1;
    } else {
      // Secured loans (Home/Vehicle) are very hard to settle
      probability -= 0.3;
      factor = 0.85;
    }

    // 3. Creditor Factor
    if (creditorType === 'NBFC' || creditorType === 'FINTECH') {
      probability += 0.1;
    }

    const finalProbability = Math.min(Math.max(probability, 0.05), 0.95);
    const settlementAmount = totalDebt * factor;

    return {
      probability: finalProbability,
      estimatedSettlementAmount: settlementAmount,
      savings: totalDebt - settlementAmount,
      strategyType: finalProbability > 0.7 ? 'AGGRESSIVE' : finalProbability > 0.4 ? 'STANDARD' : 'CONSERVATIVE',
      rejectionRisk: finalProbability > 0.6 ? 'LOW' : finalProbability > 0.3 ? 'MEDIUM' : 'HIGH',
      timeframeMonths: dpd > 90 ? 3 : 6
    };
  }
};
