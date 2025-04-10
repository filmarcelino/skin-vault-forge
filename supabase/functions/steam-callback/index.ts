
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
      
      // Wait a moment to ensure the auth trigger has time to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Ensure profile exists and has Steam data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error(`Error checking profile: ${profileError.message}`);
      }
      
      // Insert or update the user record
      const userData = {
        id: userId,
        steam_id: steamId,
        username: steamUser.personaname,
        avatar_url: steamUser.avatarfull,
        email: randomEmail,
        is_admin: false
      };
      
      // First try to update if user exists in users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          steam_id: steamId,
          username: steamUser.personaname,
          avatar_url: steamUser.avatarfull
        })
        .eq('id', userId);
      
      if (updateError) {
        console.log(`User not found in users table, creating new record`);
        // User doesn't exist in users table, insert new record
        const { error: insertError } = await supabase
          .from('users')
          .insert(userData);
          
        if (insertError) {
          console.error(`Error inserting user: ${insertError.message}`);
          
          // Try without is_admin if that's causing problems
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
      } else {
        console.log('Successfully updated user record');
      }
      
      user = userData;
    }
    
    // Create a session for the user - FIX HERE
    console.log('Creating session for user');
    
    // Use the createUserSession method instead which is available in newer Supabase versions
    // Generate JWT token for the user
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: crypto.randomUUID(), // This won't actually be used since we're using service role
    });
    
    if (signInError) {
      console.error(`Error signing in user: ${signInError.message}`);
      
      // Fallback to manual JWT generation
      const { data: token, error: tokenError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
      });
      
      if (tokenError) {
        console.error(`Error generating token: ${tokenError.message}`);
        throw new Error('Failed to create user session');
      }
      
      // Use the token properties
      const finalSessionData = {
        session: {
          access_token: token.properties?.access_token || '',
          refresh_token: token.properties?.refresh_token || '',
        }
      };
      
      // Determine the redirect URL - set a fixed URL for easier debugging
      const redirectUrl = 'https://skin-vault-forge.lovable.app/auth/callback';
      
      // Encode the session data for the redirect
      const sessionString = JSON.stringify({
        access_token: finalSessionData.session.access_token,
        refresh_token: finalSessionData.session.refresh_token,
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
    }
    
    // Use the session data from signInWithPassword
    console.log('Session created successfully');
    
    // Determine the redirect URL - set a fixed URL for easier debugging
    const redirectUrl = 'https://skin-vault-forge.lovable.app/auth/callback';
    
    // Encode the session data for the redirect
    const sessionString = JSON.stringify({
      access_token: sessionData.session?.access_token,
      refresh_token: sessionData.session?.refresh_token,
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
