const fetch = require('node-fetch');

async function testSpotify() {
  try {
    const res = await fetch('https://open.spotify.com');
    const text = await res.text();
    const tokenMatch = text.match(/"accessToken":"([^"]+)"/);
    if (tokenMatch) {
      console.log('Token found:', tokenMatch[1].substring(0, 10));
      const searchRes = await fetch('https://api.spotify.com/v1/search?q=Global+Top+50&type=playlist&limit=1', {
        headers: { Authorization: 'Bearer ' + tokenMatch[1] }
      });
      const data = await searchRes.json();
      console.log(JSON.stringify(data.playlists.items[0], null, 2));
    } else {
      console.log('No token found');
    }
  } catch (e) {
    console.error(e);
  }
}
testSpotify();
