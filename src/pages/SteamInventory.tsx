
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import InventoryDisplay from '@/components/InventoryDisplay';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SteamInventory = () => {
  const [user, setUser] = useState<any>(null);
  const [steamId, setSteamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Not authenticated, redirect to login
        navigate('/login');
        return;
      }
      
      setUser(session.user);
      
      // Check if user has a steam ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('steam_id')
        .eq('id', session.user.id)
        .single();
        
      if (userError) {
        console.error('Error fetching user data:', userError);
        setError('Failed to fetch user data. Please refresh the page.');
        return;
      }
      
      if (!userData.steam_id) {
        setError('No Steam account linked. Please connect your Steam account to view your inventory.');
        return;
      }
      
      setSteamId(userData.steam_id);
    };
    
    checkAuth();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Steam Inventory</h1>
          <p className="text-muted-foreground">
            View and manage your CS2 items from Steam
          </p>
        </div>
        
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              {error}
              {error.includes('No Steam account') && (
                <Button onClick={() => navigate('/login')} className="self-start">
                  Connect Steam Account
                </Button>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <InventoryDisplay steamId={steamId} userId={user?.id} />
        )}
      </main>
      
      <footer className="border-t border-border/40 py-6 px-4 mt-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 SkinVault. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SteamInventory;
