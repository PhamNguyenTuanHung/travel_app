const PERMISSIONS = {
    admin: ["*"],

    staff: [
        "location.create",
        "location.read",
        "location.update",
        "location.delete",

        "review.read",
        "review.delete",

        "dashboard.read",
        "user.read",

        "ad.create",
        "ad.read",
        "ad.update",
        "ad.delete",

        "gamification.read",
        "points.read",
        "points.write",
        "favorite.read",
        "favorite.write",
        "trip.read",
        "trip.write",
        "checkin.read",
        "checkin.write"
    ],

    user: [
        "location.read",

        "review.create",
        "review.read",
        "review.update",
        "review.delete",

        "profile.read",
        "profile.update",

        "ad.read",
        "gamification.read",
        "points.read",
        "favorite.read",
        "favorite.write",
        "trip.read",
        "trip.write",
        "checkin.read",
        "checkin.write"
    ],
};

module.exports = PERMISSIONS;