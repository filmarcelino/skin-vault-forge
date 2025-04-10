
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ShoppingBag, 
  DollarSign, 
  Award,
  Star
} from "lucide-react";

interface InventorySummaryProps {
  inventory: any;
}

const InventorySummary = ({ inventory }: InventorySummaryProps) => {
  // Process inventory data to get summary stats
  const getInventoryStats = () => {
    try {
      const { assets = [], descriptions = [] } = inventory;
      
      // Total number of items
      const totalItems = assets.length;
      
      // Map assets to descriptions to get complete item data
      const items = assets.map((asset: any) => {
        const description = descriptions.find((desc: any) => 
          desc.classid === asset.classid && desc.instanceid === asset.instanceid
        );
        return { ...asset, ...description };
      });
      
      // Count by rarity
      const rarityMap: Record<string, number> = {};
      items.forEach((item: any) => {
        if (item.tags) {
          const rarityTag = item.tags.find((tag: any) => tag.category === 'Rarity');
          if (rarityTag) {
            rarityMap[rarityTag.name] = (rarityMap[rarityTag.name] || 0) + 1;
          }
        }
      });
      
      // Find rarest item (highest rarity with lowest count)
      const rarityOrder = [
        'Consumer Grade', 
        'Industrial Grade', 
        'Mil-Spec Grade', 
        'Restricted', 
        'Classified', 
        'Covert', 
        'Contraband'
      ];
      
      let mostValuableItem = null;
      items.forEach((item: any) => {
        if (item.marketable && (!mostValuableItem || getItemRarityIndex(item) > getItemRarityIndex(mostValuableItem))) {
          mostValuableItem = item;
        }
      });
      
      return {
        totalItems,
        itemsByRarity: rarityMap,
        mostValuableItem
      };
    } catch (error) {
      console.error('Error calculating inventory stats:', error);
      return {
        totalItems: 0,
        itemsByRarity: {},
        mostValuableItem: null
      };
    }
  };
  
  const getItemRarityIndex = (item: any) => {
    const rarityOrder = [
      'Consumer Grade', 
      'Industrial Grade', 
      'Mil-Spec Grade', 
      'Restricted', 
      'Classified', 
      'Covert', 
      'Contraband'
    ];
    
    if (item.tags) {
      const rarityTag = item.tags.find((tag: any) => tag.category === 'Rarity');
      if (rarityTag) {
        return rarityOrder.indexOf(rarityTag.name);
      }
    }
    return -1;
  };
  
  const stats = getInventoryStats();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">Total Items</CardTitle>
          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
          <CardDescription>Items in your inventory</CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">Rare Items</CardTitle>
          <Star className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.itemsByRarity['Classified'] || 0} / {stats.itemsByRarity['Covert'] || 0}
          </div>
          <CardDescription>Classified / Covert items</CardDescription>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">Most Valuable</CardTitle>
          <Award className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {stats.mostValuableItem ? (
            <>
              <div className="text-lg font-medium truncate">
                {stats.mostValuableItem.name}
              </div>
              <CardDescription>
                {stats.mostValuableItem.tags?.find((tag: any) => tag.category === 'Rarity')?.name || 'Unknown rarity'}
              </CardDescription>
            </>
          ) : (
            <CardDescription>No marketable items found</CardDescription>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventorySummary;
