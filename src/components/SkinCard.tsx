import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UserSkin } from '@/types/skin';
import { Button } from './ui/button';
import { Edit, Trash2 } from 'lucide-react';

// Just modifying the export function to add a link to the management page
export function SkinCard({
  skin,
  showActions = true,
  onDelete,
}: {
  skin: UserSkin;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/inventory/management/${skin.collection_id}`);
  };

  return (
    <Card className="overflow-hidden">
      <div
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="relative aspect-square overflow-hidden rounded-md border border-border/50 mb-4">
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

            {skin.statTrak && (
              <Badge
                className="absolute top-2 left-2 bg-yellow-600/80 hover:bg-yellow-600 text-white"
              >
                StatTrak™
              </Badge>
            )}
          </div>
          <h2 className="text-lg font-bold mb-1">{skin.name}</h2>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{skin.weapon_type}</span>
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
        </CardContent>
      </div>
      {showActions && (
        <div className="flex items-center justify-between p-4">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete && onDelete(skin.id)}>
            <Trash2 className="mr-2 h-4 w-4" />Delete
          </Button>
        </div>
      )}
    </Card>
  );
}
