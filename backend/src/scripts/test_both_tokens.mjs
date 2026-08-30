async function testBoth() {
  const tokenREST = '96dHZVzsAuuOYFtYmgdJpXcnlaSz9G7qm1CuolbZGDSFVdR66fFKzvns9i1BM64A4SctAMSntOnsHRhzLvinxA==';
  const tokenOAuth = 'lrFxI-iSEg_2qm86c_2u4o2b22fKmSzfJXA7LsqKse1u93Q7VxCCAWwNoJHPomhrgrkDnjkfkwKQliw8zj-86o6-78XmmHbL';

  const coords = '79.9864,23.1815;80.0120,23.2100;79.9540,23.1650';

  console.log('--- Testing Token 1 (REST Key):', tokenREST);
  try {
    const url1 = `https://apis.mappls.com/advancedmaps/v1/${encodeURIComponent(tokenREST)}/distance_matrix/driving/${coords}`;
    const res1 = await fetch(url1);
    console.log('Token 1 Status:', res1.status, await res1.json());
  } catch (e) {
    console.log('Token 1 Err:', e.message);
  }

  console.log('\n--- Testing Token 2 (OAuth Bearer):', tokenOAuth);
  try {
    const url2 = `https://route.mappls.com/route/dm/distance_matrix/driving/${coords}?access_token=${tokenOAuth}`;
    const res2 = await fetch(url2);
    console.log('Token 2 Status:', res2.status, await res2.json());
  } catch (e) {
    console.log('Token 2 Err:', e.message);
  }
}

testBoth();
