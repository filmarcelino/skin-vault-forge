
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        console.log("Auth callback initiated");
        console.log("URL search params:", location.search);
        
        // Check if we have an error parameter (from failed login)
        const searchParams = new URLSearchParams(location.search);
        const errorParam = searchParams.get('error');
        
        if (errorParam) {
          console.error("Login error from URL:", errorParam);
          setError(errorParam);
          toast({
            title: 'Falha na autenticação',
            description: errorParam,
            variant: 'destructive',
          });
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        // Check if we have tokens in URL (from our custom Steam auth)
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log("Found tokens in URL");
          
          // Set the session in Supabase
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error("Error setting session:", error);
            throw error;
          }
          
          toast({
            title: 'Login bem-sucedido',
            description: 'Você foi autenticado com sucesso via Steam.',
          });
          
          // Redirect to home page after successful login
          setRedirectTo('/inventory');
          return;
        }
        
        // If we've reached here without returning, something unexpected happened
        console.error("Tokens not found in URL");
        
        toast({
          title: 'Erro de autenticação',
          description: 'Ocorreu um erro inesperado durante a autenticação. Por favor, tente novamente.',
          variant: 'destructive',
        });
        setRedirectTo('/login');
      } catch (err) {
        console.error('Error in auth callback:', err);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
          variant: 'destructive',
        });
        setRedirectTo('/login');
      } finally {
        setLoading(false);
      }
    }

    handleAuthCallback();
  }, [toast, location.search, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Autenticando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Falha na Autenticação</h2>
          <p>{error}</p>
          <button 
            className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={() => navigate('/login')}
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecionando...</p>
    </div>
  );
};

export default AuthCallback;
