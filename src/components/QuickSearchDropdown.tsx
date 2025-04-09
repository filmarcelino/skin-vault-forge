
import React, { useState, useEffect } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { BookmarkIcon, Trash2 } from 'lucide-react';
import { FilterOptions } from './AdvancedFilterDrawer';
import { toast } from 'sonner';

interface QuickSearch {
  id: string;
  name: string;
  filterOptions: FilterOptions;
}

interface QuickSearchDropdownProps {
  onSelectSearch: (filters: FilterOptions) => void;
}

const QuickSearchDropdown = ({ onSelectSearch }: QuickSearchDropdownProps) => {
  const [savedSearches, setSavedSearches] = useState<QuickSearch[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('quickSearches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved searches', error);
        localStorage.removeItem('quickSearches');
      }
    }
  }, []);
  
  const handleDeleteSearch = (e: React.MouseEvent, searchId: string) => {
    e.stopPropagation();
    const updatedSearches = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updatedSearches);
    localStorage.setItem('quickSearches', JSON.stringify(updatedSearches));
    toast.success('Search removed');
  };
  
  if (savedSearches.length === 0) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <BookmarkIcon className="h-4 w-4 mr-2" />
          Quick Searches
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Saved Searches</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {savedSearches.map((search) => (
          <DropdownMenuItem 
            key={search.id} 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => onSelectSearch(search.filterOptions)}
          >
            <span>{search.name}</span>
            <Trash2 
              className="h-4 w-4 text-destructive hover:text-destructive/80" 
              onClick={(e) => handleDeleteSearch(e, search.id)}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickSearchDropdown;
