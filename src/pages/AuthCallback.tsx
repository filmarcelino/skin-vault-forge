import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        console.log("Auth callback initiated");
        // Check if we have session data in URL (from our custom Steam auth)
        const searchParams = new URLSearchParams(location.search);
        const sessionParam = searchParams.get('session');
        
        if (sessionParam) {
          console.log("Found session data in URL");
          try {
            // Parse the session data
            const sessionData = JSON.parse(decodeURIComponent(sessionParam));
            console.log("Session data parsed successfully");
            
            // Set the session in Supabase
            if (sessionData?.access_token && sessionData?.refresh_token) {
              console.log("Setting session in Supabase");
              const { error } = await supabase.auth.setSession({
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token,
              });
              
              if (error) {
                console.error("Error setting session:", error);
                throw error;
              }
              
              toast({
                title: 'Login successful',
                description: 'You have been successfully signed in via Steam.',
              });
              
              setRedirectTo('/');
              return;
            } else {
              console.error("Invalid session data:", sessionData);
              throw new Error("Invalid session data");
            }
          } catch (err) {
            console.error('Error setting custom session:', err);
            toast({
              title: 'Authentication failed',
              description: 'There was a problem with your Steam sign in. Please try again.',
              variant: 'destructive',
            });
            setRedirectTo('/login');
            return;
          }
        } else {
          console.log("No session data in URL, checking current session");
        }
        
        // Otherwise proceed with standard OAuth callback handling
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.error('Auth callback error:', error);
          toast({
            title: 'Authentication failed',
            description: 'There was a problem signing in. Please try again.',
            variant: 'destructive',
          });
          setRedirectTo('/login');
          return;
        }
        
        // User authenticated successfully
        const userId = data.session.user.id;
        const identities = data.session.user.identities;
        
        // Check if this is a Steam login
        const steamIdentity = identities?.find(id => id.provider === 'steam');
        
        if (steamIdentity) {
          const steamId = steamIdentity.id;
          
          // Update the user record with Steam information
          await updateUserWithSteamInfo(userId, steamId);
        }

        toast({
          title: 'Login successful',
          description: 'You have been successfully signed in.',
        });
        setRedirectTo('/');
      } catch (err) {
        console.error('Error in auth callback:', err);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
        setRedirectTo('/login');
      } finally {
        setLoading(false);
      }
    }

    handleAuthCallback();
  }, [toast, location.search]);

  const updateUserWithSteamInfo = async (userId: string, steamId: string) => {
    try {
      // Call our edge function to fetch Steam user data
      const { data: steamUserData, error: steamError } = await supabase.functions.invoke('fetch-steam-user', {
        body: { steamId }
      });
      
      if (steamError || !steamUserData) {
        console.error('Error fetching Steam user data:', steamError);
        return;
      }
      
      // Update user record with Steam information
      const { error: updateError } = await supabase
        .from('users')
        .update({
          steam_id: steamId,
          username: steamUserData.personaname || null,
          avatar_url: steamUserData.avatarfull || null,
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user with Steam data:', updateError);
      }
    } catch (err) {
      console.error('Error in updateUserWithSteamInfo:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return null;
};

export default AuthCallback;
