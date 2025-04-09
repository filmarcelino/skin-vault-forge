
import React, { useState } from 'react';
import { Menu, User, Settings, SunMoon, Search, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();

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

        <div className={`search-container flex-1 ${isSearchOpen ? 'flex' : 'hidden md:flex'} justify-center`}>
          <div className={`relative w-full max-w-md ${isSearchOpen && isMobile ? 'w-full' : ''}`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              type="search" 
              placeholder="Search skins, collections, or weapon types..." 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm pl-9 shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neon-purple"
            />
            {isSearchOpen && isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
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
