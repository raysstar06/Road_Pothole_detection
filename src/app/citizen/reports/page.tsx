import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, MapPin } from "lucide-react"

export default async function CitizenAllReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CITIZEN") {
    redirect("/login")
  }

  const reports = await prisma.roadReport.findMany({
    where: { citizenId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container mx-auto max-w-5xl p-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/citizen">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All My Reports</h1>
            <p className="text-slate-500 text-sm">
              Total {reports.length} report{reports.length === 1 ? "" : "s"} submitted
            </p>
          </div>
        </div>
        <Link href="/citizen/report">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Camera className="w-4 h-4" /> New Report
          </Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-slate-500 space-y-4">
            <MapPin className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-lg font-medium">You haven't reported any road defects yet.</p>
            <Link href="/citizen/report">
              <Button>Report a Defect Now</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Link key={report.id} href={`/citizen/reports/${report.id}`} className="group">
              <Card className="overflow-hidden h-full hover:shadow-md transition-shadow border-slate-200">
                <div className="h-44 bg-slate-200 relative overflow-hidden">
                  {report.imageUrl && (
                    <img
                      src={report.imageUrl}
                      alt="Defect"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-900 shadow-sm">
                      {report.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {report.address || "Unknown Location"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(report.createdAt).toLocaleDateString()} • {report.ticketId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                    {report.description || "No description provided."}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Priority Level</span>
                    {report.priorityLevel ? (
                      <Badge
                        variant={
                          report.priorityLevel === "HIGH"
                            ? "destructive"
                            : report.priorityLevel === "MODERATE"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {report.priorityLevel}
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">Evaluating...</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
