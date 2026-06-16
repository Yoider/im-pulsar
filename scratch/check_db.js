const { PrismaClient } = require('../src/generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        rootsType: true
      }
    });
    console.log('USERS:', JSON.stringify(users, null, 2));

    const rootsTypes = await prisma.rootsType.findMany({
      include: {
        rootsTypesSteps: {
          include: {
            step: true
          }
        }
      }
    });
    console.log('ROOTS_TYPES:', JSON.stringify(rootsTypes, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

run();
