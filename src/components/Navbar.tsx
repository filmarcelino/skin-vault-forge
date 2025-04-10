import React, { useState, useEffect } from 'react';
import { Settings, ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { checkAdminStatus } from '@/utils/adminUtils';
import { Dialog } from './ui/dialog';
import NavigationLinks from './navigation/NavigationLinks';
import SearchBar from './search/SearchBar';
import UserMenu from './user/UserMenu';
import MobileMenuSheet from './navigation/MobileMenuSheet';

const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkUserSession = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUser(data.session?.user || null);
    };
    
    checkUserSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setCurrentUser(session?.user || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const { data: isAdmin } = useQuery({
    queryKey: ['admin-status'],
    queryFn: checkAdminStatus,
    retry: false,
    staleTime: 300000,
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center px-4 sm:px-8">
        <div className="flex items-center gap-2 mr-4">
          {isMobile && (
            <MobileMenuSheet 
              isAdmin={isAdmin} 
              currentUser={currentUser}
              setShowLoginDialog={setShowLoginDialog}
            />
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-md bg-neon-violet flex items-center justify-center">
              <span className="font-bold text-white text-xs">CS</span>
            </div>
            <span className="text-base font-bold tracking-tight">
              <span className="text-foreground">SkinVault</span>
            </span>
          </Link>
        </div>

        {!isMobile && !isSearchOpen && (
          <NavigationLinks isAdmin={isAdmin} />
        )}

        <SearchBar 
          isMobile={isMobile} 
          isSearchOpen={isSearchOpen} 
          setIsSearchOpen={setIsSearchOpen} 
        />
        
        <div className={`flex items-center justify-end gap-2 ${isSearchOpen && isMobile ? 'hidden' : 'ml-auto md:ml-0'}`}>
          {isMobile && !isSearchOpen && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <UserMenu currentUser={currentUser} />
        </div>
      </div>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        {/* This is rendered by UserMenu component */}
      </Dialog>
    </header>
  );
};

export default Navbar;
