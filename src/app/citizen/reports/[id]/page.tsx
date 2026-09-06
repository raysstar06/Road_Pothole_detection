import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Hammer, ShieldCheck } from "lucide-react"

export default async function CitizenReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CITIZEN") {
    redirect("/login")
  }

  const resolvedParams = await params
  const report = await prisma.roadReport.findUnique({
    where: { id: resolvedParams.id },
    include: {
      detection: true,
      duplicateGroup: true,
      repairAssignment: true,
      repairVerification: true,
    },
  })

  if (!report || report.citizenId !== session.user.id) {
    return (
      <div className="container mx-auto max-w-2xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Report not found</h2>
        <p className="text-slate-500">You may not have permission to view this report.</p>
        <Link href="/citizen" className="text-blue-600 hover:underline">
          &larr; Return to Dashboard
        </Link>
      </div>
    )
  }

  const steps = [
    { label: "Submitted", statusKey: "SUBMITTED", icon: Clock },
    { label: "AI Verified", statusKey: "YOLO_VERIFIED", icon: ShieldCheck },
    { label: "Scheduled", statusKey: "REPAIR_SCHEDULED", icon: Hammer },
    { label: "In Progress", statusKey: "REPAIR_IN_PROGRESS", icon: AlertTriangle },
    { label: "Resolved", statusKey: "RESOLVED", icon: CheckCircle2 },
  ]

  const statusHierarchy = [
    "SUBMITTED",
    "YOLO_VERIFIED",
    "DEDUPLICATED",
    "REPAIR_SCHEDULED",
    "REPAIR_IN_PROGRESS",
    "AWAITING_VERIFICATION",
    "RESOLVED",
  ]

  const currentStatusIndex = statusHierarchy.indexOf(report.status)

  return (
    <div className="container mx-auto max-w-5xl p-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/citizen" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Ticket #{report.ticketId}</h1>
            <Badge variant="outline" className="text-sm bg-slate-100">
              {report.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-slate-500 mt-1">{report.address || "Location Recorded"}</p>
        </div>
        {report.priorityLevel && (
          <Badge
            variant={
              report.priorityLevel === "HIGH"
                ? "destructive"
                : report.priorityLevel === "MODERATE"
                ? "default"
                : "secondary"
            }
            className="text-sm px-4 py-1 self-start md:self-auto"
          >
            {report.priorityLevel} Priority ({report.priorityScore?.toFixed(1)})
          </Badge>
        )}
      </div>

      {/* Status Pipeline Visualizer */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Repair Lifecycle Progress</CardTitle>
          <CardDescription>Track the municipal response for your report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {steps.map((step, idx) => {
              const stepIndex = statusHierarchy.indexOf(step.statusKey)
              const isPassed = currentStatusIndex >= stepIndex
              const isCurrent = report.status === step.statusKey
              const Icon = step.icon

              return (
                <div
                  key={step.label}
                  className={`p-3 rounded-lg border text-center flex flex-col items-center gap-2 ${
                    isCurrent
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : isPassed
                      ? "bg-white text-slate-800 border-slate-300"
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isCurrent ? "text-white" : isPassed ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="text-xs font-semibold">{step.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Defect Photo and Detection details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-slate-200">
              <img src={report.imageUrl} alt="Defect" className="w-full h-full object-cover" />

              {/* Bounding box overlay if available */}
              {report.detection && (
                <div
                  className="absolute border-2 border-red-500 bg-red-500/20"
                  style={{
                    left: `${(report.detection.x / report.detection.imageWidth) * 100}%`,
                    top: `${(report.detection.y / report.detection.imageHeight) * 100}%`,
                    width: `${(report.detection.width / report.detection.imageWidth) * 100}%`,
                    height: `${(report.detection.height / report.detection.imageHeight) * 100}%`,
                  }}
                >
                  <div className="bg-red-500 text-white text-[10px] px-1 absolute -top-4 left-[-2px] whitespace-nowrap">
                    Defect {(report.detection.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle>AI Vision Inspection</CardTitle>
            </CardHeader>
            <CardContent>
              {report.detection ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Inspection Model</p>
                    <p className="font-semibold">{report.detection.modelName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Confidence</p>
                    <p className="font-semibold">{(report.detection.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Surface Coverage</p>
                    <p className="font-semibold">{report.boundingBoxCoverage?.toFixed(1) || "0.0"}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Severity</p>
                    <p className="font-semibold text-red-600">{report.severity || "MODERATE"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Automated verification completed.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Report Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{report.description || "No description provided."}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status & Assignment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Date Reported</p>
                <p className="font-medium">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">GPS Coordinates</p>
                <p className="font-mono text-xs">
                  {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </p>
              </div>

              {report.repairAssignment ? (
                <div className="pt-3 border-t space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Repair Contractor
                  </p>
                  <p className="font-medium">{report.repairAssignment.contractorName}</p>
                  <p className="text-xs text-slate-500">
                    Scheduled: {new Date(report.repairAssignment.scheduledDate).toLocaleDateString()}
                  </p>
                  {report.repairAssignment.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border">
                      {report.repairAssignment.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="pt-3 border-t">
                  <p className="text-slate-500">Assigned Contractor</p>
                  <p className="text-slate-400 text-xs italic">Awaiting municipal scheduling</p>
                </div>
              )}

              {report.repairVerification && (
                <div className="pt-3 border-t space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                    AI Completion Audit
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span>Audit Status:</span>
                    <Badge variant={report.repairVerification.auditStatus === "PASS" ? "default" : "destructive"}>
                      {report.repairVerification.auditStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    Quality Score: {report.repairVerification.completionScore.toFixed(1)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
