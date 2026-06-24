const PERMISSIONS = require("../config/permissions");

const permit = (permission) => {
    return (req, res, next) => {
        const role = req.user?.role;

        if (!role) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const rolePermissions = PERMISSIONS[role] || [];

        if (
            rolePermissions.includes("*") ||
            rolePermissions.includes(permission)
        ) {
            return next();
        }

        return res.status(403).json({
            message: `Forbidden: Bạn không có quyền thực hiện hành động này (${permission})`
        });
    };
};

module.exports = permit;