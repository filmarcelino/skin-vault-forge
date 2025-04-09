
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const url = new URL(req.url);
    const params = url.searchParams;
    
    // Validate the OpenID response
    const steamId = params.get('openid.claimed_id')?.split('/').pop();
    
    if (!steamId) {
      throw new Error('No Steam ID found in response');
    }
    
    // Create Supabase client with service role to manage users
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch Steam user details
    const steamUserResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
    );
    
    if (!steamUserResponse.ok) {
      throw new Error('Failed to fetch Steam user data');
    }
    
    const steamUserData = await steamUserResponse.json();
    const steamUser = steamUserData.response.players[0];
    
    if (!steamUser) {
      throw new Error('Steam user not found');
    }
    
    // Check if user with this Steam ID exists
    const { data: existingUsers, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq('steam_id', steamId)
      .maybeSingle();
      
    if (queryError) {
      throw queryError;
    }
    
    let userId;
    
    if (existingUsers) {
      // User exists, generate a new session
      userId = existingUsers.id;
    } else {
      // Create a new user with Steam data
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: `${steamId}@steam.placeholder`,
        password: crypto.randomUUID(),
        user_metadata: {
          steam_id: steamId,
          username: steamUser.personaname,
          avatar_url: steamUser.avatarfull,
          provider: 'steam',
        },
        email_confirm: true,
      });
      
      if (createError) {
        throw createError;
      }
      
      userId = authUser.user.id;
      
      // Update users table with Steam information
      const { error: updateError } = await supabase
        .from('users')
        .update({
          steam_id: steamId,
          username: steamUser.personaname,
          avatar_url: steamUser.avatarfull,
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating user with Steam data:', updateError);
      }
    }
    
    // Create a session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: userId,
      properties: {
        provider: 'steam',
      },
    });
    
    if (sessionError) {
      throw sessionError;
    }
    
    // Determine the redirect URL
    const origin = req.headers.get('origin') || '';
    let redirectUrl;
    
    if (origin.includes('lovable.app')) {
      redirectUrl = `${origin}/?session=${encodeURIComponent(JSON.stringify(sessionData))}`;
    } else if (origin.includes('vercel.app')) {
      redirectUrl = `${origin}/?session=${encodeURIComponent(JSON.stringify(sessionData))}`;
    } else if (origin.includes('localhost')) {
      redirectUrl = `${origin}/?session=${encodeURIComponent(JSON.stringify(sessionData))}`;
    } else {
      redirectUrl = `${origin}/?session=${encodeURIComponent(JSON.stringify(sessionData))}`;
    }
    
    // Redirect to the client with session data
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    });
  } catch (error) {
    console.error('Error in steam-callback:', error);
    
    // Redirect to error page
    const origin = req.headers.get('origin') || '';
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${origin}/login?error=${encodeURIComponent(error.message)}`
      }
    });
  }
});
