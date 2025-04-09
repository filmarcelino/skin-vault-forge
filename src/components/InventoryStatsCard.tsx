
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InventoryStatsCardProps {
  title: string;
  skinCount: number;
  totalValue: number | null;
  currency?: string;
  className?: string;
  icon?: React.ReactNode;
}

const InventoryStatsCard: React.FC<InventoryStatsCardProps> = ({
  title,
  skinCount,
  totalValue,
  currency = '$',
  className,
  icon
}) => {
  return (
    <Card className={cn("bg-card/50 transition-all hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Number of skins:</span>
            <span className="font-medium">{skinCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Total estimated value:</span>
            <span className="font-medium text-neon-purple">
              {totalValue !== null ? `${currency}${totalValue.toFixed(2)}` : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryStatsCard;
