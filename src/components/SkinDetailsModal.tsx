
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skin } from '@/types/skin';
import { ShoppingCart, Heart } from 'lucide-react';

interface SkinDetailsModalProps {
  skin: Skin;
  isOpen: boolean;
  onClose: () => void;
}

const SkinDetailsModal: React.FC<SkinDetailsModalProps> = ({
  skin,
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex justify-between items-center">
            <span>{skin.name}</span>
            <Badge className={cn(
              "ml-2",
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
          </DialogTitle>
          <DialogDescription className="flex justify-between">
            <span>{skin.weapon_type}</span>
            <span>{skin.exterior || "Factory New"}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative aspect-video w-full overflow-hidden rounded-md border border-border/50 mb-4">
          <img
            src={skin.image_url}
            alt={skin.name}
            className="h-full w-full object-contain"
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
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Price:</div>
            <div className="text-2xl font-bold text-neon-purple">
              {skin.price_usd ? `$${skin.price_usd.toFixed(2)}` : 'N/A'}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">StatTrak™:</div>
            <div className="text-base">
              {skin.statTrak ? (
                <Badge variant="outline" className="bg-yellow-600/30 text-yellow-200 border-yellow-600">
                  StatTrak™ Available
                </Badge>
              ) : (
                "Not Available"
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between gap-2">
          <Button variant="outline">
            <Heart className="mr-2 h-4 w-4" />
            Add to Wishlist
          </Button>
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SkinDetailsModal;
