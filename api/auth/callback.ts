
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
      return Response.redirect("https://skin-vault-forge.vercel.app/login?error=missing-steam-id", 302);
    }
    
    const steamId = claimedId.split("/").pop();
    
    if (!steamId) {
      console.error("Could not extract Steam ID from claimed_id");
      return Response.redirect("https://skin-vault-forge.vercel.app/login?error=invalid-steam-id", 302);
    }
    
    console.log(`Steam ID extracted: ${steamId}`);
    
    // Redirect to our Steam login endpoint with the steamid
    return Response.redirect(`/api/steam-login?steamid=${steamId}`, 302);
  } catch (error) {
    console.error("Error in Steam auth callback:", error);
    return Response.redirect(`https://skin-vault-forge.vercel.app/login?error=${encodeURIComponent(error.message || "Unknown error")}`, 302);
  }
}
