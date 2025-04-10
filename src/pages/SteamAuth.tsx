
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SteamAuth = () => {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleSteamCallback() {
      try {
        console.log("Steam auth callback initiated");
        
        // Get URL parameters
        const searchParams = new URLSearchParams(location.search);
        
        // Check if we have error parameter
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
        
        // Get access_token and refresh_token from URL if they exist
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        
        if (access_token && refresh_token) {
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
        } else {
          // Handle the case where the email is returned (alternative approach)
          const email = searchParams.get('email');
          
          if (email) {
            console.log("Found email in URL, attempting sign in");
            
            try {
              // The API has already created/updated the user in Supabase
              // We just need to sign in with the email
              const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: 'steampassword123', // This should match the password set by the API
              });
              
              if (error) {
                console.error("Error signing in:", error);
                throw error;
              }
              
              console.log("Sign in successful");
              
              toast({
                title: 'Login successful',
                description: 'You have been successfully signed in via Steam.',
              });
              
              // Redirect to home page after successful login
              setRedirectTo('/');
            } catch (err) {
              console.error('Error signing in:', err);
              setError(err instanceof Error ? err.message : 'Authentication error');
              toast({
                title: 'Authentication failed',
                description: 'There was a problem with your Steam sign in. Please try again.',
                variant: 'destructive',
              });
              setTimeout(() => navigate('/login'), 3000);
            }
          } else {
            // Neither tokens nor email found
            console.error("Missing authentication data in URL");
            setError('Authentication failed: Missing data');
            toast({
              title: 'Authentication failed',
              description: 'Missing authentication data',
              variant: 'destructive',
            });
            setTimeout(() => navigate('/login'), 3000);
          }
        }
      } catch (err) {
        console.error('Error in steam auth callback:', err);
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

    handleSteamCallback();
  }, [toast, location.search, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Authenticating with Steam...</p>
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

export default SteamAuth;
