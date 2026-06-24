const express = require("express");
const cors = require("cors");

const app = express();

// Import routes
const UserRoute = require("./routes/user.route");
const ProfileRoute = require("./routes/profile.routes");
const AuthRoute = require("./routes/auth.routes");
const PlaceRoute = require("./routes/place.routes");
const ReviewRoute = require("./routes/review.routes");
const ProvinceRoute = require("./routes/province.routes");
const CategoryRoute = require("./routes/category.routes");
const BannerRoute = require("./routes/banner.routes");
const GamificationRoute = require("./routes/gamification.routes");
const FavoriteRoute = require("./routes/favorite.routes");
const TripRoute = require("./routes/trip.routes");
const CheckinRoute = require("./routes/checkin.routes");
const PointsRoute = require("./routes/points.routes");

// ===================== MIDDLEWARE =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================== ROUTES =====================
app.use("/users", UserRoute);
app.use("/profile", ProfileRoute);
app.use("/auth", AuthRoute);
app.use("/places", PlaceRoute);
app.use("/reviews", ReviewRoute);
app.use("/provinces", ProvinceRoute);
app.use("/categories", CategoryRoute);
app.use("/banners", BannerRoute);
app.use("/gamification-configs", GamificationRoute);
app.use("/favorites", FavoriteRoute);
app.use("/trips", TripRoute);
app.use("/checkins", CheckinRoute);
app.use("/loyalty-points", PointsRoute);

// ===================== HANDLE 404 =====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route không tồn tại",
  });
});

// ===================== ERROR HANDLER =====================
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi hệ thống nội bộ!",
  });
});

module.exports = app;