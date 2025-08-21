import { PrismaClient, Role, EventType } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Delete existing data
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  // Create hardcoded admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@tocdoc.com',
      role: Role.ADMIN,
    },
  })

  // Create demo doctor for testing
  const doctor = await prisma.user.create({
    data: {
      email: 'doctor@tocdoc.com',
      role: Role.DOCTOR,
    },
  })

  // Create demo events
  await prisma.event.create({
    data: {
      doctorId: doctor.id,
      type: EventType.ADMISSION,
      patientAlias: 'JD-001',
      dobMonthYear: '012000',
      diagnosis: 'Hypertension',
      hospitalName: 'Central Hospital',
      eventDate: new Date(),
      reviewed: false,
    },
  })

  await prisma.event.create({
    data: {
      doctorId: doctor.id,
      type: EventType.DISCHARGE,
      patientAlias: 'JD-002',
      dobMonthYear: '031995',
      diagnosis: 'Post-op Recovery',
      hospitalName: 'Central Hospital',
      eventDate: new Date(),
      reviewed: true,
    },
  })

  console.log({
    message: 'Database seeded successfully',
    admin: { id: admin.id, email: admin.email },
    doctor: { id: doctor.id, email: doctor.email },
  })
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })