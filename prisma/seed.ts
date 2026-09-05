import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seeding...')

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'City Administrator',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      neighborhood: 'City Hall',
    },
  })

  // Create Citizen
  const citizenPassword = await bcrypt.hash('citizen123', 10)
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {},
    create: {
      name: 'John Citizen',
      email: 'citizen@example.com',
      passwordHash: citizenPassword,
      role: 'CITIZEN',
      neighborhood: 'Downtown',
      civicPoints: 120,
    },
  })

  // Create Reports
  const report1 = await prisma.roadReport.create({
    data: {
      ticketId: 'RPT-1001',
      citizenId: citizen.id,
      imageUrl: '/images/demo-pothole-1.jpg',
      latitude: 19.0760,
      longitude: 72.8777,
      address: 'Main St, Downtown',
      description: 'Large pothole near the intersection.',
      status: 'SUBMITTED',
    }
  })

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
