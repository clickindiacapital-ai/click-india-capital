import { getSupabase } from './supabase';
import { Asset } from '@click-india/shared-types';

export interface Listing {
  id?: string;
  asset_id: string;
  seller_id: string;
  listing_type: 'SALE' | 'REFINANCE' | 'RENT';
  price: number;
  location: string;
  status: 'ACTIVE' | 'SOLD' | 'PENDING';
  metadata: Record<string, any>;
  created_at?: string;
}

export const marketplaceService = {
  // Get listings with advanced filtering
  async getListings(filters: {
    type?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const client = getSupabase();
    let query = client
      .from('marketplace_listings')
      .select(`
        *,
        assets (*),
        users (full_name, phone)
      `)
      .eq('status', 'ACTIVE');

    if (filters.city) query = query.eq('location', filters.city);
    if (filters.type) query = query.eq('metadata->>asset_type', filters.type);
    if (filters.minPrice) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice) query = query.lte('price', filters.maxPrice);

    return await query.order('created_at', { ascending: false });
  },

  // Create a listing from an existing asset in the locker
  async createListingFromAsset(assetId: string, sellerId: string, price: number, location: string) {
    const client = getSupabase();
    
    // Check if asset belongs to seller
    const { data: asset } = await client
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .eq('user_id', sellerId)
      .single();

    if (!asset) throw new Error('Asset not found or unauthorized');

    const listing: Listing = {
      asset_id: assetId,
      seller_id: sellerId,
      listing_type: 'SALE',
      price,
      location,
      status: 'ACTIVE',
      metadata: {
        asset_type: asset.asset_type,
        asset_name: asset.asset_name,
        thumbnail: asset.metadata?.thumbnail || ''
      }
    };

    const { data, error } = await client.from('marketplace_listings').insert([listing]).select().single();

    if (data && !error) {
      const { eventBus } = await import('@click-india/shared-events');
      const { auditService } = await import('@click-india/shared-audit');

      eventBus.emit({
        type: 'MarketplaceOpportunityCreated',
        actor: { id: sellerId, type: 'USER' },
        payload: data,
      });

      await auditService.log({
        actor_id: sellerId,
        actor_type: 'USER',
        action: 'MARKETPLACE_LISTING_CREATED',
        entity_type: 'LISTING',
        entity_id: data.id,
        new_state: data,
      });
    }

    return { data, error };
  },

  // Get trending deals (AI-powered match)
  async getTrendingDeals() {
    const client = getSupabase();
    return await client
      .from('marketplace_listings')
      .select('*, assets(*)')
      .eq('status', 'ACTIVE')
      .limit(6)
      .order('price', { ascending: true });
  }
};
