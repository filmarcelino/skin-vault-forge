
import { supabase } from '@/integrations/supabase/client';
import { Skin, UserSkin } from '@/types/skin';
import { toast } from 'sonner';
import { cacheSkins, getCachedSkins } from './skinCache';

// Cache key prefix
const USER_INVENTORY_CACHE_PREFIX = 'user_inventory_';

// Generate cache key for user inventory queries
export const getUserInventoryCacheKey = (
  page: number, 
  pageSize: number,
  source: string = 'all',
  filters?: Record<string, any>
): string => {
  const filterString = filters ? JSON.stringify(filters) : '';
  return `${USER_INVENTORY_CACHE_PREFIX}_${source}_page_${page}_size_${pageSize}_${filterString}`;
};

// Add a skin to user's inventory
export const addSkinToInventory = async (
  skin: Skin,
  acquisitionDetails: {
    acquired_date?: string;
    acquisition_price?: number;
    currency?: string;
    notes?: string;
    source?: 'local' | 'steam';
  } = {}
): Promise<UserSkin | null> => {
  try {
    const { data, error } = await supabase
      .from('user_collections')
      .insert({
        skin_id: skin.id,
        user_id: 'demo-user', // Replace with auth.uid() when auth is implemented
        acquired_date: acquisitionDetails.acquired_date || new Date().toISOString(),
        acquisition_price: acquisitionDetails.acquisition_price || null,
        currency: acquisitionDetails.currency || 'USD',
        notes: acquisitionDetails.notes || null
      })
      .select('*, skins(*)')
      .single();

    if (error) {
      toast.error(`Failed to add skin to inventory: ${error.message}`);
      return null;
    }

    // Clear cache to refresh inventory data
    clearUserInventoryCache();

    toast.success('Skin added to inventory');
    
    // Format the returned data to match our UserSkin type
    return {
      collection_id: data.id,
      id: data.skins.id,
      name: data.skins.name,
      weapon_type: data.skins.weapon_type,
      image_url: data.skins.image_url,
      rarity: data.skins.rarity as any,
      exterior: data.skins.exterior,
      price_usd: data.skins.price_usd,
      price_brl: data.skins.price_brl,
      price_cny: data.skins.price_cny,
      price_rub: data.skins.price_rub,
      statTrak: false, // Default since we don't have this in DB yet
      float: data.skins.float,
      acquired_date: data.acquired_date,
      acquisition_price: data.acquisition_price,
      currency: data.currency,
      notes: data.notes
    };
  } catch (error) {
    console.error('Error adding skin to inventory:', error);
    toast.error('Failed to add skin to inventory');
    return null;
  }
};

