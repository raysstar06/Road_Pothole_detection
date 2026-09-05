import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminReportActions from "@/components/AdminReportActions"
import Link from "next/link"

export default async function AdminReportPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const report = await prisma.roadReport.findUnique({
    where: { id: params.id },
    include: {
      citizen: true,
      detection: true,
      duplicateGroup: true,
      repairAssignment: true,
      repairVerification: true
    }
  })

  if (!report) {
    return <div className="p-8 text-center">Report not found</div>
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-4">
            Ticket {report.ticketId}
            <Badge variant="outline" className="text-sm bg-slate-100">{report.status.replace(/_/g, ' ')}</Badge>
          </h1>
          <p className="text-slate-500 mt-1">{report.address}</p>
        </div>
        <div className="flex gap-2">
          {report.priorityLevel && (
            <Badge variant={
              report.priorityLevel === 'HIGH' ? 'destructive' :
              report.priorityLevel === 'MODERATE' ? 'default' : 'secondary'
            } className="text-sm px-4 py-1">
              {report.priorityLevel} Priority ({report.priorityScore?.toFixed(1)})
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Image & Detection */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-slate-200">
              <img src={report.imageUrl} alt="Defect" className="w-full h-full object-cover" />
              
              {/* Bounding Box Overlay */}
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
                    Pothole {report.detection.confidence.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle>AI Detection Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {report.detection ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Model</p>
                    <p className="font-semibold">{report.detection.modelName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Confidence</p>
                    <p className="font-semibold">{(report.detection.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Coverage Ratio</p>
                    <p className="font-semibold">{report.boundingBoxCoverage?.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Severity</p>
                    <p className="font-semibold text-red-600">{report.severity}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">AI detection pending...</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700">{report.description || 'No description provided.'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Meta & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Submitted By</p>
                <p className="font-medium">{report.citizen.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Date</p>
                <p className="font-medium">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Coordinates</p>
                <p className="font-mono">{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</p>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-slate-500 mb-1">Crowd Intelligence</p>
                {report.duplicateGroup ? (
                  <div className="bg-orange-50 text-orange-800 p-3 rounded-md border border-orange-200">
                    <p className="font-semibold">{report.duplicateGroup.reportCount} Citizens reported this</p>
                    <p className="text-xs mt-1">Group ID: {report.duplicateGroup.id}</p>
                    <p className="text-xs mt-1">Urgency: {report.duplicateGroup.crowdUrgency}</p>
                  </div>
                ) : (
                  <p className="font-medium">Single report (No duplicates nearby)</p>
                )}
              </div>
            </CardContent>
          </Card>

          <AdminReportActions report={report} />
        </div>

      </div>
    </div>
  )
}
