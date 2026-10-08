-- Add custom_link for nav-only categories (e.g. My Clock Luxe → /luxe, Gifting → /gifting).
-- Run once. Safe to run if column already exists (ignore error).

ALTER TABLE categories ADD COLUMN custom_link VARCHAR(255) NULL AFTER sort_order;
