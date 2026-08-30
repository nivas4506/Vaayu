import { db } from '../../db/client.js';
import { ENV } from '../../config/env.js';
import { cache } from '../../db/cache.js';

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

let cachedMapplsToken = '';
let tokenExpiryTime = 0;

async function getMapplsAccessToken(): Promise<string> {
  if (cachedMapplsToken && Date.now() < tokenExpiryTime - 60000) {
    return cachedMapplsToken;
  }

  if (ENV.MAPPLS_CLIENT_ID && ENV.MAPPLS_CLIENT_SECRET) {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', ENV.MAPPLS_CLIENT_ID);
      params.append('client_secret', ENV.MAPPLS_CLIENT_SECRET);

      const res = await fetch('https://outpost.mappls.com/api/security/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.access_token) {
          cachedMapplsToken = data.access_token;
          tokenExpiryTime = Date.now() + (data.expires_in || 86400) * 1000;
          return cachedMapplsToken;
        }
      }
    } catch (err: any) {
      console.warn('[Discovery Service] Mappls OAuth Token exchange note:', err.message || err);
    }
  }

  return ENV.MAPPLS_ACCESS_TOKEN || ENV.MAPPLS_CLIENT_ID || '';
}

async function fetchMapplsDistances(
  userLat: number,
  userLng: number,
  facilities: { id: string; latitude: number; longitude: number }[]
): Promise<{ distances: Record<string, number>; durations: Record<string, number> }> {
  const result = { distances: {} as Record<string, number>, durations: {} as Record<string, number> };
  if ((!ENV.MAPPLS_ACCESS_TOKEN && !ENV.MAPPLS_CLIENT_ID) || facilities.length === 0) {
    return result;
  }

  try {
    const sourceCoord = `${userLng},${userLat}`;
    const destCoords = facilities.map(f => `${f.longitude},${f.latitude}`).join(';');
    const coordsString = `${sourceCoord};${destCoords}`;

    // First attempt: MapmyIndia Advanced Maps REST endpoint with Client ID
    const apiKey = (ENV.MAPPLS_CLIENT_ID || ENV.MAPPLS_ACCESS_TOKEN).trim();
    let url = `https://apis.mappls.com/advancedmaps/v1/${encodeURIComponent(apiKey)}/distance_matrix/driving/${coordsString}`;

    let response = await fetch(url, { signal: AbortSignal.timeout(4000) });

    // Fallback: If 401, obtain OAuth Bearer token and call route.mappls.com
    if (!response.ok) {
      const oauthToken = await getMapplsAccessToken();
      if (oauthToken) {
        url = `https://route.mappls.com/route/dm/distance_matrix/driving/${coordsString}?access_token=${encodeURIComponent(oauthToken)}`;
        response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      }
    }

    if (!response.ok) {
      throw new Error(`Mappls responded with status ${response.status}`);
    }

    const data = await response.json() as any;

    if (data && data.results) {
      const rawDistances = Array.isArray(data.results.distances?.[0])
        ? data.results.distances[0]
        : Array.isArray(data.results[0]?.distances)
        ? data.results[0].distances
        : null;

      const rawDurations = Array.isArray(data.results.durations?.[0])
        ? data.results.durations[0]
        : Array.isArray(data.results[0]?.durations)
        ? data.results[0].durations
        : null;

      if (rawDistances) {
        facilities.forEach((fac, idx) => {
          const distMeters = rawDistances[idx + 1];
          if (typeof distMeters === 'number') {
            result.distances[fac.id] = Math.round((distMeters / 1000) * 10) / 10;
          }
          if (rawDurations) {
            const durSeconds = rawDurations[idx + 1];
            if (typeof durSeconds === 'number') {
              result.durations[fac.id] = Math.max(1, Math.round(durSeconds / 60));
            }
          }
        });
        return result;
      }
    }
  } catch (err: any) {
    console.warn('[Discovery Service] Mappls API call notice:', err.message || err);
  }
  return result;
}

