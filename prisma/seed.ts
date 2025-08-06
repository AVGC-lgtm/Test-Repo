import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { USER_ROLES, PRODUCT_DATABASE } from '../src/lib/constants'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create default users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = [
    {
      email: 'dao@agrishield.com',
      name: 'District Agricultural Officer',
      password: hashedPassword,
      role: USER_ROLES.DAO
    },
    {
      email: 'field@agrishield.com',
      name: 'Field Officer',
      password: hashedPassword,
      role: USER_ROLES.FIELD_OFFICER
    },
    {
      email: 'legal@agrishield.com',
      name: 'Legal Officer',
      password: hashedPassword,
      role: USER_ROLES.LEGAL_OFFICER
    },
    {
      email: 'lab@agrishield.com',
      name: 'Lab Coordinator',
      password: hashedPassword,
      role: USER_ROLES.LAB_COORDINATOR
    },
    {
      email: 'hq@agrishield.com',
      name: 'HQ Monitoring',
      password: hashedPassword,
      role: USER_ROLES.HQ_MONITORING
    },
    {
      email: 'admin@agrishield.com',
      name: 'District Admin',
      password: hashedPassword,
      role: USER_ROLES.DISTRICT_ADMIN
    }
  ]

  console.log('👥 Creating users...')
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    })
    console.log(`✅ Created user: ${user.email}`)
  }

  // Seed products from constants
  console.log('📦 Creating products...')
  for (const [category, companies] of Object.entries(PRODUCT_DATABASE)) {
    for (const [company, products] of Object.entries(companies as any)) {
      for (const [productName, productData] of Object.entries(products as any)) {
        const data = productData as any
        const product = await prisma.product.upsert({
          where: {
            category_company_name: {
              category,
              company,
              name: productName
            }
          },
          update: {},
          create: {
            category,
            company,
            name: productName,
            activeIngredient: data.activeIngredient,
            composition: data.composition,
            packaging: data.packaging || [],
            batchFormat: data.batchFormat,
            commonCounterfeitMarkers: data.commonCounterfeitMarkers || [],
            mrp: data.mrp,
            hologramFeatures: data.hologramFeatures || [],
            bagColor: data.bagColor,
            subsidizedRate: data.subsidizedRate,
            varieties: data.varieties || []
          }
        })
        console.log(`✅ Created product: ${category} - ${company} - ${productName}`)
      }
    }
  }

  // Create sample inspection tasks
  console.log('📋 Creating sample inspection tasks...')
  const daoUser = await prisma.user.findUnique({ where: { email: 'dao@agrishield.com' } })
  const fieldUser = await prisma.user.findUnique({ where: { email: 'field@agrishield.com' } })

  if (daoUser && fieldUser) {
    const sampleInspections = [
      {
        officer: 'John Doe',
        date: '2024-01-15',
        location: 'Market Area, District Center',
        targetType: 'Retail Store',
        equipment: ['Digital Scale', 'Sample Collection Kit', 'Camera'],
        status: 'scheduled',
        userId: daoUser.id
      },
      {
        officer: 'Jane Smith',
        date: '2024-01-16',
        location: 'Agricultural Warehouse, Sector 5',
        targetType: 'Wholesale Distributor',
        equipment: ['Testing Kit', 'Sample Bags', 'GPS Device'],
        status: 'in-progress',
        userId: fieldUser.id
      },
      {
        officer: 'Mike Johnson',
        date: '2024-01-14',
        location: 'Farmer Cooperative, Village A',
        targetType: 'Cooperative Store',
        equipment: ['Authenticity Scanner', 'Documentation Kit'],
        status: 'completed',
        userId: fieldUser.id
      }
    ]

    for (const inspection of sampleInspections) {
      await prisma.inspectionTask.create({ data: inspection })
      console.log(`✅ Created inspection task: ${inspection.location}`)
    }
  }

  // Create sample scan results and seizures
  console.log('🔍 Creating sample scan results and seizures...')
  const uplSaafProduct = await prisma.product.findFirst({
    where: { company: 'UPL', name: 'Saaf' }
  })

  if (uplSaafProduct && fieldUser) {
    const scanResult = await prisma.scanResult.create({
      data: {
        company: 'UPL',
        product: 'Saaf',
        batchNumber: 'UPL-SAAF-202401-12345',
        authenticityScore: 25.5,
        issues: ['Poor print quality', 'Missing hologram', 'Incorrect packaging'],
        recommendation: 'Suspected Counterfeit',
        geoLocation: '28.6139, 77.2090',
        timestamp: new Date().toISOString(),
        productId: uplSaafProduct.id
      }
    })

    const seizure = await prisma.seizure.create({
      data: {
        quantity: '50 packets (100g each)',
        estimatedValue: '6000',
        witnessName: 'Ram Kumar (Shop Owner)',
        evidencePhotos: ['/uploads/evidence1.jpg', '/uploads/evidence2.jpg'],
        videoEvidence: '/uploads/seizure_video.mp4',
        status: 'pending',
        userId: fieldUser.id,
        scanResultId: scanResult.id
      }
    })

    console.log(`✅ Created seizure: ${seizure.id}`)

    // Create lab sample
    const labUser = await prisma.user.findUnique({ where: { email: 'lab@agrishield.com' } })
    if (labUser) {
      const labSample = await prisma.labSample.create({
        data: {
          sampleType: 'Pesticide Sample',
          labDestination: 'Central Agricultural Lab',
          status: 'testing',
          userId: labUser.id,
          seizureId: seizure.id
        }
      })

      console.log(`✅ Created lab sample: ${labSample.id}`)

      // Create FIR case
      const legalUser = await prisma.user.findUnique({ where: { email: 'legal@agrishield.com' } })
      if (legalUser) {
        await prisma.fIRCase.create({
          data: {
            labReportId: 'LAB-RPT-2024-001',
            violationType: 'Sale of Counterfeit Pesticides',
            accused: 'Shop Owner - Ram Kumar',
            location: 'Market Area, District Center',
            status: 'draft',
            caseNotes: 'Counterfeit UPL Saaf pesticide found during routine inspection',
            userId: legalUser.id,
            seizureId: seizure.id,
            labSampleId: labSample.id
          }
        })

        console.log(`✅ Created FIR case`)
      }
    }
  }

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
