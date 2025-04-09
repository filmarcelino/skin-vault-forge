
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
    const origin = req.headers.get('origin') || '';
    
    // Determine the return URL based on the origin
    let returnTo;
    if (origin.includes('lovable.app')) {
      returnTo = `${origin}/auth/callback`;
    } else if (origin.includes('vercel.app')) {
      returnTo = `${origin}/auth/callback`;
    } else if (origin.includes('localhost')) {
      returnTo = `${origin}/auth/callback`;
    } else {
      returnTo = `${origin}/auth/callback`;
    }

    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnTo,
      'openid.realm': returnTo,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });

    return new Response(
      JSON.stringify({ redirectUrl: `${steamOpenIdUrl}?${params.toString()}` }),
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
