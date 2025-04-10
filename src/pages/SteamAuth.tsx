
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
    const handleSteamCallback = async () => {
      try {
        console.log("Processing Steam authentication callback");
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);
        
        // Extract OpenID parameters from the URL
        const mode = searchParams.get('openid.mode');
        const identity = searchParams.get('openid.identity');
        
        if (mode !== 'id_res' || !identity) {
          throw new Error('Invalid Steam authentication response');
        }
        
        // Extract Steam ID from the identity URL (format: https://steamcommunity.com/openid/id/STEAMID)
        const steamId = identity.split('/').pop();
        
        if (!steamId) {
          throw new Error('Could not extract Steam ID from response');
        }
        
        console.log('Steam ID:', steamId);
        
        // Call our API endpoint to complete the authentication flow
        const apiEndpoint = `/api/steam-auth-callback?steamid=${steamId}`;
        console.log('Calling API endpoint:', apiEndpoint);
        
        const response = await fetch(apiEndpoint);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${errorText}`);
        }
        
        // The API should redirect to the login page with the tokens
        // If we reached this point, something might be wrong
        throw new Error('Authentication flow did not complete correctly');
        
      } catch (error) {
        console.error('Steam auth callback error:', error);
        setError(error.message || 'Failed to authenticate with Steam');
        toast({
          title: 'Authentication failed',
          description: error.message || 'Failed to authenticate with Steam',
          variant: 'destructive',
        });
        
        // Redirect to login after a delay
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleSteamCallback();
  }, [navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-white">
      {isProcessing ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-[#8a2be2] mb-4" />
          <h2 className="text-xl font-medium mb-2">Processando autenticação Steam...</h2>
          <p className="text-gray-400">
            Por favor, aguarde enquanto completamos sua autenticação
          </p>
        </>
      ) : error ? (
        <div className="max-w-md text-center p-8 bg-red-900/20 rounded-lg border border-red-900">
          <h2 className="text-xl font-medium text-red-400 mb-2">Falha na autenticação</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#8a2be2] text-white px-4 py-2 rounded hover:bg-[#7a1bd2]"
          >
            Voltar para o login
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Autenticação completada</h2>
          <p className="text-gray-400">Redirecionando para a página inicial...</p>
        </div>
      )}
    </div>
  );
};

export default SteamAuth;
