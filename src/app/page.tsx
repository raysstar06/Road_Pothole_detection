"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

export default function LandingPage() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            See It. <span className="text-blue-500">Verify It.</span> Fix It.
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            AI-powered civic infrastructure monitoring that turns citizen reports into verified, prioritized, and accountable road repairs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href={session ? (session.user.role === 'ADMIN' ? '/admin' : '/citizen/report') : '/login'}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 h-14">
                Report a Road Defect
              </Button>
            </Link>
            <Link href={session?.user.role === 'ADMIN' ? '/admin' : '/login'}>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-slate-600 text-slate-900 hover:bg-slate-800 hover:text-white">
                Municipal Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-6 rounded-2xl bg-slate-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold">Capture</h3>
              <p className="text-slate-600">Citizens snap a photo of a road defect. We automatically extract GPS coordinates.</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-2xl bg-slate-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold">Detect & Prioritize</h3>
              <p className="text-slate-600">Our YOLOv8 AI analyzes the image, calculates severity, and deduplicates nearby reports.</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-2xl bg-slate-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold">Repair & Verify</h3>
              <p className="text-slate-600">Authorities schedule repairs. A post-repair AI audit ensures the fix was successful before closing the loop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl space-y-24">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold">AI Detection</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                We use state-of-the-art computer vision models like YOLOv8 to automatically detect potholes in user-submitted photos, calculating bounding boxes and confidence scores instantly.
              </p>
            </div>
            <div className="flex-1 w-full bg-slate-200 rounded-2xl aspect-video flex items-center justify-center">
               <span className="text-slate-400 font-medium">Detection Visualization</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-bold">Smart Deduplication</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Using geospatial algorithms (Haversine formula), we automatically group multiple reports of the same pothole within a 10-meter radius, turning duplicate complaints into crowd urgency signals.
              </p>
            </div>
            <div className="flex-1 w-full bg-slate-200 rounded-2xl aspect-video flex items-center justify-center">
               <span className="text-slate-400 font-medium">Clustering Visualization</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-blue-600 text-white text-center">
        <div className="container mx-auto max-w-4xl space-y-8">
          <h2 className="text-4xl font-bold">Help Make Every Road Safer</h2>
          <p className="text-xl text-blue-100">
            Join the community of citizens earning civic points for improving local infrastructure.
          </p>
          <Link href={session ? '/citizen' : '/login'}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 h-14 mt-4">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
