"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PotholeDetectionService, HazardAssessmentService } from "@/services/ai"
import { DeduplicationService } from "@/services/deduplication"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function submitReportAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'CITIZEN') {
    throw new Error("Unauthorized")
  }

  const file = formData.get("image") as File
  const latitudeStr = formData.get("latitude") as string
  const longitudeStr = formData.get("longitude") as string
  const description = formData.get("description") as string
  const address = formData.get("address") as string

  if (!file || !latitudeStr || !longitudeStr) {
    throw new Error("Missing required fields")
  }

  const latitude = parseFloat(latitudeStr)
  const longitude = parseFloat(longitudeStr)

  // 1. Save Image
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`
  const filepath = path.join(process.cwd(), "public/uploads", filename)
  await writeFile(filepath, buffer)
  const imageUrl = `/uploads/${filename}`

  // 2. Generate Ticket ID
  const count = await prisma.roadReport.count()
  const ticketId = `RPT-${1000 + count + 1}`

  // 3. Create initial report
  const report = await prisma.roadReport.create({
    data: {
      ticketId,
      citizenId: session.user.id,
      imageUrl,
      latitude,
      longitude,
      address,
      description,
      status: 'SUBMITTED'
    }
  })

  // 4. Run AI Detection
  const detectionResult = await PotholeDetectionService.detect(imageUrl)
  
  await prisma.detection.create({
    data: {
      reportId: report.id,
      modelName: detectionResult.model,
      confidence: detectionResult.confidence,
      x: detectionResult.boundingBox.x,
      y: detectionResult.boundingBox.y,
      width: detectionResult.boundingBox.width,
      height: detectionResult.boundingBox.height,
      imageWidth: detectionResult.imageWidth,
      imageHeight: detectionResult.imageHeight
    }
  })

  // 5. Calculate Coverage and update status
  const pBox = detectionResult.boundingBox.width * detectionResult.boundingBox.height
  const pTotal = detectionResult.imageWidth * detectionResult.imageHeight
  const boundingBoxCoverage = (pBox / pTotal) * 100

  await prisma.roadReport.update({
    where: { id: report.id },
    data: {
      boundingBoxCoverage,
      confidenceScore: detectionResult.confidence,
      status: 'YOLO_VERIFIED'
    }
  })

  // 6. Deduplication Check
  const groupId = await DeduplicationService.processNewReport(report.id, latitude, longitude)
  
  // Get updated group urgency if duplicated
  let crowdUrgency = 'LOW'
  let duplicateCount = 1
  if (groupId) {
    const group = await prisma.duplicateGroup.findUnique({ where: { id: groupId } })
    if (group) {
      crowdUrgency = group.crowdUrgency
      duplicateCount = group.reportCount
    }
  }

  // 7. Calculate Priority
  const assessment = HazardAssessmentService.calculate(
    detectionResult.confidence, 
    boundingBoxCoverage / 100, 
    duplicateCount, 
    0, // Age is 0 for new report
    detectionResult.severity
  )

  await prisma.roadReport.update({
    where: { id: report.id },
    data: {
      priorityScore: assessment.priorityScore,
      priorityLevel: assessment.priorityLevel,
      severity: assessment.severity,
      crowdUrgency: crowdUrgency
    }
  })

  // 8. Admin Notification
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } })
  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        recipientId: admin.id,
        reportId: report.id,
        type: 'NEW_REPORT',
        title: 'New Road Defect Reported',
        message: `A new ${assessment.priorityLevel} priority road defect (${ticketId}) was reported at ${address || 'Unknown Location'}.`
      }
    })
  }

  // 9. Award Civic Points
  await prisma.civicPointTransaction.create({
    data: {
      userId: session.user.id,
      reportId: report.id,
      points: 15,
      reason: 'Successful verified report submission'
    }
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { civicPoints: { increment: 15 } }
  })

  // 10. Citizen Notification
  await prisma.notification.create({
    data: {
      recipientId: session.user.id,
      reportId: report.id,
      type: 'STATUS_UPDATE',
      title: 'Report Verified',
      message: `Your report ${ticketId} has been verified by our AI and added to the municipal queue. You earned 15 Civic Points!`
    }
  })

  return { success: true, ticketId }
}
