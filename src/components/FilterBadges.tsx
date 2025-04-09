
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { FilterOptions } from './AdvancedFilterDrawer';

interface FilterBadgesProps {
  filters: FilterOptions;
  onRemoveFilter: (key: keyof FilterOptions, value?: string) => void;
}

const FilterBadges = ({ filters, onRemoveFilter }: FilterBadgesProps) => {
  const hasActiveFilters = () => {
    return (
      filters.inventorySource !== 'all' ||
      filters.rarities.length > 0 ||
      filters.exteriors.length > 0 ||
      filters.weaponTypes.length > 0 ||
      filters.hasStatTrak ||
      filters.minPrice > 0 ||
      filters.maxPrice < 10000
    );
  };
  
  if (!hasActiveFilters()) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.inventorySource !== 'all' && (
        <Badge variant="outline" className="flex items-center gap-1">
          Source: {filters.inventorySource}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onRemoveFilter('inventorySource')} 
          />
        </Badge>
      )}
      
      {filters.rarities.map(rarity => (
        <Badge key={rarity} variant="outline" className="flex items-center gap-1">
          Rarity: {rarity}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onRemoveFilter('rarities', rarity)} 
          />
        </Badge>
      ))}
      
      {filters.exteriors.map(exterior => (
        <Badge key={exterior} variant="outline" className="flex items-center gap-1">
          {exterior}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onRemoveFilter('exteriors', exterior)} 
          />
        </Badge>
      ))}
      
      {filters.weaponTypes.map(weaponType => (
        <Badge key={weaponType} variant="outline" className="flex items-center gap-1">
          {weaponType}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onRemoveFilter('weaponTypes', weaponType)} 
          />
        </Badge>
      ))}
      
      {filters.hasStatTrak && (
        <Badge variant="outline" className="flex items-center gap-1">
          StatTrak™
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onRemoveFilter('hasStatTrak')} 
          />
        </Badge>
      )}
      
      {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
        <Badge variant="outline" className="flex items-center gap-1">
          Price: ${filters.minPrice} - ${filters.maxPrice}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => {
              onRemoveFilter('minPrice');
              onRemoveFilter('maxPrice');
            }} 
          />
        </Badge>
      )}
    </div>
  );
};

export default FilterBadges;
