
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Loader2, 
  Filter, 
  ArrowUpDown,
  Search,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skin, PaginatedSkins } from '@/types/skin';
import SkinCard from '@/components/SkinCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddSkinForm from '@/components/AddSkinForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious, PaginationLink } from '@/components/ui/pagination';
import { cacheSkins, getCachedSkins, getPaginationCacheKey } from '@/utils/skinCache';

const Inventory = () => {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSkins, setFilteredSkins] = useState<Skin[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalSkins, setTotalSkins] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    fetchSkins(currentPage, pageSize);
  }, [currentPage, pageSize]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSkins(skins);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = skins.filter(skin => 
        skin.name.toLowerCase().includes(lowercaseQuery) || 
        skin.weapon_type.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredSkins(filtered);
    }
  }, [searchQuery, skins]);
  
  const fetchSkins = async (page: number, size: number, refreshCache: boolean = false) => {
    try {
      setLoading(true);
      
      // Check cache first (if not forced refresh)
      const filters = { search: searchQuery, tab: activeTab };
      const cacheKey = getPaginationCacheKey(page, size, filters);
      
      if (!refreshCache) {
        const cachedData = getCachedSkins<PaginatedSkins>(cacheKey);
        if (cachedData) {
          setSkins(cachedData.skins);
          setFilteredSkins(cachedData.skins);
          setTotalSkins(cachedData.count);
          setCurrentPage(cachedData.page);
          setLoading(false);
          return;
        }
      }
      
      // Calculate pagination offset
      const from = (page - 1) * size;
      const to = from + size - 1;
      
      // Get total count first for pagination
      const { count } = await supabase
        .from('skins')
        .select('*', { count: 'exact', head: true });
      
      setTotalSkins(count || 0);
      
      // Then fetch the current page of data
      const { data, error } = await supabase
        .from('skins')
        .select('*')
        .range(from, to);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.length > 0) {
        // Transform the data to match our SkinCard component props
        const formattedSkins: Skin[] = data.map((skin) => ({
          id: skin.id,
          name: skin.name,
          weapon_type: skin.weapon_type || 'Unknown',
          image_url: skin.image_url || 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
          rarity: (skin.rarity as 'common' | 'uncommon' | 'rare' | 'mythical' | 'legendary' | 'ancient' | 'contraband') || 'common',
          exterior: skin.exterior || 'Factory New',
          price_usd: skin.price_usd,
          statTrak: Math.random() > 0.8, // Randomly assign StatTrak for now
          float: skin.float,
        }));
        
        setSkins(formattedSkins);
        setFilteredSkins(formattedSkins);
        
        // Cache the results
        const paginatedData: PaginatedSkins = {
          skins: formattedSkins,
          count: count || 0,
          page,
          pageSize: size
        };
        
        cacheSkins(cacheKey, paginatedData);
      } else {
        toast.info("No skins found in database.");
        setSkins([]);
        setFilteredSkins([]);
      }
    } catch (err: any) {
      console.error("Error fetching skins:", err);
      setError(err.message);
      toast.error("Failed to load skins");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const addSkin = (newSkin: Skin) => {
    // In a real implementation, this would save to Supabase
    setSkins(prev => [...prev, newSkin]);
    setFilteredSkins(prev => [...prev, newSkin]);
    setIsAddModalOpen(false);
    toast.success("Skin added to inventory");
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
  
  // Calculate total pages
  const totalPages = Math.ceil(totalSkins / pageSize);
  
  // Generate pagination numbers
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5; // Maximum number of page numbers to show
    
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
        
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Inventory</TabsTrigger>
            <TabsTrigger value="local">Local Collection</TabsTrigger>
            <TabsTrigger value="steam">Steam Inventory</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center mb-6 gap-2">
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
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
          
          <TabsContent value="all" className="mt-0">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 text-neon-purple animate-spin" />
                <span className="ml-2">Loading inventory...</span>
              </div>
            ) : filteredSkins.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">No skins found</p>
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
                      key={skin.id}
                      name={skin.name}
                      weaponType={skin.weapon_type}
                      image={skin.image_url}
                      rarity={skin.rarity}
                      wear={skin.exterior}
                      price={skin.price_usd ? `$${skin.price_usd.toFixed(2)}` : 'N/A'}
                      statTrak={skin.statTrak}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
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
          
          <TabsContent value="local" className="mt-0">
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Your local collection will appear here</p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4"
              >
                Add Skin to Local Collection
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="steam" className="mt-0">
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Connect your Steam account to view your inventory</p>
              <Button variant="outline" className="mt-4">
                Connect Steam
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Add Skin Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Skin to Inventory</DialogTitle>
          </DialogHeader>
          <AddSkinForm onSubmit={addSkin} allSkins={skins} />
        </DialogContent>
      </Dialog>
      
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
