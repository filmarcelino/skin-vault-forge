
import { Button } from '@/components/ui/button';
import { FaSteam } from 'react-icons/fa';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Call our steam-start function to get the redirect URL
      const { data, error } = await supabase.functions.invoke('steam-start');
      
      if (error) {
        console.error('Steam start error:', error);
        throw new Error(error.message || 'Falha ao iniciar a autenticação do Steam');
      }
      
      if (!data?.redirectUrl) {
        console.error('No redirect URL received:', data);
        throw new Error('Nenhuma URL de redirecionamento recebida do servidor');
      }
      
      console.log('Redirecting to Steam:', data.redirectUrl);
      // Redirect to Steam authentication page
      window.location.href = data.redirectUrl;
      
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
      className={`relative overflow-hidden group ${className || ''}`}
      disabled={isLoading}
      id={id}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-neon-violet/20 to-neon-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <FaSteam className="mr-3 h-5 w-5" />
      )}
      
      <span>Entrar com Steam</span>
    </Button>
  );
};

export default SteamLoginButton;
