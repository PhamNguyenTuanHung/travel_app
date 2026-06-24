const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {

  async register(data) {
    const { email, password, full_name, phone } = data;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("EMAIL ALREADY EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
        full_name: full_name || email.split("@")[0],
        role_id: 2, // Quyền user mặc định
        phone: phone || null,
        provider: 'credentials',
        home_town: null,
        bio: null,
        total_points: 0,
        status: 'active',
      },
    });
    return newUser;
  }

  async login(data) {

    const { email, password } = data;

    const user = await prisma.users.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      throw new Error("USER NOT EXIST");
    }

    if (user.provider === 'google' && !user.password_hash) {
      throw new Error("PLEASE LOGIN WITH GOOGLE");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error("INVALID_PASSWORD");
    }

    const roleName = user.roles?.name ? user.roles.name.toLowerCase() : "user";
    const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

    const token = jwt.sign(
      { id: user.id, role: roleName },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    const { password_hash, ...cleanUser } = user;

    return {
      message: "Login success",
      token,
      user: cleanUser
    };
  }


  async loginWithGoogle(idToken) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error("INVALID_GOOGLE_TOKEN");

      const { email, name, picture } = payload;

      let user = await prisma.users.findUnique({
        where: { email },
        include: { roles: true }
      });

      if (!user) {
        user = await prisma.users.create({
          data: {
            email,
            full_name: name || email.split("@")[0],
            avatar_url: picture || null,
            provider: 'google',
            role_id: 2, // Mặc định là khách du lịch (user)
            status: 'active'
          },
          include: { roles: true }
        });
      }

      if (user.status === 'banned') {
        throw new Error("USER_IS_BANNED");
      }

      const roleName = user.roles?.name ? user.roles.name.toLowerCase() : "user";
      const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

      const token = jwt.sign(
        { id: user.id, role: roleName },
        JWT_SECRET,
        { expiresIn: "30d" } // Thường đăng nhập MXH cho hạn dài xíu (30 ngày)
      );

      const { password_hash, ...cleanUser } = user;

      return {
        message: "Google login success",
        token,
        user: cleanUser
      };

    } catch (error) {
      throw new Error(`GOOGLE_AUTH_FAILED: ${error.message}`);
    }
  }
}

module.exports = new AuthService();