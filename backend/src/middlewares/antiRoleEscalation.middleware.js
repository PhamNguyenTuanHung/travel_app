const antiRoleEscalation = (req, res, next) => {
    const currentUser = req.user;
    const targetRoleId = req.body.role_id;

    if (!targetRoleId) {
        return next();
    }

    const isTargetAdmin = Number(targetRoleId) === 1;
    const isCurrentAdmin = currentUser?.role_id === 1;

    if (isTargetAdmin && !isCurrentAdmin) {
        return res.status(403).json({
            message: "You cannot assign admin role",
        });
    }

    next();
};

module.exports = antiRoleEscalation;