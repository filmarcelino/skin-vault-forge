
import { Skin, PaginatedSkins } from '@/types/skin';

// Cache expiration time (in minutes)
const CACHE_EXPIRY = 30;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Save skins data to localStorage with expiry
export const cacheSkins = (key: string, data: any): void => {
  const cacheData: CacheItem<any> = {
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

// Get cached skins data if not expired
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
