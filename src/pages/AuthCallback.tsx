
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
            title: 'Authentication failed',
            description: errorParam,
            variant: 'destructive',
          });
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        // Check for access_token and refresh_token in URL (from Steam auth)
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        
        if (access_token && refresh_token) {
          console.log("Found auth tokens in URL");
          
          try {
            // Set the session in Supabase
            console.log("Setting session in Supabase with tokens");
            const { error } = await supabase.auth.setSession({
              access_token: access_token,
              refresh_token: refresh_token,
            });
            
            if (error) {
              console.error("Error setting session:", error);
              throw error;
            }
            
            toast({
              title: 'Login successful',
              description: 'You have been successfully signed in via Steam.',
            });
            
            // Redirect to home page after successful login
            setRedirectTo('/');
            return;
          } catch (err) {
            console.error('Error setting session with tokens:', err);
            setError('There was a problem with your Steam sign in. Please try again.');
            toast({
              title: 'Authentication failed',
              description: 'There was a problem with your Steam sign in. Please try again.',
              variant: 'destructive',
            });
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
        }
        
        // If we've reached here without returning, something unexpected happened
        console.error("No valid authentication data found in URL");
        
        setError('An unexpected error occurred during authentication. Please try again.');
        toast({
          title: 'Authentication error',
          description: 'An unexpected error occurred during authentication. Please try again.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/login'), 3000);
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
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button 
          className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          onClick={() => navigate('/login')}
        >
          Return to Login
        </button>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting...</p>
    </div>
  );
};

export default AuthCallback;