export async function discoverFacilities(params: {
  need: string; // e.g. "blood_test", "consultation", "xray"
  userLat?: number;
  userLng?: number;
  pincode?: string;
  village?: string;
}) {
  const { need, pincode, village } = params;

  // Default fallback coords (Rampur area) if not provided
  const userLat = params.userLat ?? 23.2100;
  const userLng = params.userLng ?? 80.0120;

  const cacheKey = `discover:${need}:${pincode || ''}:${village || ''}:${userLat}:${userLng}`;
  const cached = await cache.get<any>(cacheKey);
  if (cached) return cached;

  const facilities = db.prepare(`SELECT * FROM facilities WHERE status = 'ACTIVE'`).all() as any[];

  // Retrieve driving distances via Mappls Distance Matrix API, fallback to Haversine straight-line if offline or error
  const { distances: mapplsDistances, durations: mapplsDurations } = await fetchMapplsDistances(userLat, userLng, facilities);

  let serviceGapDetected = false;
  let gapDetails: any = null;

  const results = facilities.map((fac) => {
    // Fetch target service availability
    const avail = db.prepare(`
      SELECT ca.*, s.key as service_key
      FROM current_availability ca
      JOIN services s ON ca.service_id = s.id
      WHERE ca.facility_id = ? AND ca.service_id = ?
    `).get(fac.id, need) as any;

    const distanceKm = mapplsDistances[fac.id] ?? calculateDistanceKm(userLat, userLng, fac.latitude, fac.longitude);
    const estimatedTravelTimeMin = mapplsDurations[fac.id] ?? Math.max(1, Math.round((distanceKm / 35) * 60));

    // Scoring metrics
    const serviceMatchScore = avail ? 1.0 : 0.0;
    
    let availConfidenceScore = 0.0;
    if (avail) {
      if (avail.status === 'AVAILABLE') availConfidenceScore = 1.0;
      else if (avail.status === 'LIMITED') availConfidenceScore = 0.5;
      else if (avail.status === 'UNAVAILABLE') availConfidenceScore = 0.0;
    }

    let freshnessScore = 0.3;
    if (avail) {
      const ageHours = (Date.now() - new Date(avail.updated_at).getTime()) / (3600 * 1000);
      if (ageHours <= 24) freshnessScore = 1.0;
      else if (ageHours <= 48) freshnessScore = 0.7;
    }

    let distanceScore = 0.2;
    if (distanceKm <= 5) distanceScore = 1.0;
    else if (distanceKm <= 15) distanceScore = 0.7;
    else if (distanceKm <= 30) distanceScore = 0.4;

    const openNowScore = 1.0; // Prototype default

    // Combined score: 0.40 * serviceMatch + 0.25 * availConfidence + 0.15 * freshness + 0.10 * openNow + 0.10 * distance
    const totalScore = Math.round((
      0.40 * serviceMatchScore +
      0.25 * availConfidenceScore +
      0.15 * freshnessScore +
      0.10 * openNowScore +
      0.10 * distanceScore
    ) * 100) / 100;

    // Explanation string
    let explanation = `${fac.type} located ${distanceKm} km away (~${estimatedTravelTimeMin} mins).`;
    if (avail?.status === 'AVAILABLE') {
      explanation += ` Confirmed AVAILABLE for ${need}.`;
    } else if (avail?.status === 'UNAVAILABLE') {
      explanation += ` Requested service ${need} is currently UNAVAILABLE.`;
    } else if (avail?.status === 'LIMITED') {
      explanation += ` Service ${need} has LIMITED availability (${avail.capacity_note || 'check hours'}).`;
    } else {
      explanation += ` Service capability unknown.`;
    }

    return {
      facilityId: fac.id,
      name: fac.name,
      type: fac.type,
      pincode: fac.pincode,
      village: fac.village,
      distanceKm,
      estimatedTravelTimeMin,
      hours: fac.hours,
      contact: fac.contact,
      serviceAvailability: avail ? {
        status: avail.status,
        confidence: avail.source,
        capacityNote: avail.capacity_note,
        updatedAt: avail.updated_at,
        isStale: (Date.now() - new Date(avail.updated_at).getTime()) > ENV.FRESHNESS_WINDOW_HOURS * 3600 * 1000
      } : null,
      score: totalScore,
      explanation
    };
  });

  // Sort by score descending, then distance ascending
  results.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);

  // Check for Service Gap: closest facility that has UNAVAILABLE status for requested service
  const unavailableFacs = results.filter((f) => f.serviceAvailability?.status === 'UNAVAILABLE');
  const nearestUnavailable = [...unavailableFacs].sort((a, b) => a.distanceKm - b.distanceKm)[0];

  if (nearestUnavailable) {
    serviceGapDetected = true;
    const bestAlternate = results.find((f) => f.serviceAvailability?.status === 'AVAILABLE');
    gapDetails = {
      closestFacility: nearestUnavailable.name,
      closestFacilityDistance: nearestUnavailable.distanceKm,
      reason: nearestUnavailable.serviceAvailability?.capacityNote || 'Service unavailable at closest facility',
      recommendedAlternate: bestAlternate ? bestAlternate.name : 'District Civil Hospital',
      alternateDistanceKm: bestAlternate ? bestAlternate.distanceKm : null
    };
  }

  const finalResult = {
    query: { need, pincode, village, userLat, userLng },
    results,
    serviceGapDetected,
    gapDetails
  };

  await cache.set(cacheKey, finalResult, 300); // Cache for 5 minutes (300 seconds)
  return finalResult;
}
