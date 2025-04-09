
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import SteamLoginButton from '@/components/SteamLoginButton';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Sign in to SkinVault</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Use your Steam account to access your inventory
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <SteamLoginButton />
          <p className="text-xs text-center text-muted-foreground mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
