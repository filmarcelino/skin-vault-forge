
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
      
      // Check for error parameter in URL
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      if (errorParam) {
        toast({
          title: "Erro de autenticação",
          description: decodeURIComponent(errorParam),
          variant: "destructive"
        });
        setError(decodeURIComponent(errorParam));
      }
      
      setIsLoading(false);
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
