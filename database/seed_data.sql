USE ecommerce_db;

-- Standard User Accounts (BCrypt encoded)
INSERT INTO users (id, email, password, first_name, last_name, phone, role) VALUES
(1, 'admin@nexstore.com', '$2a$10$wE95pIcxG9s5jPqM3VZZ/ueCkgv17q6x0eY2Xm8e9rQfX0A3tLw0.', 'Store', 'Manager', '9876543210', 'ROLE_ADMIN'),
(2, 'customer@nexstore.com', '$2a$10$wE95pIcxG9s5jPqM3VZZ/ueCkgv17q6x0eY2Xm8e9rQfX0A3tLw0.', 'Rahul', 'Sharma', '9876543211', 'ROLE_CUSTOMER')
ON DUPLICATE KEY UPDATE email=email;

-- Verified Address
INSERT INTO addresses (id, user_id, full_name, phone, street_address, city, state, postal_code, country, is_default) VALUES
(1, 2, 'Rahul Sharma', '9876543211', 'Flat 402, Green Valley Apartments, Outer Ring Road', 'Bengaluru', 'Karnataka', '560103', 'India', TRUE)
ON DUPLICATE KEY UPDATE full_name=full_name;

-- Premium Commercial Categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES
(1, 'Electronics & Gadgets', 'electronics', 'Flagship laptops, noise-cancelling headphones, smart wearables and studio accessories.', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80'),
(2, 'Footwear & Athletic', 'footwear', 'Performance marathon runners, street-style high-tops and luxury leather sneakers.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'),
(3, 'Smart Wearables & Watches', 'wearables', 'Next-generation health telemetry watches, titanium smart bands and optical displays.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'),
(4, 'Gear & Tech Accessories', 'accessories', 'Waterproof anti-theft backpacks, mechanical keyboards, ergonomic desk sets.', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80')
ON DUPLICATE KEY UPDATE name=name;

-- Amazon / Flipkart Style Commercial Products
INSERT INTO products (id, name, slug, description, price, original_price, stock_quantity, sku, image_url, category_id, rating, review_count, is_best_seller, is_active) VALUES
(1, 'Sony WH-1000XM5 Wireless Industry-Leading Noise-Cancelling Headphones', 'sony-wh1000xm5-headphones', 'Industry Leading Noise Cancellation with 8 microphones and Auto NC Optimizer. Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback). Ultra-comfortable lightweight design with soft fit leather.', 26990.00, 34990.00, 35, 'SNY-WH-XM5', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 1, 4.8, 3840, TRUE, TRUE),

(2, 'Apple MacBook Air 15-inch M3 Chip (16GB RAM, 512GB SSD Storage)', 'apple-macbook-air-m3-15', 'Stunning 15.3-inch Liquid Retina display with True Tone. Supercharged by Apple M3 8-core CPU and 10-core GPU. Up to 18 hours of all-day battery life. MagSafe 3 charging port, two Thunderbolt ports, and 1080p FaceTime HD camera.', 134900.00, 154900.00, 14, 'APL-MBA-M3', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', 1, 4.9, 1420, TRUE, TRUE),

(3, 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard (Gateron Jupiter Brown)', 'keychron-q1-pro-keyboard', '75% layout full aluminum CNC machined mechanical keyboard. Connects up to 3 devices via Bluetooth 5.1 or Type-C wired. Hot-swappable PCB, south-facing RGB, screw-in stabilizers, and double-gasket acoustic dampening.', 15999.00, 19999.00, 45, 'KCR-Q1-PRO', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 1, 4.7, 856, FALSE, TRUE),

(4, 'Nike ZoomX Vaporfly Next% 3 Carbon Plate Racing Shoes', 'nike-zoomx-vaporfly-next-3', 'Engineered for marathon champions. Features responsive ZoomX foam paired with a full-length flyplate carbon fibre plate for propulsive energy return. Flyknit engineered mesh upper provides breathable lightweight containment.', 18395.00, 22995.00, 28, 'NKE-ZMX-VP3', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 2, 4.8, 2190, TRUE, TRUE),

(5, 'Converse Chuck 70 Vintage Canvas High-Top Unisex Sneakers', 'converse-chuck-70-vintage', 'Built off of the original 1970s design with premium materials and extraordinary attention to detail. Heavy-grade 12oz canvas upper, archival rubber taping, and cushioned OrthoLite insole for all-day comfort.', 5999.00, 7499.00, 60, 'CNV-CHK-70', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', 2, 4.6, 5210, FALSE, TRUE),

(6, 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium Case', 'apple-watch-ultra-2-gps', 'Rugged 49mm aerospace-grade titanium case. Brightest Always-On Retina display at 3000 nits. Precision dual-frequency GPS, customizable Action button, Depth gauge with water resistance to 100m, and up to 36-hour battery life.', 84900.00, 89900.00, 18, 'APL-WTCH-U2', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 3, 4.9, 940, TRUE, TRUE),

(7, 'Peak Design Everyday Backpack 20L V2 Weatherproof', 'peak-design-everyday-backpack-20l', 'An iconic, award-winning pack for everyday and photo carry. 100% recycled 400D weatherproof nylon canvas shell. Dual weatherproof side zips, MagLatch top closure, FlexFold dividers, and dedicated 15-inch laptop sleeve.', 24999.00, 28999.00, 22, 'PKD-EDB-20L', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 4, 4.7, 630, FALSE, TRUE),

(8, 'Bellroy Hide & Seek Premium Leather RFID-Blocking Bi-Fold Wallet', 'bellroy-hide-seek-leather-wallet', 'Engineered to keep traditional wallet capacity in a remarkably slim silhouette. Features 4 quick-access card slots, hidden cash coin compartment, RFID protection, and certified environmentally tanned top-grain leather.', 7200.00, 8500.00, 50, 'BLR-HDS-WLT', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', 4, 4.6, 1780, FALSE, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Customer Cart Initialization
INSERT INTO carts (id, user_id) VALUES (1, 2)
ON DUPLICATE KEY UPDATE user_id=user_id;
