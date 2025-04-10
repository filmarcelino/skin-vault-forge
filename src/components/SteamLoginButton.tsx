
import { Button } from '@/components/ui/button';
import { FaSteam } from 'react-icons/fa';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SteamLoginButtonProps {
  id?: string;
  className?: string;
  onSuccess?: (steamId: string) => void;
}

const SteamLoginButton = ({ id, className, onSuccess }: SteamLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSteamLogin = async () => {
    try {
      setIsLoading(true);
      
      console.log('Starting Steam login process');
      
      // Redirect to Steam OpenID login
      // This URL needs to be updated to match your actual domain
      const redirectUrl = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(window.location.origin + '/steam-auth')}&openid.realm=${encodeURIComponent(window.location.origin)}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
      
      console.log('Redirecting to Steam:', redirectUrl);
      window.location.href = redirectUrl;
      
    } catch (error) {
      console.error('Steam login error:', error);
      toast({
        title: 'Erro de login',
        description: error.message || 'Falha ao conectar com o Steam. Por favor, tente novamente.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSteamLogin}
      className={`bg-[#171a21] hover:bg-[#2a475e] text-white w-full ${className || ''}`}
      disabled={isLoading}
      id={id}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FaSteam className="mr-2" />
      )}
      Entrar com Steam
    </Button>
  );
};

export default SteamLoginButton;
