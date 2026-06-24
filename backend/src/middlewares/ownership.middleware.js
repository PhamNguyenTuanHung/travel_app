const checkOwnOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role === "admin") {
        return next();
    }

    const paramId = req.params.id;


    if (req.user.id.toString() === paramId.toString()) {
        return next();
    }

    return res.status(403).json({
        message: "You can only access your own data",
    });
};

module.exports = checkOwnOrAdmin;