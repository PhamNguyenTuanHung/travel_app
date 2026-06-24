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

    // Ad
    adRead: [auth, permit("ad.read")],
    adCreate: [auth, permit("ad.create")],
    adUpdate: [auth, permit("ad.update")],
    adDelete: [auth, permit("ad.delete")],

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

    // Provider
    providerRead: [auth, permit("provider.read")],
    providerCreate: [auth, permit("provider.create")],
    providerUpdate: [auth, permit("provider.update")],
    providerDelete: [auth, permit("provider.delete")],

    // Notification
    notificationRead: [auth, permit("notification.read")],
    notificationCreate: [auth, permit("notification.create")],
    notificationUpdate: [auth, permit("notification.update")],
    notificationDelete: [auth, permit("notification.delete")],

    // Ad Log
    adLogRead: [auth, permit("adLog.read")],
    adLogCreate: [auth, permit("adLog.create")],
    adLogUpdate: [auth, permit("adLog.update")],
    adLogDelete: [auth, permit("adLog.delete")],

    // Role
    roleRead: [auth, permit("role.read")],
    roleCreate: [auth, permit("role.create")],
    roleUpdate: [auth, permit("role.update")],
    roleDelete: [auth, permit("role.delete")],
};

module.exports = protect;