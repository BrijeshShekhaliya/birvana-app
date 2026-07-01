const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Fetching latest Android build from EAS...');
  // Use npx to invoke eas-cli securely
  const output = execSync('npx eas-cli build:list --platform android --limit 1 --json', { encoding: 'utf8' });
  const builds = JSON.parse(output);

  if (!builds || builds.length === 0) {
    console.error('No builds found on EAS.');
    process.exit(1);
  }

  const latestBuild = builds[0];
  if (latestBuild.status !== 'FINISHED') {
    console.warn(`Warning: The latest build status is ${latestBuild.status}, not FINISHED.`);
  }

  const buildUrl = latestBuild.artifacts?.buildUrl;
  if (!buildUrl) {
    console.error('No build artifact URL found in the latest build.');
    process.exit(1);
  }

  console.log(`Found latest build URL: ${buildUrl}`);

  const releasesPath = path.resolve(__dirname, '../../web 2/public/releases.json');
  if (!fs.existsSync(releasesPath)) {
    console.error(`Error: Cannot find releases.json at ${releasesPath}`);
    process.exit(1);
  }

  const releases = JSON.parse(fs.readFileSync(releasesPath, 'utf8'));
  
  // Update the download URL
  releases.latest.url = buildUrl;
  
  // Format with 2 spaces indentation
  fs.writeFileSync(releasesPath, JSON.stringify(releases, null, 2) + '\n');
  console.log('Updated releases.json successfully!');

  // Automatically stage, commit and push the updated download link to GitHub
  const web2Dir = path.resolve(__dirname, '../../web 2');
  console.log('Staging, committing, and pushing changes in web 2 repository...');
  execSync('git add public/releases.json', { cwd: web2Dir });
  execSync('git commit -m "chore(releases): update latest build url from EAS" --no-verify', { cwd: web2Dir });
  execSync('git push origin main', { cwd: web2Dir });
  console.log('Successfully pushed updated download link to GitHub! Vercel will now deploy it.');

} catch (error) {
  console.error('Error updating web release:', error.message || error);
  process.exit(1);
}
