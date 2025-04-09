
import { Button } from '@/components/ui/button';
import { FaSteam } from 'react-icons/fa';
import { supabase } from '@/integrations/supabase/client';

const SteamLoginButton = () => {
  const handleSteamLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      // Using 'steam' as string literal since it's not in the Provider type
      provider: 'steam' as any,
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    
    if (error) {
      console.error('Steam login error:', error);
    }
  };

  return (
    <Button 
      onClick={handleSteamLogin}
      className="bg-[#171a21] hover:bg-[#2a475e] text-white"
    >
      <FaSteam className="mr-2" />
      Login with Steam
    </Button>
  );
};

export default SteamLoginButton;
