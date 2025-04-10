
import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, Settings, SunMoon, Search, X, ShoppingCart, Shield, LogIn, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import SearchResults from './SearchResults';
import { Badge } from './ui/badge';
import { Skin } from '@/types/skin';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { checkAdminStatus } from '@/utils/adminUtils';
import SteamLoginButton from './SteamLoginButton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Skin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const queryParts = searchQuery.toLowerCase().split(/\s+/).filter(part => part.length > 0);
        
        let queryCondition = '';
        
        queryParts.forEach((part, index) => {
          if (index > 0) queryCondition += ',';
          queryCondition += `name.ilike.%${part}%`;
          queryCondition += `,weapon_type.ilike.%${part}%`;
        });
        
        const { data, error } = await supabase
          .from('skins')
          .select('*')
          .or(queryCondition)
          .limit(20);
        
        if (error) {
          console.error('Search error:', error);
          return;
        }

        if (data) {
          const formattedResults: Skin[] = data.map(skin => ({
            id: skin.id,
            name: skin.name,
            weapon_type: skin.weapon_type || 'Unknown',
            image_url: skin.image_url || 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
            rarity: (skin.rarity as 'common' | 'uncommon' | 'rare' | 'mythical' | 'legendary' | 'ancient' | 'contraband') || 'common',
            exterior: skin.exterior || 'Factory New',
            price_usd: skin.price_usd,
            statTrak: false
          }));
          
          setSearchResults(formattedResults);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    if (isMobile) {
      setIsSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background">
                <nav className="grid gap-4 text-lg mt-8">
                  <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    Home
                  </Link>
                  <Link to="/inventory" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    Inventory
                  </Link>
                  <Link to="/steam-inventory" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Cloud className="h-4 w-4" />
                    Steam Inventory
                  </Link>
                  <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    Market
                  </a>
                  <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    Statistics
                  </a>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2 text-primary hover:text-primary/80">
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  {!currentUser && (
                    <button 
                      onClick={() => setShowLoginDialog(true)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </button>
                  )}
                  {currentUser && (
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <LogIn className="h-4 w-4" />
                      Logout
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
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
          <nav className="hidden md:flex gap-6 mx-6">
            <Link
              to="/" 
              className="text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
            >
              Home
            </Link>
            <Link 
              to="/inventory" 
              className="text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
            >
              Inventory
            </Link>
            <Link 
              to="/steam-inventory" 
              className="text-sm font-medium transition-colors hover:text-foreground text-muted-foreground flex items-center gap-1"
            >
              <Cloud className="h-3 w-3" />
              Steam Inventory
            </Link>
            <a 
              href="#" 
              className="text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
            >
              Market
            </a>
            <a 
              href="#" 
              className="text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
            >
              Statistics
            </a>
            {isAdmin && (
              <Link 
                to="/admin" 
                className="text-sm font-medium transition-colors hover:text-primary/80 text-primary flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                Admin
              </Link>
            )}
          </nav>
        )}

        <div ref={searchRef} className={`search-container flex-1 ${isSearchOpen ? 'flex' : 'hidden md:flex'} justify-center relative`}>
          <div className={`relative w-full max-w-md ${isSearchOpen && isMobile ? 'w-full' : ''}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="search" 
              placeholder="Search skins, collections, or weapon types..." 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm pl-9 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-purple"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
            />
            {(searchQuery || isSearchOpen && isMobile) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-[9999] max-h-[500px] overflow-y-auto">
                <SearchResults 
                  results={searchResults} 
                  isLoading={isLoading} 
                  onSelect={() => setShowDropdown(false)} 
                />
              </div>
            )}
          </div>
        </div>
        
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
        </div>
      </div>

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
    </header>
  );
};

export default Navbar;
