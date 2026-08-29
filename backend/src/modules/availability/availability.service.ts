import { db } from '../../db/client.js';
import { cache } from '../../db/cache.js';

export function submitAvailabilityUpdate(data: {
  facilityId: string;
  serviceId: string;
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'UNKNOWN';
  source: 'FACILITY_REPORTED' | 'ASHA_REPORTED' | 'PATIENT_FEEDBACK';
  confidence?: number;
  capacityNote?: string;
  updatedBy?: string;
}) {
  const now = new Date().toISOString();
  const confidence = data.confidence ?? (data.source === 'FACILITY_REPORTED' ? 1.0 : data.source === 'ASHA_REPORTED' ? 0.8 : 0.6);

  // Transactionally update current availability read model and append to history table
  const updateCurrent = db.transaction(() => {
    const existing = db.prepare(`
      SELECT facility_id FROM current_availability WHERE facility_id = ? AND service_id = ?
    `).get(data.facilityId, data.serviceId);

    if (existing) {
      db.prepare(`
        UPDATE current_availability
        SET status = ?, source = ?, confidence = ?, capacity_note = ?, updated_at = ?
        WHERE facility_id = ? AND service_id = ?
      `).run(
        data.status,
        data.source,
        confidence,
        data.capacityNote || null,
        now,
        data.facilityId,
        data.serviceId
      );
    } else {
      db.prepare(`
        INSERT INTO current_availability (facility_id, service_id, status, source, confidence, capacity_note, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        data.facilityId,
        data.serviceId,
        data.status,
        data.source,
        confidence,
        data.capacityNote || null,
        now
      );
    }

    const histId = `hist_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    db.prepare(`
      INSERT INTO availability_updates (id, facility_id, service_id, status, source, confidence, updated_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      histId,
      data.facilityId,
      data.serviceId,
      data.status,
      data.source,
      confidence,
      data.updatedBy || 'staff',
      now
    );

    // Audit event
    db.prepare(`
      INSERT INTO audit_events (id, actor_id, action, entity_type, entity_id, metadata, created_at)
      VALUES (?, ?, 'UPDATE_AVAILABILITY', 'facility_services', ?, ?, ?)
    `).run(
      `audit_${Date.now()}`,
      data.updatedBy || 'staff',
      `${data.facilityId}:${data.serviceId}`,
      JSON.stringify({ status: data.status, source: data.source }),
      now
    );
  });

  updateCurrent();

  // Invalidate discovery and facilities caches asynchronously in background
  cache.clearPattern('discover:*').catch(err => console.error('[Cache Error] Failed to clear discover pattern:', err));
  cache.clearPattern('facilities:*').catch(err => console.error('[Cache Error] Failed to clear facilities pattern:', err));

  return db.prepare(`
    SELECT ca.*, s.key as service_key
    FROM current_availability ca
    JOIN services s ON ca.service_id = s.id
    WHERE ca.facility_id = ? AND ca.service_id = ?
  `).get(data.facilityId, data.serviceId);
}
