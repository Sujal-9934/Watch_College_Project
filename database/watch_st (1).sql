-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 12, 2026 at 07:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `watch_st`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('billing','shipping') DEFAULT 'shipping',
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `address_line_1` varchar(255) DEFAULT NULL,
  `address_line_2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `zip_code` varchar(20) NOT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'India',
  `is_default` tinyint DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `type`, `first_name`, `last_name`, `email`, `phone`, `company`, `address`, `address_line_1`, `address_line_2`, `city`, `state`, `zip_code`, `postal_code`, `country`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 4, 'shipping', 'Nitin', 'Dube', 'nitindube275@gmail.com', '7945124523', NULL, 'Songadh (M)', NULL, NULL, 'Songadh (M)', 'Songadh,Tapi,GJ', '394670', NULL, 'India', 0, '2026-01-18 11:28:41', '2026-01-18 11:28:41'),
(2, 4, 'billing', 'Nitin', 'Dube', 'nitindube275@gmail.com', '7945124523', NULL, 'Songadh (M)', NULL, NULL, 'Songadh (M)', 'Songadh,Tapi,GJ', '394670', NULL, 'India', 0, '2026-01-18 11:28:41', '2026-01-18 11:28:41'),
(3, 4, 'shipping', 'Nitin', 'Dube', 'nitindube275@gmail.com', '7945124523', NULL, 'Songadh (M)', NULL, NULL, 'Songadh (M)', 'Songadh,Tapi,GJ', '394670', NULL, 'India', 0, '2026-01-19 12:22:12', '2026-01-19 12:22:12'),
(4, 4, 'billing', 'Nitin', 'Dube', 'nitindube275@gmail.com', '7945124523', NULL, 'Songadh (M)', NULL, NULL, 'Songadh (M)', 'Songadh,Tapi,GJ', '394670', NULL, 'India', 0, '2026-01-19 12:22:12', '2026-01-19 12:22:12'),
(5, 4, 'shipping', 'Nitin', 'Dube', 'nitindube275@gmail.com', '7945124523', NULL, 'Songadh (M)', NULL, NULL, 'Songadh (M)', 'Songadh,Tapi,GJ', '394670', NULL, 'India', 0, '2026-01-19 12:49:20', '2026-01-19 12:49:20'),
(6, 4, 'billing', 'Nitin', 'Dube', 'nitindube275@gmail.com', '7945124523', NULL, 'Songadh (M)', NULL, NULL, 'Songadh (M)', 'Songadh,Tapi,GJ', '394670', NULL, 'India', 0, '2026-01-19 12:49:20', '2026-01-19 12:49:20'),
(7, 4, 'shipping', 'Nitin', 'Dube', 'nitindube275@gmail.com', '7945124523', NULL, 'Songadh (M)', NULL, NULL, 'Songadh (M)', 'Songadh,Tapi,GJ', '394670', NULL, 'India', 0, '2026-01-19 13:13:30', '2026-01-19 13:13:30'),
(8, 4, 'billing', 'Nitin', 'Dube', 'nitindube275@gmail.com', '7945124523', NULL, 'Songadh (M)', NULL, NULL, 'Songadh (M)', 'Songadh,Tapi,GJ', '394670', NULL, 'India', 0, '2026-01-19 13:13:30', '2026-01-19 13:13:30');

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `role` enum('super_admin','admin','moderator') DEFAULT 'admin',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `is_active` tinyint DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `role`, `permissions`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@watchstore.com', '$2b$12$w6XkV0HdUIHu2W2BjAfU2eGkBVmNUTqa14EAUI0TIu4FgvPlqET/C', 'Super', 'Admin', 'super_admin', NULL, 1, NULL, '2026-01-12 09:56:50', '2026-01-12 09:56:50');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `is_active` tinyint DEFAULT 1,
  `sort_order` int DEFAULT 0,
  `custom_link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `description`, `logo`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Rolex', 'Luxury Swiss watch manufacturer', 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=400&logo=rolex', 'rolex', 1, 1, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(2, 'Omega', 'Swiss luxury watch brand', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&logo=omega', 'omega', 1, 2, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(3, 'Casio', 'Japanese electronics company', 'https://images.unsplash.com/photo-1509192505294-54624bc02149?w=400&logo=casio', 'casio', 1, 3, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(4, 'Fossil', 'American watch and lifestyle company', 'https://images.unsplash.com/photo-1547996160-81dfa63595dd?w=400&logo=fossil', 'fossil', 1, 4, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(5, 'Titan', 'Indian watch manufacturing company', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&logo=titan', 'titan', 1, 5, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(6, 'Seiko', 'Japanese watch company', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&logo=seiko', 'seiko', 1, 6, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(7, 'Timex', 'American watch company', 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&logo=timex', 'timex', 1, 7, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(8, 'Apple', 'Technology company known for smartwatches', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&logo=apple', 'apple', 1, 8, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(9, 'Samsung', 'South Korean electronics company', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&logo=samsung', 'samsung', 1, 9, '2026-01-12 09:56:50', '2026-01-12 09:56:50');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `slug` varchar(100) NOT NULL,
  `is_active` tinyint DEFAULT 1,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `image`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Men\'s Watches', 'Premium watches for men', 'https://images.unsplash.com/photo-1623998021451-306e52f33653?w=800&cat=men', 'mens-watches', 1, 1, '2026-01-12 09:56:50', '2026-02-23 09:10:54'),
