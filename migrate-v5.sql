-- Prices by day of the week. Run once on a database created before this.
-- Existing bookings keep their totals: every day of an existing booking is priced at the price it was quoted.
ALTER TABLE rooms ADD COLUMN day_prices TEXT NOT NULL DEFAULT '{}';
ALTER TABLE booking_rooms ADD COLUMN day_rates TEXT NOT NULL DEFAULT '[]';
ALTER TABLE bookings ADD COLUMN total INTEGER NOT NULL DEFAULT 0;
UPDATE booking_rooms SET day_rates = json_array(rate, rate, rate, rate, rate, rate, rate);
UPDATE bookings SET total = CAST(julianday(check_out) - julianday(check_in) AS INTEGER) * (SELECT COALESCE(SUM(CASE WHEN basis = 'person' THEN rate * pax ELSE rate END + extra_beds * extra_rate), 0) FROM booking_rooms WHERE booking_id = bookings.id);
