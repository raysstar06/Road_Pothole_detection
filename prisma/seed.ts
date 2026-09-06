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

  // Seed SLA Knowledge Documents
  const knowledgeDocs = [
    {
      title: "Municipal Road Repair SLAs & Turnaround Times",
      content: "According to the municipal Service Level Agreement (SLA): High-priority road defects (deep potholes, arterial road hazards) must be inspected and scheduled for repair within 48 hours. Moderate-priority defects on secondary streets are scheduled within 14 days. Low-priority surface abrasions are queued for cyclical maintenance within 30 to 45 days."
    },
    {
      title: "AI Hazard Assessment Engine & Priority Scoring",
      content: "Road defects are prioritized through an automated AI Hazard Assessment Engine. Priority score is calculated dynamically from: visual bounding box coverage (40%), AI detection confidence (30%), crowd urgency / duplicate report density (20%), and defect age (10%). Defects with priority scores >= 70 are tagged HIGH priority."
    },
    {
      title: "Spatio-Visual Deduplication & Crowd Urgency",
      content: "When multiple citizens report defects within a 20-meter radius, our geospatial deduplication system automatically clusters them into a single primary municipal ticket. Each additional report escalates the ticket's crowd urgency rating (LOW -> MODERATE -> HIGH) and increases repair priority without generating redundant contractor dispatches."
    },
    {
      title: "Civic Points, Leaderboard & Gamification",
      content: "Citizens earn 15 Civic Points for each verified road report submitted through the portal. Points accumulate towards community ranks: Civic Watcher (1-49 points), Street Sentinel (50-99 points), and Community Champion (100+ points). Citizens with high civic engagement are highlighted on the public Community Leaderboard."
    },
    {
      title: "Post-Repair Visual Verification & Resolution Audit",
      content: "Repairs cannot be closed arbitrarily. Once a contractor finishes work, an after-repair completion photo must be audited by AI. The system inspects the image for residual defects and generates a completion score. The ticket can only transition to RESOLVED status once the audit receives an official PASS status."
    },
    {
      title: "Escalation & Municipal Contact",
      content: "If a high-priority defect has not been scheduled within the 48-hour SLA window, or if a resolved pothole shows early degradation, citizens can escalate directly to the Department of Transportation hotline at 1-800-ROAD-FIX (Mon-Fri 8am-6pm) or file an escalated inquiry through the Civic SLA Assistant."
    }
  ]

  for (const doc of knowledgeDocs) {
    const existing = await prisma.knowledgeDocument.findFirst({
      where: { title: doc.title }
    })
    if (!existing) {
      await prisma.knowledgeDocument.create({
        data: doc
      })
    }
  }

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
