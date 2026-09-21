require('dotenv').config();

const prisma = require('../db');

async function seed() {
  const existingVehicles = await prisma.vehicle.count();
  if (existingVehicles > 0) {
    console.log(`Skipping sample data: ${existingVehicles} vehicle(s) already exist.`);
    return;
  }

  await prisma.vehicle.create({
    data: {
      id: 'vehicle-civic',
      make: 'Honda',
      model: 'Civic',
      year: 2020,
      variant: 'RS Turbo',
      engine: '1.5L VTEC Turbo',
      transmission: 'CVT',
      color: 'Rallye Red',
      nickname: 'Ruby',
      modifications: {
        create: [
          {
            id: 'mod-exhaust',
            name: 'Cat-back Exhaust',
            category: 'Exhaust',
            brand: 'HKS',
            price: 45000,
            status: 'PLANNED',
            notes: 'Confirm fitment before ordering.',
          },
          {
            id: 'mod-wheels',
            name: '18-inch Wheels',
            category: 'Wheels & Tires',
            brand: 'Rays',
            price: 90000,
            status: 'PURCHASED',
            purchaseDate: '2026-09-10',
            notes: 'Waiting for tires.',
          },
        ],
      },
    },
  });
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
