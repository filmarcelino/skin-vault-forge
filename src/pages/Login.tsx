
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
      } else {
        // Auto-redirect to Steam login
        document.getElementById('steam-login-btn')?.click();
      }
    };
    
    // Check session on component mount
    checkSession();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">SkinVault</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Redirecionando para autenticação...
          </p>
        </div>

        <div className="mt-8 space-y-6 hidden">
          <SteamLoginButton id="steam-login-btn" />
        </div>
        
        <div className="flex justify-center mt-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Login;
