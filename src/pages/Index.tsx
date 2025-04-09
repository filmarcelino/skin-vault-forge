import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { SkinCard } from '@/components/SkinCard';
import FilterBar from '@/components/FilterBar';
import CategoryTabs from '@/components/CategoryTabs';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2, ShoppingBag, Database, Cloud, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skin, UserSkin } from '@/types/skin';
import InventoryStatsCard from '@/components/InventoryStatsCard';
import { Link } from 'react-router-dom';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from '@/components/ui/pagination';
import { supabase } from '@/integrations/supabase/client';
import { 
  getUserInventoryStats, 
  fetchUserInventory, 
  initializeDemoInventory 
} from '@/utils/userInventory';
import { cacheSkins, getCachedSkins, getPaginationCacheKey } from '@/utils/skinCache';

const Index = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [userSkins, setUserSkins] = useState<UserSkin[]>([]);
  const [featuredSkins, setFeaturedSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalSkins, setTotalSkins] = useState(0);
  
  const [totalStats, setTotalStats] = useState({ count: 0, value: 0 });
  const [localStats, setLocalStats] = useState({ count: 0, value: 0 });
  const [steamStats, setSteamStats] = useState({ count: 0, value: 0 });
  
  const [apiSkinsCount, setApiSkinsCount] = useState<number | null>(null);
  const [showSkinsSection, setShowSkinsSection] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  useEffect(() => {
    initializeDemoInventory().then(() => {
      fetchStats();
    });
  }, []);
  
  useEffect(() => {
    if (showSkinsSection) {
      fetchUserFeaturedSkins(currentPage, pageSize);
    }
  }, [currentPage, pageSize, showSkinsSection]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const fetchStats = async () => {
    try {
      const { count, error: countError } = await supabase
        .from('skins')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw new Error(countError.message);
      }
      
      setApiSkinsCount(count || 0);
      
      const stats = await getUserInventoryStats();
      setTotalStats(stats.total);
      setLocalStats(stats.local);
      setSteamStats(stats.steam);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      toast.error("Failed to load inventory stats");
    }
  };
  
  const fetchUserFeaturedSkins = async (page: number, size: number, refreshCache: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchUserInventory(page, size, 'all', filters, refreshCache);
      setUserSkins(result.skins);
      setTotalSkins(result.count);
      
      await fetchFeaturedMasterSkins();
      
      setShowSkinsSection(true);
    } catch (err: any) {
      console.error("Error fetching skins:", err);
      setError(err.message);
      toast.error("Failed to load skins");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFeaturedMasterSkins = async () => {
    try {
      const cacheKey = 'featured_master_skins';
      const cachedData = getCachedSkins<Skin[]>(cacheKey);
      
      if (cachedData) {
        setFeaturedSkins(cachedData);
        return;
      }
      
      const { data, error } = await supabase
        .from('skins')
        .select('*')
        .in('rarity', ['legendary', 'ancient', 'contraband'])
        .order('price_usd', { ascending: false })
        .limit(4);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.length > 0) {
        const formattedSkins: Skin[] = data.map(skin => ({
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
          statTrak: Math.random() > 0.8,
          float: skin.float,
        }));
        
        setFeaturedSkins(formattedSkins);
        cacheSkins(cacheKey, formattedSkins);
      }
    } catch (error) {
      console.error("Error fetching featured skins:", error);
    }
  };
  
  const fetchSkinsFromAPI = async () => {
    try {
      toast.info("Importing skins from API. This may take a moment...");
      setLoading(true);
      
      const response = await supabase.functions.invoke('fetch-cs2-skins');
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast.success("Successfully imported skins from API");
      await fetchStats();
      
      if (showSkinsSection) {
        await fetchUserFeaturedSkins(1, pageSize, true);
      }
    } catch (err: any) {
      console.error("Error importing skins:", err);
      setError("Failed to import skins from API. Please try again later.");
      toast.error("Failed to import skins");
    } finally {
      setLoading(false);
    }
  };
  
  const handleLoadSkins = () => {
    if (!showSkinsSection) {
      fetchUserFeaturedSkins(currentPage, pageSize);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil((totalSkins || 0) / pageSize)) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const totalPages = Math.ceil(totalSkins / pageSize);
  
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="text-foreground">Welcome to </span>
            <span className="text-neon-purple neon-text">SkinVault</span>
          </h1>
          <p className="text-muted-foreground">
            Manage, track, and showcase your CS2 skin collection in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <InventoryStatsCard 
            title="Total Inventory" 
            skinCount={totalStats.count} 
            totalValue={totalStats.value}
            icon={<ShoppingBag className="h-4 w-4" />}
            className="border-neon-purple/30"
          />
          <InventoryStatsCard 
            title="Local Inventory" 
            skinCount={localStats.count} 
            totalValue={localStats.value}
            icon={<Database className="h-4 w-4" />}
          />
          <InventoryStatsCard 
            title="Steam Inventory" 
            skinCount={steamStats.count} 
            totalValue={steamStats.value}
            icon={<Cloud className="h-4 w-4" />}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold mb-4">Your Inventory</h2>
          <Link to="/inventory">
            <Button variant="outline" size="sm">
              Manage Inventory
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {apiSkinsCount !== null ? (
                `${apiSkinsCount} skins available in database`
              ) : (
                'Loading stats...'
              )}
            </p>
            {showSkinsSection && totalSkins > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Showing {userSkins.length} of {totalSkins} skins in your collection
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {!showSkinsSection && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSkins}
                className="gap-2"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Show Your Skins
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSkinsFromAPI}
              className="gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Import Skins from API
            </Button>
          </div>
        </div>
        
        {showSkinsSection && (
          <>
            {userSkins.length === 0 && !loading ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">Your inventory is empty</p>
                <Link to="/inventory">
                  <Button className="mt-4">
                    Add Skins to Inventory
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {userSkins.length > 0 && !loading && (
                  <>
                    <CategoryTabs />
                    <FilterBar />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
                      {userSkins.map((skin) => (
                        <SkinCard 
                          key={skin.collection_id}
                          skin={skin}
                          showActions={false}
                        />
                      ))}
                    </div>
                    
                    {totalSkins > pageSize && (
                      <Pagination className="my-6">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          
                          {getPaginationItems()}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)} 
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                )}
                
                {featuredSkins.length > 0 && (
                  <>
                    <div className="mt-12 mb-4">
                      <h2 className="text-2xl font-bold">Featured Skins</h2>
                      <p className="text-muted-foreground">Premium skins from our catalog</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {featuredSkins.map((skin) => (
                        <SkinCard 
                          key={skin.id}
                          skin={{
                            ...skin,
                            collection_id: skin.id
                          }}
                          showActions={false}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 text-neon-purple animate-spin" />
                <span className="ml-2">Loading skins...</span>
              </div>
            )}
            
            {error && (
              <Alert variant="destructive" className="my-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </main>
      
      <footer className="border-t border-border/40 py-6 px-4 mt-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 Clutch Studio's SkinVault. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
      
      {showBackToTop && (
        <Button 
          variant="secondary"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full shadow-lg z-40 neon-border"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default Index;
