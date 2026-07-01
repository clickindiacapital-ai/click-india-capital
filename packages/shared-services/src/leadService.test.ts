import { describe, it, expect, vi, beforeEach } from 'vitest';
import { leadService, initSupabase } from './supabase';

// Mock dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-id', phone: '9876543210' }, error: null }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { status: 'NEW_LEAD' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'test-id', status: 'DIAGNOSIS_PENDING' }, error: null }))
          }))
        }))
      }))
    }))
  }))
}));

vi.mock('@click-india/shared-utils', () => ({
  SecurityUtils: {
    isRateLimited: vi.fn(() => false),
    sanitizeString: vi.fn((s) => s),
    validatePhone: vi.fn((p) => p.length === 10)
  }
}));

vi.mock('@click-india/shared-events', () => ({
  eventBus: {
    emit: vi.fn()
  }
}));

vi.mock('@click-india/shared-audit', () => ({
  auditService: {
    log: vi.fn(),
    setPersistence: vi.fn()
  }
}));

describe('LeadService Smoke Test', () => {
  beforeEach(() => {
    initSupabase('https://test.supabase.co', 'test-key');
    vi.clearAllMocks();
  });

  it('should create a lead successfully with valid data', async () => {
    const leadData = {
      phone: '9876543210',
      loan_type: 'VEHICLE',
      loan_amount: 500000,
      urgency: 'HIGH'
    };

    const { data, error } = await leadService.createLead(leadData);

    expect(error).toBeNull();
    expect(data.id).toBe('test-id');
  });

  it('should reject lead creation if phone is invalid', async () => {
    const leadData = {
      phone: '123', // Invalid
      loan_type: 'VEHICLE'
    };

    // Mock validation failure
    const { SecurityUtils } = await import('@click-india/shared-utils');
    (SecurityUtils.validatePhone as any).mockReturnValueOnce(false);

    const { error } = await leadService.createLead(leadData);
    expect(error).toBe('Invalid phone format detected.');
  });

  it('should handle state transitions correctly', async () => {
    const { error } = await leadService.updateLeadStatus('test-id', 'DIAGNOSIS_PENDING', 'user-id');
    expect(error).toBeNull();
  });
});
