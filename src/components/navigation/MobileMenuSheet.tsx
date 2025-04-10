
import React from 'react';
import { Menu, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import NavigationLinks from './NavigationLinks';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface MobileMenuSheetProps {
  isAdmin?: boolean;
  currentUser: any;
  setShowLoginDialog: (show: boolean) => void;
}

const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({ 
  isAdmin, 
  currentUser,
  setShowLoginDialog
}) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background">
        <NavigationLinks isAdmin={isAdmin} isMobile={true} />
        
        {!currentUser && (
          <button 
            onClick={() => setShowLoginDialog(true)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mt-4"
          >
            <LogIn className="h-4 w-4" />
            Login
          </button>
        )}
        {currentUser && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mt-4"
          >
            <LogIn className="h-4 w-4" />
            Logout
          </button>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenuSheet;
