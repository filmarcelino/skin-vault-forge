
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Skin } from '@/types/skin';
import { Loader2, Check, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ScrollArea } from './ui/scroll-area';

interface AddSkinFormProps {
  onSubmit: (skin: Skin) => void;
  allSkins: Skin[];
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  BRL: 'R$',
  CNY: '¥',
  RUB: '₽'
};

const AddSkinForm: React.FC<AddSkinFormProps> = ({ onSubmit, allSkins }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Skin[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [floatValue, setFloatValue] = useState<number>(0.15);
  const [exterior, setExterior] = useState<string>('Factory New');
  const [isStatTrak, setIsStatTrak] = useState<boolean>(false);
  
  const [priceValue, setPriceValue] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  
  // Search for skins as user types
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        // Split query into words to search each part
        const queryParts = searchQuery.toLowerCase().split(/\s+/).filter(part => part.length > 0);
        
        // Build a more complex query with OR conditions for each part
        let queryCondition = '';
        
        queryParts.forEach((part, index) => {
          if (index > 0) queryCondition += ',';
          queryCondition += `name.ilike.%${part}%`;
          queryCondition += `,weapon_type.ilike.%${part}%`;
        });

        // Perform search in Supabase with improved query
        const { data, error } = await supabase
          .from('skins')
          .select('*')
          .or(queryCondition)
          .limit(20); // Increased limit to show more results
        
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
            statTrak: false
          }));
          
          setSearchResults(formattedResults);
          setShowResults(formattedResults.length > 0);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Update exterior based on float value
  useEffect(() => {
    if (floatValue < 0.07) {
      setExterior('Factory New');
    } else if (floatValue < 0.15) {
      setExterior('Minimal Wear');
    } else if (floatValue < 0.38) {
      setExterior('Field-Tested');
    } else if (floatValue < 0.45) {
      setExterior('Well-Worn');
    } else {
      setExterior('Battle-Scarred');
    }
  }, [floatValue]);
  
  // Select a skin from search results
  const handleSelectSkin = (skin: Skin) => {
    setSelectedSkin(skin);
    setSearchQuery(`${skin.weapon_type} | ${skin.name}`);
    setShowResults(false);
    
    // Pre-fill price in USD if available
    if (skin.price_usd) {
      setPriceValue(skin.price_usd.toString());
      setSelectedCurrency('USD');
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (selectedSkin && e.target.value !== `${selectedSkin.weapon_type} | ${selectedSkin.name}`) {
      setSelectedSkin(null); // Reset selected skin if search query changes
    }
  };
  
  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSkin) {
      toast.error("Please select a skin from the search results");
      return;
    }
    
    // Create new skin object with chosen currency price
    const newSkin: Skin = {
      ...selectedSkin,
      exterior,
      price_usd: selectedCurrency === 'USD' ? parseFloat(priceValue) || null : null,
      statTrak: isStatTrak,
    };
    
    // Add other currency prices if needed
    if (selectedCurrency === 'BRL') {
      newSkin.price_brl = parseFloat(priceValue) || null;
    } else if (selectedCurrency === 'CNY') {
      newSkin.price_cny = parseFloat(priceValue) || null;
    } else if (selectedCurrency === 'RUB') {
      newSkin.price_rub = parseFloat(priceValue) || null;
    }
    
    onSubmit(newSkin);
  };
  
  return (
    <ScrollArea className="max-h-[80vh] pr-4">
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="space-y-2">
          <Label htmlFor="skin-search">Skin Name</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="skin-search"
              placeholder="Search for a skin..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
            {searching && (
              <div className="absolute right-2 top-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-[100] max-h-[300px] overflow-y-auto">
                <div className="p-1">
                  {searchResults.map((skin) => (
                    <div
                      key={skin.id}
                      onClick={() => handleSelectSkin(skin)}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                    >
                      <div className="h-12 w-12 relative overflow-hidden rounded-md flex-shrink-0 border border-border/50">
                        <img
                          src={skin.image_url}
                          alt={skin.name}
                          className="h-full w-full object-cover"
                        />
                        <div className={cn(
                          "absolute inset-0 opacity-20",
                          skin.rarity === 'common' && "bg-gradient-to-br from-rarity-common/20 to-transparent",
                          skin.rarity === 'uncommon' && "bg-gradient-to-br from-rarity-uncommon/20 to-transparent",
                          skin.rarity === 'rare' && "bg-gradient-to-br from-rarity-rare/20 to-transparent",
                          skin.rarity === 'mythical' && "bg-gradient-to-br from-rarity-mythical/20 to-transparent",
                          skin.rarity === 'legendary' && "bg-gradient-to-br from-rarity-legendary/20 to-transparent",
                          skin.rarity === 'ancient' && "bg-gradient-to-br from-rarity-ancient/20 to-transparent",
                          skin.rarity === 'contraband' && "bg-gradient-to-br from-rarity-contraband/20 to-transparent",
                        )}/>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-sm truncate">{skin.name}</h4>
                          <span className="text-xs text-neon-purple font-medium">
                            {skin.price_usd ? `$${skin.price_usd.toFixed(2)}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{skin.weapon_type}</span>
                          <Badge className={cn(
                            "text-xs",
                            skin.rarity === 'common' && "bg-rarity-common text-black hover:bg-rarity-common/80",
                            skin.rarity === 'uncommon' && "bg-rarity-uncommon hover:bg-rarity-uncommon/80",
                            skin.rarity === 'rare' && "bg-rarity-rare hover:bg-rarity-rare/80",
                            skin.rarity === 'mythical' && "bg-rarity-mythical hover:bg-rarity-mythical/80",
                            skin.rarity === 'legendary' && "bg-rarity-legendary hover:bg-rarity-legendary/80",
                            skin.rarity === 'ancient' && "bg-rarity-ancient hover:bg-rarity-ancient/80",
                            skin.rarity === 'contraband' && "bg-rarity-contraband hover:bg-rarity-contraband/80 text-black",
                          )}>
                            {skin.rarity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {selectedSkin && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Skin Preview</Label>
                <div className="mt-1 relative aspect-video overflow-hidden rounded-md border border-border/50 bg-muted">
                  <img 
                    src={selectedSkin.image_url} 
                    alt={selectedSkin.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="float-value">Float Value: {floatValue.toFixed(5)}</Label>
                    <span className="text-sm font-medium">{exterior}</span>
                  </div>
                  <Slider 
                    id="float-value"
                    min={0} 
                    max={1} 
                    step={0.001}
                    value={[floatValue]} 
                    onValueChange={(values) => setFloatValue(values[0])} 
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Factory New</span>
                    <span>Minimal Wear</span>
                    <span>Field-Tested</span>
                    <span>Battle-Scarred</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="stat-trak" 
                    checked={isStatTrak}
                    onCheckedChange={setIsStatTrak}
                  />
                  <Label htmlFor="stat-trak" className="text-base cursor-pointer">
                    StatTrak™ Available
                  </Label>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Price Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5">
                        {currencySymbols[selectedCurrency]}
                      </span>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        className="pl-7"
                      />
                    </div>
                    <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="CNY">CNY (¥)</SelectItem>
                        <SelectItem value="RUB">RUB (₽)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={!selectedSkin}>Add to Inventory</Button>
        </div>
      </form>
    </ScrollArea>
  );
};

export default AddSkinForm;
