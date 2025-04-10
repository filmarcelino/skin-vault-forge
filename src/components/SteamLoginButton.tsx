
import { Button } from '@/components/ui/button';
import { FaSteam } from 'react-icons/fa';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SteamLoginButtonProps {
  id?: string;
}

const SteamLoginButton = ({ id }: SteamLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSteamLogin = async () => {
    try {
      setIsLoading(true);
      
      console.log('Starting Steam login process');
      
      // Redirect to the external Steam login API
      const apiUrl = 'https://steam-login.clutchstudio.gg/auth/steam';
      console.log('Redirecting to Steam API:', apiUrl);
      
      window.location.href = apiUrl;
      
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
      id={id}
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
