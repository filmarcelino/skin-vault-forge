
import { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2 } from "lucide-react";

interface SkinGridProps {
  inventory: any;
}

interface ProcessedItem {
  name: string;
  classid: string;
  instanceid: string;
  icon_url: string;
  rarity: string;
  rarityColor: string;
  type: string;
  marketable: boolean;
  tradable: boolean;
  assetid: string;
}

const SkinGrid = ({ inventory }: SkinGridProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Process inventory data to get usable items
  const processedItems = useMemo(() => {
    setIsLoading(true);
    try {
      const { assets = [], descriptions = [] } = inventory;
      
      // Map assets to descriptions to get complete item data
      const items: ProcessedItem[] = assets.map((asset: any) => {
        const description = descriptions.find((desc: any) => 
          desc.classid === asset.classid && desc.instanceid === asset.instanceid
        );
        
        if (!description) return null;
        
        // Find rarity tag
        let rarity = 'Common';
        let rarityColor = 'bg-gray-500';
        let type = 'Other';
        
        if (description.tags) {
          const rarityTag = description.tags.find((tag: any) => tag.category === 'Rarity');
          if (rarityTag) {
            rarity = rarityTag.name;
            
            // Set color based on rarity
            switch (rarity) {
              case 'Consumer Grade':
                rarityColor = 'bg-gray-500';
                break;
              case 'Industrial Grade':
                rarityColor = 'bg-blue-500';
                break;
              case 'Mil-Spec Grade':
                rarityColor = 'bg-blue-600';
                break;
              case 'Restricted':
                rarityColor = 'bg-purple-500';
                break;
              case 'Classified':
                rarityColor = 'bg-pink-500';
                break;
              case 'Covert':
                rarityColor = 'bg-red-500';
                break;
              case 'Contraband':
                rarityColor = 'bg-yellow-500';
                break;
              default:
                rarityColor = 'bg-gray-500';
            }
          }
          
          const typeTag = description.tags.find((tag: any) => tag.category === 'Type');
          if (typeTag) {
            type = typeTag.name;
          }
        }
        
        return {
          name: description.name || 'Unknown Item',
          classid: description.classid,
          instanceid: description.instanceid,
          icon_url: description.icon_url,
          rarity: rarity,
          rarityColor: rarityColor,
          type: type,
          marketable: description.marketable === 1,
          tradable: description.tradable === 1,
          assetid: asset.assetid
        };
      }).filter(Boolean);
      
      return items;
    } catch (error) {
      console.error('Error processing inventory items:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [inventory]);
  
  // Get unique rarities for filter
  const rarities = useMemo(() => {
    const uniqueRarities = new Set<string>();
    processedItems.forEach(item => uniqueRarities.add(item.rarity));
    return Array.from(uniqueRarities).sort();
  }, [processedItems]);
  
  // Get unique types for filter
  const types = useMemo(() => {
    const uniqueTypes = new Set<string>();
    processedItems.forEach(item => uniqueTypes.add(item.type));
    return Array.from(uniqueTypes).sort();
  }, [processedItems]);
  
  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return processedItems.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Rarity filter
      const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
      
      // Type filter
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      
      return matchesSearch && matchesRarity && matchesType;
    });
  }, [processedItems, searchQuery, rarityFilter, typeFilter]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Processing inventory items...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={rarityFilter} onValueChange={setRarityFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by rarity" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="all">All Rarities</SelectItem>
            {rarities.map(rarity => (
              <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="all">All Types</SelectItem>
            {types.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing {filteredItems.length} of {processedItems.length} items
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p>No items match your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <Card key={`${item.classid}-${item.instanceid}-${item.assetid}`} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="p-0">
                <div className="relative h-36 bg-gray-100 flex items-center justify-center">
                  <img 
                    src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}/330x192`} 
                    alt={item.name}
                    className="max-h-full max-w-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className={`absolute top-0 right-0 m-2 h-2 w-2 rounded-full ${item.rarityColor}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className={`${item.rarityColor} text-white text-xs`}>
                    {item.rarity}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                {item.type}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkinGrid;
