
import { Button } from '@/components/ui/button';
import { FaSteam } from 'react-icons/fa';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SteamLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSteamLogin = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'steam' as any, // Using type assertion for now
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      
      if (error) {
        console.error('Steam login error:', error);
        
        // Check for unsupported provider error
        if (error.message?.includes('Unsupported provider')) {
          toast({
            title: 'Provider not enabled',
            description: 'Steam login is not enabled in Supabase. Please go to Supabase Authentication settings and enable the Steam provider.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Login error',
            description: error.message || 'Failed to connect with Steam. Please try again.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Unexpected error during Steam login:', error);
      toast({
        title: 'Login error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSteamLogin}
      className="bg-[#171a21] hover:bg-[#2a475e] text-white"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FaSteam className="mr-2" />
      )}
      Login with Steam
    </Button>
  );
};

export default SteamLoginButton;
