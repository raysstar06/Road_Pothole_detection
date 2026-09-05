import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react"

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'CITIZEN') {
    redirect('/login')
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  // Mark all as read (Server Action ideally, but doing it on load for demo simplicity)
  if (notifications.some(n => !n.isRead)) {
    await prisma.notification.updateMany({
      where: { recipientId: session.user.id, isRead: false },
      data: { isRead: true }
    })
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-3 rounded-full text-blue-600">
          <Bell className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-slate-500 text-center py-12">You have no new notifications.</p>
        ) : (
          notifications.map(notification => (
            <Card key={notification.id} className={!notification.isRead ? 'bg-blue-50/50 border-blue-200' : ''}>
              <CardContent className="p-4 flex gap-4">
                <div className="mt-1">
                  {notification.type === 'NEW_REPORT' && <Info className="w-5 h-5 text-blue-500" />}
                  {notification.type === 'STATUS_UPDATE' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {notification.type === 'POINTS_AWARDED' && <CheckCircle className="w-5 h-5 text-yellow-500" />}
                  {!['NEW_REPORT', 'STATUS_UPDATE', 'POINTS_AWARDED'].includes(notification.type) && <AlertTriangle className="w-5 h-5 text-slate-500" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{notification.title}</p>
                    <span className="text-xs text-slate-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">{notification.message}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