(2, 'Women\'s Watches', 'Elegant watches for women', 'https://images.unsplash.com/photo-1623998021743-30588147dca0?w=800&cat=women', 'womens-watches', 1, 2, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(3, 'Luxury Watches', 'High-end luxury timepieces', 'https://images.unsplash.com/photo-1547996160-81dfa63595dd?w=800&cat=luxury', 'luxury-watches', 1, 3, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(4, 'Sports Watches', 'Durable watches for active lifestyles', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&cat=sports', 'sports-watches', 1, 4, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(5, 'Smart Watches', 'Modern smartwatches with advanced features', 'https://images.unsplash.com/photo-1508685096489-7cf6ca62ec0b?w=800&cat=smart', 'smart-watches', 1, 5, '2026-01-12 09:56:50', '2026-01-12 09:56:50');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `discount_value` decimal(8,2) NOT NULL,
  `minimum_order_amount` decimal(10,2) DEFAULT 0.00,
  `maximum_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT 0,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `is_active` tinyint DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `description`, `discount_type`, `discount_value`, `minimum_order_amount`, `maximum_discount_amount`, `usage_limit`, `used_count`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 5000.00, NULL, 100, 0, '2026-01-12 15:26:50', '2026-02-11 15:26:50', 1, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(2, 'SAVE500', 'Flat Rs. 500 off on orders above Rs. 10000', 'fixed', 500.00, 10000.00, NULL, 50, 0, '2026-01-12 15:26:50', '2026-03-13 15:26:50', 1, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(3, 'FESTIVE20', 'Festive season special - 20% off', 'percentage', 20.00, 15000.00, NULL, 200, 0, '2026-01-12 15:26:50', '2026-04-12 15:26:50', 1, '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(4, 'FLAT1000', 'Flat Rs. 1000 off on orders above Rs. 25000', 'fixed', 1000.00, 25000.00, NULL, 100, 0, '2026-01-12 15:26:50', '2026-02-26 15:26:50', 1, '2026-01-12 09:56:50', '2026-01-12 09:56:50');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter_subscribers`
--

CREATE TABLE `newsletter_subscribers` (
  `id` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `is_active` tinyint DEFAULT 1,
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `unsubscribed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_method` enum('stripe','razorpay','cod') DEFAULT 'cod',
  `payment_id` varchar(255) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `shipping_amount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `coupon_id` int DEFAULT NULL,
  `shipping_address_id` int DEFAULT NULL,
  `billing_address_id` int DEFAULT NULL,
  `order_notes` text DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `estimated_delivery_date` date DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `cancelled_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `user_id`, `status`, `payment_status`, `payment_method`, `payment_id`, `subtotal`, `tax_amount`, `discount_amount`, `shipping_amount`, `total_amount`, `coupon_id`, `shipping_address_id`, `billing_address_id`, `order_notes`, `tracking_number`, `estimated_delivery_date`, `delivered_at`, `cancelled_at`, `cancelled_reason`, `created_at`, `updated_at`) VALUES
(1, 'ORD17687357213075EED8C', 4, 'processing', 'pending', 'razorpay', NULL, 1300000.00, 234000.00, 0.00, 0.00, 1534000.00, NULL, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-18 11:28:41', '2026-01-19 12:23:11'),
(2, 'ORD176882533218170BD53', 4, 'processing', 'pending', 'cod', NULL, 50000.00, 9000.00, 0.00, 0.00, 59000.00, NULL, 3, 4, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-19 12:22:12', '2026-01-19 12:23:03'),
(3, 'ORD176882696047778459B', 4, 'pending', 'pending', 'cod', NULL, 45000.00, 8100.00, 0.00, 0.00, 53100.00, NULL, 5, 6, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-19 12:49:20', '2026-01-19 12:49:20'),
(4, 'ORD17688284101821E7623', 4, 'confirmed', 'pending', 'cod', NULL, 50000.00, 9000.00, 0.00, 0.00, 59000.00, NULL, 7, 8, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-19 13:13:30', '2026-01-19 13:14:17');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_sku` varchar(100) NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variant_id`, `product_name`, `product_sku`, `quantity`, `unit_price`, `total_price`, `created_at`) VALUES
(1, 1, 2, NULL, 'Omega Speedmaster', 'OMEGA-SPEED-31130422001001', 1, 450000.00, 450000.00, '2026-01-18 11:28:41'),
(2, 1, 1, NULL, 'Rolex Submariner', 'ROLEX-SUB-116610LN', 1, 850000.00, 850000.00, '2026-01-18 11:28:41'),
(3, 2, 11, NULL, 'Nii', 'nih', 1, 50000.00, 50000.00, '2026-01-19 12:22:12'),
(4, 3, 8, NULL, 'Apple Watch Series 9', 'APPLE-WATCH-S9-45MM', 1, 45000.00, 45000.00, '2026-01-19 12:49:20'),
(5, 4, 11, NULL, 'Nii', 'nih', 1, 50000.00, 50000.00, '2026-01-19 13:13:30');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `payment_method` enum('stripe','razorpay','cod') NOT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'INR',
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `payment_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_data`)),
  `refund_id` varchar(255) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `refund_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `seller_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `sku` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `stock_quantity` int DEFAULT 0,
  `min_stock_level` int DEFAULT 5,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `movement_type` varchar(100) DEFAULT NULL,
  `water_resistance` varchar(50) DEFAULT NULL,
  `warranty_period` int DEFAULT 24,
  `category_id` int DEFAULT NULL,
  `brand_id` int DEFAULT NULL,
  `is_featured` tinyint DEFAULT 0,
  `is_active` tinyint DEFAULT 1,
  `seo_title` varchar(255) DEFAULT NULL,
  `seo_description` text DEFAULT NULL,
  `seo_keywords` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products` 

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT 0,
  `is_primary` tinyint DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images` 

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `rating` int NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(255) DEFAULT NULL,
  `review_text` text DEFAULT NULL,
  `is_verified_purchase` tinyint DEFAULT 0,
  `is_approved` tinyint DEFAULT 1,
  `likes_count` int DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_name` varchar(100) NOT NULL,
  `variant_value` varchar(100) NOT NULL,
  `price_modifier` decimal(8,2) DEFAULT 0.00,
  `stock_quantity` int DEFAULT 0,
  `sku_suffix` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `search_history`
--

CREATE TABLE `search_history` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `search_query` varchar(255) NOT NULL,
  `results_count` int DEFAULT 0,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sliders`
--

CREATE TABLE `sliders` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_active` tinyint DEFAULT 1,
  `display_order` int DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sliders`
--

INSERT INTO `sliders` (`id`, `title`, `description`, `image_url`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Luxury Timepieces', 'Discover exquisite craftsmanship', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 1, 1, '2026-01-12 10:02:37', '2026-01-12 10:02:37'),
(2, 'Timeless Elegance', 'Where tradition meets innovation', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 1, 2, '2026-01-12 10:02:37', '2026-01-12 10:02:37'),
(3, 'Precision Engineering', 'Mastery in every movement', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 1, 3, '2026-01-12 10:02:37', '2026-01-12 10:02:37'),
(4, 'Heritage Collection', 'Century-old craftsmanship', 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 1, 4, '2026-01-12 10:02:37', '2026-01-12 10:02:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `profile_image` varchar(255) DEFAULT NULL,
  `is_email_verified` tinyint DEFAULT 0,
  `email_verification_token` varchar(255) DEFAULT NULL,
  `email_verification_expires` datetime DEFAULT NULL,
  `login_otp_token` varchar(255) DEFAULT NULL,
  `login_otp_expires` datetime DEFAULT NULL,
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` datetime DEFAULT NULL,
  `is_active` tinyint DEFAULT 1,
  `role` enum('user','admin','super_admin','seller') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `phone`, `date_of_birth`, `gender`, `profile_image`, `is_email_verified`, `email_verification_token`, `email_verification_expires`, `login_otp_token`, `login_otp_expires`, `reset_password_token`, `reset_password_expires`, `is_active`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'User', 'admin@watchstore.com', '$2a$10$Rw7UW/tPpZX62DM4tTrgK.Y0kfjuEB/w6ElK9eW.PaQ4ymTdE4Sla', '+91-9876543210', NULL, 'other', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'admin', '2026-01-12 09:56:50', '2026-02-23 08:45:47'),
(2, 'John', 'Doe', 'user@example.com', '$2b$12$tA8WM4kellHj0os928LKguzRH4/69.8Lpdhi4kvBTb3z.AEc3Go96', '+91-9876543211', NULL, 'male', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'user', '2026-01-12 09:56:50', '2026-01-12 09:56:50'),
(4, 'Nitin', 'Dube', 'nitindube275@gmail.com', '$2b$12$zfi7i3js1iA/m2xRbvI4.OuHHGhEplyxQATl9s5cp8Q4zMKqtoxuO', NULL, NULL, 'other', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'user', '2026-01-12 10:05:17', '2026-03-12 06:45:42'),
(5, 'tamanna', 'panchal', 'tamannapanchal36@gmail.com', '$2b$12$kbxbaJqojg6gKK.4wbc6rO/7gWJ7i2Y7u/X0Hk3AHwVEgmKWUzXsK', NULL, NULL, 'other', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'user', '2026-01-12 10:23:58', '2026-01-12 10:25:16'),
(6, 'seller', 'example', 'seller@example.com', '$2a$10$Rw7UW/tPpZX62DM4tTrgK.Y0kfjuEB/w6ElK9eW.PaQ4ymTdE4Sla', NULL, NULL, 'other', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'seller', '2026-03-12 05:29:19', '2026-03-12 05:32:55');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(1, 4, 1, '2026-01-18 11:18:55');

--

INSERT INTO `products` (`id`, `seller_id`, `name`, `description`, `short_description`, `sku`, `price`, `original_price`, `discount_percentage`, `stock_quantity`, `min_stock_level`, `weight`, `dimensions`, `material`, `movement_type`, `water_resistance`, `warranty_period`, `category_id`, `brand_id`, `is_featured`, `is_active`, `seo_title`, `seo_description`, `seo_keywords`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Rolex Men\'s Heritage', 'The premium Rolex Men\'s Heritage from our exclusive Men\'s Watches collection.', 'Quality watch', 'MEN-1-1-1', 13000.00, 14500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 1, 1, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(2, NULL, 'Omega Men\'s Modern', 'The premium Omega Men\'s Modern from our exclusive Men\'s Watches collection.', 'Quality watch', 'MEN-2-2-2', 58000.00, 59500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 1, 2, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(3, NULL, 'Casio Men\'s Supreme', 'The premium Casio Men\'s Supreme from our exclusive Men\'s Watches collection.', 'Quality watch', 'MEN-3-3-3', 45000.00, 46500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 1, 3, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(4, NULL, 'Fossil Men\'s Elite', 'The premium Fossil Men\'s Elite from our exclusive Men\'s Watches collection.', 'Quality watch', 'MEN-4-4-4', 35000.00, 36500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 1, 4, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(5, NULL, 'Titan Men\'s Explorer', 'The premium Titan Men\'s Explorer from our exclusive Men\'s Watches collection.', 'Quality watch', 'MEN-5-5-5', 39000.00, 40500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 1, 5, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(6, NULL, 'Rolex Women\'s Heritage', 'The premium Rolex Women\'s Heritage from our exclusive Women\'s Watches collection.', 'Quality watch', 'WOM-1-1-6', 18000.00, 19500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 2, 1, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(7, NULL, 'Omega Women\'s Modern', 'The premium Omega Women\'s Modern from our exclusive Women\'s Watches collection.', 'Quality watch', 'WOM-2-2-7', 43000.00, 44500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 2, 2, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(8, NULL, 'Casio Women\'s Supreme', 'The premium Casio Women\'s Supreme from our exclusive Women\'s Watches collection.', 'Quality watch', 'WOM-3-3-8', 33000.00, 34500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 2, 3, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(9, NULL, 'Fossil Women\'s Elite', 'The premium Fossil Women\'s Elite from our exclusive Women\'s Watches collection.', 'Quality watch', 'WOM-4-4-9', 46000.00, 47500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 2, 4, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(10, NULL, 'Titan Women\'s Explorer', 'The premium Titan Women\'s Explorer from our exclusive Women\'s Watches collection.', 'Quality watch', 'WOM-5-5-10', 46000.00, 47500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 2, 5, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(11, NULL, 'Rolex Luxury Heritage', 'The premium Rolex Luxury Heritage from our exclusive Luxury Watches collection.', 'Quality watch', 'LUX-1-1-11', 24000.00, 25500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 3, 1, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(12, NULL, 'Omega Luxury Modern', 'The premium Omega Luxury Modern from our exclusive Luxury Watches collection.', 'Quality watch', 'LUX-2-2-12', 36000.00, 37500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 3, 2, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(13, NULL, 'Casio Luxury Supreme', 'The premium Casio Luxury Supreme from our exclusive Luxury Watches collection.', 'Quality watch', 'LUX-3-3-13', 56000.00, 57500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 3, 3, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(14, NULL, 'Fossil Luxury Elite', 'The premium Fossil Luxury Elite from our exclusive Luxury Watches collection.', 'Quality watch', 'LUX-4-4-14', 43000.00, 44500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 3, 4, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(15, NULL, 'Titan Luxury Explorer', 'The premium Titan Luxury Explorer from our exclusive Luxury Watches collection.', 'Quality watch', 'LUX-5-5-15', 17000.00, 18500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 3, 5, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(16, NULL, 'Rolex Sports Heritage', 'The premium Rolex Sports Heritage from our exclusive Sports Watches collection.', 'Quality watch', 'SPT-1-1-16', 57000.00, 58500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 4, 1, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(17, NULL, 'Omega Sports Modern', 'The premium Omega Sports Modern from our exclusive Sports Watches collection.', 'Quality watch', 'SPT-2-2-17', 16000.00, 17500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 4, 2, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(18, NULL, 'Casio Sports Supreme', 'The premium Casio Sports Supreme from our exclusive Sports Watches collection.', 'Quality watch', 'SPT-3-3-18', 32000.00, 33500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 4, 3, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(19, NULL, 'Fossil Sports Elite', 'The premium Fossil Sports Elite from our exclusive Sports Watches collection.', 'Quality watch', 'SPT-4-4-19', 41000.00, 42500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 4, 4, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(20, NULL, 'Titan Sports Explorer', 'The premium Titan Sports Explorer from our exclusive Sports Watches collection.', 'Quality watch', 'SPT-5-5-20', 47000.00, 48500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 4, 5, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(21, NULL, 'Rolex Smart Heritage', 'The premium Rolex Smart Heritage from our exclusive Smart Watches collection.', 'Quality watch', 'SMT-1-1-21', 52000.00, 53500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 5, 1, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(22, NULL, 'Omega Smart Modern', 'The premium Omega Smart Modern from our exclusive Smart Watches collection.', 'Quality watch', 'SMT-2-2-22', 33000.00, 34500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 5, 2, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(23, NULL, 'Casio Smart Supreme', 'The premium Casio Smart Supreme from our exclusive Smart Watches collection.', 'Quality watch', 'SMT-3-3-23', 28000.00, 29500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 5, 3, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(24, NULL, 'Fossil Smart Elite', 'The premium Fossil Smart Elite from our exclusive Smart Watches collection.', 'Quality watch', 'SMT-4-4-24', 50000.00, 51500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 5, 4, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00'),
(25, NULL, 'Titan Smart Explorer', 'The premium Titan Smart Explorer from our exclusive Smart Watches collection.', 'Quality watch', 'SMT-5-5-25', 48000.00, 49500.00, 0.00, 25, 5, NULL, NULL, NULL, NULL, NULL, 24, 5, 5, 0, 1, NULL, NULL, NULL, '2026-03-19 16:30:00', '2026-03-19 16:30:00');

INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80', 'Rolex Men\'s Heritage', 0, 1, '2026-03-19 16:30:00'),
(2, 2, 'https://images.unsplash.com/photo-1557531751-2294890cb582?w=800&q=80', 'Omega Men\'s Modern', 0, 1, '2026-03-19 16:30:00'),
(3, 3, 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80', 'Casio Men\'s Supreme', 0, 1, '2026-03-19 16:30:00'),
(4, 4, 'https://images.unsplash.com/photo-1547996160-81dfa63595dd?w=800&q=80', 'Fossil Men\'s Elite', 0, 1, '2026-03-19 16:30:00'),
(5, 5, 'https://images.unsplash.com/photo-1508685096489-7cf6ca62ec0b?w=800&q=80', 'Titan Men\'s Explorer', 0, 1, '2026-03-19 16:30:00'),
(6, 6, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', 'Rolex Women\'s Heritage', 0, 1, '2026-03-19 16:30:00'),
(7, 7, 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80', 'Omega Women\'s Modern', 0, 1, '2026-03-19 16:30:00'),
(8, 8, 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80', 'Casio Women\'s Supreme', 0, 1, '2026-03-19 16:30:00'),
(9, 9, 'https://images.unsplash.com/photo-1526333637841-8308ee82333b?w=800&q=80', 'Fossil Women\'s Elite', 0, 1, '2026-03-19 16:30:00'),
(10, 10, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80', 'Titan Women\'s Explorer', 0, 1, '2026-03-19 16:30:00'),
(11, 11, 'https://images.unsplash.com/photo-1517466107383-77c8e6f1f1d1?w=800&q=80', 'Rolex Luxury Heritage', 0, 1, '2026-03-19 16:30:00'),
(12, 12, 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80', 'Omega Luxury Modern', 0, 1, '2026-03-19 16:30:00'),
(13, 13, 'https://images.unsplash.com/photo-1622434641406-a15812345ad1?w=800&q=80', 'Casio Luxury Supreme', 0, 1, '2026-03-19 16:30:00'),
(14, 14, 'https://images.unsplash.com/photo-1619134704035-9e1969b7cca2?w=800&q=80', 'Fossil Luxury Elite', 0, 1, '2026-03-19 16:30:00'),
(15, 15, 'https://images.unsplash.com/photo-1617375252865-c89b27521191?w=800&q=80', 'Titan Luxury Explorer', 0, 1, '2026-03-19 16:30:00'),
(16, 16, 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800&q=80', 'Rolex Sports Heritage', 0, 1, '2026-03-19 16:30:00'),
(17, 17, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', 'Omega Sports Modern', 0, 1, '2026-03-19 16:30:00'),
(18, 18, 'https://images.unsplash.com/photo-1509192505294-54624bc02149?w=800&q=80', 'Casio Sports Supreme', 0, 1, '2026-03-19 16:30:00'),
(19, 19, 'https://images.unsplash.com/photo-1511499767350-a1590fdb2ca8?w=800&q=80', 'Fossil Sports Elite', 0, 1, '2026-03-19 16:30:00'),
(20, 20, 'https://images.unsplash.com/photo-1639019888514-6f2964955375?w=800&q=80', 'Titan Sports Explorer', 0, 1, '2026-03-19 16:30:00'),
(21, 21, 'https://images.unsplash.com/photo-1613524681729-fd508092ec0f?w=800&q=80', 'Rolex Smart Heritage', 0, 1, '2026-03-19 16:30:00'),
(22, 22, 'https://images.unsplash.com/photo-1623998021451-306e52f33653?w=800&q=80', 'Omega Smart Modern', 0, 1, '2026-03-19 16:30:00'),
(23, 23, 'https://images.unsplash.com/photo-1623998022131-7788950882e3?w=800&q=80', 'Casio Smart Supreme', 0, 1, '2026-03-19 16:30:00'),
(24, 24, 'https://images.unsplash.com/photo-1623998021743-30588147dca0?w=800&q=80', 'Fossil Smart Elite', 0, 1, '2026-03-19 16:30:00'),
(25, 25, 'https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?w=800&q=80', 'Titan Smart Explorer', 0, 1, '2026-03-19 16:30:00');

-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `idx_cart_user` (`user_id`),
  ADD KEY `idx_cart_session` (`session_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `coupon_id` (`coupon_id`),
  ADD KEY `shipping_address_id` (`shipping_address_id`),
  ADD KEY `billing_address_id` (`billing_address_id`),
  ADD KEY `idx_orders_user` (`user_id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_created` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `idx_order_items_order` (`order_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `brand_id` (`brand_id`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);


--


--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `newsletter_subscribers`
--
ALTER TABLE `newsletter_subscribers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;


--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--


--


--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `search_history`
--
ALTER TABLE `search_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sliders`
--
ALTER TABLE `sliders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `activity_logs_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`billing_address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `search_history`
--
ALTER TABLE `search_history`
  ADD CONSTRAINT `search_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;



COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
