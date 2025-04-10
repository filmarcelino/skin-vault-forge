
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SteamCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleSteamCallback = async () => {
      try {
        console.log("Steam callback initiated");
        const searchParams = new URLSearchParams(location.search);
        
        // Get the email parameter from the URL (this comes from your external auth service)
        const email = searchParams.get('email');
        
        if (!email) {
          throw new Error('No email received from Steam authentication service');
        }
        
        console.log('Attempting to sign in with email from Steam auth:', email);
        
        // For your external auth flow, you're using a predefined email format
        // We need to sign in with this email to access the user created by your external service
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          // Since your external service generates a random password that we don't know here,
          // you'll need to modify your external service to either:
          // 1. Use a consistent password for each user that you know here
          // 2. Pass the password in the URL (not recommended for security)
          // 3. Use a token-based authentication instead
          password: 'temporaryPassword123', // This won't work unless it matches what your external service sets
        });
        
        if (signInError) {
          console.error('Error signing in:', signInError);
          throw new Error('Failed to authenticate with Supabase: ' + signInError.message);
        }
        
        if (!data.session) {
          throw new Error('No session created');
        }
        
        console.log('Successfully authenticated with Supabase');
        
        toast({
          title: 'Login successful',
          description: 'You have been successfully signed in via Steam.',
        });
        
        navigate('/');
      } catch (err) {
        console.error('Steam callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        toast({
          title: 'Authentication failed',
          description: err instanceof Error ? err.message : 'Failed to authenticate with Steam',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    handleSteamCallback();
  }, [location.search, navigate, toast]);

  // Display loading or error states
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
        <p className="mt-4 text-sm text-muted-foreground">
          Note: If you're testing the integration, make sure your external authentication service 
          is properly configured and running.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium">Login successful</p>
      <p className="mt-2 text-muted-foreground">Redirecting to homepage...</p>
    </div>
  );
};

export default SteamCallback;
