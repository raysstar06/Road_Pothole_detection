import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const reports = await prisma.roadReport.findMany({
    orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }],
    include: {
      citizen: { select: { name: true, email: true } },
      duplicateGroup: true,
      detection: true,
    },
  })

  // Build CSV
  const headers = [
    "Ticket ID",
    "Status",
    "Priority Level",
    "Priority Score",
    "Severity",
    "Crowd Urgency",
    "Duplicate Reports Count",
    "Address",
    "Latitude",
    "Longitude",
    "Reported By",
    "Citizen Email",
    "Created Date",
  ]

  const rows = reports.map((r) => [
    `"${r.ticketId}"`,
    `"${r.status}"`,
    `"${r.priorityLevel || "N/A"}"`,
    `"${r.priorityScore ? r.priorityScore.toFixed(1) : "N/A"}"`,
    `"${r.severity || "N/A"}"`,
    `"${r.crowdUrgency}"`,
    `"${r.duplicateGroup ? r.duplicateGroup.reportCount : 1}"`,
    `"${(r.address || "Unknown").replace(/"/g, '""')}"`,
    `"${r.latitude}"`,
    `"${r.longitude}"`,
    `"${(r.citizen.name || "").replace(/"/g, '""')}"`,
    `"${r.citizen.email}"`,
    `"${new Date(r.createdAt).toISOString()}"`,
  ])

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="roadwatch-municipal-report-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
