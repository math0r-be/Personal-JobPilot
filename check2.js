const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cv = await prisma.cv.findUnique({ where: { id: 'cmo5q7cy40002hc0x0rt81s8z' } });
  console.log('templateId:', cv.templateId);
  console.log('photo length:', (cv.photo || '').length);
}

main().finally(() => prisma.$disconnect());