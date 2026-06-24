require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/db');

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  let server;
  try {
    // 1. Connect to Database
    await prisma.$connect();
    console.log("DB connection successful!");

    // 2. Start Express app
    server = app.listen(PORT, async () => {
      console.log(`Test server running on port ${PORT}`);
      try {
        await executeSuite();
        console.log("=========================================");
        console.log("✅ ALL TESTS PASSED SUCCESSFULLY!");
        console.log("=========================================");
        process.exit(0);
      } catch (err) {
        console.error("❌ Test suite failed:", err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("Failed to start test environment:", err);
    process.exit(1);
  }
}

async function executeSuite() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = "password123";

  // Test 1: Register User
  console.log("\n--- Testing Auth Register ---");
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      full_name: "Test User",
      phone: "0999" + Math.floor(100000 + Math.random() * 900000),
    }),
  });
  const regData = await regRes.json();
  if (regRes.status !== 201) {
    throw new Error(`Register failed: ${JSON.stringify(regData)}`);
  }
  console.log("User registered:", regData.email);
  const userId = regData.id;

  // Elevate user to ADMIN so they have full permissions for the suite
  await prisma.users.update({
    where: { id: userId },
    data: { role_id: 1 }
  });
  console.log("Elevated user to ADMIN in database.");

  // Test 2: Login User
  console.log("\n--- Testing Auth Login ---");
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  console.log("Login success! Token generated.");
  const token = loginData.token;

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Test 3: Get Places (Public)
  console.log("\n--- Testing Get Places (Public) ---");
  const destsRes = await fetch(`${BASE_URL}/places`);
  const destsData = await destsRes.json();
  if (destsRes.status !== 200) {
    throw new Error(`Get places failed: ${JSON.stringify(destsData)}`);
  }
  console.log(`Fetched ${destsData.rows.length} places.`);

  // Test 4: Create a Place
  console.log("\n--- Testing Create Place ---");
  const createDestRes = await fetch(`${BASE_URL}/places`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Vịnh Hạ Long",
      province: "Quảng Ninh",
      description: "Di sản thiên nhiên thế giới",
      image_url: "https://example.com/halong.jpg",
    }),
  });
  const newDest = await createDestRes.json();
  if (createDestRes.status !== 201) {
    throw new Error(`Create place failed: ${JSON.stringify(newDest)}`);
  }
  console.log("Created place ID:", newDest.id);
  const placeId = newDest.id;

  // Test 5: Create a Review
  console.log("\n--- Testing Create Review ---");
  const createReviewRes = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      user_id: userId,
      place_id: placeId,
      rating: 5,
      comment: "Tuyệt vời ông mặt trời!",
    }),
  });
  const newReview = await createReviewRes.json();
  if (createReviewRes.status !== 201) {
    throw new Error(`Create review failed: ${JSON.stringify(newReview)}`);
  }
  console.log(
    `Created review ID: ${newReview.id}, rating: ${newReview.rating}`
  );

  // Test 6: Get Reviews (Public)
  console.log("\n--- Testing Get Reviews (Public) ---");
  const reviewsRes = await fetch(`${BASE_URL}/reviews`);
  const reviewsData = await reviewsRes.json();
  if (reviewsRes.status !== 200) {
    throw new Error(`Get reviews failed: ${JSON.stringify(reviewsData)}`);
  }
  console.log(`Fetched ${reviewsData.rows.length} reviews.`);

  // Test: Provinces CRUD
  console.log("\n--- Testing Provinces CRUD ---");
  const createProvinceRes = await fetch(`${BASE_URL}/provinces`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      slug: "test-province-slug-" + Date.now(),
      name_vi: "Tỉnh Thử Nghiệm",
      name_en: "Test Province",
      is_visible: true
    })
  });
  const newProvince = await createProvinceRes.json();
  if (createProvinceRes.status !== 201) {
    throw new Error(`Create province failed: ${JSON.stringify(newProvince)}`);
  }
  console.log("Created Province ID:", newProvince.id);
  const provId = newProvince.id;

  const updateProvinceRes = await fetch(`${BASE_URL}/provinces/${provId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      name_vi: "Tỉnh Thử Nghiệm Cập Nhật"
    })
  });
  const updatedProvince = await updateProvinceRes.json();
  if (updateProvinceRes.status !== 200) {
    throw new Error(`Update province failed: ${JSON.stringify(updatedProvince)}`);
  }
  console.log("Updated Province name_vi:", updatedProvince.name_vi);

  const getProvincesRes = await fetch(`${BASE_URL}/provinces?search=Thử`);
  const provincesData = await getProvincesRes.json();
  if (getProvincesRes.status !== 200 || provincesData.count === 0) {
    throw new Error(`Get provinces filtering failed: ${JSON.stringify(provincesData)}`);
  }
  console.log(`Fetched filtered provinces count: ${provincesData.count}`);

  // Test: Categories CRUD
  console.log("\n--- Testing Categories CRUD ---");
  const createCategoryRes = await fetch(`${BASE_URL}/categories`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      icon_url: "https://example.com/icon.png",
      marker_color: "#FF0000",
      name_vi: "Thể Loại Thử Nghiệm",
      name_en: "Test Category"
    })
  });
  const newCategory = await createCategoryRes.json();
  if (createCategoryRes.status !== 201) {
    throw new Error(`Create category failed: ${JSON.stringify(newCategory)}`);
  }
  console.log("Created Category ID:", newCategory.id);
  const catId = newCategory.id;

  const updateCategoryRes = await fetch(`${BASE_URL}/categories/${catId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      name_vi: "Thể Loại Cập Nhật"
    })
  });
  const updatedCategory = await updateCategoryRes.json();
  if (updateCategoryRes.status !== 200) {
    throw new Error(`Update category failed: ${JSON.stringify(updatedCategory)}`);
  }
  console.log("Updated Category name_vi:", updatedCategory.name_vi);

  // Test: Ads CRUD
  console.log("\n--- Testing Ads CRUD ---");
  const createAdRes = await fetch(`${BASE_URL}/ads`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Banner Khuyến Mãi",
      image_url: "https://example.com/banner.jpg",
      type: "home",
      target_url: "https://example.com/promo",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000).toISOString(),
      is_active: true
    })
  });
  const newAd = await createAdRes.json();
  if (createAdRes.status !== 201) {
    throw new Error(`Create ad failed: ${JSON.stringify(newAd)}`);
  }
  console.log("Created Ad ID:", newAd.id);
  const adId = newAd.id;

  // Test: Gamification Configs CRUD
  console.log("\n--- Testing Gamification Configs CRUD ---");
  const createConfigRes = await fetch(`${BASE_URL}/gamification-configs`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      action_key: "checkin_bonus_" + Date.now(),
      points: 50
    })
  });
  const newConfig = await createConfigRes.json();
  if (createConfigRes.status !== 200 && createConfigRes.status !== 201) {
    throw new Error(`Create gamification config failed: ${JSON.stringify(newConfig)}`);
  }
  console.log("Created/Upserted Gamification Config key:", newConfig.action_key);
  const configKey = newConfig.action_key;

  // Test: Favorites CRUD
  console.log("\n--- Testing Favorites CRUD ---");
  const addFavRes = await fetch(`${BASE_URL}/favorites`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      place_id: placeId
    })
  });
  const newFav = await addFavRes.json();
  if (addFavRes.status !== 201) {
    throw new Error(`Add favorite failed: ${JSON.stringify(newFav)}`);
  }
  console.log("Added to favorites. Place ID:", newFav.place_id);

  const getFavsRes = await fetch(`${BASE_URL}/favorites`, {
    headers: authHeaders
  });
  const favs = await getFavsRes.json();
  if (getFavsRes.status !== 200 || favs.length === 0) {
    throw new Error(`Get favorites failed: ${JSON.stringify(favs)}`);
  }
  console.log(`User has ${favs.length} favorite(s).`);

  // Test: Trips & Trip Places CRUD
  console.log("\n--- Testing Trips & Trip Places CRUD ---");
  const createTripRes = await fetch(`${BASE_URL}/trips`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      title: "Chuyến đi Hà Nội - Hạ Long"
    })
  });
  const newTrip = await createTripRes.json();
  if (createTripRes.status !== 201) {
    throw new Error(`Create trip failed: ${JSON.stringify(newTrip)}`);
  }
  console.log("Created Trip ID:", newTrip.id);
  const tripId = newTrip.id;

  // Add place to trip
  const addPlaceRes = await fetch(`${BASE_URL}/trips/${tripId}/places`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      place_id: placeId,
      sort_order: 1
    })
  });
  const tripPlace = await addPlaceRes.json();
  if (addPlaceRes.status !== 201) {
    throw new Error(`Add place to trip failed: ${JSON.stringify(tripPlace)}`);
  }
  console.log("Added place to trip. Trip Place ID:", tripPlace.id);

  // Test: User Check-ins CRUD
  console.log("\n--- Testing User Check-ins CRUD ---");
  const addCheckinRes = await fetch(`${BASE_URL}/checkins`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      place_id: placeId
    })
  });
  const newCheckin = await addCheckinRes.json();
  if (addCheckinRes.status !== 201) {
    throw new Error(`Add checkin failed: ${JSON.stringify(newCheckin)}`);
  }
  console.log("Check-in successful. ID:", newCheckin.id);

  const getCheckinsRes = await fetch(`${BASE_URL}/checkins`, {
    headers: authHeaders
  });
  const checkins = await getCheckinsRes.json();
  if (getCheckinsRes.status !== 200) {
    throw new Error(`Get checkins failed: ${JSON.stringify(checkins)}`);
  }
  console.log(`Fetched ${checkins.length} checkins.`);

  // Test: Loyalty Points CRUD
  console.log("\n--- Testing Loyalty Points History CRUD ---");
  const addPointsRes = await fetch(`${BASE_URL}/loyalty-points`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      user_id: userId,
      action_type: "review_destination",
      points_earned: 20,
      blockchain_status: "pending"
    })
  });
  const pointsRecord = await addPointsRes.json();
  if (addPointsRes.status !== 201) {
    throw new Error(`Add points failed: ${JSON.stringify(pointsRecord)}`);
  }
  console.log("Points history entry created. ID:", pointsRecord.id);
  const pointsHistId = pointsRecord.id;

  const getPointsRes = await fetch(`${BASE_URL}/loyalty-points`, {
    headers: authHeaders
  });
  const pointsList = await getPointsRes.json();
  if (getPointsRes.status !== 200) {
    throw new Error(`Get points list failed: ${JSON.stringify(pointsList)}`);
  }
  console.log(`Fetched ${pointsList.count} points history entries.`);

  // Clean up
  console.log("\n--- Cleaning up new test entities ---");
  
  // Delete Points History
  const delPointsRes = await fetch(`${BASE_URL}/loyalty-points/${pointsHistId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  if (delPointsRes.status !== 200) {
    throw new Error("Delete points history failed");
  }
  console.log("Deleted points history entry:", pointsHistId);

  // Delete Trip (cascades to trip_places in DB because of onDelete: Cascade)
  const delTripRes = await fetch(`${BASE_URL}/trips/${tripId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  if (delTripRes.status !== 200) {
    throw new Error("Delete trip failed");
  }
  console.log("Deleted trip ID:", tripId);

  // Delete Gamification Config
  const delConfigRes = await fetch(`${BASE_URL}/gamification-configs/${configKey}`, {
    method: "DELETE",
    headers: authHeaders
  });
  if (delConfigRes.status !== 200) {
    throw new Error("Delete gamification config failed");
  }
  console.log("Deleted gamification config key:", configKey);

  // Delete Ad
  const delAdRes = await fetch(`${BASE_URL}/ads/${adId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  if (delAdRes.status !== 200) {
    throw new Error("Delete ad failed");
  }
  console.log("Deleted ad ID:", adId);

  // Delete Category
  const delCatRes = await fetch(`${BASE_URL}/categories/${catId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  if (delCatRes.status !== 200) {
    throw new Error("Delete category failed");
  }
  console.log("Deleted category ID:", catId);

  // Delete Province
  const delProvRes = await fetch(`${BASE_URL}/provinces/${provId}`, {
    method: "DELETE",
    headers: authHeaders
  });
  if (delProvRes.status !== 200) {
    throw new Error("Delete province failed");
  }
  console.log("Deleted province ID:", provId);

  // Test 7: Clean up (Delete Place, which cascades to Reviews, Favorites, Checkins in database)
  console.log("\n--- Testing Cascade Delete Place ---");
  const deleteDestRes = await fetch(`${BASE_URL}/places/${placeId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  if (deleteDestRes.status !== 200) {
    throw new Error("Delete place failed");
  }
  console.log("Cascade deleted place ID:", placeId);
}

runTests();
