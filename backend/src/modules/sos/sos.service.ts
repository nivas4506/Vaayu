import { db } from '../../db/client.js';
import { calculateDistanceKm } from '../discovery/discovery.service.js';

export interface SosTriggerPayload {
  reporterId: string;
  reporterRole: string;
  latitude?: number;
  longitude?: number;
}

export function triggerSos(data: SosTriggerPayload) {
  const id = `sos_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  
  // Default fallback coords if not provided (Rampur area)
  const lat = data.latitude ?? 23.2100;
  const lng = data.longitude ?? 80.0120;
  
  // 1. Find nearest facility to coordinate ambulance assignment
  const facilities = db.prepare(`SELECT * FROM facilities WHERE status = 'ACTIVE'`).all() as any[];
  let nearestFacility: any = null;
  let minDistance = Infinity;
  
  for (const fac of facilities) {
    const dist = calculateDistanceKm(lat, lng, fac.latitude, fac.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestFacility = fac;
    }
  }

  // Assign simulated ambulance from nearest facility
  const ambulanceId = nearestFacility 
    ? `AMB-${nearestFacility.type}-${nearestFacility.id.substring(0, 4).toUpperCase()}`
    : 'AMB-GEN-108';

  // 2. Insert SOS record
  db.prepare(`
    INSERT INTO sos_triggers (id, reporter_id, reporter_role, latitude, longitude, status, ambulance_id, created_at, resolved_at)
    VALUES (?, ?, ?, ?, ?, 'TRIGGERED', ?, ?, NULL)
  `).run(id, data.reporterId, data.reporterRole, lat, lng, ambulanceId, now);

  // 3. Log Audit Event
  db.prepare(`
    INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, metadata, created_at)
    VALUES (?, ?, 'SOS_TRIGGERED', 'sos_triggers', ?, ?, ?)
  `).run(
    `audit_${Date.now()}`,
    data.reporterId,
    id,
    JSON.stringify({
      latitude: lat,
      longitude: lng,
      nearestFacility: nearestFacility?.name || 'Unknown',
      distanceKm: nearestFacility ? minDistance : null,
      ambulanceId
    }),
    now
  );

  return getSosStatus(id);
}

export function getSosStatus(id: string) {
  return db.prepare(`
    SELECT * FROM sos_triggers WHERE id = ?
  `).get(id) as any || null;
}
