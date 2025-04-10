
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SteamAuth = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleSteamAuth = async () => {
      try {
        console.log("Processing Steam authentication");
        const params = new URLSearchParams(window.location.search);
        const steamId = params.get('steamId');
        
        if (!steamId) {
          throw new Error('No Steam ID received');
        }

        console.log('Steam ID received:', steamId);
        
        // First check if there's a current session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('User already has a session, updating Steam ID');
          
          // User is already logged in, update the Steam ID
          const { error: updateError } = await supabase
            .from('users')
            .update({ steam_id: steamId })
            .eq('id', sessionData.session.user.id);
            
          if (updateError) {
            console.error('Error updating Steam ID:', updateError);
            // Continue anyway as this is not critical
          }
          
          // Fetch user's Steam inventory and store it
          try {
            await fetchAndStoreInventory(steamId, sessionData.session.access_token);
          } catch (invError) {
            console.error('Error fetching inventory:', invError);
            // Non-critical, continue
          }
          
          toast({
            title: 'Steam account linked',
            description: 'Your Steam account has been successfully linked.',
          });
          
          // Redirect to inventory page
          setTimeout(() => navigate('/inventory'), 1000);
        } else {
          console.log('No session found, checking for existing user with Steam ID');
          
          // Check if there's a user with this Steam ID already
          const { data: existingUser, error: queryError } = await supabase
            .from('users')
            .select('id')
            .eq('steam_id', steamId)
            .maybeSingle();
            
          if (queryError) {
            console.error('Error querying user:', queryError);
          }
          
          if (existingUser) {
            console.log('Existing user found with this Steam ID');
            // We found a user, but we need to create a session
            // This would typically require us to sign in the user
            // Since we're using a custom flow, we should handle this on the server side
          }

          // Store in localStorage temporarily
          localStorage.setItem('steamId', steamId);
          console.log('SteamID saved to localStorage:', steamId);
          
          toast({
            title: 'Login successful',
            description: 'Successfully authenticated with Steam.',
          });
          
          // Redirect to login page which will handle the rest
          setTimeout(() => navigate('/login?steamId=' + steamId), 1000);
        }
      } catch (error) {
        console.error('Steam auth error:', error);
        setError(error.message || 'Failed to authenticate with Steam');
        toast({
          title: 'Authentication failed',
          description: error.message || 'Failed to authenticate with Steam',
          variant: 'destructive',
        });
        
        // Still navigate after a delay to avoid getting stuck
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleSteamAuth();
  }, [navigate, toast]);
  
  // Helper function to fetch and store the user's inventory
  const fetchAndStoreInventory = async (steamId: string, token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-steam-inventory', {
        body: { steamId },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (error) {
        throw new Error(`Failed to fetch inventory: ${error.message}`);
      }
      
      console.log('Successfully fetched and stored inventory');
      return data;
    } catch (error) {
      console.error('Error in fetchAndStoreInventory:', error);
      throw error;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-medium text-destructive mb-2">Authentication Failed</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-medium mb-2">
        {isProcessing ? 'Logging in with Steam...' : 'Login successful'}
      </h2>
      <p className="text-muted-foreground">
        {isProcessing 
          ? 'Please wait while we complete your authentication' 
          : 'Redirecting to homepage...'}
      </p>
    </div>
  );
};

export default SteamAuth;
