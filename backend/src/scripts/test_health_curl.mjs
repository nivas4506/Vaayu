async function check() {
  try {
    const res = await fetch('http://localhost:3000/api/v1/health');
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Health JSON:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.log('Backend not answering yet:', err.message);
  }
}
check();
