const fetch = require('node-fetch');

async function test() {
  try {
    const r = await fetch('https://open.spotify.com/playlist/37i9dQZEVXbMDoHDwVN2tF');
    const t = await r.text();
    const match = t.match(/<script id="session" data-testid="session" type="application\/json">(.*?)<\/script>/);
    if (match) {
       const data = JSON.parse(match[1]);
       console.log(data.accessToken ? 'YES' : 'NO');
       if (data.accessToken) {
         const plRes = await fetch('https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF', { headers: { Authorization: 'Bearer ' + data.accessToken } });
         const json = await plRes.json();
         console.log(json.name);
         console.log(json.tracks.items.length);
       }
    } else {
       console.log('No session block found');
    }
  } catch (e) {
    console.error(e);
  }
}
test();
