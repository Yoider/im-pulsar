const { PrismaClient } = require('../src/generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
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

    const rootsTypes = await prisma.rootsType.findMany({
      include: {
        rootsTypesSteps: {
          include: {
            step: true
          }
        }
      }
    });

    const steps = await prisma.step.findMany();

    const output = {
      users,
      rootsTypes,
      steps
    };

    fs.writeFileSync('scratch/db_dump.json', JSON.stringify(output, null, 2), 'utf8');
    console.log("DB dump saved successfully.");
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

run();
