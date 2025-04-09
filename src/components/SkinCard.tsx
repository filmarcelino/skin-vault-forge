
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SkinCardProps {
  name: string;
  weaponType: string;
  image: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythical' | 'legendary' | 'ancient' | 'contraband';
  wear?: string;
  price: string;
  statTrak?: boolean;
}

const SkinCard: React.FC<SkinCardProps> = ({
  name,
  weaponType,
  image,
  rarity,
  wear = 'Factory New',
  price,
  statTrak = false,
}) => {
  return (
    <Card className="group overflow-hidden border-border/50 bg-card/50 transition-all duration-300 hover:border-neon-purple/60 hover:shadow-[0_0_15px_rgba(155,135,245,0.2)] relative">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={cn(
          "absolute inset-0 opacity-20",
          rarity === 'common' && "bg-gradient-to-br from-rarity-common/20 to-transparent",
          rarity === 'uncommon' && "bg-gradient-to-br from-rarity-uncommon/20 to-transparent",
          rarity === 'rare' && "bg-gradient-to-br from-rarity-rare/20 to-transparent",
          rarity === 'mythical' && "bg-gradient-to-br from-rarity-mythical/20 to-transparent",
          rarity === 'legendary' && "bg-gradient-to-br from-rarity-legendary/20 to-transparent",
          rarity === 'ancient' && "bg-gradient-to-br from-rarity-ancient/20 to-transparent",
          rarity === 'contraband' && "bg-gradient-to-br from-rarity-contraband/20 to-transparent",
        )}/>
        
        {statTrak && (
          <Badge 
            className="absolute top-2 left-2 bg-yellow-600/80 hover:bg-yellow-600 text-white"
          >
            StatTrak™
          </Badge>
        )}
        
        <Badge 
          className={cn(
            "absolute top-2 right-2",
            rarity === 'common' && "bg-rarity-common text-black hover:bg-rarity-common/80",
            rarity === 'uncommon' && "bg-rarity-uncommon hover:bg-rarity-uncommon/80",
            rarity === 'rare' && "bg-rarity-rare hover:bg-rarity-rare/80",
            rarity === 'mythical' && "bg-rarity-mythical hover:bg-rarity-mythical/80",
            rarity === 'legendary' && "bg-rarity-legendary hover:bg-rarity-legendary/80",
            rarity === 'ancient' && "bg-rarity-ancient hover:bg-rarity-ancient/80",
            rarity === 'contraband' && "bg-rarity-contraband hover:bg-rarity-contraband/80 text-black",
          )}
        >
          {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-medium truncate mr-2">{name}</h3>
          <span className="text-neon-purple font-semibold shrink-0">{price}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{weaponType}</span>
          <span>{wear}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkinCard;
