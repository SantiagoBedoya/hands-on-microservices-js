import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

async function seedData() {
  // create two dummy recipes
  const firstTransaction = await prismaClient.transaction.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      status: 'CREATED',
      accountId: '662c081370bd2ba6b5f04e94',
      description: 'simple transaction',
    },
  });

  console.log(firstTransaction);
}

seedData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
