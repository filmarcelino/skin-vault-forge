
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlidersHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const FilterBar: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="w-full py-4 flex flex-wrap gap-2 md:gap-4 items-center justify-between">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Collection</h2>
        <span className="text-sm text-muted-foreground">(145 items)</span>
      </div>
      
      <div className="flex flex-wrap gap-2 md:gap-4 items-center">
        {!isMobile && (
          <>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Weapon Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weapons</SelectItem>
                <SelectItem value="rifle">Rifles</SelectItem>
                <SelectItem value="smg">SMGs</SelectItem>
                <SelectItem value="pistol">Pistols</SelectItem>
                <SelectItem value="knife">Knives</SelectItem>
                <SelectItem value="glove">Gloves</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Consumer Grade</SelectItem>
                <SelectItem value="uncommon">Industrial Grade</SelectItem>
                <SelectItem value="rare">Mil-Spec</SelectItem>
                <SelectItem value="mythical">Restricted</SelectItem>
                <SelectItem value="legendary">Classified</SelectItem>
                <SelectItem value="ancient">Covert</SelectItem>
                <SelectItem value="contraband">Contraband</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                <SelectItem value="clutch">Clutch Case</SelectItem>
                <SelectItem value="gamma">Gamma Case</SelectItem>
                <SelectItem value="chroma">Chroma Case</SelectItem>
                <SelectItem value="operation">Operation Cases</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
        
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {isMobile ? "Filters" : "More Filters"}
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
