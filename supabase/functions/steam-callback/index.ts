
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    
    if (!steamApiKey) {
      console.error('No Steam API key found in environment');
      throw new Error('Steam API key not configured');
    }
    
    // Create Supabase client with service role to manage users
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch Steam user details
    console.log(`Fetching Steam user details using API key: ${steamApiKey.substring(0, 4)}...`);
    const steamUserUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`;
    console.log(`Steam API URL: ${steamUserUrl}`);
    
    const steamUserResponse = await fetch(steamUserUrl);
    
    if (!steamUserResponse.ok) {
      console.error(`Failed to fetch Steam user data: ${steamUserResponse.status}`);
      console.error(`Response: ${await steamUserResponse.text()}`);
      throw new Error('Failed to fetch Steam user data');
    }
    
    const steamUserData = await steamUserResponse.json();
    console.log(`Steam API response: ${JSON.stringify(steamUserData)}`);
    
    const steamUser = steamUserData.response.players[0];
    
    if (!steamUser) {
      console.error('Steam user not found in API response');
      throw new Error('Steam user not found');
    }
    
    console.log(`Steam user found: ${steamUser.personaname}`);
    
    // Check if the is_admin column exists
    try {
      const { data: hasColumn, error: columnError } = await supabase
        .rpc('check_column_exists', { 
          table_name: 'users', 
          column_name: 'is_admin' 
        });
      
      if (columnError) {
        console.error(`Error checking for is_admin column: ${columnError.message}`);
      } else if (!hasColumn) {
        console.log('is_admin column does not exist, creating it');
        
        // Add the column if it doesn't exist
        const { error: createError } = await supabase
          .rpc('create_check_column_exists_function');
        
        if (createError) {
          console.error(`Error creating is_admin column: ${createError.message}`);
        } else {
          console.log('Successfully created is_admin column');
        }
      } else {
        console.log('is_admin column exists');
      }
    } catch (error) {
      console.error(`Error in column check: ${error.message}`);
    }
    
    // Check if user with this Steam ID exists
    console.log('Checking if user exists in database');
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('id, email, username, avatar_url')
      .eq('steam_id', steamId)
      .maybeSingle();
      
    if (queryError) {
      console.error(`Error querying user: ${queryError.message}`);
      throw queryError;
    }
    
    let userId;
    let user;
    
    if (existingUser) {
      // User exists, use existing user ID
      console.log(`Existing user found with id: ${existingUser.id}`);
      userId = existingUser.id;
      user = existingUser;
    } else {
      // Create a new user with Steam data
      console.log('Creating new user with Steam data');
      
      // Generate a unique email that won't conflict
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
      
      // Prepare user data including is_admin
      const userData = {
        id: userId,
        steam_id: steamId,
        username: steamUser.personaname,
        avatar_url: steamUser.avatarfull,
        email: randomEmail,
        is_admin: false
      };
      
      // Insert into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert(userData);
        
      if (insertError) {
        console.error(`Error inserting user: ${insertError.message}`);
        
        // If error is about is_admin column, try without it
        if (insertError.message.includes('is_admin')) {
          console.log('Trying insertion without is_admin field');
          
          const { id, steam_id, username, avatar_url, email } = userData;
          const { error: retryError } = await supabase
            .from('users')
            .insert({ id, steam_id, username, avatar_url, email });
            
          if (retryError) {
            console.error(`Error in retry insertion: ${retryError.message}`);
          } else {
            console.log('Successfully inserted user without is_admin field');
          }
        }
      }
      
      user = userData;
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
    
    // Determine the redirect URL - set a fixed URL for easier debugging
    const redirectUrl = 'https://skin-vault-forge.lovable.app/auth/callback';
    
    // Encode the session data for the redirect
    const sessionString = JSON.stringify({
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      user: {
        id: userId,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        steam_id: steamId
      }
    });
    
    const encodedSession = encodeURIComponent(sessionString);
    
    // Redirect to the client with session data
    const finalRedirectUrl = `${redirectUrl}?session=${encodedSession}`;
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
