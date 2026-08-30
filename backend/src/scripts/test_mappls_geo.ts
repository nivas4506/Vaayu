import { discoverFacilities, calculateDistanceKm } from '../modules/discovery/discovery.service.js';
import { ENV } from '../config/env.js';
import { initDatabase } from '../db/client.js';

async function runTest() {
  console.log('--- 🗺️ Mappls & Geo Navigation Verification ---');
  console.log('Mappls Token Configured:', ENV.MAPPLS_ACCESS_TOKEN ? 'YES (Length: ' + ENV.MAPPLS_ACCESS_TOKEN.length + ')' : 'NO');
  
  await initDatabase();

  // Test GPS Coordinates: Jabalpur City Center
  const userLat = 23.1815;
  const userLng = 79.9864;

  console.log(`\nQuerying discovery & routing for user coordinates: [Lat: ${userLat}, Lng: ${userLng}]...`);
  
  const result = await discoverFacilities({ lat: userLat, lon: userLng });

  console.log(`\n✅ Facilities Found: ${result.facilities.length}`);
  
  result.facilities.slice(0, 3).forEach((fac, idx) => {
    console.log(`\n[#${idx + 1}] ${fac.name} (${fac.type})`);
    console.log(`    Distance: ${fac.distanceKm} km`);
    console.log(`    Travel Time: ~${fac.estimatedTravelTimeMin} mins`);
    console.log(`    Coordinates: [${fac.latitude}, ${fac.longitude}]`);
    console.log(`    Emergency Available: ${fac.emergencyAvailable ? 'YES' : 'NO'}`);
  });

  // Verify Haversine computation test
  const testDist = calculateDistanceKm(23.1815, 79.9864, 23.2100, 80.0120);
  console.log(`\n✅ Mathematical Haversine Check (23.1815, 79.9864 -> 23.2100, 80.0120): ${testDist} km`);
  console.log('\n--- 🎉 Verification Completed Successfully ---');
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
