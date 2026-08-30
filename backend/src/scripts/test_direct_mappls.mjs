async function testMappls() {
  const token = 'cpcikplvzslyriwgqhowlttlwinuebgpunrn';
  console.log('Testing Mappls Distance Matrix API with token:', token);

  const sourceLng = 79.9864;
  const sourceLat = 23.1815;
  const dest1Lng = 80.0120;
  const dest1Lat = 23.2100;
  const dest2Lng = 79.9540;
  const dest2Lat = 23.1650;

  const coordsString = `${sourceLng},${sourceLat};${dest1Lng},${dest1Lat};${dest2Lng},${dest2Lat}`;
  const url = `https://route.mappls.com/route/dm/distance_matrix/driving/${coordsString}?access_token=${token}`;

  // Test 1: Standard request with localhost Origin & Referer headers
  console.log('\n--- Test 1: Request with Origin: http://localhost:5173 ---');
  try {
    const res = await fetch(url, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log('HTTP Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }

  // Test 2: Check current outbound IP
  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    console.log('\n📍 Your Current Public Outbound IP is:', ipData.ip);
    console.log('👉 If MapmyIndia asks for IP Address, whitelist:', ipData.ip);
  } catch (e) {
    console.log('Could not fetch IP:', e.message);
  }
}

testMappls();
