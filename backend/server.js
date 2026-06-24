require("dotenv").config();
const app = require("./src/app");
const prisma = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Kiểm tra kết nối DB (Prisma)
    await prisma.$connect();
    console.log("✅ Kết nối Database thành công!");

    // 2. Bật server sau khi DB OK
    app.listen(PORT, () => {
      console.log("==================================================");
      console.log("🚀 Server đang chạy!");
      console.log(`🌐 http://localhost:${PORT}`);
      console.log("==================================================");
    });

  } catch (error) {
    console.error("❌ Lỗi kết nối Database:", error);
  }
};

startServer();
