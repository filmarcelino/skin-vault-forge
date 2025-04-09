
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
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
    const { steamId } = await req.json();
    
    if (!steamId) {
      return new Response(
        JSON.stringify({ error: 'Steam ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get the Steam API key from environment variables
    const steamApiKey = Deno.env.get('STEAM_API_KEY');
    
    if (!steamApiKey) {
      console.error('Missing Steam API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Call Steam API to get user data
    const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamId}`;
    const steamResponse = await fetch(steamApiUrl);
    const steamData = await steamResponse.json();

    if (!steamResponse.ok || !steamData?.response?.players?.[0]) {
      console.error('Steam API error', steamData);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Steam user data' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Return the first player from the response
    const playerData = steamData.response.players[0];
    
    return new Response(
      JSON.stringify(playerData),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error in fetch-steam-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
