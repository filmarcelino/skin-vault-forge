
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import SkinCard from '@/components/SkinCard';
import FilterBar from '@/components/FilterBar';
import CategoryTabs from '@/components/CategoryTabs';
import { Button } from '@/components/ui/button';
import { ArrowUp, Loader2, ShoppingBag, Database, Steam } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skin } from '@/types/skin';
import InventoryStatsCard from '@/components/InventoryStatsCard';
import { Link } from 'react-router-dom';

const Index = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats for the cards (these would be fetched from Supabase in a real implementation)
  const [totalStats, setTotalStats] = useState({ count: 0, value: 0 });
  const [localStats, setLocalStats] = useState({ count: 0, value: 0 });
  const [steamStats, setSteamStats] = useState({ count: 0, value: 0 });
  
  useEffect(() => {
    fetchSkins();
  }, []);
  
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
  
  const fetchSkins = async () => {
    try {
      setLoading(true);
      
      // Fetch skins from Supabase
      const { data, error } = await supabase
        .from('skins')
        .select('*')
        .limit(20); // Limit to 20 skins for better performance
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.length > 0) {
        // Transform the data to match our SkinCard component props
        const formattedSkins: Skin[] = data.map((skin) => ({
          id: skin.id,
          name: skin.name,
          weapon_type: skin.weapon_type || 'Unknown',
          image_url: skin.image_url || 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
          rarity: (skin.rarity as 'common' | 'uncommon' | 'rare' | 'mythical' | 'legendary' | 'ancient' | 'contraband') || 'common',
          exterior: skin.exterior || 'Factory New',
          price_usd: skin.price_usd,
          statTrak: Math.random() > 0.8, // Randomly assign StatTrak for now as API doesn't have this
        }));
        
        setSkins(formattedSkins);
        
        // Calculate stats for the cards
        const totalValue = formattedSkins.reduce((sum, skin) => sum + (skin.price_usd || 0), 0);
        setTotalStats({ count: formattedSkins.length, value: totalValue });
        
        // Mock data for the other cards - in a real app this would come from the database
        setLocalStats({ count: Math.floor(formattedSkins.length * 0.3), value: totalValue * 0.3 });
        setSteamStats({ count: Math.floor(formattedSkins.length * 0.7), value: totalValue * 0.7 });
        
        toast.success(`Loaded ${formattedSkins.length} skins from database`);
      } else {
        // If no skins in database, trigger the Edge Function to fetch them
        toast.info("No skins found in database. Fetching from API...");
        await fetchSkinsFromAPI();
      }
    } catch (err: any) {
      console.error("Error fetching skins:", err);
      setError(err.message);
      toast.error("Failed to load skins");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSkinsFromAPI = async () => {
    try {
      const response = await supabase.functions.invoke('fetch-cs2-skins');
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      toast.success("Successfully imported skins from API");
      // Fetch the newly imported skins
      await fetchSkins();
    } catch (err: any) {
      console.error("Error importing skins:", err);
      setError("Failed to import skins from API. Please try again later.");
      toast.error("Failed to import skins");
    }
  };
  
  const handleRefreshSkins = async () => {
    toast.info("Refreshing skins from API...");
    await fetchSkinsFromAPI();
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
        
        {/* Stats Cards */}
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
            icon={<Steam className="h-4 w-4" />}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold mb-4">Featured Skins</h2>
          <Link to="/inventory">
            <Button variant="outline" size="sm">
              Manage Inventory
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {skins.length > 0 ? `${skins.length} skins available` : ''}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshSkins}
            className="gap-2"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Refresh Skins
          </Button>
        </div>
        
        <CategoryTabs />
        <FilterBar />
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 text-neon-purple animate-spin" />
            <span className="ml-2">Loading skins...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : skins.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No skins found</p>
            <Button onClick={fetchSkinsFromAPI} className="mt-4">
              Import Skins
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
            {skins.map((skin) => (
              <SkinCard 
                key={skin.id}
                name={skin.name}
                weaponType={skin.weapon_type}
                image={skin.image_url}
                rarity={skin.rarity}
                wear={skin.exterior}
                price={skin.price_usd ? `$${skin.price_usd.toFixed(2)}` : 'N/A'}
                statTrak={skin.statTrak}
              />
            ))}
          </div>
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
