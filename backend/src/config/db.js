const { PrismaClient } = require('../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool);

// Khởi tạo một instance Prisma Client duy nhất cho toàn bộ ứng dụng
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'], // (Tùy chọn) In các câu lệnh SQL ra terminal để bạn dễ debug
});

module.exports = prisma;