import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Loader2, 
  Filter, 
  ArrowUpDown,
  Search,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Skin, UserSkin } from '@/types/skin';
import { SkinCard } from '@/components/SkinCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddSkinForm from '@/components/AddSkinForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from '@/components/ui/pagination';
import { 
  fetchUserInventory, 
  addSkinToInventory, 
  initializeDemoInventory 
} from '@/utils/userInventory';
import { useIsMobile } from '@/hooks/use-mobile';
import AdvancedFilterDrawer, { FilterOptions } from '@/components/AdvancedFilterDrawer';
import FilterBadges from '@/components/FilterBadges';
import QuickSearchDropdown from '@/components/QuickSearchDropdown';

const Inventory = () => {
  const [skins, setSkins] = useState<UserSkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSkins, setFilteredSkins] = useState<UserSkin[]>([]);
  const isMobile = useIsMobile();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalSkins, setTotalSkins] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    inventorySource: 'all',
    rarities: [],
    minPrice: 0,
    maxPrice: 10000,
    exteriors: [],
    weaponTypes: [],
    hasStatTrak: false,
    sortBy: 'name',
    sortDirection: 'asc'
  });
  
  useEffect(() => {
    initializeDemoInventory().then(() => {
      fetchInventory(currentPage, pageSize, activeTab);
    });
  }, []);
  
  useEffect(() => {
    fetchInventory(currentPage, pageSize, activeTab);
  }, [currentPage, pageSize, activeTab]);
  
  useEffect(() => {
    applyFiltersToSkins();
  }, [searchQuery, skins, advancedFilters]);
  
  const fetchInventory = async (page: number, size: number, source: string = 'all', refreshCache: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = { search: searchQuery };
      const result = await fetchUserInventory(page, size, source, filters, refreshCache);
      
      setSkins(result.skins);
      setTotalSkins(result.count);
      setCurrentPage(result.page);
    } catch (err: any) {
      console.error("Error fetching inventory:", err);
      setError(err.message);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };
  
  const applyFiltersToSkins = () => {
    if (!skins.length) {
      setFilteredSkins([]);
      return;
    }
    
    let filtered = [...skins];
    
    // Apply text search filter
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(skin => 
        skin.name.toLowerCase().includes(lowercaseQuery) || 
        skin.weapon_type.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Apply advanced filters
    if (advancedFilters.rarities.length > 0) {
      filtered = filtered.filter(skin => advancedFilters.rarities.includes(skin.rarity));
    }
    
    if (advancedFilters.exteriors.length > 0) {
      filtered = filtered.filter(skin => advancedFilters.exteriors.includes(skin.exterior));
    }
    
    if (advancedFilters.weaponTypes.length > 0) {
      filtered = filtered.filter(skin => 
        advancedFilters.weaponTypes.some(type => 
          skin.weapon_type.toLowerCase().includes(type.toLowerCase())
        )
      );
    }
    
    if (advancedFilters.hasStatTrak) {
      filtered = filtered.filter(skin => skin.statTrak);
    }
    
    // Price filtering
    filtered = filtered.filter(skin => {
      const price = skin.price_usd || 0;
      return price >= advancedFilters.minPrice && price <= advancedFilters.maxPrice;
    });
    
    // Sorting
    filtered.sort((a, b) => {
      const sortBy = advancedFilters.sortBy as keyof UserSkin;
      const direction = advancedFilters.sortDirection === 'asc' ? 1 : -1;
      
      if (sortBy === 'price_usd') {
        const priceA = a[sortBy] || 0;
        const priceB = b[sortBy] || 0;
        return (priceA - priceB) * direction;
      }
      
      // For string comparisons
      if (typeof a[sortBy] === 'string' && typeof b[sortBy] === 'string') {
        return (a[sortBy] as string).localeCompare(b[sortBy] as string) * direction;
      }
      
      // Fallback for other types
      if (a[sortBy] < b[sortBy]) return -1 * direction;
      if (a[sortBy] > b[sortBy]) return 1 * direction;
      return 0;
    });
    
    setFilteredSkins(filtered);
  };
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page on search change
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const addSkin = async (newSkin: Skin) => {
    const result = await addSkinToInventory(newSkin, {
      acquired_date: new Date().toISOString(),
      acquisition_price: newSkin.price_usd || 0,
      currency: 'USD',
      notes: 'Added manually',
      source: 'local'
    });
    
    if (result) {
      fetchInventory(currentPage, pageSize, activeTab, true);
      setIsAddModalOpen(false);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil((totalSkins || 0) / pageSize)) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };
  
  const totalPages = Math.ceil(totalSkins / pageSize);
  
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  const handleDeleteSkin = async (id: string) => {
    try {
      toast.info("Delete functionality will be implemented soon");
      fetchInventory(currentPage, pageSize, activeTab, true);
    } catch (err: any) {
      console.error("Error deleting skin:", err);
      toast.error("Failed to delete skin");
    }
  };
  
  const handleApplyAdvancedFilters = (filters: FilterOptions) => {
    setAdvancedFilters(filters);
    setActiveTab(filters.inventorySource);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleRemoveFilter = (key: keyof FilterOptions, value?: string) => {
    setAdvancedFilters(prev => {
      const updated = { ...prev };
      
      // Handle array filters (rarities, exteriors, weaponTypes)
      if (Array.isArray(updated[key]) && value) {
        // Fix the type issue by using a proper type cast
        if (key === 'rarities') {
          updated.rarities = updated.rarities.filter(item => item !== value);
        } else if (key === 'exteriors') {
          updated.exteriors = updated.exteriors.filter(item => item !== value);
        } else if (key === 'weaponTypes') {
          updated.weaponTypes = updated.weaponTypes.filter(item => item !== value);
        }
      } 
      // Handle boolean, string, number filters
      else {
        switch (key) {
          case 'inventorySource':
            updated.inventorySource = 'all';
            break;
          case 'hasStatTrak':
            updated.hasStatTrak = false;
            break;
          case 'minPrice':
            updated.minPrice = 0;
            break;
          case 'maxPrice':
            updated.maxPrice = 10000;
            break;
          default:
            // No change needed
            break;
        }
      }
      
      return updated;
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">
              Browse, search and manage your CS2 skin collection
            </p>
            {totalSkins > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Total: {totalSkins} skins • Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
          
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Skin
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">{isMobile ? 'All' : 'All Inventory'}</TabsTrigger>
            <TabsTrigger value="steam">{isMobile ? 'Steam' : 'Steam Inventory'}</TabsTrigger>
            <TabsTrigger value="local">{isMobile ? 'Local' : 'Local Collection'}</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap items-center mb-6 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or weapon type..." 
                value={searchQuery}
                onChange={handleSearch}
                className="pl-9 w-full"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <QuickSearchDropdown onSelectSearch={handleApplyAdvancedFilters} />
              
              <Button 
                onClick={() => setIsFilterDrawerOpen(true)}
                variant="outline" 
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden md:inline">Advanced Filters</span>
              </Button>
              
              <Button variant="outline" size="icon">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <FilterBadges filters={advancedFilters} onRemoveFilter={handleRemoveFilter} />
          
          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 text-neon-purple animate-spin" />
                <span className="ml-2">Loading inventory...</span>
              </div>
            ) : filteredSkins.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">
                  {searchQuery || Object.values(advancedFilters).some(v => 
                    Array.isArray(v) ? v.length > 0 : v !== false && v !== 'all' && v !== 0 && v !== 10000
                  ) 
                    ? "No skins match your search criteria" 
                    : "No skins found in your inventory"}
                </p>
                <Button 
                  onClick={() => setIsAddModalOpen(true)} 
                  className="mt-4"
                >
                  Add Your First Skin
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredSkins.map((skin) => (
                    <SkinCard 
                      key={skin.collection_id}
                      skin={skin}
                      onDelete={handleDeleteSkin}
                    />
                  ))}
                </div>
                
                {totalSkins > pageSize && (
                  <Pagination className="my-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {getPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)} 
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] z-[9999]">
          <DialogHeader>
            <DialogTitle>Add Skin to Inventory</DialogTitle>
          </DialogHeader>
          <AddSkinForm onSubmit={addSkin} allSkins={[]} />
        </DialogContent>
      </Dialog>
      
      <AdvancedFilterDrawer 
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onApplyFilters={handleApplyAdvancedFilters}
        initialFilters={advancedFilters}
      />
      
      <footer className="border-t border-border/40 py-6 px-4 mt-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 Clutch Studio's SkinVault. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Inventory;
