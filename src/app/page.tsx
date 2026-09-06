"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import {
  Camera,
  ShieldCheck,
  BrainCircuit,
  Sparkles,
  MapPin,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  Activity,
  Layers,
} from "lucide-react"

export default function LandingPage() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-24 md:py-32 px-4">
        {/* Subtle decorative background glows (retaining slate-900 / blue-600 palette) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[300px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto max-w-5xl text-center space-y-8 relative z-10">
          {/* Status badge pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-blue-400 text-sm font-medium shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Next-Gen Civic Infrastructure AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            See It. <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Verify It.</span> Fix It.
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            AI-powered civic infrastructure monitoring that turns citizen reports into verified, prioritized, and accountable road repairs.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={session ? (session.user.role === "ADMIN" ? "/admin" : "/citizen/report") : "/login"}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 h-14 rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Report a Road Defect
              </Button>
            </Link>
            <Link href={session?.user.role === "ADMIN" ? "/admin" : "/login"}>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 h-14 rounded-xl border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                Municipal Command Center
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-slate-800/80 mt-12 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-2xl md:text-3xl">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span>98.2%</span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-medium">AI Vision Accuracy</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-2xl md:text-3xl">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>&lt; 48h</span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-medium">Critical Defect SLA</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-2xl md:text-3xl">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>10m</span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-medium">Geospatial Dedup Radius</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-2xl md:text-3xl">
                <Award className="w-5 h-5 text-blue-400" />
                <span>15 pts</span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 font-medium">Civic Reward Per Report</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-blue-600 font-semibold text-sm tracking-wider uppercase">Automated Workflow</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">How RoadWatch AI Works</h2>
            <p className="text-slate-600 text-base">
              A transparent, closed-loop pipeline from street capture to verified municipal completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-4 p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
                <Camera className="w-8 h-8" />
              </div>
              <div className="inline-block px-3 py-0.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                Step 1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Instant Citizen Capture</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Citizens snap a photo of a pothole. GPS coordinates and human-readable addresses are automatically extracted via OpenStreetMap geocoding.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-4 p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div className="inline-block px-3 py-0.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                Step 2
              </div>
              <h3 className="text-xl font-bold text-slate-900">AI Vision & Prioritization</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Gemini Vision inspects the defect, estimates surface coverage, assigns severity, and groups duplicate reports within 10m to boost crowd urgency.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-4 p-8 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="inline-block px-3 py-0.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                Step 3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Repair & Audit Verification</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Contractors are dispatched through the command center. An automated completion visual audit guarantees 0% residual defects before closing the ticket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Feature Visual Showcase */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-200/60">
        <div className="container mx-auto max-w-6xl space-y-28">
          {/* Feature 1: AI Vision */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <Activity className="w-3.5 h-3.5" />
                <span>Computer Vision Intelligence</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Automated Defect Detection & Surface Scoring
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Using multimodal vision models, every submitted road photo is analyzed within seconds. The engine generates precise bounding boxes, defect confidence scores, and surface area ratios.
              </p>
              <ul className="space-y-3 text-slate-700 text-sm font-medium">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Sub-second inference with confidence scoring & severity classification</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Dynamic surface area coverage calculation for repair budgeting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Real-time citizen notification upon AI verification</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group">
              <img
                src="/images/ai-detection.jpg"
                alt="AI Pothole Vision Detection with bounding box and HUD analysis"
                className="w-full h-auto aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Feature 2: Smart Deduplication */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-16">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Spatio-Visual Clustering</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Spatio-Temporal Deduplication & Crowd Signals
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                When 10 citizens report the same crater on a busy avenue, municipal teams shouldn't see 10 redundant work orders. Our Haversine algorithm automatically clusters reports within a 10-meter radius.
              </p>
              <ul className="space-y-3 text-slate-700 text-sm font-medium">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Clusters duplicate reports into a single municipal work ticket</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Converts duplicate reports into an escalated Crowd Urgency multiplier</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Eliminates redundant contractor dispatches and municipal waste</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 group">
              <img
                src="/images/smart-deduplication.jpg"
                alt="Smart Deduplication and GIS clustering map"
                className="w-full h-auto aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-blue-600 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-blue-700/40 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-4xl space-y-8 relative z-10">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Help Make Every Road Safer</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Join the community of proactive citizens earning civic points, unlocking badges, and holding infrastructure repairs accountable.
          </p>
          <div className="pt-2">
            <Link href={session ? "/citizen/report" : "/register"}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-9 h-14 rounded-xl shadow-xl font-semibold">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal sleek footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-center text-sm">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold tracking-tight">RoadWatch<span className="text-blue-500">AI</span></span>
            <span>&copy; {new Date().getFullYear()} Municipal Road Infrastructure Monitoring</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span>YOLOv8 & Gemini Multimodal Vision</span>
            <span>•</span>
            <span>OpenStreetMap Nominatim</span>
            <span>•</span>
            <span>Spatio-Visual Deduplication</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
