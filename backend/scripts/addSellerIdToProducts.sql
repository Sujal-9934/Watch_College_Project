-- Run this to enable seller-scoped products and orders in the seller panel.
-- Run once. If column already exists, skip or run: ALTER TABLE products DROP COLUMN seller_id; then run again.
-- After running, assign products to sellers: UPDATE products SET seller_id = <user_id> WHERE ...;

ALTER TABLE products ADD COLUMN seller_id INT NULL AFTER id;
ALTER TABLE products ADD INDEX idx_products_seller_id (seller_id);
