
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SteamAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleSteamAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const steamId = params.get('steamId');

        if (steamId) {
          // Store in localStorage if needed
          localStorage.setItem('steamId', steamId);
          console.log('SteamID saved:', steamId);
          
          toast({
            title: 'Login successful',
            description: 'Successfully logged in with Steam.',
          });
          
          // Redirect to main page
          navigate('/');
        } else {
          throw new Error('No Steam ID received');
        }
      } catch (error) {
        console.error('Steam auth error:', error);
        toast({
          title: 'Authentication failed',
          description: error.message || 'Failed to authenticate with Steam',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    handleSteamAuth();
  }, [navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-medium mb-2">Logging in with Steam...</h2>
      <p className="text-muted-foreground">Please wait while we complete your authentication</p>
    </div>
  );
};

export default SteamAuth;
