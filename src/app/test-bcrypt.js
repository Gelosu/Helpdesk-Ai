// test-prisma.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const questions = await prisma.beginnerQuestion.findMany();
    console.log('✅ beginnerQuestion model exists and fetched successfully.');
    console.log('📋 Questions:', questions);
  } catch (error) {
    console.error('❌ Error accessing beginnerQuestion model:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
