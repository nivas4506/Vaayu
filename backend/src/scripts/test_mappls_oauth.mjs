async function testOAuthTokenExchange() {
  const clientId = '96dHZVzsAuuOYFtYmgdJpXcnlaSz9G7qm1CuolbZGDSFVdR66fFKzvns9i1BM64A4SctAMSntOnsHRhzLvinxA==';
  const clientSecret = 'lrFxI-iSEg_2qm86c_2u4o2b22fKmSzfJXA7LsqKse1u93Q7VxCCAWwNoJHPomhrgrkDnjkfkwKQliw8zj-86o6-78XmmHbL';

  console.log('Testing MapmyIndia OAuth token generation...');
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const res = await fetch('https://outpost.mappls.com/api/security/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    console.log('OAuth Token Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('OAuth Token Response:', data);
  } catch (err) {
    console.error('OAuth Exchange error:', err.message);
  }
}

testOAuthTokenExchange();
