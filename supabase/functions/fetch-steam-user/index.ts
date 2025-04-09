
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Steam API key from environment variables
    const steamApiKey = Deno.env.get('STEAM_API_KEY');
    
    if (!steamApiKey) {
      throw new Error('STEAM_API_KEY is not configured in Supabase');
    }
    
    // Parse request body to get the Steam ID
    const { steamId } = await req.json();
    
    if (!steamId) {
      throw new Error('No Steam ID provided');
    }
    
    // Call the Steam API to get player details
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return the player data
    if (data?.response?.players?.length > 0) {
      return new Response(
        JSON.stringify(data.response.players[0]),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      throw new Error('Steam user not found');
    }
  } catch (error) {
    console.error('Error in fetch-steam-user:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
