
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
        
        if (!access_token || !refresh_token) {
          console.error("Missing auth tokens in URL");
          setError('Authentication failed: Missing tokens');
          toast({
            title: 'Authentication failed',
            description: 'Missing authentication tokens',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        console.log("Found auth tokens in URL, setting session");
        
        try {
          // Set the session in Supabase
          const { error } = await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token,
          });
          
          if (error) {
            console.error("Error setting session:", error);
            throw error;
          }
          
          // Verify the session was properly set
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !sessionData.session) {
            console.error("Failed to verify session:", sessionError);
            throw new Error('Failed to verify authentication session');
          }
          
          console.log("Session verified successfully");
          
          toast({
            title: 'Login successful',
            description: 'You have been successfully signed in via Steam.',
          });
          
          // Redirect to home page after successful login
          setRedirectTo('/');
        } catch (err) {
          console.error('Error setting/verifying session:', err);
          setError(err instanceof Error ? err.message : 'Authentication error');
          toast({
            title: 'Authentication failed',
            description: 'There was a problem with your Steam sign in. Please try again.',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/login'), 3000);
        }
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Authenticating...</p>
        <p className="mt-2 text-muted-foreground text-center">Please wait while we complete your login</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button 
          className="mt-6 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium">Redirecting...</p>
      <p className="mt-2 text-muted-foreground">You'll be redirected to the homepage momentarily</p>
    </div>
  );
};

export default AuthCallback;
