import { db } from '../../db/client.js';
import { ENV } from '../../config/env.js';
import { cache } from '../../db/cache.js';

export async function getAllFacilities(filters?: { type?: string; pincode?: string }) {
  const typeFilter = filters?.type || '';
  const pincodeFilter = filters?.pincode || '';
  const cacheKey = `facilities:list:${typeFilter}:${pincodeFilter}`;

  const cached = await cache.get<any[]>(cacheKey);
  if (cached) return cached;

  let query = `SELECT * FROM facilities WHERE status = 'ACTIVE'`;
  const params: any[] = [];

  if (filters?.type) {
    query += ` AND type = ?`;
    params.push(filters.type);
  }
  if (filters?.pincode) {
    query += ` AND pincode = ?`;
    params.push(filters.pincode);
  }

  query += ` ORDER BY name ASC`;

  const facilities = db.prepare(query).all(...params) as any[];

  const result = facilities.map((fac) => {
    const services = db.prepare(`
      SELECT ca.*, s.category, s.key as service_key, s.icon
      FROM current_availability ca
      JOIN services s ON ca.service_id = s.id
      WHERE ca.facility_id = ?
    `).all(fac.id) as any[];

    return {
      ...fac,
      services: services.map((s) => ({
        serviceId: s.service_id,
        category: s.category,
        key: s.service_key,
        icon: s.icon,
        status: s.status,
        source: s.source,
        confidence: s.confidence,
        capacityNote: s.capacity_note,
        updatedAt: s.updated_at,
        isStale: (Date.now() - new Date(s.updated_at).getTime()) > ENV.FRESHNESS_WINDOW_HOURS * 3600 * 1000
      }))
    };
  });

  await cache.set(cacheKey, result, 600); // Cache for 10 minutes
  return result;
}

export async function getFacilityById(id: string) {
  const cacheKey = `facilities:detail:${id}`;
  const cached = await cache.get<any>(cacheKey);
  if (cached) return cached;

  const fac = db.prepare(`SELECT * FROM facilities WHERE id = ?`).get(id) as any;
  if (!fac) return null;

  const services = db.prepare(`
    SELECT ca.*, s.category, s.key as service_key, s.icon
    FROM current_availability ca
    JOIN services s ON ca.service_id = s.id
    WHERE ca.facility_id = ?
  `).all(id) as any[];

  const result = {
    ...fac,
    services: services.map((s) => ({
      serviceId: s.service_id,
      category: s.category,
      key: s.service_key,
      icon: s.icon,
      status: s.status,
      source: s.source,
      confidence: s.confidence,
      capacityNote: s.capacity_note,
      updatedAt: s.updated_at,
      isStale: (Date.now() - new Date(s.updated_at).getTime()) > ENV.FRESHNESS_WINDOW_HOURS * 3600 * 1000
    }))
  };

  await cache.set(cacheKey, result, 600); // Cache for 10 minutes
  return result;
}
