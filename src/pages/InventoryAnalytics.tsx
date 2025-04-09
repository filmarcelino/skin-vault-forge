
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays } from 'date-fns';
import { fetchUserInventory, getUserInventoryStats } from '@/utils/userInventory';
import { UserSkin } from '@/types/skin';
import { ChevronDown, ChevronUp, Clock, TrendingUp, Coins, ShieldCheck } from 'lucide-react';
import { SkinCard } from '@/components/SkinCard';

const InventoryAnalytics = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  
  // Fetch user inventory data
  const { data: inventoryData } = useQuery({
    queryKey: ['userInventory'],
    queryFn: () => fetchUserInventory(1, 1000, 'all'),
  });
  
  // Fetch inventory stats
  const { data: inventoryStats } = useQuery({
    queryKey: ['inventoryStats'],
    queryFn: getUserInventoryStats,
  });
  
  // Value formatting helper
  const formatCurrencyValue = (value: number): string => {
    switch (selectedCurrency) {
      case 'USD':
        return `$${value.toFixed(2)}`;
      case 'BRL':
        return `R$${value.toFixed(2)}`;
      case 'CNY':
        return `¥${value.toFixed(2)}`;
      case 'RUB':
        return `₽${value.toFixed(2)}`;
      default:
        return `$${value.toFixed(2)}`;
    }
  };
  
  // Prepare data for charts
  const rarityData = usePrepareRarityData(inventoryData?.skins || []);
  const typeData = usePrepareTypeData(inventoryData?.skins || []);
  const valueData = usePrepareValueData(inventoryData?.skins || []);
  const recentAdditions = usePrepareRecentAdditions(inventoryData?.skins || []);
  const oldestItems = usePrepareOldestItems(inventoryData?.skins || []);
  const highestValueItems = usePrepareHighestValueItems(inventoryData?.skins || [], selectedCurrency);
  
  // Rarity colors for charts
  const rarityColors = {
    common: '#B0C3D9',
    uncommon: '#5E98D9',
    rare: '#4B69FF',
    mythical: '#8847FF',
    legendary: '#D32CE6',
    ancient: '#EB4B4B',
    contraband: '#FFCC00'
  };
  
  const typeColors = {
    'Rifle': '#4B69FF',
    'Pistol': '#D32CE6',
    'SMG': '#8847FF',
    'Shotgun': '#EB4B4B',
    'Sniper Rifle': '#5E98D9',
    'Knife': '#FFCC00',
    'Gloves': '#32CD32',
    'Case': '#B0C3D9',
    'Sticker': '#FF6347',
    'Other': '#A0A0A0'
  };
  
  // Chart configurations
  const chartConfig = {
    rarity: {
      common: { label: 'Common', theme: { light: '#B0C3D9', dark: '#B0C3D9' } },
      uncommon: { label: 'Uncommon', theme: { light: '#5E98D9', dark: '#5E98D9' } },
      rare: { label: 'Rare', theme: { light: '#4B69FF', dark: '#4B69FF' } },
      mythical: { label: 'Mythical', theme: { light: '#8847FF', dark: '#8847FF' } },
      legendary: { label: 'Legendary', theme: { light: '#D32CE6', dark: '#D32CE6' } },
      ancient: { label: 'Ancient', theme: { light: '#EB4B4B', dark: '#EB4B4B' } },
      contraband: { label: 'Contraband', theme: { light: '#FFCC00', dark: '#FFCC00' } },
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Inventory Analytics</h2>
          <p className="text-muted-foreground">
            View insights and statistics about your skin collection
          </p>
        </div>

        {/* Currency Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Display values in:</span>
          <Tabs
            defaultValue="USD"
            value={selectedCurrency}
            onValueChange={setSelectedCurrency}
            className="w-[200px]"
          >
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="USD">USD</TabsTrigger>
              <TabsTrigger value="BRL">BRL</TabsTrigger>
              <TabsTrigger value="CNY">CNY</TabsTrigger>
              <TabsTrigger value="RUB">RUB</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Inventory Value
              </CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryStats ? formatCurrencyValue(inventoryStats.total.value) : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {inventoryStats ? `${inventoryStats.total.count} items` : ''}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Local Inventory Value
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryStats ? formatCurrencyValue(inventoryStats.local.value) : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {inventoryStats ? `${inventoryStats.local.count} items` : ''}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Steam Inventory Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryStats ? formatCurrencyValue(inventoryStats.steam.value) : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {inventoryStats ? `${inventoryStats.steam.count} items` : ''}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Item Value
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryStats && inventoryStats.total.count > 0 
                  ? formatCurrencyValue(inventoryStats.total.value / inventoryStats.total.count) 
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Per item average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribution Charts */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Distribution by Rarity</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                <ChartContainer config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={rarityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label
                    >
                      {rarityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={rarityColors[entry.name as keyof typeof rarityColors]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Distribution by Type</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" nameKey="name">
                      {typeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={typeColors[entry.name as keyof typeof typeColors] || '#A0A0A0'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Value Over Time</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={valueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Item Lists */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          {/* Highest Valued Items */}
          <Card>
            <CardHeader>
              <CardTitle>Highest Valued Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highestValueItems.slice(0, 5).map((skin) => (
                  <div key={skin.collection_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <img
                          src={skin.image_url}
                          alt={skin.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{skin.name}</p>
                        <p className="text-xs text-muted-foreground">{skin.weapon_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrencyValue(getSkinValueByCurrency(skin, selectedCurrency) || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Additions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Additions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAdditions.slice(0, 5).map((skin) => (
                  <div key={skin.collection_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <img
                          src={skin.image_url}
                          alt={skin.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{skin.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {skin.acquired_date ? format(new Date(skin.acquired_date), 'MMM d, yyyy') : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrencyValue(getSkinValueByCurrency(skin, selectedCurrency) || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Oldest Items */}
          <Card>
            <CardHeader>
              <CardTitle>Oldest Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {oldestItems.slice(0, 5).map((skin) => (
                  <div key={skin.collection_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <img
                          src={skin.image_url}
                          alt={skin.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{skin.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {skin.acquired_date ? format(new Date(skin.acquired_date), 'MMM d, yyyy') : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrencyValue(getSkinValueByCurrency(skin, selectedCurrency) || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Helper functions to prepare chart data
function usePrepareRarityData(skins: UserSkin[]) {
  return [
    { name: 'common', value: skins.filter(skin => skin.rarity === 'common').length },
    { name: 'uncommon', value: skins.filter(skin => skin.rarity === 'uncommon').length },
    { name: 'rare', value: skins.filter(skin => skin.rarity === 'rare').length },
    { name: 'mythical', value: skins.filter(skin => skin.rarity === 'mythical').length },
    { name: 'legendary', value: skins.filter(skin => skin.rarity === 'legendary').length },
    { name: 'ancient', value: skins.filter(skin => skin.rarity === 'ancient').length },
    { name: 'contraband', value: skins.filter(skin => skin.rarity === 'contraband').length },
  ].filter(item => item.value > 0);
}

function usePrepareTypeData(skins: UserSkin[]) {
  // Group skins by weapon type
  const typeGroups: Record<string, number> = {};
  
  skins.forEach(skin => {
    const type = skin.weapon_type || 'Other';
    typeGroups[type] = (typeGroups[type] || 0) + 1;
  });
  
  return Object.entries(typeGroups).map(([name, value]) => ({ name, value }));
}

function usePrepareValueData(skins: UserSkin[]) {
  // Create acquisition date-based value chart
  const sortedSkins = [...skins].filter(skin => skin.acquired_date).sort((a, b) => {
    return new Date(a.acquired_date || '').getTime() - new Date(b.acquired_date || '').getTime();
  });
  
  const valueMap: Record<string, number> = {};
  let cumulativeValue = 0;
  
  sortedSkins.forEach(skin => {
    if (skin.acquired_date) {
      const date = format(new Date(skin.acquired_date), 'yyyy-MM-dd');
      cumulativeValue += skin.price_usd || 0;
      valueMap[date] = cumulativeValue;
    }
  });
  
  return Object.entries(valueMap).map(([date, value]) => ({ date, value }));
}

function usePrepareRecentAdditions(skins: UserSkin[]) {
  return [...skins]
    .filter(skin => skin.acquired_date)
    .sort((a, b) => {
      return new Date(b.acquired_date || '').getTime() - new Date(a.acquired_date || '').getTime();
    });
}

function usePrepareOldestItems(skins: UserSkin[]) {
  return [...skins]
    .filter(skin => skin.acquired_date)
    .sort((a, b) => {
      return new Date(a.acquired_date || '').getTime() - new Date(b.acquired_date || '').getTime();
    });
}

function usePrepareHighestValueItems(skins: UserSkin[], currency: string) {
  return [...skins].sort((a, b) => {
    const valueA = getSkinValueByCurrency(a, currency) || 0;
    const valueB = getSkinValueByCurrency(b, currency) || 0;
    return valueB - valueA;
  });
}

// Helper to get skin value based on selected currency
function getSkinValueByCurrency(skin: UserSkin, currency: string): number | null {
  switch (currency) {
    case 'USD':
      return skin.price_usd;
    case 'BRL':
      return skin.price_brl;
    case 'CNY':
      return skin.price_cny;
    case 'RUB':
      return skin.price_rub;
    default:
      return skin.price_usd;
  }
}

export default InventoryAnalytics;
