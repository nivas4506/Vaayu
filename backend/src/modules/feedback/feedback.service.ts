import { db } from '../../db/client.js';

export function submitFeedback(data: {
  facilityId: string;
  serviceId?: string;
  category: 'wrong_status' | 'wrong_hours' | 'missing_facility' | 'medicine_shortage' | 'staff_absent';
  description: string;
  reporterRole?: string;
}) {
  const id = `fdb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO feedback_reports (id, facility_id, service_id, category, description, reporter_role, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
  `).run(
    id,
    data.facilityId,
    data.serviceId || null,
    data.category,
    data.description,
    data.reporterRole || 'PATIENT',
    now
  );

  return db.prepare(`SELECT * FROM feedback_reports WHERE id = ?`).get(id);
}

export function getAllFeedbackReports(status?: 'PENDING' | 'RESOLVED') {
  let query = `
    SELECT fr.*, f.name as facility_name
    FROM feedback_reports fr
    JOIN facilities f ON fr.facility_id = f.id
  `;
  const params: any[] = [];

  if (status) {
    query += ` WHERE fr.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY fr.created_at DESC`;

  return db.prepare(query).all(...params);
}
