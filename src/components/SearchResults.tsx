
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skin } from '@/types/skin';
import SkinDetailsModal from './SkinDetailsModal';

interface SearchResultsProps {
  results: Skin[];
  isLoading: boolean;
  onSelect: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, isLoading, onSelect }) => {
  const [selectedSkin, setSelectedSkin] = React.useState<Skin | null>(null);

  const handleSelectSkin = (skin: Skin) => {
    setSelectedSkin(skin);
    onSelect();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-neon-purple mr-2" />
        <span>Searching...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No matching skins found
      </div>
    );
  }

  return (
    <>
      <div className="p-1">
        {results.map((skin) => (
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

      {/* Skin Details Modal with increased z-index */}
      {selectedSkin && (
        <div className="z-[99999]">
          <SkinDetailsModal
            skin={selectedSkin}
            isOpen={!!selectedSkin}
            onClose={() => setSelectedSkin(null)}
          />
        </div>
      )}
    </>
  );
};

export default SearchResults;
