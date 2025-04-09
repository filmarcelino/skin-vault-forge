
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

const CategoryTabs: React.FC = () => {
  return (
    <div className="w-full overflow-auto pb-2 scrollbar-none">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-flow-col justify-start gap-2 overflow-auto scrollbar-none p-1 h-auto">
          <TabsTrigger value="all" className="rounded-full px-4">All Items</TabsTrigger>
          <TabsTrigger value="rifles" className="rounded-full px-4">Rifles</TabsTrigger>
          <TabsTrigger value="smgs" className="rounded-full px-4">SMGs</TabsTrigger>
          <TabsTrigger value="pistols" className="rounded-full px-4">Pistols</TabsTrigger>
          <TabsTrigger value="knives" className="rounded-full px-4">Knives</TabsTrigger>
          <TabsTrigger value="gloves" className="rounded-full px-4">Gloves</TabsTrigger>
          <TabsTrigger value="agents" className="rounded-full px-4">Agents</TabsTrigger>
          <TabsTrigger value="stickers" className="rounded-full px-4">Stickers</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CategoryTabs;
