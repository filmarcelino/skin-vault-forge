import { Skin, PaginatedSkins } from '@/types/skin';

// Cache expiration time (in minutes)
const CACHE_EXPIRY = 30;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Save data to localStorage with expiry
export const cacheSkins = <T>(key: string, data: T): void => {
  const cacheData: CacheItem<T> = {
    data,
    timestamp: Date.now(),
  };
  try {
    localStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`Cached ${key} data`);
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
};

// Get cached data if not expired
export const getCachedSkins = <T>(key: string): T | null => {
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;

    const { data, timestamp }: CacheItem<T> = JSON.parse(cachedData);
    // Check if cache has expired
    const expiryTime = CACHE_EXPIRY * 60 * 1000; // Convert minutes to milliseconds
    if (Date.now() - timestamp > expiryTime) {
      // Cache expired, remove it
      localStorage.removeItem(key);
      return null;
    }
    
    console.log(`Using cached ${key} data`);
    return data;
  } catch (error) {
    console.warn('Error retrieving cache:', error);
    return null;
  }
};

// Clear specific cache
export const clearSkinCache = (key: string): void => {
  localStorage.removeItem(key);
};

// Generate cache key for paginated queries
export const getPaginationCacheKey = (
  page: number,
  pageSize: number,
  filters?: Record<string, any>
): string => {
  const filterString = filters ? JSON.stringify(filters) : '';
  return `skins_page_${page}_size_${pageSize}_${filterString}`;
};

// Clear all skin-related caches
export const clearAllSkinCaches = (): void => {
  // Get all keys from localStorage
  Object.keys(localStorage).forEach(key => {
    // Only clear keys related to skins
    if (
      key.startsWith('skins_') || 
      key.startsWith('user_inventory_') ||
      key.includes('featured_')
    ) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('All skin caches cleared');
};

/**
 * Refreshes the skins cache from APIs or other data sources
 * @param progressCallback Optional callback function to report progress (0-1)
 */
export const refreshSkinsCache = async (
  progressCallback?: (progress: number) => void
): Promise<void> => {
  try {
    // Initialize progress
    if (progressCallback) progressCallback(0);
    
    // First, fetch data from the Supabase database
    const { data: dbSkins, error } = await supabase
      .from('skins')
      .select('*');
    
    if (error) throw error;
    
    // Report progress after database fetch
    if (progressCallback) progressCallback(0.3);
    
    // Here you would typically also fetch from external APIs
    // and merge/reconcile the data
    
    // Example of fetching from an API (commented out as placeholder)
    // const apiResponse = await fetch('https://api.example.com/skins');
    // const apiSkins = await apiResponse.json();
    
    // Report progress after API fetch
    if (progressCallback) progressCallback(0.6);
    
    // Process and merge the data
    // const mergedData = mergeSkinData(dbSkins, apiSkins);
    
    // Update local storage with the refreshed data
    if (dbSkins) {
      localStorage.setItem('skinCache', JSON.stringify(dbSkins));
      localStorage.setItem('skinCacheTimestamp', Date.now().toString());
    }
    
    // Final progress update
    if (progressCallback) progressCallback(1);
    
    console.log('Skin cache refreshed successfully');
  } catch (error) {
    console.error('Error refreshing skin cache:', error);
    throw new Error('Failed to refresh skin cache');
  }
};
