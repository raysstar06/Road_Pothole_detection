"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error("Unauthorized")
  }
  return session
}

export async function scheduleRepairAction(reportId: string, contractorName: string, scheduledDate: string, notes: string) {
  const session = await requireAdmin()
  
  const report = await prisma.roadReport.findUnique({ where: { id: reportId } })
  if (!report) throw new Error("Report not found")

  await prisma.repairAssignment.create({
    data: {
      reportId,
      assignedBy: session.user.id,
      contractorName,
      scheduledDate: new Date(scheduledDate),
      notes
    }
  })

  await prisma.roadReport.update({
    where: { id: reportId },
    data: { status: 'REPAIR_SCHEDULED' }
  })

  // Notify Citizen
  await prisma.notification.create({
    data: {
      recipientId: report.citizenId,
      reportId,
      type: 'STATUS_UPDATE',
      title: 'Repair Scheduled',
      message: `Your report ${report.ticketId} has been scheduled for repair.`
    }
  })

  return { success: true }
}

export async function startRepairAction(reportId: string) {
  await requireAdmin()
  
  const report = await prisma.roadReport.update({
    where: { id: reportId },
    data: { status: 'REPAIR_IN_PROGRESS' }
  })

  await prisma.repairAssignment.update({
    where: { reportId },
    data: { status: 'IN_PROGRESS' }
  })

  // Notify Citizen
  await prisma.notification.create({
    data: {
      recipientId: report.citizenId,
      reportId,
      type: 'STATUS_UPDATE',
      title: 'Repair In Progress',
      message: `The repair for your report ${report.ticketId} has started.`
    }
  })

  return { success: true }
}

export async function verifyRepairAuditAction(reportId: string, formData: FormData) {
  const session = await requireAdmin()
  
  // Actually handle upload...
  // For demo, we just pretend we saved it and ran the AI
  
  // Mock AI result
  const passed = Math.random() > 0.1 // 90% pass rate
  
  await prisma.repairVerification.create({
    data: {
      reportId,
      imageUrl: '/images/demo-repaired.jpg', // mocked
      residualDefectDetected: !passed,
      confidence: 0.95,
      completionScore: passed ? 98.5 : 45.0,
      auditStatus: passed ? 'PASS' : 'FAIL',
      verifiedBy: session.user.id
    }
  })

  await prisma.roadReport.update({
    where: { id: reportId },
    data: { status: 'AWAITING_VERIFICATION' }
  })

  return { success: true, passed }
}

export async function resolveReportAction(reportId: string) {
  await requireAdmin()
  
  const report = await prisma.roadReport.findUnique({
    where: { id: reportId },
    include: { repairVerification: true }
  })

  if (!report) throw new Error("Report not found")
  if (report.status !== 'AWAITING_VERIFICATION') throw new Error("Invalid state transition")
  if (!report.repairVerification || report.repairVerification.auditStatus !== 'PASS') {
    throw new Error("Cannot resolve without a PASSED audit")
  }

  await prisma.roadReport.update({
    where: { id: reportId },
    data: { 
      status: 'RESOLVED',
      resolvedAt: new Date()
    }
  })

  // Notify Citizen
  await prisma.notification.create({
    data: {
      recipientId: report.citizenId,
      reportId,
      type: 'STATUS_UPDATE',
      title: 'Report Resolved',
      message: `Your road defect (${report.ticketId}) has been successfully repaired and verified.`
    }
  })

  return { success: true }
}
