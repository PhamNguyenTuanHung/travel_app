-- =============================================================================
-- KÍCH HOẠT EXTENSION PHỤC VỤ BẢN ĐỒ & TÌM KIẾM KHÔNG GIAN
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- 1. PHÂN HỆ NGƯỜI DÙNG & TƯƠNG TÁC (USERS & GAMIFICATION)
-- =============================================================================

-- Bảng Nhóm quyền (BỔ SUNG)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Bảng Người dùng (ĐÃ SỬA: Thêm khóa ngoại role_id)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id INT NOT NULL REFERENCES roles(id) DEFAULT 2, -- Mặc định là quyền user (id=2)
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    provider VARCHAR(20) NOT NULL DEFAULT 'credentials',
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    home_town VARCHAR(100),
    bio TEXT,
    total_points INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Lịch sử Điểm thưởng
CREATE TABLE loyalty_points_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    points_earned INT NOT NULL,
    blockchain_status VARCHAR(20) NOT NULL DEFAULT 'none',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. PHÂN HỆ DỮ LIỆU CỐT LÕI & BẢN ĐỒ (CORE DATA & SPATIAL MAP)
-- =============================================================================

-- Bảng Tỉnh/Thành phố
CREATE TABLE provinces (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE
);

-- Bảng Danh mục
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    icon_url VARCHAR(255) NOT NULL,
    marker_color VARCHAR(7) NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL
);

-- Bảng Địa điểm du lịch (Có tích hợp trường hình học PostGIS)
CREATE TABLE places (
    id BIGSERIAL PRIMARY KEY,
    province_id INT NOT NULL REFERENCES provinces(id) ON DELETE RESTRICT,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name_vi VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_vi TEXT NOT NULL,
    description_en TEXT NOT NULL,
    address_vi VARCHAR(255) NOT NULL,
    address_en VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    phone VARCHAR(20),
    opening_hours VARCHAR(255),
    price_range VARCHAR(100),
    has_parking BOOLEAN NOT NULL DEFAULT FALSE,
    is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
    sponsored_expires_at TIMESTAMP WITH TIME ZONE,
    avg_rating NUMERIC(2, 1) NOT NULL DEFAULT 0.0,
    total_reviews INT NOT NULL DEFAULT 0,
    total_favorites INT NOT NULL DEFAULT 0,
    total_visits INT NOT NULL DEFAULT 0,
    total_views INT NOT NULL DEFAULT 0
);

-- Bảng Bộ sưu tập ảnh địa điểm
CREATE TABLE place_images (
    id BIGSERIAL PRIMARY KEY,
    place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

-- =============================================================================
-- 3. PHÂN HỆ HÀNH TRÌNH & TƯƠNG TÁC (TRIPS, FAVORITES & REVIEWS)
-- =============================================================================

-- Bảng Địa điểm yêu thích
CREATE TABLE favorites (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, place_id)
);

-- Bảng Kế hoạch chuyến đi
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Chi tiết địa điểm thuộc chuyến đi
CREATE TABLE trip_places (
    id BIGSERIAL PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0
);

-- Bảng Xác minh đã ghé thăm (Check-in qua GPS)
CREATE TABLE user_checkins (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Đánh giá địa điểm
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Ảnh đính kèm của Đánh giá
CREATE TABLE review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL
);

-- =============================================================================
-- 4. PHÂN HỆ QUẢN TRỊ CMS (MARKETING & CONFIGURATION)
-- =============================================================================

