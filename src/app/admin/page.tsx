import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AdminMapWrapper from "@/components/AdminMapWrapper"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Fetch KPI data
  const totalReports = await prisma.roadReport.count()
  const newReports = await prisma.roadReport.count({ where: { status: 'SUBMITTED' } })
  const highPriority = await prisma.roadReport.count({ where: { priorityLevel: 'HIGH', status: { not: 'RESOLVED' } } })
  const scheduled = await prisma.roadReport.count({ where: { status: 'REPAIR_SCHEDULED' } })
  
  // Fetch Reports for Priority Queue
  const reports = await prisma.roadReport.findMany({
    where: {
      status: { not: 'RESOLVED' }
    },
    orderBy: [
      { priorityScore: 'desc' },
      { createdAt: 'desc' }
    ],
    include: {
      detection: true,
      duplicateGroup: true
    }
  })

  return (
    <div className="container mx-auto max-w-7xl p-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Municipal Command Center</h1>
        <div className="flex gap-4">
          <Button variant="outline">Generate Report</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Active Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">New (Awaiting AI Verify)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{newReports}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{highPriority}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Scheduled Repairs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{scheduled}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="queue">Priority Queue</TabsTrigger>
          <TabsTrigger value="map">Live Map</TabsTrigger>
        </TabsList>
        
        <TabsContent value="queue">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Priority Score</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.ticketId}</TableCell>
                      <TableCell>{report.address || 'Unknown'}</TableCell>
                      <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{report.priorityScore?.toFixed(1) || 'N/A'}</span>
                          {report.priorityLevel && (
                            <Badge variant={
                              report.priorityLevel === 'HIGH' ? 'destructive' :
                              report.priorityLevel === 'MODERATE' ? 'default' : 'secondary'
                            }>
                              {report.priorityLevel}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.duplicateGroup ? (
                          <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                            {report.duplicateGroup.reportCount} Reports
                          </Badge>
                        ) : (
                          <span className="text-sm text-slate-500">1 Report</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.status.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/reports/${report.id}`}>
                          <Button size="sm">Inspect</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reports.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        No active reports found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="map">
          <Card>
            <CardContent className="p-0 h-[600px] flex items-center justify-center bg-slate-100">
               <AdminMapWrapper reports={reports} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
