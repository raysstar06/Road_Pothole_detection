"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const highPriorityIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function AdminMap({ reports }: { reports: any[] }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-full w-full flex items-center justify-center">Loading Map...</div>

  // Default center (e.g. Mumbai if reports are empty, otherwise first report)
  const center: [number, number] = reports.length > 0 
    ? [reports[0].latitude, reports[0].longitude] 
    : [19.0760, 72.8777]

  return (
    <div className="h-full w-full rounded-md overflow-hidden">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map(report => (
          <Marker 
            key={report.id} 
            position={[report.latitude, report.longitude]}
            icon={report.priorityLevel === 'HIGH' ? highPriorityIcon : icon}
          >
            <Popup>
              <div className="space-y-2 min-w-[200px]">
                <h3 className="font-bold text-base">{report.ticketId}</h3>
                <p className="text-sm">{report.address}</p>
                <div className="flex gap-2 text-xs">
                  <span className="font-semibold bg-slate-100 px-2 rounded">Status: {report.status}</span>
                  <span className={`font-semibold px-2 rounded ${report.priorityLevel === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {report.priorityLevel}
                  </span>
                </div>
                {report.duplicateGroup && (
                  <p className="text-xs text-orange-600 font-medium">
                    Duplicate Group: {report.duplicateGroup.reportCount} reports
                  </p>
                )}
                <a href={`/admin/reports/${report.id}`} className="text-blue-600 text-sm hover:underline block mt-2">
                  Inspect Report &rarr;
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
