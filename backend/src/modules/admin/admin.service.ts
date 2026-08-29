import { db } from '../../db/client.js';
import { ENV } from '../../config/env.js';

export function getAdminMetrics() {
  const totalFacilities = (db.prepare(`SELECT COUNT(*) as cnt FROM facilities WHERE status = 'ACTIVE'`).get() as any).cnt;
  const totalReferrals = (db.prepare(`SELECT COUNT(*) as cnt FROM referrals`).get() as any).cnt;
  const activeReferrals = (db.prepare(`SELECT COUNT(*) as cnt FROM referrals WHERE status IN ('CREATED', 'ACCEPTED', 'READY_FOR_VISIT')`).get() as any).cnt;

  // Unavailable services count
  const serviceGapsCount = (db.prepare(`SELECT COUNT(*) as cnt FROM current_availability WHERE status = 'UNAVAILABLE'`).get() as any).cnt;

  // Stale records count (>48 hours old)
  const staleCutoff = new Date(Date.now() - ENV.FRESHNESS_WINDOW_HOURS * 3600 * 1000).toISOString();
  const staleCount = (db.prepare(`SELECT COUNT(*) as cnt FROM current_availability WHERE updated_at < ?`).get(staleCutoff) as any).cnt;

  const pendingFeedbackCount = (db.prepare(`SELECT COUNT(*) as cnt FROM feedback_reports WHERE status = 'PENDING'`).get() as any).cnt;

  // Data Quality Score calculation: 100% - (staleCount * 5% + serviceGapsCount * 2%) bounded [0, 100]
  const qualityScore = Math.max(0, Math.min(100, Math.round(100 - (staleCount * 5 + serviceGapsCount * 2))));

  return {
    overview: {
      totalFacilities,
      totalReferrals,
      activeReferrals,
      serviceGapsCount,
      staleCount,
      pendingFeedbackCount,
      dataQualityScore: qualityScore
    }
  };
}

export function getAdminIssues() {
  const staleCutoff = new Date(Date.now() - ENV.FRESHNESS_WINDOW_HOURS * 3600 * 1000).toISOString();

  // 1. Service Gaps (UNAVAILABLE)
  const serviceGaps = db.prepare(`
    SELECT ca.*, f.name as facility_name, f.type as facility_type, s.key as service_key
    FROM current_availability ca
    JOIN facilities f ON ca.facility_id = f.id
    JOIN services s ON ca.service_id = s.id
    WHERE ca.status = 'UNAVAILABLE'
    ORDER BY ca.updated_at DESC
  `).all();

  // 2. Stale updates (>48h old)
  const staleUpdates = db.prepare(`
    SELECT ca.*, f.name as facility_name, s.key as service_key
    FROM current_availability ca
    JOIN facilities f ON ca.facility_id = f.id
    JOIN services s ON ca.service_id = s.id
    WHERE ca.updated_at < ?
    ORDER BY ca.updated_at ASC
  `).all(staleCutoff);

  // 3. Pending feedback queue
  const pendingFeedback = db.prepare(`
    SELECT fr.*, f.name as facility_name
    FROM feedback_reports fr
    JOIN facilities f ON fr.facility_id = f.id
    WHERE fr.status = 'PENDING'
    ORDER BY fr.created_at DESC
  `).all();

  return {
    serviceGaps,
    staleUpdates,
    pendingFeedback
  };
}
