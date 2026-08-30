async function testNewToken() {
  const token = '96dHZVzsAuuOYFtYmgdJpXcnlaSz9G7qm1CuolbZGDSFVdR66fFKzvns9i1BM64A4SctAMSntOnsHRhzLvinxA==';
  const encodedToken = encodeURIComponent(token);
  const coords = '79.9864,23.1815;80.0120,23.2100;79.9540,23.1650';

  console.log('Testing NEW Mappls Token...');

  // Test 1: Query param access_token
  try {
    const url1 = `https://route.mappls.com/route/dm/distance_matrix/driving/${coords}?access_token=${encodedToken}`;
    const r1 = await fetch(url1);
    console.log('\n--- Test 1 (Query Param) ---');
    console.log('HTTP Status:', r1.status, r1.statusText);
    const text1 = await r1.text();
    console.log('Response:', text1);
  } catch (e) {
    console.log('Test 1 error:', e.message);
  }

  // Test 2: Authorization Header Bearer
  try {
    const url2 = `https://route.mappls.com/route/dm/distance_matrix/driving/${coords}`;
    const r2 = await fetch(url2, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('\n--- Test 2 (Bearer Header) ---');
    console.log('HTTP Status:', r2.status, r2.statusText);
    const text2 = await r2.text();
    console.log('Response:', text2);
  } catch (e) {
    console.log('Test 2 error:', e.message);
  }

  // Test 3: apis.mappls.com advancedmaps v1
  try {
    const url3 = `https://apis.mappls.com/advancedmaps/v1/${encodedToken}/distance_matrix/driving/${coords}`;
    const r3 = await fetch(url3);
    console.log('\n--- Test 3 (apis.mappls.com advancedmaps v1) ---');
    console.log('HTTP Status:', r3.status, r3.statusText);
    const text3 = await r3.text();
    console.log('Response:', text3);
  } catch (e) {
    console.log('Test 3 error:', e.message);
  }
}

testNewToken();
