"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Camera, MapPin, Mic, Loader2, UploadCloud } from "lucide-react"
import { submitReportAction } from "@/app/actions/report"

export default function ReportDefectPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState<string>("Detecting location...")
  const [description, setDescription] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      
      // Auto-fetch location if not already fetched
      if (!latitude) {
        getLocation()
      }
    }
  }

  const getLocation = () => {
    setIsLocating(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
          
          // Reverse geocoding mock (would normally use Google Maps or Mapbox API)
          setAddress(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`)
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setAddress("Unable to retrieve location automatically")
          setIsLocating(false)
        },
        { enableHighAccuracy: true }
      )
    } else {
      setAddress("Geolocation not supported by your browser")
      setIsLocating(false)
    }
  }

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser.")
      return
    }

    if (isRecording) {
      setIsRecording(false)
      // Stop logic would be handled by the recognition event if we kept a ref
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript)
      setIsRecording(false)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !latitude || !longitude) {
      alert("Please provide a photo and allow location access.")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("latitude", latitude.toString())
      formData.append("longitude", longitude.toString())
      formData.append("address", address)
      formData.append("description", description)

      const result = await submitReportAction(formData)
      
      if (result.success) {
        router.push(`/citizen`)
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      alert("Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Report a Road Defect</CardTitle>
          <CardDescription>
            Help us identify and fix infrastructure issues by submitting a photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Photo */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">1. Take or Upload a Photo</Label>
              <div 
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors ${previewUrl ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="w-full relative aspect-video rounded-lg overflow-hidden">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium flex items-center gap-2">
                        <UploadCloud className="w-5 h-5" /> Change Photo
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 flex flex-col items-center py-8">
                    <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-medium">Tap to take a photo</p>
                      <p className="text-sm text-slate-500">or upload from your gallery</p>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Step 2: Location */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">2. Location</Label>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border">
                <MapPin className={`w-6 h-6 ${latitude ? 'text-green-500' : 'text-slate-400'}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {isLocating ? 'Acquiring GPS signal...' : (latitude ? 'Location detected' : 'Location required')}
                  </p>
                  <p className="text-xs text-slate-500">{address}</p>
                </div>
                {!latitude && !isLocating && (
                  <Button type="button" variant="outline" size="sm" onClick={getLocation}>
                    Get Location
                  </Button>
                )}
              </div>
            </div>

            {/* Step 3: Description */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold" htmlFor="description">3. Description (Optional)</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-2 ${isRecording ? 'text-red-500 bg-red-50' : 'text-blue-600'}`}
                  onClick={toggleRecording}
                >
                  <Mic className="w-4 h-4" />
                  {isRecording ? 'Listening...' : 'Voice Input'}
                </Button>
              </div>
              <Textarea 
                id="description"
                placeholder="E.g. Deep pothole causing vehicles to swerve."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              className="w-full h-14 text-lg mt-8" 
              disabled={isSubmitting || !file || !latitude}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : 'Submit Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
