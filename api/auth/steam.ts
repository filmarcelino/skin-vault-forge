
export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  // Get the redirect URL for after authentication
  const redirectUrl = "https://skin-vault-forge.vercel.app/auth/callback";
  
  // Construct the Steam OpenID URL
  const appUrl = "https://skin-vault-forge.vercel.app";
  
  // Construct the Steam OpenID URL
  const steamLoginUrl = `https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.return_to=${encodeURIComponent(redirectUrl)}&openid.realm=${encodeURIComponent(appUrl)}&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select`;
  
  console.log('Redirecting to Steam:', steamLoginUrl);
  return Response.redirect(steamLoginUrl, 302);
}
