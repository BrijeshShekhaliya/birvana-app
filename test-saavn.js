const url = `https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=wap6dot0`;
fetch(url).then(r => r.json()).then(data => {
  console.log("Categories Available:", Object.keys(data));
  console.log("Top Playlists:", data.top_playlists?.map(p => p.title));
  console.log("Browse Discover:", data.browse_discover?.map(p => p.title));
  console.log("New Albums:", data.new_albums?.slice(0, 5).map(p => p.title));
}).catch(console.error);
