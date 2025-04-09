
import React, { useState } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerClose,
  DrawerFooter
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { SaveIcon, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export interface FilterOptions {
  inventorySource: 'all' | 'steam' | 'local';
  rarities: string[];
  minPrice: number;
  maxPrice: number;
  exteriors: string[];
  weaponTypes: string[];
  hasStatTrak: boolean;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

interface QuickSearch {
  id: string;
  name: string;
  filterOptions: FilterOptions;
}

interface AdvancedFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

const defaultFilters: FilterOptions = {
  inventorySource: 'all',
  rarities: [],
  minPrice: 0,
  maxPrice: 10000,
  exteriors: [],
  weaponTypes: [],
  hasStatTrak: false,
  sortBy: 'name',
  sortDirection: 'asc'
};

const AdvancedFilterDrawer = ({ 
  isOpen, 
  onClose,
  onApplyFilters, 
  initialFilters
}: AdvancedFilterDrawerProps) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || defaultFilters);
  const [quickSearchName, setQuickSearchName] = useState('');
  const [savedSearches, setSavedSearches] = useState<QuickSearch[]>(() => {
    const saved = localStorage.getItem('quickSearches');
    return saved ? JSON.parse(saved) : [];
  });

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRarityToggle = (rarity: string) => {
    setFilters(prev => {
      const newRarities = prev.rarities.includes(rarity)
        ? prev.rarities.filter(r => r !== rarity)
        : [...prev.rarities, rarity];
      return { ...prev, rarities: newRarities };
    });
  };

  const handleExteriorToggle = (exterior: string) => {
    setFilters(prev => {
      const newExteriors = prev.exteriors.includes(exterior)
        ? prev.exteriors.filter(e => e !== exterior)
        : [...prev.exteriors, exterior];
      return { ...prev, exteriors: newExteriors };
    });
  };

  const handleWeaponTypeToggle = (weaponType: string) => {
    setFilters(prev => {
      const newWeaponTypes = prev.weaponTypes.includes(weaponType)
        ? prev.weaponTypes.filter(w => w !== weaponType)
        : [...prev.weaponTypes, weaponType];
      return { ...prev, weaponTypes: newWeaponTypes };
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handleSaveQuickSearch = () => {
    if (!quickSearchName.trim()) {
      toast.error("Please provide a name for your quick search");
      return;
    }

    const newSearch: QuickSearch = {
      id: Date.now().toString(),
      name: quickSearchName.trim(),
      filterOptions: { ...filters }
    };

    const updatedSearches = [...savedSearches, newSearch];
    setSavedSearches(updatedSearches);
    localStorage.setItem('quickSearches', JSON.stringify(updatedSearches));
    
    setQuickSearchName('');
    toast.success(`Saved "${quickSearchName}" to quick searches`);
  };

  const handleLoadQuickSearch = (searchId: string) => {
    const search = savedSearches.find(s => s.id === searchId);
    if (search) {
      setFilters(search.filterOptions);
      toast.success(`Loaded "${search.name}" filter settings`);
    }
  };

  const handleDeleteQuickSearch = (searchId: string) => {
    const updatedSearches = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updatedSearches);
    localStorage.setItem('quickSearches', JSON.stringify(updatedSearches));
    toast.success(`Quick search removed`);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="min-h-[70vh] max-h-[90vh]">
        <div className="px-4 py-4">
          <DrawerHeader className="px-0">
            <div className="flex items-center justify-between">
              <DrawerTitle>Advanced Search & Filters</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          
          <div className="overflow-y-auto pb-20 pt-2 pr-1" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div className="space-y-6">
              {/* Inventory Source */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Inventory Source</Label>
                <RadioGroup 
                  value={filters.inventorySource} 
                  onValueChange={(value) => handleFilterChange('inventorySource', value)}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All Inventory</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="steam" id="steam" />
                    <Label htmlFor="steam">Steam Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="local" id="local" />
                    <Label htmlFor="local">Local Collection Only</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Rarities */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Rarity</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["common", "uncommon", "rare", "mythical", "legendary", "ancient", "contraband"].map(rarity => (
                    <div key={rarity} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`rarity-${rarity}`} 
                        checked={filters.rarities.includes(rarity)}
                        onCheckedChange={() => handleRarityToggle(rarity)}
                      />
                      <Label htmlFor={`rarity-${rarity}`} className="capitalize">{rarity}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Exteriors */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Exterior/Condition</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"].map(exterior => (
                    <div key={exterior} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`exterior-${exterior}`} 
                        checked={filters.exteriors.includes(exterior)}
                        onCheckedChange={() => handleExteriorToggle(exterior)}
                      />
                      <Label htmlFor={`exterior-${exterior}`}>{exterior}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Weapon Types */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Weapon Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {["Rifle", "Pistol", "SMG", "Shotgun", "Sniper", "Knife", "Gloves"].map(weaponType => (
                    <div key={weaponType} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`weaponType-${weaponType}`} 
                        checked={filters.weaponTypes.includes(weaponType)}
                        onCheckedChange={() => handleWeaponTypeToggle(weaponType)}
                      />
                      <Label htmlFor={`weaponType-${weaponType}`}>{weaponType}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Price Range ($)</Label>
                <div className="flex gap-4 items-center">
                  <Input
                    type="number"
                    min={0}
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                    className="w-20"
                  />
                  <Slider
                    min={0}
                    max={10000}
                    step={1}
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={([min, max]) => {
                      handleFilterChange('minPrice', min);
                      handleFilterChange('maxPrice', max);
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>
              
              {/* StatTrak Option */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="statTrak" 
                  checked={filters.hasStatTrak}
                  onCheckedChange={(checked) => handleFilterChange('hasStatTrak', checked)}
                />
                <Label htmlFor="statTrak">StatTrak™ Only</Label>
              </div>
              
              {/* Sort Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortBy">Sort By</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger id="sortBy">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price_usd">Price</SelectItem>
                      <SelectItem value="rarity">Rarity</SelectItem>
                      <SelectItem value="acquired_date">Date Acquired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sortDirection">Direction</Label>
                  <Select
                    value={filters.sortDirection}
                    onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sortDirection', value)}
                  >
                    <SelectTrigger id="sortDirection">
                      <SelectValue placeholder="Sort direction..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Quick Searches */}
              <div className="space-y-4 border-t pt-4">
                <Label className="text-base font-medium">Quick Searches</Label>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Name this filter set..."
                    value={quickSearchName}
                    onChange={(e) => setQuickSearchName(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleSaveQuickSearch} 
                    title="Save as Quick Search"
                  >
                    <SaveIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                {savedSearches.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {savedSearches.map((search) => (
                      <div key={search.id} className="flex items-center space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleLoadQuickSearch(search.id)}
                          className="text-xs h-8"
                        >
                          {search.name}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteQuickSearch(search.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Save your current filter settings as a quick search for future use.</p>
                )}
              </div>
            </div>
          </div>
          
          <DrawerFooter className="px-0 pt-2 pb-4 border-t">
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={handleResetFilters}>Reset Filters</Button>
              <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AdvancedFilterDrawer;
