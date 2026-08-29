-- Vaayu PostgreSQL DDL Schema

CREATE TABLE IF NOT EXISTS users (
    id TEXT,
    role TEXT,
    phone_hash TEXT,
    preferred_language TEXT,
    status TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
    id TEXT,
    name TEXT,
    type TEXT,
    pincode TEXT,
    village TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    hours TEXT,
    contact TEXT,
    status TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id TEXT,
    category TEXT,
    key TEXT,
    icon TEXT,
    active BOOLEAN
);

CREATE TABLE IF NOT EXISTS facility_services (
    facility_id TEXT,
    service_id TEXT,
    capability_status TEXT
);

CREATE TABLE IF NOT EXISTS availability_updates (
    id TEXT,
    facility_id TEXT,
    service_id TEXT,
    status TEXT,
    source TEXT,
    confidence REAL,
    updated_by TEXT,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS current_availability (
    facility_id TEXT,
    service_id TEXT,
    status TEXT,
    source TEXT,
    confidence REAL,
    capacity_note TEXT,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referrals (
    id TEXT,
    public_code TEXT,
    origin_facility_id TEXT,
    dest_facility_id TEXT,
    service_id TEXT,
    patient_name TEXT,
    patient_phone TEXT,
    urgency TEXT,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referral_events (
    id TEXT,
    referral_id TEXT,
    from_status TEXT,
    to_status TEXT,
    actor_id TEXT,
    reason TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback_reports (
    id TEXT,
    facility_id TEXT,
    service_id TEXT,
    category TEXT,
    description TEXT,
    reporter_role TEXT,
    status TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT,
    actor_id TEXT,
    action TEXT,
    entity_type TEXT,
    entity_id TEXT,
    metadata TEXT,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sos_triggers (
    id TEXT PRIMARY KEY,
    reporter_id TEXT,
    reporter_role TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT,
    ambulance_id TEXT,
    created_at TIMESTAMP,
    resolved_at TIMESTAMP
);
