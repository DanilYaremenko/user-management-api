import { faker } from '@faker-js/faker/locale/uk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.position.deleteMany();

  // Uncomment to reset the sequence of the id column
  await prisma.$executeRaw`ALTER SEQUENCE "Position_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;

  const positions = [
    { name: 'Frontend Developer' },
    { name: 'Backend Developer' },
    { name: 'Fullstack Developer' },
    { name: 'DevOps Engineer' },
    { name: 'QA Engineer' },
    { name: 'Data Analyst' },
    { name: 'Data Scientist' },
    { name: 'Machine Learning Engineer' },
    { name: 'Product Manager' },
    { name: 'UI/UX Designer' },
  ];

  await prisma.position.createMany({
    data: positions,
  });

  const getRandomPhone = () => {
    return '380' + Math.floor(Math.random() * 900000000 + 100000000);
  };

  const users = Array.from({ length: 45 }, () => ({
    name: faker.internet.userName(),
    email: faker.internet.email(),
    phone: getRandomPhone(),
    photo: Buffer.from(faker.image.avatar()),
    position_id: Math.floor(Math.random() * positions.length) + 1,
  }));

  await prisma.user.createMany({
    data: users,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
