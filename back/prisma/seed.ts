import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 12;

  const users = [
    {
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      color: '#FF5733',
    },
    {
      username: 'bob',
      email: 'bob@example.com',
      password: 'securepass456',
      color: '#3366FF',
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        username: user.username,
        email: user.email,
        password: hashedPassword,
        color: user.color,
      },
    });
  }

  console.log('✅ Utilisateurs insérés avec succès');
}

main()
  .catch((e) => {
    console.error('❌ Erreur dans le seed :', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  }); 