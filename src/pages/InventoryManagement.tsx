
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Edit, Trash2, ArrowLeft, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/Navbar';
import { UserSkin } from '@/types/skin';
import { supabase } from '@/integrations/supabase/client';

const InventoryManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    acquired_date: '',
    acquisition_type: 'purchase',
    acquisition_price: 0,
    currency: 'USD',
    notes: '',
  });

  // Fetch the skin details using the ID
  const { data: skin, isLoading, error } = useQuery({
    queryKey: ['userSkin', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_collections')
        .select(`
          *,
          skins(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Format the response to match our UserSkin type
      const userSkin: UserSkin = {
        collection_id: data.id,
        id: data.skins.id,
        name: data.skins.name,
        weapon_type: data.skins.weapon_type || 'Unknown',
        image_url: data.skins.image_url || 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
        rarity: (data.skins.rarity as any) || 'common',
        exterior: data.skins.exterior || 'Factory New',
        price_usd: data.skins.price_usd,
        price_brl: data.skins.price_brl,
        price_cny: data.skins.price_cny,
        price_rub: data.skins.price_rub,
        statTrak: false,
        float: data.skins.float,
        acquired_date: data.acquired_date,
        acquisition_price: data.acquisition_price,
        currency: data.currency,
        notes: data.notes
      };

      // Initialize form data
      setFormData({
        acquired_date: data.acquired_date ? new Date(data.acquired_date).toISOString().split('T')[0] : '',
        acquisition_type: 'purchase', // Default value since we don't have this field yet
        acquisition_price: data.acquisition_price || 0,
        currency: data.currency || 'USD',
        notes: data.notes || '',
      });

      return userSkin;
    },
    enabled: !!id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('user_collections')
        .update({
          acquired_date: formData.acquired_date,
          acquisition_price: parseFloat(formData.acquisition_price.toString()),
          currency: formData.currency,
          notes: formData.notes,
        })
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      toast.success('Skin details updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('Error updating skin:', error);
      toast.error('Failed to update skin details');
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      
      toast.success('Skin removed from inventory');
      navigate('/inventory');
    } catch (error) {
      console.error('Error deleting skin:', error);
      toast.error('Failed to delete skin');
    }
  };

  const handleMoveInventory = async () => {
    // This is a placeholder for moving between Steam and Local inventory
    // In a real app, you would have a source field in the database
    toast.success('Moved skin between inventories');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl py-6">
          <div className="flex justify-center items-center h-[70vh]">
            <p>Loading skin details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !skin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl py-6">
          <div className="flex justify-center items-center h-[70vh] flex-col gap-4">
            <p>Error loading skin details. The skin might not exist.</p>
            <Button onClick={() => navigate('/inventory')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-4xl py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/inventory')} 
              className="mr-3"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
          </div>
          {!editMode ? (
            <Button onClick={() => setEditMode(true)} className="flex items-center">
              <Edit className="mr-2 h-4 w-4" /> Edit Details
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skin Image & Basic Details */}
          <div className="md:col-span-1">
            <Card>
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
                <div className="flex justify-between items-center mb-2">
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
                <div className="text-sm">
                  <p><strong>Exterior:</strong> {skin.exterior}</p>
                  {skin.float && <p><strong>Float:</strong> {skin.float.toFixed(8)}</p>}
                </div>
                
                <Tabs defaultValue="usd" className="mt-4">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="usd">USD</TabsTrigger>
                    <TabsTrigger value="brl">BRL</TabsTrigger>
                    <TabsTrigger value="cny">CNY</TabsTrigger>
                    <TabsTrigger value="rub">RUB</TabsTrigger>
                  </TabsList>
                  <TabsContent value="usd">
                    <div className="p-3 border border-border rounded-md mt-2">
                      <p className="text-sm text-muted-foreground">Market Price</p>
                      <p className="font-medium text-neon-purple">{skin.price_usd ? `$${skin.price_usd.toFixed(2)}` : 'N/A'}</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="brl">
                    <div className="p-3 border border-border rounded-md mt-2">
                      <p className="text-sm text-muted-foreground">Market Price</p>
                      <p className="font-medium text-neon-purple">{skin.price_brl ? `R$${skin.price_brl.toFixed(2)}` : 'N/A'}</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="cny">
                    <div className="p-3 border border-border rounded-md mt-2">
                      <p className="text-sm text-muted-foreground">Market Price</p>
                      <p className="font-medium text-neon-purple">{skin.price_cny ? `¥${skin.price_cny.toFixed(2)}` : 'N/A'}</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="rub">
                    <div className="p-3 border border-border rounded-md mt-2">
                      <p className="text-sm text-muted-foreground">Market Price</p>
                      <p className="font-medium text-neon-purple">{skin.price_rub ? `₽${skin.price_rub.toFixed(2)}` : 'N/A'}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Editable Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Skin Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="acquired_date">Acquisition Date</Label>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="acquired_date"
                        name="acquired_date"
                        type="date"
                        value={formData.acquired_date}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="acquisition_type">Acquisition Type</Label>
                    <Select 
                      disabled={!editMode} 
                      value={formData.acquisition_type} 
                      onValueChange={(value) => handleSelectChange('acquisition_type', value)}
                    >
                      <SelectTrigger id="acquisition_type" className="w-full">
                        <SelectValue placeholder="Select acquisition type" />
                      </SelectTrigger>
                      <SelectContent className="z-[99999] bg-background">
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="trade">Trade</SelectItem>
                        <SelectItem value="gift">Gift</SelectItem>
                        <SelectItem value="drop">Drop</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="acquisition_price">Acquisition Price</Label>
                      <Input 
                        id="acquisition_price"
                        name="acquisition_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.acquisition_price}
                        onChange={handleChange}
                        disabled={!editMode}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        disabled={!editMode} 
                        value={formData.currency} 
                        onValueChange={(value) => handleSelectChange('currency', value)}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="z-[99999] bg-background">
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="BRL">BRL (R$)</SelectItem>
                          <SelectItem value="CNY">CNY (¥)</SelectItem>
                          <SelectItem value="RUB">RUB (₽)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="Add any notes or tags for this skin"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleMoveInventory}
                      >
                        <ArrowLeftRight className="mr-2 h-4 w-4" /> 
                        Move to {skin.notes?.includes("steam") ? "Local" : "Steam"} Inventory
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={handleDelete}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove from Inventory
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
