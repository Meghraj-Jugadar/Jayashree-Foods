const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Seed roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'customer' },
    update: {},
    create: { name: 'customer' },
  });

  // Seed admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@foodfactory.com' },
    update: {},
    create: {
      name: 'Factory Admin',
      email: 'admin@foodfactory.com',
      password: hashedPassword,
      phone: '9999999999',
      roleId: adminRole.id,
    },
  });

  // Seed categories
  const categories = ['Bakery', 'Dairy', 'Beverages', 'Snacks', 'Frozen Foods'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed settings
  const defaultSettings = [
    { key: 'factory_name', value: 'Food Factory Co.' },
    { key: 'factory_address', value: '123 Factory Lane, City' },
    { key: 'factory_phone', value: '9876543210' },
    { key: 'factory_email', value: 'info@foodfactory.com' },
    { key: 'tax_rate', value: '18' },
    { key: 'currency', value: 'INR' },
  ];

  for (const setting of defaultSettings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
