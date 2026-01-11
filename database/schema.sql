-- ============================================================================
-- Premium Watch Store E-commerce Database Schema
-- Complete Database Setup with Demo Data
-- MySQL Database for Full-Stack E-commerce Application
-- ============================================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS watch_st;
USE watch_st;

-- ============================================================================
-- TABLE DEFINITIONS
-- ============================================================================

-- Users Table (Customers)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other') DEFAULT 'other',
    profile_image VARCHAR(255),
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires DATETIME,
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    role ENUM('user', 'admin', 'super_admin', 'seller') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Brands Table
CREATE TABLE IF NOT EXISTS brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo VARCHAR(255),
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT,
    short_description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    material VARCHAR(100),
    movement_type VARCHAR(100),
    water_resistance VARCHAR(50),
    warranty_period INT DEFAULT 24, -- months
    category_id INT,
    brand_id INT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Variants Table (for different sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    variant_name VARCHAR(100) NOT NULL, -- e.g., "Size", "Color"
    variant_value VARCHAR(100) NOT NULL, -- e.g., "Small", "Black"
    price_modifier DECIMAL(8,2) DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    sku_suffix VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Shopping Cart Table
CREATE TABLE IF NOT EXISTS cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    session_id VARCHAR(255), -- For guest users
    product_id INT NOT NULL,
    variant_id INT,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (user_id, product_id)
);

