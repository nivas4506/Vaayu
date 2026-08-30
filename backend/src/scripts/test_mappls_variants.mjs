async function testVariants() {
  const token = 'cpcikplvzslyriwgqhowlttlwinuebgpunrn';
  const coords = '79.9864,23.1815;80.0120,23.2100;79.9540,23.1650';

  console.log('Testing Mappls Variants for Token:', token);

  // Variant 1: Query param access_token
  try {
    const url1 = `https://route.mappls.com/route/dm/distance_matrix/driving/${coords}?access_token=${token}`;
    const r1 = await fetch(url1);
    console.log('\nVariant 1 (Query Param):', r1.status, await r1.text());
  } catch (e) {
    console.log('Variant 1 error:', e.message);
  }

  // Variant 2: Authorization Header Bearer
  try {
    const url2 = `https://route.mappls.com/route/dm/distance_matrix/driving/${coords}`;
    const r2 = await fetch(url2, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('\nVariant 2 (Bearer Header):', r2.status, await r2.text());
  } catch (e) {
    console.log('Variant 2 error:', e.message);
  }

  // Variant 3: apis.mappls.com endpoint
  try {
    const url3 = `https://apis.mappls.com/advancedmaps/v1/${token}/distance_matrix/driving/${coords}`;
    const r3 = await fetch(url3);
    console.log('\nVariant 3 (Legacy v1 path):', r3.status, await r3.text());
  } catch (e) {
    console.log('Variant 3 error:', e.message);
  }
}

testVariants();
