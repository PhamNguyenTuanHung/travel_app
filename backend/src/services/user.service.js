const prisma = require("../config/db");
const bcrypt = require("bcrypt");

class UserService {
    async getAllUsers({ limit = 10, page = 1 }) {
        const take = parseInt(limit);
        const skip = (parseInt(page) - 1) * take;
        return await prisma.users.findMany({
            take,
            skip,
            include: { roles: true }
        });
    }

    async getUserById(id) {
        const user = await prisma.users.findUnique({
            where: { id },
            include: { roles: true }
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async createUser(data) {
        const payload = { ...data };
        if (payload.role_id !== undefined) payload.role_id = parseInt(payload.role_id);
        return await prisma.users.create({
            data: payload
        });
    }

    async updateUser(id, data) {
        const user = await prisma.users.findUnique({ where: { id } });
        if (!user) {
            throw new Error("User not found");
        }
        const payload = { ...data };
        if (payload.role_id !== undefined) payload.role_id = parseInt(payload.role_id);
        return await prisma.users.update({
            where: { id },
            data: payload
        });
    }

    async deleteUser(id) {
        const user = await prisma.users.findUnique({ where: { id } });
        if (!user) {
            throw new Error("User not found");
        }
        await prisma.users.delete({
            where: { id }
        });
        return {
            id,
            deleted: true,
        };
    }

    async updatePassword(id, oldPassword, newPassword) {
        const user = await prisma.users.findUnique({ where: { id } });
        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
            oldPassword,
            user.password_hash
        );

        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }

        if (newPassword.length < 8) {
            throw new Error(
                "Password must be at least 8 characters"
            );
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password_hash
        );

        if (isSamePassword) {
            throw new Error(
                "New password must be different from current password"
            );
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        const updatedUser = await prisma.users.update({
            where: { id },
            data: {
                password_hash: hashedPassword
            }
        });

        return {
            success: true,
            message: "Password updated successfully",
            user: updatedUser
        };
    }
}

module.exports = new UserService();