import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Award } from "lucide-react"

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CITIZEN') {
    redirect('/login')
  }

  const users = await prisma.user.findMany({
    where: { role: 'CITIZEN' },
    orderBy: { civicPoints: 'desc' },
    take: 50
  })

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
        <h1 className="text-4xl font-bold tracking-tight">Community Leaderboard</h1>
        <p className="text-slate-500 text-lg">Recognizing our most active citizens in keeping our roads safe.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>Based on verified reports and community impact.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Rank</TableHead>
                <TableHead>Citizen</TableHead>
                <TableHead>Neighborhood</TableHead>
                <TableHead className="text-right">Civic Points</TableHead>
                <TableHead className="text-right">Badge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id} className={user.id === session.user.id ? "bg-blue-50" : ""}>
                  <TableCell className="text-center font-bold">
                    {index === 0 && <Medal className="w-6 h-6 mx-auto text-yellow-500" />}
                    {index === 1 && <Medal className="w-6 h-6 mx-auto text-slate-400" />}
                    {index === 2 && <Medal className="w-6 h-6 mx-auto text-amber-600" />}
                    {index > 2 && `#${index + 1}`}
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.name} {user.id === session.user.id && "(You)"}
                  </TableCell>
                  <TableCell>{user.neighborhood || 'Unknown'}</TableCell>
                  <TableCell className="text-right font-bold text-blue-600">{user.civicPoints}</TableCell>
                  <TableCell className="text-right">
                    {user.civicPoints >= 100 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        <Award className="w-3 h-3" /> Community Champion
                      </span>
                    ) : user.civicPoints >= 50 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        <Award className="w-3 h-3" /> Street Sentinel
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                        <Award className="w-3 h-3" /> Civic Watcher
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
