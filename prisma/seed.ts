import { PrismaClient, Role } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.eventImage.deleteMany()
  await prisma.event.deleteMany()
  await prisma.ccRecipient.deleteMany()
  await prisma.user.deleteMany()

  const admin = await prisma.user.create({
    data: {
      email: 'admin@tocdoc.com',
      name: 'Admin',
      role: Role.ADMIN,
    },
  })

  const doctor = await prisma.user.create({
    data: {
      email: 'doctor@tocdoc.com',
      name: 'Dr. Demo',
      role: Role.DOCTOR,
    },
  })

  await prisma.event.create({
    data: {
      doctorId: doctor.id,
      patientAlias: 'JD-001',
      dobMonthYear: '01/2000',
      diagnosis: 'Hypertension',
      hospitalName: 'MGH',
      status: 'ADMITTED',
      admissionDate: new Date(),
      reviewed: false,
    },
  })

  await prisma.event.create({
    data: {
      doctorId: doctor.id,
      patientAlias: 'JD-002',
      dobMonthYear: '03/1995',
      diagnosis: 'Post-op Recovery',
      hospitalName: 'BWH',
      status: 'DISCHARGED',
      admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dischargeDate: new Date(),
      dischargeNotes: 'Patient stable. Follow up in 2 weeks.',
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
