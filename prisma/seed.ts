import { PrismaClient, Role } from '@prisma/client'
// import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Optional: Clear existing data
  // Order matters due to foreign key constraints: delete patients before users
  console.log(`Deleting existing patients...`)
  await prisma.patient.deleteMany({})
  console.log(`Deleting existing users...`)
  await prisma.user.deleteMany({})

  // Create test users (physicians and admin)
  console.log(`Creating users...`)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hospital.com',
      role: Role.ADMIN,
    },
  })

  const physician1 = await prisma.user.create({
    data: {
      email: 'dr.smith@hospital.com',
      role: Role.PHYSICIAN,
    },
  })

  const physician2 = await prisma.user.create({
    data: {
      email: 'dr.jones@hospital.com',
      role: Role.PHYSICIAN,
    },
  })

  // Create test patients with recent dates
  const today = new Date()
  const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
  const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)

  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        name: 'John Doe',
        dob: new Date('1980-01-01'),
        facility: 'Main Hospital',
        diagnosis: 'Hypertension',
        admission: sevenDaysAgo,
        discharge: threeDaysAgo, // Recently discharged
        notes: 'Responding well to treatment. Follow-up required for medication adjustment.',
        physicianId: physician1.id,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Jane Smith',
        dob: new Date('1975-06-15'),
        facility: 'East Wing Medical Center',
        diagnosis: 'Type 2 Diabetes',
        admission: tenDaysAgo,
        discharge: twoDaysAgo, // Recently discharged
        notes: 'Blood sugar levels stabilizing. Needs follow-up lab work in 1 week.',
        physicianId: physician1.id,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Robert Johnson',
        dob: new Date('1990-03-22'),
        facility: 'West Wing Hospital',
        diagnosis: 'Pneumonia',
        admission: fiveDaysAgo,
        discharge: today, // Discharged today
        notes: 'Chest X-ray shows significant improvement. Discharged with oral antibiotics.',
        physicianId: physician2.id,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'Mary Williams',
        dob: new Date('1965-08-14'),
        facility: 'Main Hospital',
        diagnosis: 'Congestive Heart Failure',
        admission: threeDaysAgo,
        discharge: null, // Still admitted
        notes: 'Admitted for acute exacerbation. Responding to IV diuretics.',
        physicianId: physician1.id,
      },
    }),
    prisma.patient.create({
      data: {
        name: 'James Brown',
        dob: new Date('1972-12-03'),
        facility: 'East Wing Medical Center',
        diagnosis: 'Acute Myocardial Infarction',
        admission: fiveDaysAgo,
        discharge: threeDaysAgo,
        notes: 'PCI performed successfully. Discharged on dual antiplatelet therapy.',
        physicianId: physician2.id,
      },
    }),
  ])

  console.log('Seed data created:', {
    users: [admin, physician1, physician2],
    patients,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 