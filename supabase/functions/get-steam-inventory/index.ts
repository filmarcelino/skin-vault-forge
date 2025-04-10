import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Get Supabase credentials from environment
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const steamApiKey = Deno.env.get('STEAM_API_KEY') ?? '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { steamId } = await req.json();
    
    if (!steamId) {
      throw new Error('Steam ID is required');
    }
    
    console.log(`Fetching inventory for Steam ID: ${steamId}`);
    
    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if we have a recent inventory in the database (less than 1 hour old)
    const { data: existingInventory, error: fetchError } = await supabase
      .from('inventarios')
      .select('*')
      .eq('steam_id', steamId)
      .order('timestamp', { ascending: false })
      .limit(1);
      
    if (fetchError) {
      console.error('Error fetching existing inventory:', fetchError.message);
    }
    
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // If we have a recent inventory, return it
    if (existingInventory && 
        existingInventory.length > 0 && 
        new Date(existingInventory[0].timestamp) > oneHourAgo) {
      console.log('Returning cached inventory from database');
      return new Response(
        JSON.stringify({ 
          inventory: existingInventory[0].inventario,
          fromCache: true,
          timestamp: existingInventory[0].timestamp
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Otherwise, fetch from Steam API
    console.log('Fetching inventory from Steam API');
    const steamInventoryUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;
    
    const response = await fetch(steamInventoryUrl);
    
    if (!response.ok) {
      console.error(`Steam API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch inventory from Steam: ${response.statusText}`);
    }
    
    const inventoryData = await response.json();
    
    // Get the user ID from the token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error('Error getting user:', userError?.message);
      throw new Error('Failed to authenticate user');
    }
    
    const userId = userData.user.id;
    
    // Store the inventory in the database
    const { error: insertError } = await supabase
      .from('inventarios')
      .insert({
        user_id: userId,
        steam_id: steamId,
        inventario: inventoryData
      });
      
    if (insertError) {
      console.error('Error inserting inventory:', insertError.message);
      // Continue anyway, we'll return the data from the API
    }
    
    return new Response(
      JSON.stringify({ 
        inventory: inventoryData,
        fromCache: false,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in get-steam-inventory:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
