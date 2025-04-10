
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
      
      // Redirect to our Steam auth API route
      window.location.href = '/api/auth/steam';
      
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
