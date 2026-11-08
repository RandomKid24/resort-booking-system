CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL, sleeps INTEGER NOT NULL, price INTEGER NOT NULL DEFAULT 0,  -- per night (or per person per night), whole currency units
  pricing TEXT NOT NULL DEFAULT 'room', extra_bed_price INTEGER NOT NULL DEFAULT 0, max_extra_beds INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1  -- 0 = archived, hidden from the board
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY, token TEXT NOT NULL UNIQUE,
  guest_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
  check_in TEXT NOT NULL, check_out TEXT NOT NULL, guests INTEGER NOT NULL DEFAULT 1,
  paid INTEGER NOT NULL DEFAULT 0, pay_method TEXT NOT NULL DEFAULT '', reminded INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS booking_rooms (
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  rate INTEGER NOT NULL DEFAULT 0,  -- price quoted at booking time
  basis TEXT NOT NULL DEFAULT 'room', pax INTEGER NOT NULL DEFAULT 0, extra_beds INTEGER NOT NULL DEFAULT 0, extra_rate INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (booking_id, room_id)
);
CREATE INDEX IF NOT EXISTS idx_booking_dates ON bookings(check_in, check_out);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
-- Audit log: every change is recorded, and rows can never be edited or deleted. Run once on an older database.
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY, at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor TEXT NOT NULL, action TEXT NOT NULL, entity TEXT NOT NULL DEFAULT '', entity_id INTEGER,
  summary TEXT NOT NULL, detail TEXT
);
CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log(at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, entity_id);
CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit_log BEGIN SELECT RAISE(ABORT, 'audit log is append-only'); END;
CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT, 'audit log is append-only'); END;