// Fetch user's inventory with pagination
export const fetchUserInventory = async (
  page: number,
  pageSize: number,
  source: string = 'all', // 'all', 'local', 'steam'
  filters?: Record<string, any>,
  refreshCache: boolean = false
): Promise<{
  skins: UserSkin[];
  count: number;
  page: number;
  pageSize: number;
}> => {
  try {
    // Check cache first
    const cacheKey = getUserInventoryCacheKey(page, pageSize, source, filters);
    if (!refreshCache) {
      const cachedData = getCachedSkins<{
        skins: UserSkin[];
        count: number;
        page: number;
        pageSize: number;
      }>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Calculate pagination offset
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let query = supabase
      .from('user_collections')
      .select(`
        *,
        skins(*)
      `, { count: 'exact' });

    // Add source filter if provided
    // In a real app, this would filter by a 'source' column in user_collections
    // For now, we're just using demo data
    if (source !== 'all') {
      // This is a placeholder for when we have actual source data
      // query = query.eq('source', source);
    }

    // Add user filter (replace with auth.uid() when auth is implemented)
    query = query.eq('user_id', 'demo-user');

    // Add pagination
    const { data, error, count } = await query
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    // Format the data
    const userSkins: UserSkin[] = data.map(item => ({
      collection_id: item.id,
      id: item.skins.id,
      name: item.skins.name,
      weapon_type: item.skins.weapon_type || 'Unknown',
      image_url: item.skins.image_url || 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      rarity: (item.skins.rarity as any) || 'common',
      exterior: item.skins.exterior || 'Factory New',
      price_usd: item.skins.price_usd,
      price_brl: item.skins.price_brl,
      price_cny: item.skins.price_cny,
      price_rub: item.skins.price_rub,
      statTrak: false, // Default since we don't have this in DB yet
      float: item.skins.float,
      acquired_date: item.acquired_date,
      acquisition_price: item.acquisition_price,
      currency: item.currency,
      notes: item.notes
    }));

    const result = {
      skins: userSkins,
      count: count || 0,
      page,
      pageSize
    };

    // Cache results
    cacheSkins(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error fetching user inventory:', error);
    return {
      skins: [],
      count: 0,
      page,
      pageSize
    };
  }
};

// For clearing cache when data changes
export const clearUserInventoryCache = (): void => {
  // Get all keys from localStorage
  Object.keys(localStorage).forEach(key => {
    // Clear only user inventory cache keys
    if (key.startsWith(USER_INVENTORY_CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

// Search for skins in the master database (for adding to inventory)
export const searchMasterSkins = async (
  query: string,
  limit: number = 10
): Promise<Skin[]> => {
  try {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
      .from('skins')
      .select('*')
      .or(`name.ilike.%${query}%, weapon_type.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data.map(skin => ({
      id: skin.id,
      name: skin.name,
      weapon_type: skin.weapon_type || 'Unknown',
      image_url: skin.image_url || 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
      rarity: (skin.rarity as any) || 'common',
      exterior: skin.exterior || 'Factory New',
      price_usd: skin.price_usd,
      price_brl: skin.price_brl,
      price_cny: skin.price_cny,
      price_rub: skin.price_rub,
      statTrak: false,
      float: skin.float
    }));
  } catch (error) {
    console.error('Error searching master skins:', error);
    return [];
  }
};

// Calculate inventory statistics
export const getUserInventoryStats = async (): Promise<{
  total: { count: number; value: number };
  local: { count: number; value: number };
  steam: { count: number; value: number };
}> => {
  try {
    // In a real app with auth, we'd filter by user_id = auth.uid()
    const { data, error } = await supabase
      .from('user_collections')
      .select(`
        id,
        skins (
          price_usd
        )
      `)
      .eq('user_id', 'demo-user');

    if (error) {
      throw new Error(error.message);
    }

    const totalValue = data.reduce((sum, item) => sum + (item.skins.price_usd || 0), 0);
    const count = data.length;

    // In a real app, we'd separate by source
    // For demo, just split approximately
    return {
      total: { count, value: totalValue },
      local: { count: Math.floor(count * 0.3), value: totalValue * 0.3 },
      steam: { count: Math.floor(count * 0.7), value: totalValue * 0.7 },
    };
  } catch (error) {
    console.error('Error calculating inventory stats:', error);
    return {
      total: { count: 0, value: 0 },
      local: { count: 0, value: 0 },
      steam: { count: 0, value: 0 },
    };
  }
};

// Initialize demo data (for development purposes)
export const initializeDemoInventory = async (): Promise<void> => {
  try {
    // Check if we already have user_collections data
    const { count, error: countError } = await supabase
      .from('user_collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', 'demo-user');

    if (countError) {
      throw new Error(countError.message);
    }

    // If we already have demo data, return
    if (count && count > 0) {
      return;
    }

    // Get some random skins to add to demo inventory
    const { data: skins, error } = await supabase
      .from('skins')
      .select('id')
      .limit(10);

    if (error) {
      throw new Error(error.message);
    }

    // Insert demo user collections
    if (skins && skins.length > 0) {
      const collections = skins.map(skin => ({
        skin_id: skin.id,
        user_id: 'demo-user',
        acquired_date: new Date().toISOString(),
        acquisition_price: Math.floor(Math.random() * 1000),
        currency: 'USD',
        notes: 'Demo skin'
      }));

      const { error: insertError } = await supabase
        .from('user_collections')
        .insert(collections);

      if (insertError) {
        throw new Error(insertError.message);
      }

      console.log('Demo inventory initialized with', collections.length, 'skins');
    }
  } catch (error) {
    console.error('Error initializing demo inventory:', error);
  }
};
