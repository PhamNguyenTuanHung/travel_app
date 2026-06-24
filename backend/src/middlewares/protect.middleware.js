const auth = require("./auth.middleware");
const permit = require("./rbac.middleware");
const checkOwnOrAdmin = require("./ownership.middleware");

const protect = {
    auth,

    // User
    userRead: [auth, permit("user.read")],
    userCreate: [auth, permit("user.create")],
    userUpdate: [auth, permit("user.update")],
    userDelete: [auth, permit("user.delete")],

    // Profile
    profileRead: [auth, permit("profile.read")],
    profileUpdate: [auth, permit("profile.update")],

    // Review
    reviewRead: [auth, permit("review.read")],
    reviewCreate: [auth, permit("review.create")],
    reviewUpdate: [auth, permit("review.update")],
    reviewDelete: [auth, permit("review.delete")],
    reviewOwn: [auth, checkOwnOrAdmin],

    // Location
    locationRead: [auth, permit("location.read")],
    locationCreate: [auth, permit("location.create")],
    locationUpdate: [auth, permit("location.update")],
    locationDelete: [auth, permit("location.delete")],

    // Banner
    bannerRead: [auth, permit("banner.read")],
    bannerCreate: [auth, permit("banner.create")],
    bannerUpdate: [auth, permit("banner.update")],
    bannerDelete: [auth, permit("banner.delete")],

    // Gamification
    gamificationRead: [auth, permit("gamification.read")],
    gamificationWrite: [auth, permit("gamification.write")],

    // Points
    pointsRead: [auth, permit("points.read")],
    pointsWrite: [auth, permit("points.write")],

    // Favorites
    favoriteRead: [auth, permit("favorite.read")],
    favoriteWrite: [auth, permit("favorite.write")],

    // Trips
    tripRead: [auth, permit("trip.read")],
    tripWrite: [auth, permit("trip.write")],

    // Checkins
    checkinRead: [auth, permit("checkin.read")],
    checkinWrite: [auth, permit("checkin.write")],

    // Dashboard
    dashboardRead: [auth, permit("dashboard.read")],
};

module.exports = protect;