-- Addresses Table (Updated to match orderController requirements)
CREATE TABLE IF NOT EXISTS addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('billing', 'shipping') DEFAULT 'shipping',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    company VARCHAR(100),
    address VARCHAR(255) NOT NULL, -- Main address field (used by orderController)
    address_line_1 VARCHAR(255), -- Alternative field name for detailed addresses
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL, -- Main zip code field (used by orderController)
    postal_code VARCHAR(20), -- Alternative field name
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    discount_value DECIMAL(8,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('stripe', 'razorpay', 'cod') DEFAULT 'cod',
    payment_id VARCHAR(255),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    coupon_id INT,
    shipping_address_id INT,
    billing_address_id INT,
    order_notes TEXT,
    tracking_number VARCHAR(100),
    estimated_delivery_date DATE,
    delivered_at DATETIME,
    cancelled_at DATETIME,
    cancelled_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    FOREIGN KEY (billing_address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    payment_method ENUM('stripe', 'razorpay', 'cod') NOT NULL,
    payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_data JSON,
    refund_id VARCHAR(255),
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at DATETIME
);

-- Product Search History Table
CREATE TABLE IF NOT EXISTS search_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    search_query VARCHAR(255) NOT NULL,
    results_count INT DEFAULT 0,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart(session_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);

-- ============================================================================
-- DEMO DATA INSERTION
-- ============================================================================

-- Insert Categories
INSERT INTO categories (name, description, slug, sort_order) VALUES
('Men\'s Watches', 'Premium watches for men', 'mens-watches', 1),
('Women\'s Watches', 'Elegant watches for women', 'womens-watches', 2),
('Luxury Watches', 'High-end luxury timepieces', 'luxury-watches', 3),
('Sports Watches', 'Durable watches for active lifestyles', 'sports-watches', 4),
('Smart Watches', 'Modern smartwatches with advanced features', 'smart-watches', 5)
ON DUPLICATE KEY UPDATE name=name;

-- Insert Brands
INSERT INTO brands (name, description, slug, sort_order) VALUES
('Rolex', 'Luxury Swiss watch manufacturer', 'rolex', 1),
('Omega', 'Swiss luxury watch brand', 'omega', 2),
('Casio', 'Japanese electronics company', 'casio', 3),
('Fossil', 'American watch and lifestyle company', 'fossil', 4),
('Titan', 'Indian watch manufacturing company', 'titan', 5),
('Seiko', 'Japanese watch company', 'seiko', 6),
('Timex', 'American watch company', 'timex', 7),
('Apple', 'Technology company known for smartwatches', 'apple', 8),
('Samsung', 'South Korean electronics company', 'samsung', 9)
ON DUPLICATE KEY UPDATE name=name;

-- Insert Sample Products
INSERT INTO products (name, description, short_description, sku, price, original_price, discount_percentage, stock_quantity, category_id, brand_id, is_featured, seo_title, seo_description) VALUES
('Rolex Submariner', 'The Rolex Submariner is a line of luxury automatic watches designed for underwater exploration. It is one of the most recognized and coveted watches in the world. Features include a unidirectional rotating bezel, luminescent hour markers, and water resistance up to 300 meters.', 'Iconic diving watch with exceptional craftsmanship', 'ROLEX-SUB-116610LN', 850000.00, 900000.00, 5.56, 10, 3, 1, TRUE, 'Rolex Submariner - Luxury Diving Watch', 'Discover the iconic Rolex Submariner, a masterpiece of Swiss watchmaking designed for underwater exploration.'),

('Omega Speedmaster', 'The Omega Speedmaster is a legendary chronograph known as the "Moonwatch" for its role in the Apollo missions. This timepiece features a tachymeter scale, chronograph function, and exceptional precision.', 'Legendary chronograph used in space missions', 'OMEGA-SPEED-31130422001001', 450000.00, 500000.00, 10.00, 15, 3, 2, TRUE, 'Omega Speedmaster Moonwatch', 'The legendary Omega Speedmaster, famously known as the Moonwatch for its crucial role in the Apollo space missions.'),

('Casio G-Shock', 'The Casio G-Shock is a line of shock-resistant watches known for their durability and toughness. Built to withstand extreme conditions, these watches are perfect for outdoor adventures and sports activities.', 'Tough and durable digital watch', 'CASIO-GSHOCK-GW2310', 8500.00, 10000.00, 15.00, 50, 4, 3, FALSE, 'Casio G-Shock - Shock Resistant Watch', 'Experience unmatched durability with the Casio G-Shock, the ultimate shock-resistant watch for extreme conditions.'),

('Fossil Grant', 'The Fossil Grant is a sophisticated dress watch with a minimalist design and premium materials. Perfect for formal occasions and business settings.', 'Minimalist dress watch with leather strap', 'FOSSIL-GRANT-ES3822', 18500.00, 22000.00, 15.91, 30, 1, 4, TRUE, 'Fossil Grant - Minimalist Dress Watch', 'The Fossil Grant offers timeless elegance with its minimalist design and premium materials.'),

('Titan Edge', 'The Titan Edge is a modern smartwatch with fitness tracking and health monitoring features. Stay connected and track your daily activities with this feature-rich timepiece.', 'Smartwatch with fitness tracking', 'TITAN-EDGE-90185PP01', 25000.00, 30000.00, 16.67, 25, 5, 5, FALSE, 'Titan Edge Smartwatch', 'Stay connected and track your fitness with the Titan Edge smartwatch, featuring advanced health monitoring.'),

('Seiko Presage', 'The Seiko Presage collection combines traditional Japanese craftsmanship with modern watchmaking technology. These elegant timepieces feature automatic movements and sophisticated designs.', 'Elegant automatic watch with Japanese craftsmanship', 'SEIKO-PRESAGE-SSA343J1', 35000.00, 40000.00, 12.50, 20, 1, 6, TRUE, 'Seiko Presage Automatic Watch', 'Experience Japanese watchmaking excellence with the Seiko Presage collection.'),

('Timex Weekender', 'The Timex Weekender is a versatile and affordable watch perfect for everyday wear. With its classic design and reliable movement, it\'s a great choice for casual occasions.', 'Classic casual watch for everyday wear', 'TIMEX-WEEKENDER-TW2P80300', 3500.00, 4500.00, 22.22, 40, 1, 7, FALSE, 'Timex Weekender - Casual Watch', 'The Timex Weekender offers classic style and reliable performance for everyday wear.'),

('Apple Watch Series 9', 'The Apple Watch Series 9 is the latest smartwatch from Apple, featuring advanced health monitoring, fitness tracking, and seamless integration with iPhone.', 'Latest Apple smartwatch with advanced features', 'APPLE-WATCH-S9-45MM', 45000.00, 50000.00, 10.00, 35, 5, 8, TRUE, 'Apple Watch Series 9', 'Experience the future of wearable technology with the Apple Watch Series 9.'),

('Samsung Galaxy Watch 6', 'The Samsung Galaxy Watch 6 combines style and functionality with advanced health tracking, fitness monitoring, and smart features.', 'Premium smartwatch with health tracking', 'SAMSUNG-GALAXY-W6-44MM', 35000.00, 40000.00, 12.50, 30, 5, 9, FALSE, 'Samsung Galaxy Watch 6', 'Stay connected and healthy with the Samsung Galaxy Watch 6.'),

('Rolex Datejust', 'The Rolex Datejust is an iconic timepiece that has been a symbol of elegance and prestige since 1945. Features include a date display and the signature Cyclops lens.', 'Iconic elegant watch with date display', 'ROLEX-DJ-126234', 750000.00, 800000.00, 6.25, 8, 3, 1, TRUE, 'Rolex Datejust - Classic Elegance', 'The Rolex Datejust represents timeless elegance and precision in watchmaking.')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Product Images
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'Rolex Submariner front view', 1, TRUE),
(1, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 'Rolex Submariner side view', 2, FALSE),
(2, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800', 'Omega Speedmaster front view', 1, TRUE),
(3, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'Casio G-Shock front view', 1, TRUE),
(4, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 'Fossil Grant front view', 1, TRUE),
(5, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800', 'Titan Edge front view', 1, TRUE),
(6, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'Seiko Presage front view', 1, TRUE),
(7, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 'Timex Weekender front view', 1, TRUE),
(8, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800', 'Apple Watch Series 9 front view', 1, TRUE),
(9, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'Samsung Galaxy Watch 6 front view', 1, TRUE),
(10, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 'Rolex Datejust front view', 1, TRUE)
ON DUPLICATE KEY UPDATE image_url=image_url;

-- Insert Admin User in users table
-- Password: Admin@123 (bcrypt hash with 12 rounds)
-- To generate new hash: npm run create-admin (from backend directory)
INSERT INTO users (
    first_name,
    last_name,
    email,
    password,
    role,
    is_email_verified,
    is_active,
    phone
) VALUES (
    'Admin',
    'User',
    'admin@watchstore.com',
    '$2b$12$w6XkV0HdUIHu2W2BjAfU2eGkBVmNUTqa14EAUI0TIu4FgvPlqET/C', -- Admin@123
    'admin',
    1,
    1,
    '+91-9876543210'
)
ON DUPLICATE KEY UPDATE 
    role='admin',
    is_email_verified=1,
    is_active=1;

-- Insert Admin User in admin_users table (optional, for separate admin management)
INSERT INTO admin_users (username, email, password, first_name, last_name, role) VALUES
('admin', 'admin@watchstore.com', '$2b$12$w6XkV0HdUIHu2W2BjAfU2eGkBVmNUTqa14EAUI0TIu4FgvPlqET/C', 'Super', 'Admin', 'super_admin')
ON DUPLICATE KEY UPDATE username=username;

-- Insert Sample Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, usage_limit, start_date, end_date) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 5000.00, 100, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('SAVE500', 'Flat Rs. 500 off on orders above Rs. 10000', 'fixed', 500.00, 10000.00, 50, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY)),
('FESTIVE20', 'Festive season special - 20% off', 'percentage', 20.00, 15000.00, 200, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('FLAT1000', 'Flat Rs. 1000 off on orders above Rs. 25000', 'fixed', 1000.00, 25000.00, 100, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY))
ON DUPLICATE KEY UPDATE code=code;

-- Insert Sample User (for testing)
-- Password: User@123 (bcrypt hash)
INSERT INTO users (
    first_name,
    last_name,
    email,
    password,
    role,
    is_email_verified,
    is_active,
    phone,
    gender
) VALUES (
    'John',
    'Doe',
    'user@example.com',
    '$2b$12$tA8WM4kellHj0os928LKguzRH4/69.8Lpdhi4kvBTb3z.AEc3Go96', -- User@123
    'user',
    1,
    1,
    '+91-9876543211',
    'male'
)
ON DUPLICATE KEY UPDATE email=email;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- Admin Login Credentials:
-- Email: admin@watchstore.com
-- Password: Admin@123
--
-- Test User Credentials:
-- Email: user@example.com
-- Password: User@123
--
-- To update admin password, use: npm run create-admin (from backend directory)
-- This will generate a proper bcrypt hash for the password
--
-- All product images use placeholder URLs from Unsplash
-- Replace with actual product images in production
--
-- ============================================================================
