
export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  console.log("Steam auth callback function started");
  
  try {
    const { searchParams } = new URL(req.url);
    
    // Extract Steam ID from the OpenID response
    const claimedId = searchParams.get("openid.claimed_id");
    
    if (!claimedId) {
      console.error("No claimed_id found in response");
      return new Response("Missing Steam identifier", { status: 400 });
    }
    
    const steamId = claimedId.split("/").pop();
    
    if (!steamId) {
      console.error("Could not extract Steam ID from claimed_id");
      return new Response("Could not extract Steam ID", { status: 400 });
    }
    
    console.log(`Steam ID extracted: ${steamId}`);
    
    // Fetch Steam user profile
    const steamApiKey = "41DD5A77403AA95DE9C0C0DF23B1196C";
    const steamProfileRes = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
    );
    
    if (!steamProfileRes.ok) {
      console.error(`Steam API error: ${steamProfileRes.status}`);
      return new Response("Failed to fetch Steam profile", { status: 500 });
    }
    
    const steamProfileData = await steamProfileRes.json();
    const profile = steamProfileData?.response?.players?.[0];
    
    if (!profile) {
      console.error("No profile found in Steam API response");
      return new Response("Invalid Steam profile", { status: 400 });
    }
    
    console.log(`Steam profile fetched: ${profile.personaname}`);
    
    // Get Supabase credentials
    const supabaseUrl = "https://mdwifkqdnqdvmgowwssz.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kd2lma3FkbnFkdm1nb3d3c3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTAxNDMsImV4cCI6MjA1OTYyNjE0M30.xuREdnfAUvug-WEbg8FgPGVJwMVQid4RaKVDc_24d9I";
    
    // Generate a unique email for this Steam user
    const email = `steam_${steamId}@skinvault.app`;
    const password = `${steamId}_${Date.now()}`;
    
    // Try to sign in first (for existing users)
    let authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "apikey": supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password: steamId }),
    });
    
    let authData = await authResponse.json();
    
    // If sign-in fails, create a new user
    if (!authData.access_token) {
      console.log("User not found, creating new user");
      
      // Create a new user
      const signUpResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "apikey": supabaseAnonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          password,
          data: {
            steam_id: steamId,
            username: profile.personaname,
            avatar_url: profile.avatarfull,
            provider: "steam"
          }
        }),
      });
      
      const signUpData = await signUpResponse.json();
      
      if (signUpData.error) {
        console.error(`Signup error: ${signUpData.error.message}`);
        return new Response(`Authentication failed: ${signUpData.error.message}`, { status: 401 });
      }
      
      // Try signing in again after creating the user
      authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "apikey": supabaseAnonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      
      authData = await authResponse.json();
    }
    
    if (!authData.access_token) {
      console.error("Failed to authenticate after signup");
      return new Response("Authentication failed", { status: 401 });
    }
    
    console.log("Authentication successful, redirecting to app");
    
    // Redirect back to the app with tokens
    const redirectUrl = `https://skin-vault-forge.lovable.app/login?access_token=${authData.access_token}&refresh_token=${authData.refresh_token}`;
    return Response.redirect(redirectUrl, 302);
  } catch (error) {
    console.error("Error in Steam auth callback:", error);
    return new Response(`Error: ${error.message || "Unknown error"}`, { status: 500 });
  }
}
