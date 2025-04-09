
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
    console.log('Steam callback function started');
    const url = new URL(req.url);
    const params = url.searchParams;
    
    // Validate the OpenID response
    const steamId = params.get('openid.claimed_id')?.split('/').pop();
    
    if (!steamId) {
      console.error('No Steam ID found in response');
      throw new Error('No Steam ID found in response');
    }
    
    console.log(`Steam ID extracted: ${steamId}`);
    
    // Create Supabase client with service role to manage users
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch Steam user details
    console.log('Fetching Steam user details');
    const steamUserResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
    );
    
    if (!steamUserResponse.ok) {
      console.error(`Failed to fetch Steam user data: ${steamUserResponse.status}`);
      throw new Error('Failed to fetch Steam user data');
    }
    
    const steamUserData = await steamUserResponse.json();
    const steamUser = steamUserData.response.players[0];
    
    if (!steamUser) {
      console.error('Steam user not found in API response');
      throw new Error('Steam user not found');
    }
    
    console.log(`Steam user found: ${steamUser.personaname}`);
    
    // Check if user with this Steam ID exists
    console.log('Checking if user exists in database');
    const { data: existingUsers, error: queryError } = await supabase
      .from('users')
      .select('id')
      .eq('steam_id', steamId)
      .maybeSingle();
      
    if (queryError) {
      console.error(`Error querying user: ${queryError.message}`);
      throw queryError;
    }
    
    let userId;
    
    if (existingUsers) {
      // User exists, use existing user ID
      console.log(`Existing user found with id: ${existingUsers.id}`);
      userId = existingUsers.id;
    } else {
      // Create a new user with Steam data
      console.log('Creating new user with Steam data');
      
      // Generate a random email that won't conflict
      const randomEmail = `${steamId}_${Math.random().toString(36).substring(2)}@steam.placeholder`;
      
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: randomEmail,
        password: crypto.randomUUID(),
        email_confirm: true,
        user_metadata: {
          steam_id: steamId,
          username: steamUser.personaname,
          avatar_url: steamUser.avatarfull,
          provider: 'steam',
        }
      });
      
      if (createError) {
        console.error(`Error creating user: ${createError.message}`);
        throw createError;
      }
      
      userId = authUser.user.id;
      console.log(`New user created with id: ${userId}`);
      
      // Insert into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          steam_id: steamId,
          username: steamUser.personaname,
          avatar_url: steamUser.avatarfull,
          email: randomEmail,
          is_admin: false
        });
        
      if (insertError) {
        console.error(`Error inserting user: ${insertError.message}`);
        // Continue anyway, but log the error
        console.log(`Will continue with session creation despite error: ${JSON.stringify(insertError)}`);
      }
    }
    
    // Create a session for the user
    console.log('Creating session for user');
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      user_id: userId,
    });
    
    if (sessionError) {
      console.error(`Error creating session: ${sessionError.message}`);
      throw sessionError;
    }
    
    console.log('Session created successfully');
    
    // Determine the redirect URL (including protocol and adding trailing slash if needed)
    const originUrl = new URL(req.headers.get('origin') || 'http://localhost:5173');
    const baseUrl = `${originUrl.protocol}//${originUrl.host}`;
    console.log(`Redirect base URL: ${baseUrl}`);
    
    // Encode the session data for the redirect
    const sessionString = JSON.stringify(sessionData);
    const encodedSession = encodeURIComponent(sessionString);
    
    // Always use the /auth/callback path for the redirect
    const redirectUrl = `${baseUrl}/auth/callback?session=${encodedSession}`;
    console.log(`Redirecting to: ${redirectUrl}`);
    
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
    
    // Get the origin for redirection to error page
    const originUrl = new URL(req.headers.get('origin') || 'http://localhost:5173');
    const baseUrl = `${originUrl.protocol}//${originUrl.host}`;
    
    // Redirect to error page with descriptive message
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': `${baseUrl}/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`
      }
    });
  }
});