-- Bảng Banner & Khuyến mại
CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    target_url VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Bảng Cấu hình Điểm Hệ thống
CREATE TABLE gamification_configs (
    action_key VARCHAR(50) PRIMARY KEY,
    points INT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- TẠO CÁC INDEX ĐỂ TỐI ƯU HÓA TỐC ĐỘ TRUY VẤN (DATABASE TUNING)
-- =============================================================================
CREATE INDEX idx_places_geom ON places USING GIST (geom);
CREATE INDEX idx_places_province ON places(province_id);
CREATE INDEX idx_places_category ON places(category_id);
CREATE INDEX idx_place_images_place ON place_images(place_id);
CREATE INDEX idx_trip_places_trip ON trip_places(trip_id);
CREATE INDEX idx_reviews_place ON reviews(place_id);
CREATE INDEX idx_loyalty_history_user ON loyalty_points_history(user_id);
CREATE INDEX idx_places_name_vi_lower ON places (LOWER(name_vi));

-- TRƯỚC KHI CHÈN: XÓA DỮ LIỆU CŨ Ở CÁC BẢNG ĐỂ TRÁNH TRÙNG LẶP (RESET DATA)
TRUNCATE review_images, reviews, user_checkins, trip_places, trips, favorites, place_images, places, categories, provinces, loyalty_points_history, users, roles CASCADE;

-- =============================================================================
-- 0. CHÈN BẢNG NHÓM QUYỀN (ROLES) - BỔ SUNG
-- =============================================================================
INSERT INTO roles (id, name) VALUES 
(1, 'admin'), 
(2, 'user'), 
(3, 'moderator');

SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- =============================================================================
-- 1. CHÈN BẢNG TỈNH THÀNH (PROVINCES)
-- =============================================================================
INSERT INTO provinces (id, slug, name_vi, name_en, is_visible) VALUES
(1, 'can-tho', 'Cần Thơ', 'Can Tho', TRUE),
(2, 'an-giang', 'An Giang', 'An Giang', TRUE),
(3, 'ben-tre', 'Bến Tre', 'Ben Tre', TRUE),
(4, 'dong-thap', 'Đồng Tháp', 'Dong Thap', TRUE),
(5, 'kien-giang', 'Kiên Giang', 'Kien Giang', TRUE);

SELECT setval('provinces_id_seq', (SELECT MAX(id) FROM provinces));

-- =============================================================================
-- 2. CHÈN BẢNG DANH MỤC (CATEGORIES)
-- =============================================================================
INSERT INTO categories (id, icon_url, marker_color, name_vi, name_en) VALUES
(1, 'https://cdn-icons-png.flaticon.com/512/2983/2983057.png', '#FF5733', 'Quán ăn', 'Restaurant'),
(2, 'https://cdn-icons-png.flaticon.com/512/2913/2913564.png', '#33FF57', 'Khách sạn', 'Hotel'),
(3, 'https://cdn-icons-png.flaticon.com/512/854/854878.png', '#3357FF', 'Điểm du lịch', 'Attraction'),
(4, 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png', '#E133FF', 'Đặc sản', 'Souvenir'),
(5, 'https://cdn-icons-png.flaticon.com/512/2734/2734039.png', '#FFC133', 'Cafe', 'Cafe'),
(6, 'https://cdn-icons-png.flaticon.com/512/489/489874.png', '#33FFF0', 'Homestay', 'Homestay');

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- =============================================================================
-- 3. CHÈN BẢNG NGƯỜI DÙNG (USERS - ĐÃ SỬA: Thêm gán role_id mẫu)
-- =============================================================================
INSERT INTO users (id, role_id, email, phone, password_hash, full_name, home_town, total_points, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, 'dukhach1@gmail.com', '0901234567', 'hash_1', 'Nguyễn Văn Tây', 'TP. Hồ Chí Minh', 350, 'active'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 2, 'john_tourist@yahoo.com', '0918888888', 'hash_2', 'John Terry', 'London', 120, 'active'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 2, 'mientay_lover@gmail.com', '0939991122', 'hash_3', 'Lê Trần Ninh Kiều', 'Cần Thơ', 500, 'active'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 1, 'admin_test@mekongoi.vn', '0944555666', 'hash_4', 'Trần Văn CMS', 'Bến Tre', 0, 'active');

-- =============================================================================
-- 4. CHÈN BẢNG ĐỊA ĐIỂM (PLACES) - 15 ĐỊA ĐIỂM TRẢI KHẮP MIỀN TÂY
-- =============================================================================
INSERT INTO places (
    id, province_id, category_id, name_vi, name_en, 
    description_vi, description_en, address_vi, address_en, 
    latitude, longitude, geom, phone, opening_hours, price_range, 
    has_parking, is_sponsored, avg_rating, total_reviews, total_favorites, total_visits, total_views
) VALUES
-- === CẦN THƠ ===
(1, 1, 3, 'Chợ nổi Cái Răng', 'Cai Rang Floating Market',
 'Chợ nổi chuyên mua bán nông sản, trái cây ở sông Cái Răng.', 'A bustling floating market famous for local agricultural products.',
 'Sông Cái Răng, Quận Cái Răng, Cần Thơ', 'Cai Rang River, Can Tho',
 10.005187, 105.746816, ST_SetSRID(ST_MakePoint(105.746816, 10.005187), 4326), '02923123456', '05:00 - 09:00', '20.000đ - 100.000đ', FALSE, TRUE, 4.8, 2, 45, 120, 1500),

(2, 1, 1, 'Quán Ăn Hồi Đó', 'Hoi Do Restaurant',
 'Quán ăn mang phong cách miền Tây xưa cũ, cơm điền dã.', 'A retro-styled restaurant serving traditional Southern meals.',
 '56 Trần Bình Trọng, Ninh Kiều, Cần Thơ', '56 Tran Binh Trong, Can Tho',
 10.034179, 105.779183, ST_SetSRID(ST_MakePoint(105.779183, 10.034179), 4326), '0939123456', '10:00 - 22:00', '40.000đ - 150.000đ', TRUE, FALSE, 4.5, 1, 23, 80, 600),

(3, 1, 2, 'Khách sạn Victoria Cần Thơ Resort', 'Victoria Can Tho Resort',
 'Khu nghỉ dưỡng sang trọng bậc nhất bên bờ sông Hậu.', 'Luxury colonial-style resort located on the banks of Hau River.',
 'Phường Cái Khế, Ninh Kiều, Cần Thơ', 'Cai Khe Ward, Can Tho',
 10.046522, 105.786931, ST_SetSRID(ST_MakePoint(105.786931, 10.046522), 4326), '02923810111', '24/7', '1.500.000đ - 4.000.000đ', TRUE, TRUE, 4.7, 0, 89, 40, 2300),

-- === AN GIANG ===
(4, 2, 3, 'Rừng tràm Trà Sư', 'Tra Su Cajuput Forest',
 'Hệ sinh thái rừng ngập mặn tuyệt đẹp với thảm bèo xanh mướt.', 'A stunning flooded mangrove forest filled with green duckweed.',
 'Văn Giáo, Tịnh Biên, An Giang', 'Van Giao, Tinh Bien, An Giang',
 10.553974, 105.050672, ST_SetSRID(ST_MakePoint(105.050672, 10.553974), 4326), NULL, '07:00 - 17:30', '100.000đ - 200.000đ', TRUE, FALSE, 4.6, 1, 110, 310, 4200),

(5, 2, 3, 'Miếu Bà Chúa Xứ Núi Sam', 'Ba Chua Xu Temple',
 'Trung tâm hành hương tâm linh lớn nhất Đồng bằng Sông Cửu Long.', 'The most famous spiritual pilgrimage site in the Mekong Delta.',
 'Phường Núi Sam, TP. Châu Đốc, An Giang', 'Nui Sam Ward, Chau Doc, An Giang',
 10.680194, 105.077553, ST_SetSRID(ST_MakePoint(105.077553, 10.680194), 4326), NULL, '24/7', 'Miễn phí', TRUE, FALSE, 4.4, 0, 320, 1500, 9800),

(6, 2, 6, 'Fami Homestay Châu Đốc', 'Fami Homestay Chau Doc',
 'Homestay miệt vườn yên bình gần trung tâm thành phố.', 'A peaceful countryside homestay near downtown.',
 'Vĩnh Mỹ, Châu Đốc, An Giang', 'Vinh My, Chau Doc, An Giang',
 10.701123, 105.122341, ST_SetSRID(ST_MakePoint(105.122341, 10.701123), 4326), '0912345678', '24/7', '350.000đ - 600.000đ', TRUE, FALSE, 4.8, 0, 15, 12, 180),

-- === BẾN TRE ===
(7, 3, 3, 'Khu du lịch Làng Bè Bến Tre', 'Lang Be Tourist Area',
 'Nơi trải nghiệm các trò chơi dân gian sông nước Miền Tây vui nhộn.', 'An amusement park featuring traditional Southern river games.',
 'An Khánh, Châu Thành, Bến Tre', 'An Khanh, Chau Thanh, Ben Tre',
 10.292556, 106.329432, ST_SetSRID(ST_MakePoint(106.329432, 10.292556), 4326), '0949911999', '08:00 - 18:00', '50.000đ - 250.000đ', TRUE, TRUE, 4.3, 0, 64, 520, 3100),

(8, 3, 4, 'Kẹo dừa Thanh Long', 'Thanh Long Coconut Candy',
 'Lò sản xuất kẹo dừa truyền thống lâu đời, tham quan miễn phí.', 'A long-standing traditional coconut candy workshop.',
 'Phường 4, TP. Bến Tre, Bến Tre', 'Ward 4, Ben Tre City, Ben Tre',
 10.241553, 106.376843, ST_SetSRID(ST_MakePoint(106.376843, 10.241553), 4326), '02753822456', '07:30 - 21:00', '20.000đ - 100.000đ', TRUE, FALSE, 4.5, 0, 42, 90, 850),

-- === ĐỒNG THÁP ===
(9, 4, 3, 'Làng hoa kiểng Sa Đéc', 'Sa Dec Flower Village',
 'Vương quốc hoa của miền Tây với hàng trăm loài hoa khoe sắc.', 'The flower capital of the Mekong Delta with hundreds of species.',
 'Tân Quy Đông, Sa Đéc, Đồng Tháp', 'Tan Quy Dong, Sa Dec, Dong Thap',
 10.308722, 105.772543, ST_SetSRID(ST_MakePoint(105.772543, 10.308722), 4326), NULL, '06:00 - 18:00', '20.000đ - 50.000đ', TRUE, FALSE, 4.6, 0, 210, 890, 5600),

(10, 4, 1, 'Nhà cổ Huỳnh Thủy Lê', 'Huynh Thuy Le Ancient House',
 'Ngôi nhà cổ nổi tiếng gắn liền với tiểu thuyết "Người tình".', 'The famous ancient house associated with the novel "The Lover".',
 '255A Nguyễn Huệ, Sa Đéc, Đồng Tháp', '255A Nguyen Hue, Sa Dec, Dong Thap',
 10.291234, 105.761234, ST_SetSRID(ST_MakePoint(105.761234, 10.291234), 4326), '02773863215', '07:00 - 17:00', '20.000đ', TRUE, FALSE, 4.5, 0, 78, 140, 1900),

-- === KIÊN GIANG ===
(11, 5, 3, 'Chợ đêm Phú Quốc', 'Phu Quoc Night Market',
 'Thiên đường ẩm thực hải sản và mua sắm về đêm tại đảo ngọc.', 'A paradise of seafood street food and night shopping on Pearl Island.',
 'Đường Bạch Đằng, Dương Đông, Phú Quốc', 'Bach Dang Street, Phu Quoc',
 10.218522, 103.957543, ST_SetSRID(ST_MakePoint(103.957543, 10.218522), 4326), NULL, '17:00 - 23:30', '50.000đ - 500.000đ', FALSE, TRUE, 4.2, 0, 430, 2500, 15000),

(12, 5, 2, 'Khu nghỉ dưỡng Sunset Sanato', 'Sunset Sanato Resort',
 'Nơi ngắm hoàng hôn đẹp nhất Phú Quốc với các kiến trúc độc lạ.', 'The most famous sunset-watching beach resort in Phu Quoc.',
 'Bãi Trường, Dương Tơ, Phú Quốc', 'Truong Beach, Duong To, Phu Quoc',
 10.174122, 103.961234, ST_SetSRID(ST_MakePoint(103.961234, 10.174122), 4326), '02976266666', '24/7', '1.200.000đ - 3.500.000đ', TRUE, FALSE, 4.4, 0, 190, 680, 7400),

(13, 1, 5, 'Chợ Nổi Coffee', 'Cho Noi Coffee',
 'Quán cafe view sông ngắm ghe thuyền lướt qua cực chill.', 'A river-view cafe to watch local boats passing by.',
 'Ninh Kiều, Cần Thơ', 'Ninh Kieu, Can Tho',
 10.028912, 105.780123, ST_SetSRID(ST_MakePoint(105.780123, 10.028912), 4326), NULL, '06:00 - 22:00', '25.000đ - 50.000đ', TRUE, FALSE, 4.5, 0, 12, 35, 450),

(14, 3, 5, 'Ba Đống Cafe Bến Tre', 'Ba Dong Cafe',
 'Quán cafe phong cách miệt vườn, không gian rợp bóng dừa xanh.', 'A garden-style cafe surrounded by green coconut trees.',
 'Hùng Vương, TP. Bến Tre', 'Hung Vuong, Ben Tre City',
 10.238912, 106.379123, ST_SetSRID(ST_MakePoint(106.379123, 10.238912), 4326), NULL, '07:00 - 22:00', '20.000đ - 45.000đ', TRUE, FALSE, 4.3, 0, 8, 14, 290),

(15, 2, 4, 'Đặc sản Tung Lò Mò Châu Phong', 'Chau Phong Tung Lo Mo',
 'Nơi bán lạp xưởng bò truyền thống của người Chăm An Giang.', 'Traditional beef sausage workshop of Cham ethnic group.',
 'Châu Phong, Tân Châu, An Giang', 'Chau Phong, Tan Chau, An Giang',
 10.821345, 105.152345, ST_SetSRID(ST_MakePoint(105.152345, 10.821345), 4326), '0988776655', '06:00 - 21:00', '150.000đ - 300.000đ', TRUE, FALSE, 4.7, 0, 56, 120, 1100);

SELECT setval('places_id_seq', (SELECT MAX(id) FROM places));

-- =============================================================================
-- 5. CHÈN BẢNG BỘ SƯU TẬP ẢNH (PLACE_IMAGES)
-- =============================================================================
INSERT INTO place_images (place_id, image_url, is_primary) VALUES
(1, 'https://mekongoi.vn/images/cairang-1.jpg', TRUE),
(1, 'https://mekongoi.vn/images/cairang-2.jpg', FALSE),
(2, 'https://mekongoi.vn/images/hoido-1.jpg', TRUE),
(4, 'https://mekongoi.vn/images/trasu-1.jpg', TRUE),
(4, 'https://mekongoi.vn/images/trasu-2.jpg', FALSE),
(11, 'https://mekongoi.vn/images/phuquoc-market-1.jpg', TRUE);

-- =============================================================================
-- 6. CHÈN BẢNG ĐÁNH GIÁ (REVIEWS)
-- =============================================================================
INSERT INTO reviews (user_id, place_id, rating, comment, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 5, 'Hủ tiếu lắc ghe ngon xuất sắc, view bình minh bao phê!', 'approved'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 1, 4, 'Amazing traditional floating culture! Love the fresh pineapple.', 'approved'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 2, 5, 'Cơm kho quẹt đúng chuẩn vị ngoại nấu ngày xưa, không gian ấm cúng.', 'approved'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 4, 4, 'So green and beautiful, dynamic bird sanctuary!', 'approved');

-- =============================================================================
-- 7. CHÈN BẢNG KẾ HOẠCH CHUYẾN ĐI (TRIPS & TRIP_PLACES)
-- =============================================================================
INSERT INTO trips (id, user_id, title) VALUES
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Phượt Cần Thơ - An Giang 3 Ngày');

INSERT INTO trip_places (trip_id, place_id, sort_order) VALUES
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 1, 1),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 2, 2),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 4, 3);

-- =============================================================================
-- 8. CHÈN BẢNG CẤU HÌNH ĐIỂM THƯỞNG (SỬ DỤNG UPSERT)
-- =============================================================================
INSERT INTO gamification_configs (action_key, points) VALUES
('daily_checkin', 10),
('review', 30),
('share_app', 20),
('place_checkin', 50)
ON CONFLICT (action_key) 
DO UPDATE SET points = EXCLUDED.points, updated_at = CURRENT_TIMESTAMP;