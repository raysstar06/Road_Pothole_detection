"use client"

import dynamic from "next/dynamic"

const AdminMap = dynamic(() => import("@/components/AdminMap"), { ssr: false })

export default function AdminMapWrapper({ reports }: { reports: any[] }) {
  return <AdminMap reports={reports} />
}
