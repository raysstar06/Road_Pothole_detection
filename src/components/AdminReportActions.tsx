"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { scheduleRepairAction, startRepairAction, verifyRepairAuditAction, resolveReportAction } from "@/app/actions/admin"

export default function AdminReportActions({ report }: { report: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [contractor, setContractor] = useState("")
  const [date, setDate] = useState("")

  const handleSchedule = async () => {
    if (!contractor || !date) return alert("Fill all fields")
    setLoading(true)
    await scheduleRepairAction(report.id, contractor, date, "")
    setLoading(false)
    router.refresh()
  }

  const handleStart = async () => {
    setLoading(true)
    await startRepairAction(report.id)
    setLoading(false)
    router.refresh()
  }

  const handleAudit = async () => {
    setLoading(true)
    const formData = new FormData() // Mock empty form data
    const res = await verifyRepairAuditAction(report.id, formData)
    setLoading(false)
    if (res.passed) {
      alert("Visual Audit PASSED. You may now resolve the report.")
    } else {
      alert("Visual Audit FAILED. Residual defect detected.")
    }
    router.refresh()
  }

  const handleResolve = async () => {
    setLoading(true)
    await resolveReportAction(report.id)
    setLoading(false)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Municipal Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {report.status === 'SUBMITTED' && (
          <p className="text-sm text-slate-500">Waiting for AI Verification.</p>
        )}
        
        {(report.status === 'YOLO_VERIFIED' || report.status === 'DEDUPLICATED') && (
          <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
            <h4 className="font-semibold text-sm">Schedule Repair</h4>
            <div className="space-y-2">
              <Label>Contractor Name</Label>
              <Input value={contractor} onChange={(e) => setContractor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <Button onClick={handleSchedule} disabled={loading} className="w-full">
              {loading ? "Processing..." : "Schedule Repair"}
            </Button>
          </div>
        )}

        {report.status === 'REPAIR_SCHEDULED' && (
          <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
            <h4 className="font-semibold text-sm">Contractor Assignment</h4>
            <p className="text-sm text-slate-600">Assigned to: {report.repairAssignment?.contractorName}</p>
            <p className="text-sm text-slate-600">Date: {report.repairAssignment?.scheduledDate ? new Date(report.repairAssignment.scheduledDate).toLocaleDateString() : 'N/A'}</p>
            <Button onClick={handleStart} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
              Mark as In Progress
            </Button>
          </div>
        )}

        {report.status === 'REPAIR_IN_PROGRESS' && (
          <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
            <h4 className="font-semibold text-sm">Post-Repair Verification</h4>
            <div className="space-y-2">
              <Label>Upload Post-Repair Image</Label>
              <Input type="file" accept="image/*" />
            </div>
            <Button onClick={handleAudit} disabled={loading} className="w-full bg-blue-600 text-white">
              Run Visual Completion Audit
            </Button>
          </div>
        )}

        {report.status === 'AWAITING_VERIFICATION' && report.repairVerification && (
          <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
            <h4 className="font-semibold text-sm">Audit Results</h4>
            <div className="flex items-center justify-between text-sm">
              <span>Status:</span>
              <span className={`font-bold ${report.repairVerification.auditStatus === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                {report.repairVerification.auditStatus}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Completion Score:</span>
              <span className="font-mono">{report.repairVerification.completionScore}%</span>
            </div>
            
            {report.repairVerification.auditStatus === 'PASS' ? (
              <Button onClick={handleResolve} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
                Mark as Officially Resolved
              </Button>
            ) : (
              <p className="text-xs text-red-500 mt-2">Audit failed. Residual defect detected. Please fix and re-audit.</p>
            )}
          </div>
        )}
        
        {report.status === 'RESOLVED' && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-center font-medium">
            This defect has been officially resolved.
          </div>
        )}

      </CardContent>
    </Card>
  )
}
