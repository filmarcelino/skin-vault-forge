
import React, { useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SteamLoginButton from '@/components/SteamLoginButton';

interface UserMenuProps {
  currentUser: any;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => currentUser ? null : setShowLoginDialog(true)}
      >
        {currentUser ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.user_metadata?.avatar_url} />
            <AvatarFallback>
              {(currentUser.user_metadata?.username || currentUser.email || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <User className="h-5 w-5" />
        )}
      </Button>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login to SkinVault</DialogTitle>
            <DialogDescription>
              Connect with your Steam account to access your inventory and manage your skins.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <SteamLoginButton />
            <p className="text-sm text-muted-foreground mt-4">
              By logging in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserMenu;
