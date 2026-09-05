import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, MapPin, Award } from "lucide-react"

export default async function CitizenDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CITIZEN') {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      reports: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  if (!user) return <div>User not found</div>

  return (
    <div className="container mx-auto max-w-5xl p-4 py-8 space-y-8">
      {/* Header Profile Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name}</h1>
          <p className="text-slate-500">{user.neighborhood} Neighborhood</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
          <Award className="w-10 h-10 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-slate-500">Civic Points</p>
            <p className="text-2xl font-bold text-slate-900">{user.civicPoints}</p>
          </div>
        </div>
      </div>

      {/* Main CTA */}
      <Card className="bg-blue-600 text-white border-none shadow-md overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
        <CardContent className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Spotted a road defect?</h2>
            <p className="text-blue-100 text-lg">Report it quickly using your camera and GPS.</p>
          </div>
          <Link href="/citizen/report">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg h-14 px-8 rounded-full shadow-lg gap-2">
              <Camera className="w-5 h-5" />
              Report Defect
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Recent Reports</h2>
          <Button variant="ghost" className="text-blue-600">View All</Button>
        </div>

        {user.reports.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center text-slate-500 space-y-4">
              <MapPin className="w-12 h-12 mx-auto text-slate-300" />
              <p>You haven't reported any defects yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.reports.map(report => (
              <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-slate-200 relative">
                  {report.imageUrl && (
                    <img src={report.imageUrl} alt="Defect" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-900">
                      {report.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg line-clamp-1">{report.address || 'Unknown Location'}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(report.createdAt).toLocaleDateString()} • {report.ticketId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-slate-600 line-clamp-2 mt-2">
                    {report.description || 'No description provided.'}
                  </p>
                  {report.priorityLevel && (
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">Priority</span>
                      <Badge variant={
                        report.priorityLevel === 'HIGH' ? 'destructive' :
                        report.priorityLevel === 'MODERATE' ? 'default' : 'secondary'
                      }>
                        {report.priorityLevel}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
