
import { Button } from '@/components/ui/button';
import { FaSteam } from 'react-icons/fa';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SteamLoginButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSteamLogin = () => {
    try {
      setIsLoading(true);
      
      console.log('Starting Steam login process');
      
      // Define the return URL based on the current domain
      const currentDomain = window.location.origin;
      const returnUrl = `${currentDomain}/api/steam-callback`;
      
      // Set up Steam OpenID parameters
      const steamOpenIdUrl = 'https://steamcommunity.com/openid/login';
      const params = new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': returnUrl,
        'openid.realm': currentDomain,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
      });
      
      // Redirect to Steam login page
      const redirectUrl = `${steamOpenIdUrl}?${params.toString()}`;
      console.log('Redirecting to Steam:', redirectUrl);
      window.location.href = redirectUrl;
      
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
