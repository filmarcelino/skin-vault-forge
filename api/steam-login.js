
export default async function handler(req, res) {
  const { steamid } = req.query;

  if (!steamid) {
    return res.status(400).json({ error: "Missing steamid" });
  }

  const apiKey = "41DD5A77403AA95DE9C0C0DF23B1196C"; // Steam Web API Key
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamid}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data?.response?.players?.length > 0) {
      return res.status(200).json(data.response.players[0]);
    } else {
      return res.status(404).json({ error: "Player not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: "Steam API error", detail: err.message });
  }
}
