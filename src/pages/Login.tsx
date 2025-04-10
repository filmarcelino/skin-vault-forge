
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SteamLoginButton from '@/components/SteamLoginButton';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is already authenticated
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated, redirect to home page
        toast({
          title: "Bem-vindo de volta!",
          description: "Você foi autenticado com sucesso.",
        });
        navigate('/inventory');
        return;
      }
      
      // Check for access_token and refresh_token in URL (from Steam auth callback)
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log('Found tokens in URL, setting session');
        try {
          // Set the session in Supabase
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) throw error;
          
          // Clear tokens from URL for security
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast({
            title: "Login bem-sucedido",
            description: "Você foi autenticado com sucesso via Steam.",
          });
          
          navigate('/inventory');
        } catch (err) {
          console.error('Error setting session:', err);
          setError('Falha ao configurar a sessão. Por favor, tente novamente.');
        }
      }
      
      setIsLoading(false);
      
      // Check for error parameter in URL
      const error = params.get('error');
      if (error) {
        toast({
          title: "Erro de autenticação",
          description: decodeURIComponent(error),
          variant: "destructive"
        });
        setError(decodeURIComponent(error));
      }
    };
    
    // Check session on component mount
    checkSession();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="w-full max-w-md space-y-8 p-8 bg-[#1a1a1a] rounded-lg shadow-lg border border-[#333]">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#8a2be2]" />
            <p className="text-white">Autenticando com o Steam...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white">SkinVault</h2>
              <p className="text-sm text-gray-400 mt-2">
                Faça login para acessar sua conta
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="my-4 bg-red-900/20 border-red-900">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-8 space-y-6">
              <SteamLoginButton id="steam-login-btn" />
            </div>
            
            <div className="text-center mt-4 text-sm text-gray-500">
              Ao fazer login, você concorda com nossos termos de serviço e política de privacidade.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
