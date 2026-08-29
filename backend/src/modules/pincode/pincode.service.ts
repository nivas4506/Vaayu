import { db } from '../../db/client.js';
import { cache } from '../../db/cache.js';

// Pre-cached local PIN code database for Jabalpur rural district fallback
const LOCAL_PINCODE_CACHE: Record<string, { district: string; state: string; block: string; division?: string; villages: string[]; postOffices?: any[] }> = {
  '482001': {
    district: 'Jabalpur',
    state: 'Madhya Pradesh',
    block: 'Jabalpur',
    division: 'Jabalpur',
    villages: ['Nandgaon', 'Main City', 'Panchayat Bhawan'],
    postOffices: [
      { name: 'Nandgaon', branchType: 'Sub Post Office', deliveryStatus: 'Delivery', district: 'Jabalpur', state: 'Madhya Pradesh' },
      { name: 'Panchayat Bhawan', branchType: 'Branch Post Office', deliveryStatus: 'Non-Delivery', district: 'Jabalpur', state: 'Madhya Pradesh' }
    ]
  },
  '482002': {
    district: 'Jabalpur',
    state: 'Madhya Pradesh',
    block: 'Jabalpur',
    division: 'Jabalpur',
    villages: ['Rampur', 'Station Road', 'Bus Stand', 'Gorakhpur'],
    postOffices: [
      { name: 'Rampur', branchType: 'Sub Post Office', deliveryStatus: 'Delivery', district: 'Jabalpur', state: 'Madhya Pradesh' },
      { name: 'Gorakhpur', branchType: 'Branch Post Office', deliveryStatus: 'Delivery', district: 'Jabalpur', state: 'Madhya Pradesh' }
    ]
  },
  '482003': {
    district: 'Jabalpur',
    state: 'Madhya Pradesh',
    block: 'Jabalpur',
    division: 'Jabalpur',
    villages: ['Sevanagar', 'Hospital Square', 'Polipathar'],
    postOffices: [
      { name: 'Sevanagar', branchType: 'Sub Post Office', deliveryStatus: 'Delivery', district: 'Jabalpur', state: 'Madhya Pradesh' }
    ]
  },
  '482004': {
    district: 'Jabalpur',
    state: 'Madhya Pradesh',
    block: 'Jabalpur',
    division: 'Jabalpur',
    villages: ['Civil Lines', 'Medical College', 'Jabalpur City'],
    postOffices: [
      { name: 'Civil Lines', branchType: 'Head Post Office', deliveryStatus: 'Delivery', district: 'Jabalpur', state: 'Madhya Pradesh' }
    ]
  }
};

export async function lookupIndiaPincode(pincode: string) {
  let source = 'LOCAL_CACHE';
  let pincodeData: any = LOCAL_PINCODE_CACHE[pincode] || (await cache.get(`pincode:${pincode}`)) || null;

  if (pincodeData && LOCAL_PINCODE_CACHE[pincode] === undefined) {
    source = 'INDIA_POST_API'; // Restored from cache
  }

  // Fetch live from official India Post API for all 19,000+ PIN codes across India
  if (!pincodeData) {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
        signal: AbortSignal.timeout(5000), // 5s timeout for resilient all-India lookup
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = (await response.json()) as any[];

      if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffices = data[0].PostOffice;
        const first = postOffices[0];
        source = 'INDIA_POST_API';

        pincodeData = {
          district: first.District || 'Unknown District',
          state: first.State || 'Unknown State',
          block: first.Block || first.Division || first.District || 'Unknown Block',
          division: first.Division || '',
          circle: first.Circle || '',
          villages: postOffices.map((po: any) => po.Name),
          postOffices: postOffices.map((po: any) => ({
            name: po.Name,
            branchType: po.BranchType,
            deliveryStatus: po.DeliveryStatus,
            circle: po.Circle,
            district: po.District,
            division: po.Division,
            region: po.Region,
            state: po.State,
            pincode: po.Pincode
          }))
        };

        // Cache for subsequent fast lookups (TTL: 24 hours)
        await cache.set(`pincode:${pincode}`, pincodeData, 86400);
      }
    } catch (err) {
      console.warn(`[Pincode Service] India Post API offline or timed out for ${pincode}, fallback to local database.`);
    }
  }

  // Find matching facilities in Vaayu database for this pincode
  const matchingFacilities = db.prepare(`
    SELECT id, name, type, pincode, village, address, contact, status
    FROM facilities
    WHERE pincode = ? AND status = 'ACTIVE'
  `).all(pincode) as any[];

  return {
    pincode,
    district: pincodeData?.district || 'Unknown District',
    state: pincodeData?.state || 'Unknown State',
    block: pincodeData?.block || 'Unknown Block',
    division: pincodeData?.division || '',
    villages: pincodeData?.villages || [],
    postOffices: pincodeData?.postOffices || [],
    matchingFacilitiesCount: matchingFacilities.length,
    matchingFacilities,
    source
  };
}
