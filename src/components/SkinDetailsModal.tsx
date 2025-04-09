
import React from 'react';
import { Skin } from '@/types/skin';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkinDetailsModalProps {
  skin: Skin | null;
  isOpen: boolean;
  onClose: () => void;
}

const SkinDetailsModal: React.FC<SkinDetailsModalProps> = ({ skin, isOpen, onClose }) => {
  if (!skin) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <span>{skin.name}</span>
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
              {skin.rarity.charAt(0).toUpperCase() + skin.rarity.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Skin Image */}
          <div className="relative aspect-video overflow-hidden rounded-md border border-border/50">
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
          
          {/* Skin Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Weapon Type</p>
                <p className="font-medium">{skin.weapon_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Exterior</p>
                <p className="font-medium">{skin.exterior}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Rarity</p>
                <p className="font-medium capitalize">{skin.rarity}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">StatTrak™</p>
                <p className="font-medium">{skin.statTrak ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            {/* Price Information */}
            <div className="pt-2">
              <h3 className="text-lg font-medium mb-2">Price Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 p-3 border border-border rounded-md">
                  <p className="text-sm text-muted-foreground">USD</p>
                  <p className="font-medium text-neon-purple">
                    {skin.price_usd ? `$${skin.price_usd.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                
                <div className="space-y-1 p-3 border border-border rounded-md">
                  <p className="text-sm text-muted-foreground">Steam Market</p>
                  <p className="font-medium">
                    {skin.price_usd ? `$${(skin.price_usd * 0.95).toFixed(2)}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkinDetailsModal;
