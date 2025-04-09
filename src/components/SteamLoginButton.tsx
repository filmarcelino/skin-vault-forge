
import { Button } from '@/components/ui/button';
import { FaSteam } from 'react-icons/fa';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SteamLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSteamLogin = async () => {
    try {
      setIsLoading(true);
      
      console.log('Starting Steam login process');
      
      // Call our steam-start function to get the redirect URL
      const { data, error } = await supabase.functions.invoke('steam-start');
      
      if (error) {
        throw new Error(error.message || 'Failed to start Steam authentication');
      }
      
      if (data?.redirectUrl) {
        console.log('Redirecting to Steam:', data.redirectUrl);
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No redirect URL received');
      }
      
    } catch (error) {
      console.error('Steam login error:', error);
      toast({
        title: 'Login error',
        description: error.message || 'Failed to connect with Steam. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSteamLogin}
      className="bg-[#171a21] hover:bg-[#2a475e] text-white w-full"
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
