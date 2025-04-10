
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
    const steamOpenIdUrl = 'https://steamcommunity.com/openid/login';
    // Get the origin from the request headers
    const origin = req.headers.get('origin') || '';
    console.log(`Request origin: ${origin}`);
    
    // Use the supplied API key and domain
    const steamApiKey = Deno.env.get('STEAM_API_KEY') || '41DD5A77403AA95DE9C0C0DF23B1196C';
    
    // Determine the callback URL based on the environment
    let callbackUrl;
    // For production with Supabase edge functions
    callbackUrl = `https://mdwifkqdnqdvmgowwssz.functions.supabase.co/steam-callback`;
    
    console.log(`Using callback URL: ${callbackUrl}`);

    // Create OpenID parameters for Steam
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': callbackUrl,
      'openid.realm': callbackUrl,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });

    const redirectUrl = `${steamOpenIdUrl}?${params.toString()}`;
    console.log(`Generated redirect URL: ${redirectUrl}`);

    return new Response(
      JSON.stringify({ redirectUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in steam-start:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
