async function testCacheStatus() {
  console.log('--- ⚡ Checking Redis & Cache Engine Status ---');
  try {
    const res = await fetch('http://localhost:3000/api/v1/health/ping/redis');
    const data = await res.json();
    console.log('HTTP Status:', res.status);
    console.log('Cache Health Diagnostic:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Diagnostic error:', err.message);
  }
}

testCacheStatus();
