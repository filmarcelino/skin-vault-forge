// fetch-cs2-skins/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map CS2 API rarity to our database rarity format
const mapRarity = (rarity: string): string => {
  const rarityMap: Record<string, string> = {
    'Consumer Grade': 'common',
    'Industrial Grade': 'uncommon',
    'Mil-Spec Grade': 'rare',
    'Restricted': 'mythical',
    'Classified': 'legendary',
    'Covert': 'ancient',
    'Contraband': 'contraband',
    // Default fallback
    'Base Grade': 'common',
  };
  
  return rarityMap[rarity] || 'common';
};

// Process skins data from API to match our database schema
const processSkinData = (skins: any[]): any[] => {
  return skins.map(skin => ({
    name: skin.name,
    weapon_type: skin.weapon, 
    image_url: skin.image,
    rarity: mapRarity(skin.rarity),
    // Keeping default null values for the prices and float as they're not in the API
    price_usd: null,
    price_brl: null,
    price_cny: null,
    price_rub: null,
    float: null,
    exterior: null,
  }));
};

// Handle batching for large datasets
const batchInsert = async (supabase: any, items: any[], batchSize = 500) => {
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  
  let insertedCount = 0;
  console.log(`Inserting ${items.length} items in ${batches.length} batches...`);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const { error } = await supabase
      .from('skins')
      .insert(batch);
    
    if (error) {
      throw new Error(`Error inserting batch ${i + 1}: ${error.message}`);
    }
    
    insertedCount += batch.length;
    console.log(`Progress: ${insertedCount}/${items.length} skins inserted (${Math.round(insertedCount / items.length * 100)}%)`);
  }
  
  return insertedCount;
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Fetching skins data from ByMykel API...');
    const response = await fetch('https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch skins: ${response.statusText}`);
    }
    
    const skinsData = await response.json();
    console.log(`Fetched ${skinsData.length} skins from API`);
    
    // First check if we already have skins in the database
    const { count } = await supabase
      .from('skins')
      .select('*', { count: 'exact', head: true });
      
    if (count && count > 0) {
      console.log(`Found ${count} existing skins in database`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Database already contains ${count} skins. No import needed.`,
          existing_count: count
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // Process the data to match our schema
    const processedSkins = processSkinData(skinsData);
    
    console.log(`Processed ${processedSkins.length} skins, now inserting into database in batches...`);
    
    // Insert data in batches to avoid timeout/memory issues
    const insertedCount = await batchInsert(supabase, processedSkins);
    
    console.log(`Successfully inserted ${insertedCount} skins into the database`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Imported ${insertedCount} skins`,
        imported_count: insertedCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('Error in fetch-cs2-skins:', error.message);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
