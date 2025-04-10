
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skin } from '@/types/skin';
import SearchResults from '../SearchResults';

interface SearchBarProps {
  isMobile: boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ isMobile, isSearchOpen, setIsSearchOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Skin[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  return (
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
  );
};

export default SearchBar;
