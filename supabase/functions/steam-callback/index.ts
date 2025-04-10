
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Steam callback function started');
    const url = new URL(req.url);
    const params = url.searchParams;
    
    // Extract Steam ID
    const claimed_id = params.get('openid.claimed_id');
    if (!claimed_id) {
      console.error('No claimed_id found in response');
      throw new Error('Authentication failed: No claimed_id found');
    }
    
    const steamId = claimed_id.split('/').pop();
    
    if (!steamId) {
      console.error('No Steam ID found in response');
      throw new Error('Authentication failed: No Steam ID found');
    }
    
    console.log(`Steam ID extracted: ${steamId}`);
    
    // Get Steam API key from environment
    const steamApiKey = Deno.env.get('STEAM_API_KEY') ?? '';
    if (!steamApiKey) {
      console.error('No Steam API key found in environment');
      throw new Error('Steam API key not configured');
    }
    
    // Fetch Steam user details
    console.log(`Fetching Steam user details for Steam ID: ${steamId}`);
    const steamUserUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`;
    
    const steamUserResponse = await fetch(steamUserUrl);
    
    if (!steamUserResponse.ok) {
      console.error(`Failed to fetch Steam user data: ${steamUserResponse.status}`);
      console.error(`Response: ${await steamUserResponse.text()}`);
      throw new Error('Failed to fetch Steam user data');
    }
    
    const steamUserData = await steamUserResponse.json();
    console.log(`Steam API response received`);
    
    const steamUser = steamUserData.response.players[0];
    
    if (!steamUser) {
      console.error('Steam user not found in API response');
      throw new Error('Steam user not found');
    }
    
    console.log(`Steam user found: ${steamUser.personaname}`);

    // Create Supabase client with service role to manage users
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate a unique email that won't conflict
    const email = `${steamId}@steam.placeholder`;
    // Generate a secure password
    const password = crypto.randomUUID();
    
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    });
    
    if (listError) {
      console.error(`Error listing users: ${listError.message}`);
      throw listError;
    }
    
    const existingUser = existingUsers.users.find(u => u.email === email);
    
    if (!existingUser) {
      // Create a new user with Steam data
      console.log('Creating new user with Steam data');
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          steam_id: steamId,
          username: steamUser.personaname,
          avatar_url: steamUser.avatarfull,
          provider: 'steam',
        },
        email_confirm: true
      });
      
      if (createError) {
        console.error(`Error creating user: ${createError.message}`);
        throw createError;
      }
      
      console.log(`New user created with id: ${authUser.user.id}`);
    } else {
      console.log(`Existing user found with id: ${existingUser.id}`);
      
      // Optionally update the user's metadata with the latest Steam info
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            steam_id: steamId,
            username: steamUser.personaname,
            avatar_url: steamUser.avatarfull,
            provider: 'steam',
          }
        }
      );
      
      if (updateError) {
        console.error(`Error updating user: ${updateError.message}`);
        // Continue anyway as this is not critical
      }
    }
    
    // Log in the user to get tokens
    console.log('Attempting to sign in user with password');
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (loginError || !sessionData.session) {
      console.error(`Login failed: ${loginError?.message || 'No session created'}`);
      throw new Error('Failed to create user session');
    }
    
    console.log('Session created successfully');
    
    // Determine the redirect URL - Fix: Add leading slash and ensure full URL
    const redirectUrl = 'https://skin-vault-forge.lovable.app/auth/callback';
    const access_token = sessionData.session.access_token;
    const refresh_token = sessionData.session.refresh_token;
    
    // Redirect to the client with session tokens
    const finalRedirectUrl = `${redirectUrl}?access_token=${access_token}&refresh_token=${refresh_token}`;
    console.log(`Redirecting to: ${finalRedirectUrl}`);
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': finalRedirectUrl
      }
    });
  } catch (error) {
    console.error('Error in steam-callback:', error);
    
    // Redirect to error page with descriptive message
    const errorUrl = 'https://skin-vault-forge.lovable.app/login?error=' + encodeURIComponent(error.message || 'Authentication failed');
    console.log(`Redirecting to error page: ${errorUrl}`);
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': errorUrl
      }
    });
  }
});
