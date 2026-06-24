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
        "checkin.write",

        "provider.read",
        "provider.create",
        "provider.update",
        "provider.delete",

        "notification.read",
        "notification.create",
        "notification.update",
        "notification.delete",

        "adLog.read",
        "adLog.create",
        "adLog.update",
        "adLog.delete"
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
        "checkin.write",

        "provider.read",
        "notification.read",
        "adLog.create"
    ],
};

module.exports = PERMISSIONS;