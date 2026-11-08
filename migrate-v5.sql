-- Weekday and weekend prices. Run once on a database created before this.
-- Existing bookings keep their totals: their weekend price equals their normal price and all nights count as weekday nights.
ALTER TABLE rooms ADD COLUMN weekend_price INTEGER NOT NULL DEFAULT 0;
ALTER TABLE booking_rooms ADD COLUMN weekend_rate INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN wk_nights INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN we_nights INTEGER NOT NULL DEFAULT 0;
UPDATE booking_rooms SET weekend_rate = rate;
UPDATE bookings SET wk_nights = CAST(julianday(check_out) - julianday(check_in) AS INTEGER), we_nights = 0;
