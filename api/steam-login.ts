
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mdwifkqdnqdvmgowwssz.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kd2lma3FkbnFkdm1nb3d3c3N6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDA1MDE0MywiZXhwIjoyMDU5NjI2MTQzfQ.lc0s9EZbXlB3lA4DzFLf__s0d3oXDKrdz_OJ3iBk92A";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const steamid = searchParams.get("steamid");

  if (!steamid) {
    return new Response(JSON.stringify({ error: "Missing steamid" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  try {
    // Call Steam API to get player information
    const steamApiKey = "41DD5A77403AA95DE9C0C0DF23B1196C";
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${steamApiKey}&steamids=${steamid}`
    );
    
    const data = await response.json();
    const player = data?.response?.players?.[0];

    if (!player) {
      return new Response(JSON.stringify({ error: "Steam user not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    console.log("Steam player data:", player);

    // Create synthetic email for authentication
    const email = `${steamid}@steam.com`;

    // Create user if doesn't exist
    const { error: createUserError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        steam_id: steamid,
        username: player.personaname,
        avatar_url: player.avatarfull,
        profile_url: player.profileurl,
        provider: "steam"
      }
    });

    if (createUserError && createUserError.message !== "User already registered") {
      console.error("Error creating user:", createUserError);
      return new Response(JSON.stringify({ error: "Failed to create user", detail: createUserError }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    // Generate magic link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: "https://skin-vault-forge.vercel.app/login"
      }
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Error generating link:", linkError);
      return new Response(JSON.stringify({ error: "Failed to generate login link", detail: linkError }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    console.log("Generated action link:", linkData.properties.action_link);

    // Redirect to the magic link
    return Response.redirect(linkData.properties.action_link, 302);
  } catch (error) {
    console.error("Error in Steam login process:", error);
    return new Response(JSON.stringify({ error: "Server error", detail: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
