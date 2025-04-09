
import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, Settings, SunMoon, Search, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import SearchResults from './SearchResults';
import { Badge } from './ui/badge';
import { Skin } from '@/types/skin';

const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Skin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Close search results dropdown when clicking outside
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

  // Search function with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Perform search in Supabase
        const { data, error } = await supabase
          .from('skins')
          .select('*')
          .or(`name.ilike.%${searchQuery}%, weapon_type.ilike.%${searchQuery}%`)
          .limit(8);
        
        if (error) {
          console.error('Search error:', error);
          return;
        }

        if (data) {
          // Format the returned data to match our Skin type
          const formattedResults: Skin[] = data.map(skin => ({
            id: skin.id,
            name: skin.name,
            weapon_type: skin.weapon_type || 'Unknown',
            image_url: skin.image_url || 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
            rarity: (skin.rarity as 'common' | 'uncommon' | 'rare' | 'mythical' | 'legendary' | 'ancient' | 'contraband') || 'common',
            exterior: skin.exterior || 'Factory New',
            price_usd: skin.price_usd,
            statTrak: false // Default value since we don't have this in DB
          }));
          
          setSearchResults(formattedResults);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center px-4 sm:px-8">
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
                  <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    Home
                  </a>
                  <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    Inventory
                  </a>
                  <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    Market
                  </a>
                  <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    Statistics
                  </a>
                </nav>
              </SheetContent>
            </Sheet>
          )}
          <a href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-neon-violet flex items-center justify-center">
              <span className="font-bold text-white text-lg">CS</span>
            </div>
            <span className="text-xl font-bold tracking-tighter">
              <span className="text-foreground">Clutch Studio's </span>
              <span className="text-neon-purple">SkinVault</span>
            </span>
          </a>
        </div>

        {!isMobile && !isSearchOpen && (
          <nav className="hidden md:flex gap-6 mx-6">
            <a 
              href="#" 
              className="text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
            >
              Home
            </a>
            <a 
              href="#" 
              className="text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
            >
              Inventory
            </a>
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

            {/* Search Results Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-[100] max-h-[500px] overflow-y-auto">
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
          
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
