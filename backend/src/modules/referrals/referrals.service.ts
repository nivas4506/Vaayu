import { db } from '../../db/client.js';
import { sendSMS, sendWhatsApp } from '../notifications/twilio.service.js';

export function generatePublicCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `REF-${num}`;
}

export function createReferral(data: {
  originFacilityId: string;
  destFacilityId: string;
  serviceId: string;
  patientName: string;
  patientPhone: string;
  urgency: 'ROUTINE' | 'URGENT';
  notes?: string;
  actorId?: string;
}) {
  const id = `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  let code = generatePublicCode();

  // Ensure code uniqueness
  while (db.prepare(`SELECT id FROM referrals WHERE public_code = ?`).get(code)) {
    code = generatePublicCode();
  }

  const now = new Date().toISOString();

  const insertRef = db.prepare(`
    INSERT INTO referrals (id, public_code, origin_facility_id, dest_facility_id, service_id, patient_name, patient_phone, urgency, status, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CREATED', ?, ?, ?)
  `);

  insertRef.run(
    id,
    code,
    data.originFacilityId,
    data.destFacilityId,
    data.serviceId,
    data.patientName,
    data.patientPhone,
    data.urgency,
    data.notes || null,
    now,
    now
  );

  // Insert initial audit event
  db.prepare(`
    INSERT INTO referral_events (id, referral_id, from_status, to_status, actor_id, reason, created_at)
    VALUES (?, ?, NULL, 'CREATED', ?, 'Referral created', ?)
  `).run(`evt_${Date.now()}`, id, data.actorId || 'anon_asha', now);

  // Dispatch SMS notification to patient if phone number provided
  if (data.patientPhone) {
    const message = `🏥 [VAAYU HEALTH REFERRAL]
Dear ${data.patientName}, your referral ticket ${code} has been created.
Service: ${data.serviceId}
Urgency: ${data.urgency}
Status: CREATED. Present this code at destination facility.`;
    sendSMS(data.patientPhone, message).catch((e) => console.warn('[Referral SMS Notification Error]', e));
    sendWhatsApp(data.patientPhone, message).catch((e) => console.warn('[Referral WhatsApp Notification Error]', e));
  }

  return getReferralByCode(code);
}

export function getReferralByCode(code: string) {
  const ref = db.prepare(`
    SELECT r.*,
           of.name as origin_facility_name,
           df.name as dest_facility_name,
           s.key as service_key
    FROM referrals r
    JOIN facilities of ON r.origin_facility_id = of.id
    JOIN facilities df ON r.dest_facility_id = df.id
    JOIN services s ON r.service_id = s.id
    WHERE r.public_code = ?
  `).get(code) as any;

  if (!ref) return null;

  const events = db.prepare(`
    SELECT * FROM referral_events WHERE referral_id = ? ORDER BY created_at ASC
  `).all(ref.id) as any[];

  return {
    ...ref,
    timeline: events
  };
}

export function updateReferralStatus(
  idOrCode: string,
  newStatus: 'CREATED' | 'ACCEPTED' | 'READY_FOR_VISIT' | 'COMPLETED' | 'REJECTED' | 'REDIRECTED',
  data?: { reason?: string; actorId?: string }
) {
  const ref = (db.prepare(`SELECT * FROM referrals WHERE id = ? OR public_code = ?`).get(idOrCode, idOrCode)) as any;
  if (!ref) return null;

  const validTransitions: Record<string, string[]> = {
    CREATED: ['ACCEPTED', 'REJECTED', 'REDIRECTED'],
    ACCEPTED: ['READY_FOR_VISIT', 'REJECTED', 'REDIRECTED'],
    READY_FOR_VISIT: ['COMPLETED', 'REJECTED', 'REDIRECTED'],
    COMPLETED: [],
    REJECTED: [],
    REDIRECTED: ['CREATED']
  };

  const allowed = validTransitions[ref.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid state transition from ${ref.status} to ${newStatus}`);
  }

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE referrals SET status = ?, updated_at = ? WHERE id = ?
  `).run(newStatus, now, ref.id);

  db.prepare(`
    INSERT INTO referral_events (id, referral_id, from_status, to_status, actor_id, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(`evt_${Date.now()}`, ref.id, ref.status, newStatus, data?.actorId || 'staff', data?.reason || null, now);

  // Dispatch status update notification
  if (ref.patient_phone) {
    const updateMsg = `🏥 [VAAYU REFERRAL UPDATE]
Ticket: ${ref.public_code}
Status updated to: ${newStatus}.${data?.reason ? ` Reason: ${data.reason}` : ''}`;
    sendSMS(ref.patient_phone, updateMsg).catch((e) => console.warn('[Referral Update SMS Error]', e));
  }

  return getReferralByCode(ref.public_code);
}
