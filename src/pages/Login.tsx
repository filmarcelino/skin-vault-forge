
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
      
      // Check for steamId parameter in URL
      const params = new URLSearchParams(window.location.search);
      const steamId = params.get('steamId') || localStorage.getItem('steamId');
      
      if (steamId) {
        console.log('Found Steam ID, creating anonymous account:', steamId);
        try {
          // Generate a random email that won't conflict
          const randomEmail = `${steamId}_${Math.random().toString(36).substring(2)}@steam.user`;
          // Generate a random secure password
          const randomPassword = crypto.randomUUID();
          
          // Create a new user account
          const { data, error } = await supabase.auth.signUp({
            email: randomEmail,
            password: randomPassword,
            options: {
              data: {
                steam_id: steamId,
                provider: 'steam'
              }
            }
          });
          
          if (error) throw error;
          
          if (data.user) {
            console.log('Created new user account:', data.user.id);
            
            // Update the users table with Steam ID
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                steam_id: steamId,
              })
              .eq('id', data.user.id);
              
            if (updateError) {
              console.error('Error updating user with Steam ID:', updateError);
            }
            
            localStorage.removeItem('steamId');
            
            // Redirect to inventory page
            toast({
              title: "Account created",
              description: "Your account has been created and linked with Steam.",
            });
            
            navigate('/inventory');
          }
        } catch (err) {
          console.error('Error creating account:', err);
          setError('Failed to create account. Please try logging in again.');
        }
      }
      
      setIsLoading(false);
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
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Authenticating with Steam...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">SkinVault</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Faça login para acessar sua conta
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-8 space-y-6">
              <SteamLoginButton id="steam-login-btn" />
            </div>
            
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Ao fazer login, você concorda com nossos termos de serviço e política de privacidade.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
