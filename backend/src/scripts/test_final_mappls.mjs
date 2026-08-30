import fs from 'fs';

function getEnvToken() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const match = envContent.match(/MAPPLS_ACCESS_TOKEN=(.+)/);
  return match ? match[1].trim() : '';
}

async function testMapplsDiscovery() {
  const token = getEnvToken();
  console.log('Testing MapmyIndia with active token from .env:', token.substring(0, 25) + '...');

  const sourceLng = 79.9864;
  const sourceLat = 23.1815;
  const dest1Lng = 80.0120;
  const dest1Lat = 23.2100;
  const dest2Lng = 79.9540;
  const dest2Lat = 23.1650;

  const coordsString = `${sourceLng},${sourceLat};${dest1Lng},${dest1Lat};${dest2Lng},${dest2Lat}`;
  const url = `https://apis.mappls.com/advancedmaps/v1/${encodeURIComponent(token)}/distance_matrix/driving/${coordsString}`;

  console.log('Calling MapmyIndia REST URL...');
  const res = await fetch(url);
  console.log('HTTP Status:', res.status, res.statusText);
  const data = await res.json();
  console.log('MapmyIndia Live Results:', JSON.stringify(data, null, 2));

  if (data.results && data.results.distances) {
    console.log('\n✅ MapmyIndia Distance Matrix is FULLY WORKING and LIVE!');
    console.log(`Driving Distance to Facility 1: ${Math.round(data.results.distances[0][1] / 100) / 10} km (~${Math.round(data.results.durations[0][1] / 60)} mins)`);
    console.log(`Driving Distance to Facility 2: ${Math.round(data.results.distances[0][2] / 100) / 10} km (~${Math.round(data.results.durations[0][2] / 60)} mins)`);
  }
}

testMapplsDiscovery();
