
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
      
      // Call our edge function to start Steam authentication
      const { data: redirectData, error: functionError } = await supabase.functions.invoke('steam-start');
      
      if (functionError) {
        throw functionError;
      }
      
      // Redirect to Steam login page
      if (redirectData?.redirectUrl) {
        window.location.href = redirectData.redirectUrl;
      } else {
        throw new Error('Invalid response from steam-start function');
      }
      
    } catch (error) {
      console.error('Steam login error:', error);
      toast({
        title: 'Login error',
        description: error.message || 'Failed to connect with Steam. Please try again.',
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
