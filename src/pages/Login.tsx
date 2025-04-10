
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SteamLoginButton from '@/components/SteamLoginButton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for error in URL parameters
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      toast({
        title: "Authentication failed",
        description: decodeURIComponent(errorParam),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Check if user is already authenticated
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is authenticated, redirect to home page
          toast({
            title: "Bem-vindo de volta!",
            description: "Você foi autenticado com sucesso.",
          });
          navigate('/');
        } else {
          // Auto-redirect to Steam login
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Session check error:", err);
        setError("Failed to check authentication status");
        setIsLoading(false);
      }
    };
    
    // Check session on component mount
    checkSession();
  }, [navigate, toast, location.search]);

  const handleManualLogin = () => {
    document.getElementById('steam-login-btn')?.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">SkinVault</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {isLoading ? "Verificando sessão..." : "Conecte com sua conta Steam para continuar"}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de autenticação</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8 space-y-6">
          {isLoading ? (
            <div className="flex justify-center mt-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <SteamLoginButton id="steam-login-btn" />
              <p className="text-xs text-center text-muted-foreground mt-4">
                Ao fazer login, você concorda com nossos Termos de Serviço e Política de Privacidade.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
