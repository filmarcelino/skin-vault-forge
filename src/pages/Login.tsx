
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SteamLoginButton from '@/components/SteamLoginButton';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if user is already authenticated
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated, redirect to home page
        toast({
          title: "Bem-vindo de volta!",
          description: "Você foi autenticado com sucesso.",
        });
        navigate('/');
      }
    };
    
    // Check session on component mount
    checkSession();
    
    // Check for error parameter in URL
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      toast({
        title: "Erro de autenticação",
        description: decodeURIComponent(error),
        variant: "destructive"
      });
    }
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">SkinVault</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Faça login para acessar sua conta
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <SteamLoginButton id="steam-login-btn" />
        </div>
        
        <div className="text-center mt-4 text-sm text-muted-foreground">
          Ao fazer login, você concorda com nossos termos de serviço e política de privacidade.
        </div>
      </div>
    </div>
  );
};

export default Login;
