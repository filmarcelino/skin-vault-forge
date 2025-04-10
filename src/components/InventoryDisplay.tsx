
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InventorySummary from './InventorySummary';
import SkinGrid from './SkinGrid';

interface InventoryDisplayProps {
  userId?: string;
  steamId?: string;
}

const InventoryDisplay = ({ userId, steamId }: InventoryDisplayProps) => {
  const [inventory, setInventory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (steamId) {
      fetchInventory();
    } else {
      // Try to get the steam_id from the current user
      getCurrentUserSteamId();
    }
  }, [steamId, userId]);
  
  const getCurrentUserSteamId = async () => {
    try {
      // Get the current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please log in.');
      }
      
      // Get the user from the users table to get the steam_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('steam_id')
        .eq('id', session.user.id)
        .single();
        
      if (userError) {
        throw new Error('Failed to fetch user data');
      }
      
      if (!userData.steam_id) {
        throw new Error('No Steam ID associated with this account. Please link your Steam account.');
      }
      
      console.log('Found Steam ID:', userData.steam_id);
      fetchInventory(userData.steam_id);
    } catch (error) {
      console.error('Error getting current user Steam ID:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };
  
  const fetchInventory = async (id?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const steamIdToUse = id || steamId;
      if (!steamIdToUse) {
        throw new Error('No Steam ID provided');
      }
      
      // Get user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please log in.');
      }
      
      // Call our function to get the inventory
      const { data, error } = await supabase.functions.invoke('get-steam-inventory', {
        body: { steamId: steamIdToUse },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        throw new Error(`Failed to fetch inventory: ${error.message}`);
      }
      
      if (!data || !data.inventory) {
        throw new Error('No inventory data received');
      }
      
      console.log('Inventory data received:', data);
      setInventory(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInventory();
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your Steam inventory...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-destructive/10 text-destructive p-6 rounded-md max-w-md text-center">
          <h3 className="text-xl font-semibold mb-2">Error Loading Inventory</h3>
          <p className="mb-4">{error}</p>
          <Button onClick={getCurrentUserSteamId}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  if (!inventory || !inventory.inventory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground mb-4">No inventory data available</p>
        <Button onClick={getCurrentUserSteamId}>Load Inventory</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Steam Inventory</h2>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {inventory.fromCache 
          ? `Showing cached inventory from ${new Date(inventory.timestamp).toLocaleString()}`
          : 'Showing freshly fetched inventory'
        }
      </div>
      
      <InventorySummary inventory={inventory.inventory} />
      
      <SkinGrid inventory={inventory.inventory} />
    </div>
  );
};

export default InventoryDisplay;
