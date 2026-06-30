const url = `https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
fetch(url).then(r => r.json()).then(data => {
  console.log("CHART Item 0:", JSON.stringify(data.charts[0], null, 2));
  console.log("ALBUM Item 0:", JSON.stringify(data.new_albums[0], null, 2));
  console.log("DISCOVER Item 0:", JSON.stringify(data.browse_discover[0], null, 2));
  console.log("TOP PLAYLIST 0:", JSON.stringify(data.top_playlists[0], null, 2));
}).catch(console.error);
