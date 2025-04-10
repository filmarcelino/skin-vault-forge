
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
              title: "Conta criada",
              description: "Sua conta foi criada e vinculada com o Steam.",
            });
            
            navigate('/inventory');
          }
        } catch (err) {
          console.error('Error creating account:', err);
          setError('Falha ao criar conta. Por favor, tente fazer login novamente.');
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
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid-pattern">
      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-0"></div>
      
      <div className="w-full max-w-md space-y-8 p-8 rounded-lg border border-neon-purple/20 backdrop-blur-sm bg-black/50 shadow-xl relative z-10">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-neon-purple" />
            <p className="text-lg text-neon-purple/80">Autenticando com Steam...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/1138/1138004.png" 
                  alt="SkinVault Logo" 
                  className="h-16 w-16 animate-pulse" 
                />
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                <span className="text-neon-purple animate-glow">Skin</span>
                <span className="text-white">Vault</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie sua coleção de skins de CS2 em um só lugar
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="my-6 border-destructive/30 bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-8 space-y-6">
              <div className="space-y-4">
                <SteamLoginButton 
                  id="steam-login-btn" 
                  className="bg-[#1a1a1a] hover:bg-[#272727] border border-neon-purple/30 hover:border-neon-purple py-6 text-lg font-medium transition-all" 
                />
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/30"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-black/50 px-2 text-xs text-muted-foreground backdrop-blur-sm">
                      Autenticação segura
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4 text-xs text-muted-foreground/70">
                Ao fazer login, você concorda com nossos <span className="underline cursor-pointer hover:text-neon-purple">termos de serviço</span> e <span className="underline cursor-pointer hover:text-neon-purple">política de privacidade</span>.
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="absolute bottom-4 text-center w-full text-xs text-muted-foreground/50">
        &copy; 2025 SkinVault. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default Login;
