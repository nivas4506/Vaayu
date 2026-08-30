async function verifyServices() {
  try {
    const backendRes = await fetch('http://localhost:3000/api/v1/health');
    const backendData = await backendRes.json();
    console.log('✅ Backend API is ONLINE on http://localhost:3000/api/v1');
    console.log('   - Overall Status:', backendData.data.overallStatus);
    console.log('   - Database:', backendData.data.services.database.status);
    console.log('   - Mappls Routing:', backendData.data.services.mapplsRouting.status);
    console.log('   - Twilio SMS:', backendData.data.services.twilioSms.status);
    console.log('   - PIN Database:', backendData.data.services.pincodeDatabase.status);

    const frontendRes = await fetch('http://localhost:5173');
    console.log('✅ Frontend UI is ONLINE on http://localhost:5173 (HTTP', frontendRes.status, ')');
  } catch (err) {
    console.error('Service verification error:', err.message);
  }
}
verifyServices();
