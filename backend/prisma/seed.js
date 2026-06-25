const prisma = require('../src/config/db');
const bcrypt = require('bcrypt');

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Truncate all existing tables in cascade order
  console.log("🧹 Truncating existing tables...");
  const tablenames = [
    'notifications',
    'ad_clicks_impressions',
    'review_images',
    'reviews',
    'user_checkins',
    'trip_places',
    'trips',
    'favorites',
    'place_images',
    'ads',
    'places',
    'categories',
    'districts',
    'provinces',
    'loyalty_points_history',
    'users',
    'roles',
    'providers',
    'gamification_configs'
  ];

  for (const name of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${name}" CASCADE;`);
    } catch (err) {
      console.warn(`⚠️ Could not truncate table ${name}:`, err.message);
    }
  }

  // 2. Seed Roles
  console.log("👥 Seeding roles...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO roles (id, name) VALUES 
    (1, 'admin'), 
    (2, 'user'), 
    (3, 'staff');
  `);
  await prisma.$executeRawUnsafe(`SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));`);

  // 3. Seed Providers
  console.log("💼 Seeding providers...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO providers (id, name, logo_url, contact_name, phone, email, website_url, status) VALUES
    (1, 'Victoria Resort Group', 'https://example.com/logo-victoria.png', 'Nguyễn Văn Thành', '0912111222', 'contact@victoriaresorts.com', 'https://victoriaresorts.com', 'active'),
    (2, 'Quán Ăn Hồi Đó Group', 'https://example.com/logo-hoido.png', 'Lê Thị Út', '0939123456', 'info@hoidocantho.vn', 'https://facebook.com/hoidocantho', 'active'),
    (3, 'Đặc sản Bến Tre Thanh Long', 'https://example.com/logo-thanhlong.png', 'Trần Thanh Long', '02753822456', 'sales@keoduathanhlong.vn', 'https://keoduathanhlong.vn', 'active');
  `);
  await prisma.$executeRawUnsafe(`SELECT setval('providers_id_seq', (SELECT MAX(id) FROM providers));`);

  // 4. Seed Provinces
  console.log("🗺️ Seeding provinces...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO provinces (id, slug, name_vi, name_en, is_visible) VALUES
    (1, 'can-tho', 'Cần Thơ', 'Can Tho', TRUE),
    (2, 'an-giang', 'An Giang', 'An Giang', TRUE),
    (3, 'ben-tre', 'Bến Tre', 'Ben Tre', TRUE),
    (4, 'dong-thap', 'Đồng Tháp', 'Dong Thap', TRUE),
    (5, 'kien-giang', 'Kiên Giang', 'Kien Giang', TRUE);
  `);
  await prisma.$executeRawUnsafe(`SELECT setval('provinces_id_seq', (SELECT MAX(id) FROM provinces));`);

  // 5. Seed Districts
  console.log("🏙️ Seeding districts...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO districts (id, province_id, slug, name_vi, name_en, is_visible) VALUES
    (1, 1, 'ninh-kieu', 'Ninh Kiều', 'Ninh Kieu', TRUE),
    (2, 1, 'cai-rang', 'Cái Răng', 'Cai Rang', TRUE),
    (3, 2, 'chau-doc', 'Châu Đốc', 'Chau Doc', TRUE),
    (4, 2, 'tinh-bien', 'Tịnh Biên', 'Tinh Bien', TRUE),
    (5, 3, 'tp-ben-tre', 'TP. Bến Tre', 'Ben Tre City', TRUE),
    (6, 3, 'chau-thanh', 'Châu Thành', 'Chau Thanh', TRUE),
    (7, 4, 'sa-dec', 'Sa Đéc', 'Sa Dec', TRUE),
    (8, 5, 'phu-quoc', 'Phú Quốc', 'Phu Quoc', TRUE),
    (9, 2, 'tan-chau', 'Tân Châu', 'Tan Chau', TRUE);
  `);
  await prisma.$executeRawUnsafe(`SELECT setval('districts_id_seq', (SELECT MAX(id) FROM districts));`);

  // 6. Seed Categories
  console.log("🏷️ Seeding categories...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO categories (id, icon_url, marker_color, name_vi, name_en) VALUES
    (1, 'https://cdn-icons-png.flaticon.com/512/2983/2983057.png', '#FF5733', 'Quán ăn', 'Restaurant'),
    (2, 'https://cdn-icons-png.flaticon.com/512/2913/2913564.png', '#33FF57', 'Khách sạn', 'Hotel'),
    (3, 'https://cdn-icons-png.flaticon.com/512/854/854878.png', '#3357FF', 'Điểm du lịch', 'Attraction'),
    (4, 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png', '#E133FF', 'Đặc sản', 'Souvenir'),
    (5, 'https://cdn-icons-png.flaticon.com/512/2734/2734039.png', '#FFC133', 'Cafe', 'Cafe'),
    (6, 'https://cdn-icons-png.flaticon.com/512/489/489874.png', '#33FFF0', 'Homestay', 'Homestay');
  `);
  await prisma.$executeRawUnsafe(`SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));`);

  // 7. Seed Users (with bcrypt hashed password "123456")
  console.log("👤 Seeding users...");
  const hashedPassword = await bcrypt.hash("123456", 10);
  await prisma.users.createMany({
    data: [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        role_id: 2, // user
        email: 'dukhach1@gmail.com',
        phone: '0901234567',
        password_hash: hashedPassword,
        full_name: 'Nguyễn Văn Tây',
        traveler_type: 'DOMESTIC',
        total_points: 350,
        status: 'active'
      },
      {
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        role_id: 2, // user
        email: 'john_tourist@yahoo.com',
        phone: '0918888888',
        password_hash: hashedPassword,
        full_name: 'John Terry',
        traveler_type: 'INTERNATIONAL',
        total_points: 120,
        status: 'active'
      },
      {
        id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        role_id: 2, // user
        email: 'mientay_lover@gmail.com',
        phone: '0939991122',
        password_hash: hashedPassword,
        full_name: 'Lê Trần Ninh Kiều',
        traveler_type: 'DOMESTIC',
        total_points: 500,
        status: 'active'
      },
      {
        id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        role_id: 1, // admin
        email: 'admin_test@mekongoi.vn',
        phone: '0944555666',
        password_hash: hashedPassword,
        full_name: 'Trần Văn CMS',
        traveler_type: 'DOMESTIC',
        total_points: 0,
        status: 'active'
      }
    ]
  });

  // 8. Seed Places (utilizing PostGIS Raw SQL)
  console.log("📍 Seeding places (PostGIS geometry)...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO places (
        id, district_id, category_id, name_vi, name_en, 
        description_vi, description_en, address_vi, address_en, 
        latitude, longitude, geom, phone, opening_hours, min_price, max_price, 
        has_parking, avg_rating, total_reviews, total_favorites, total_visits, total_views
    ) VALUES
    -- === CẦN THƠ ===
    (1, 2, 3, 'Chợ nổi Cái Răng', 'Cai Rang Floating Market',
     'Chợ nổi chuyên mua bán nông sản, trái cây ở sông Cái Răng.', 'A bustling floating market famous for local agricultural products.',
     'Sông Cái Răng, Quận Cái Răng, Cần Thơ', 'Cai Rang River, Can Tho',
     10.005187, 105.746816, ST_SetSRID(ST_MakePoint(105.746816, 10.005187), 4326), '02923123456', '05:00 - 09:00', 20000, 100000, FALSE, 4.8, 2, 45, 120, 1500),
    
    (2, 1, 1, 'Quán Ăn Hồi Đó', 'Hoi Do Restaurant',
     'Quán ăn mang phong cách miền Tây xưa cũ, cơm điền dã.', 'A retro-styled restaurant serving traditional Southern meals.',
     '56 Trần Bình Trọng, Ninh Kiều, Cần Thơ', '56 Tran Binh Trong, Can Tho',
     10.034179, 105.779183, ST_SetSRID(ST_MakePoint(105.779183, 10.034179), 4326), '0939123456', '10:00 - 22:00', 40000, 150000, TRUE, 4.5, 1, 23, 80, 600),
    
    (3, 1, 2, 'Khách sạn Victoria Cần Thơ Resort', 'Victoria Can Tho Resort',
     'Khu nghỉ dưỡng sang trọng bậc nhất bên bờ sông Hậu.', 'Luxury colonial-style resort located on the banks of Hau River.',
     'Phường Cái Khế, Ninh Kiều, Cần Thơ', 'Cai Khe Ward, Can Tho',
     10.046522, 105.786931, ST_SetSRID(ST_MakePoint(105.786931, 10.046522), 4326), '02923810111', '24/7', 1500000, 4000000, TRUE, 4.7, 0, 89, 40, 2300),
    
    -- === AN GIANG ===
    (4, 4, 3, 'Rừng tràm Trà Sư', 'Tra Su Cajuput Forest',
     'Hệ sinh thái rừng ngập mặn tuyệt đẹp với thảm bèo xanh mướt.', 'A stunning flooded mangrove forest filled with green duckweed.',
     'Văn Giáo, Tịnh Biên, An Giang', 'Van Giao, Tinh Bien, An Giang',
     10.553974, 105.050672, ST_SetSRID(ST_MakePoint(105.050672, 10.553974), 4326), NULL, '07:00 - 17:30', 100000, 200000, TRUE, 4.6, 1, 110, 310, 4200),
    
    (5, 3, 3, 'Miếu Bà Chúa Xứ Núi Sam', 'Ba Chua Xu Temple',
     'Trung tâm hành hương tâm linh lớn nhất Đồng bằng Sông Cửu Long.', 'The most famous spiritual pilgrimage site in the Mekong Delta.',
     'Phường Núi Sam, TP. Châu Đốc, An Giang', 'Nui Sam Ward, Chau Doc, An Giang',
     10.680194, 105.077553, ST_SetSRID(ST_MakePoint(105.077553, 10.680194), 4326), NULL, '24/7', 0, 0, TRUE, 4.4, 0, 320, 1500, 9800),
    
    (6, 3, 6, 'Fami Homestay Châu Đốc', 'Fami Homestay Chau Doc',
     'Homestay miệt vườn yên bình gần trung tâm thành phố.', 'A peaceful countryside homestay near downtown.',
     'Vĩnh Mỹ, Châu Đốc, An Giang', 'Vinh My, Chau Doc, An Giang',
     10.701123, 105.122341, ST_SetSRID(ST_MakePoint(105.122341, 10.701123), 4326), '0912345678', '24/7', 350000, 600000, TRUE, 4.8, 0, 15, 12, 180),
    
    -- === BẾN TRE ===
    (7, 6, 3, 'Khu du lịch Làng Bè Bến Tre', 'Lang Be Tourist Area',
     'Nơi trải nghiệm các trò chơi dân gian sông nước Miền Tây vui nhộn.', 'An amusement park featuring traditional Southern river games.',
     'An Khánh, Châu Thành, Bến Tre', 'An Khanh, Chau Thanh, Ben Tre',
     10.292556, 106.329432, ST_SetSRID(ST_MakePoint(106.329432, 10.292556), 4326), '0949911999', '08:00 - 18:00', 50000, 250000, TRUE, 4.3, 0, 64, 520, 3100),
    
    (8, 5, 4, 'Kẹo dừa Thanh Long', 'Thanh Long Coconut Candy',
     'Lò sản xuất kẹo dừa truyền thống lâu đời, tham quan miễn phí.', 'A long-standing traditional coconut candy workshop.',
     'Phường 4, TP. Bến Tre, Bến Tre', 'Ward 4, Ben Tre City, Ben Tre',
     10.241553, 106.376843, ST_SetSRID(ST_MakePoint(106.376843, 10.241553), 4326), '02753822456', '07:30 - 21:00', 20000, 100000, TRUE, 4.5, 0, 42, 90, 850),
    
    -- === ĐỒNG THÁP ===
    (9, 7, 3, 'Làng hoa kiểng Sa Đéc', 'Sa Dec Flower Village',
     'Vương quốc hoa của miền Tây với hàng trăm loài hoa khoe sắc.', 'The flower capital of the Mekong Delta with hundreds of species.',
     'Tân Quy Đông, Sa Đéc, Đồng Tháp', 'Tan Quy Dong, Sa Dec, Dong Thap',
     10.308722, 105.772543, ST_SetSRID(ST_MakePoint(105.772543, 10.308722), 4326), NULL, '06:00 - 18:00', 20000, 50000, TRUE, 4.6, 0, 210, 890, 5600),
    
    (10, 7, 1, 'Nhà cổ Huỳnh Thủy Lê', 'Huynh Thuy Le Ancient House',
     'Ngôi nhà cổ nổi tiếng gắn liền với tiểu thuyết "Người tình".', 'The famous ancient house associated with the novel "The Lover".',
     '255A Nguyễn Huệ, Sa Đéc, Đồng Tháp', '255A Nguyen Hue, Sa Dec, Dong Thap',
     10.291234, 105.761234, ST_SetSRID(ST_MakePoint(105.761234, 10.291234), 4326), '02773863215', '07:00 - 17:00', 20000, 20000, TRUE, 4.5, 0, 78, 140, 1900),
    
    -- === KIÊN GIANG ===
    (11, 8, 3, 'Chợ đêm Phú Quốc', 'Phu Quoc Night Market',
     'Thiên đường ẩm thực hải sản và mua sắm về đêm tại đảo ngọc.', 'A paradise of seafood street food and night shopping on Pearl Island.',
     'Đường Bạch Đằng, Dương Đông, Phú Quốc', 'Bach Dang Street, Phu Quoc',
     10.218522, 103.957543, ST_SetSRID(ST_MakePoint(103.957543, 10.218522), 4326), NULL, '17:00 - 23:30', 50000, 500000, FALSE, 4.2, 0, 430, 2500, 15000),
    
    (12, 8, 2, 'Khu nghỉ dưỡng Sunset Sanato', 'Sunset Sanato Resort',
     'Nơi ngắm hoàng hôn đẹp nhất Phú Quốc với các kiến trúc độc lạ.', 'The most famous sunset-watching beach resort in Phu Quoc.',
     'Bãi Trường, Dương Tơ, Phú Quốc', 'Truong Beach, Duong To, Phu Quoc',
     10.174122, 103.961234, ST_SetSRID(ST_MakePoint(103.961234, 10.174122), 4326), '02976266666', '24/7', 1200000, 3500000, TRUE, 4.4, 0, 190, 680, 7400),
    
    (13, 1, 5, 'Chợ Nổi Coffee', 'Cho Noi Coffee',
     'Quán cafe view sông ngắm ghe thuyền lướt qua cực chill.', 'A river-view cafe to watch local boats passing by.',
     'Ninh Kiều, Cần Thơ', 'Ninh Kieu, Can Tho',
     10.028912, 105.780123, ST_SetSRID(ST_MakePoint(105.780123, 10.028912), 4326), NULL, '06:00 - 22:00', 25000, 50000, TRUE, 4.5, 0, 12, 35, 450),
    
    (14, 5, 5, 'Ba Đống Cafe Bến Tre', 'Ba Dong Cafe',
     'Quán cafe phong cách miệt vườn, không gian rợp bóng dừa xanh.', 'A garden-style cafe surrounded by green coconut trees.',
     'Hùng Vương, TP. Bến Tre', 'Hung Vuong, Ben Tre City',
     10.238912, 106.379123, ST_SetSRID(ST_MakePoint(106.379123, 10.238912), 4326), NULL, '07:00 - 22:00', 20000, 45000, TRUE, 4.3, 0, 8, 14, 290),
    
    (15, 9, 4, 'Đặc sản Tung Lò Mò Châu Phong', 'Chau Phong Tung Lo Mo',
     'Nơi bán lạp xưởng bò truyền thống của người Chăm An Giang.', 'Traditional beef sausage workshop of Cham ethnic group.',
     'Châu Phong, Tân Châu, An Giang', 'Chau Phong, Tan Chau, An Giang',
     10.821345, 105.152345, ST_SetSRID(ST_MakePoint(105.152345, 10.821345), 4326), '0988776655', '06:00 - 21:00', 150000, 300000, TRUE, 4.7, 0, 56, 120, 1100);
  `);
  await prisma.$executeRawUnsafe(`SELECT setval('places_id_seq', (SELECT MAX(id) FROM places));`);

  // 9. Seed Ads
  console.log("📺 Seeding ads...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO ads (id, provider_id, place_id, title, image_url, type, target_url, start_date, end_date, is_active) VALUES
    (1, 2, 1, 'Chợ nổi Cái Răng Promotion', 'https://mekongoi.vn/images/cairang-1.jpg', 'sponsored', NULL, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE),
    (2, 1, 3, 'Victoria Resort Promotion', 'https://example.com/logo-victoria.png', 'sponsored', NULL, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE),
    (3, 3, 7, 'Khu du lịch Làng Bè Bến Tre Promotion', 'https://mekongoi.vn/images/langbe.jpg', 'sponsored', NULL, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE),
    (4, 1, 11, 'Chợ đêm Phú Quốc Promotion', 'https://mekongoi.vn/images/phuquoc-market-1.jpg', 'sponsored', NULL, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE);
  `);
  await prisma.$executeRawUnsafe(`SELECT setval('ads_id_seq', (SELECT MAX(id) FROM ads));`);

  // 10. Seed Place Images
  console.log("🖼️ Seeding place images...");
  await prisma.place_images.createMany({
    data: [
      { place_id: 1, image_url: 'https://mekongoi.vn/images/cairang-1.jpg', is_primary: true },
      { place_id: 1, image_url: 'https://mekongoi.vn/images/cairang-2.jpg', is_primary: false },
      { place_id: 2, image_url: 'https://mekongoi.vn/images/hoido-1.jpg', is_primary: true },
      { place_id: 4, image_url: 'https://mekongoi.vn/images/trasu-1.jpg', is_primary: true },
      { place_id: 4, image_url: 'https://mekongoi.vn/images/trasu-2.jpg', is_primary: false },
      { place_id: 11, image_url: 'https://mekongoi.vn/images/phuquoc-market-1.jpg', is_primary: true }
    ]
  });

  // 11. Seed Reviews
  console.log("✍️ Seeding reviews...");
  await prisma.$executeRawUnsafe(`
    INSERT INTO reviews (id, user_id, place_id, rating, comment, status) VALUES
    (1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, 5, 'Hủ tiếu lắc ghe ngon xuất sắc, view bình minh bao phê!', 'approved'),
    (2, 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 1, 4, 'Amazing traditional floating culture! Love the fresh pineapple.', 'approved'),
    (3, 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 2, 5, 'Cơm kho quẹt đúng chuẩn vị ngoại nấu ngày xưa, không gian ấm cúng.', 'approved'),
    (4, 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 4, 4, 'So green and beautiful, dynamic bird sanctuary!', 'approved');
  `);
  await prisma.$executeRawUnsafe(`SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));`);

  // 12. Seed Trips
  console.log("✈️ Seeding trips...");
  await prisma.trips.create({
    data: {
      id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
      user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Phượt Cần Thơ - An Giang 3 Ngày'
    }
  });

  // 13. Seed Trip Places
  console.log("📍 Seeding trip places...");
  await prisma.trip_places.createMany({
    data: [
      { trip_id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', place_id: 1, sort_order: 1 },
      { trip_id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', place_id: 2, sort_order: 2 },
      { trip_id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', place_id: 4, sort_order: 3 }
    ]
  });

  // 14. Seed Gamification Configs
  console.log("🎮 Seeding gamification configs...");
  await prisma.gamification_configs.createMany({
    data: [
      { action_key: 'daily_checkin', points: 10 },
      { action_key: 'review', points: 30 },
      { action_key: 'share_app', points: 20 },
      { action_key: 'place_checkin', points: 50 }
    ],
    skipDuplicates: true
  });

  // 15. Seed Sample Notifications
  console.log("🔔 Seeding notifications...");
  await prisma.notifications.createMany({
    data: [
      {
        user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title_vi: 'Chào mừng bạn mới!',
        title_en: 'Welcome new user!',
        content_vi: 'Chào mừng bạn đã tham gia ứng dụng du lịch Mekong Ơi. Hãy bắt đầu check-in để tích lũy điểm thưởng nhé!',
        content_en: 'Welcome to Mekong Oi travel app. Start checking in to accumulate points!',
        is_read: false
      },
      {
        user_id: null, // System-wide
        title_vi: 'Bảo trì hệ thống định kỳ',
        title_en: 'Scheduled System Maintenance',
        content_vi: 'Mekong Ơi sẽ bảo trì hệ thống từ 01:00 đến 03:00 sáng ngày 25/06/2026.',
        content_en: 'Mekong Oi will be undergoing maintenance from 01:00 to 03:00 AM on June 25, 2026.',
        is_read: false
      }
    ]
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
