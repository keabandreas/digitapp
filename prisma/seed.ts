// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default categories
  await Promise.all([
    prisma.category.upsert({
      where: { name: 'General' },
      update: {},
      create: {
        name: 'General',
        order: 1
      }
    }),
    prisma.category.upsert({
      where: { name: 'Documentation' },
      update: {},
      create: {
        name: 'Documentation',
        order: 2
      }
    }),
    prisma.category.upsert({
      where: { name: 'Guides' },
      update: {},
      create: {
        name: 'Guides',
        order: 3
      }
    })
  ]);

  console.log('Database has been seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });