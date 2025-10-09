import React, { useEffect, useRef, useState } from 'react'
import { cn } from '../utils/formatters'

interface MapViewProps {
  center?: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{
    id: string
    position: { lat: number; lng: number }
    title?: string
    description?: string
    color?: string
  }>
  onMarkerClick?: (marker: any) => void
  onMapClick?: (position: { lat: number; lng: number }) => void
  className?: string
  height?: string
  interactive?: boolean
}

const MapView: React.FC<MapViewProps> = ({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 10,
  markers = [],
  onMarkerClick,
  onMapClick,
  className,
  height = '400px',
  interactive = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [mapMarkers, setMapMarkers] = useState<any[]>([])

  useEffect(() => {
    // Initialize map (placeholder for actual map implementation)
    // This would typically use Mapbox, Google Maps, or Leaflet
    if (mapRef.current && !map) {
      // For now, we'll create a placeholder map
      const mapElement = mapRef.current
      mapElement.innerHTML = `
        <div class="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div class="text-center text-gray-500 dark:text-gray-400">
            <div class="text-4xl mb-2">🗺️</div>
            <p>Map View</p>
            <p class="text-sm">Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}</p>
            <p class="text-sm">Zoom: ${zoom}</p>
            <p class="text-sm">Markers: ${markers.length}</p>
          </div>
        </div>
      `
      setMap({ center, zoom })
    }
  }, [center, zoom, markers.length])

  useEffect(() => {
    // Update markers when markers prop changes
    if (map) {
      // Clear existing markers
      setMapMarkers([])
      
      // Add new markers
      const newMarkers = markers.map((marker) => ({
        id: marker.id,
        position: marker.position,
        title: marker.title,
        description: marker.description,
        color: marker.color || '#3B82F6',
      }))
      
      setMapMarkers(newMarkers)
    }
  }, [markers, map])

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onMapClick && interactive) {
      // Calculate position from click event
      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // Convert to lat/lng (simplified calculation)
      const lat = center.lat + (y - rect.height / 2) * 0.01
      const lng = center.lng + (x - rect.width / 2) * 0.01
      
      onMapClick({ lat, lng })
    }
  }

  return (
    <div
      ref={mapRef}
      className={cn(
        'w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700',
        interactive && 'cursor-pointer',
        className
      )}
      style={{ height }}
      onClick={handleMapClick}
    >
      {/* Map markers overlay */}
      {mapMarkers.map((marker) => (
        <div
          key={marker.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{
            left: '50%',
            top: '50%',
            color: marker.color,
          }}
          onClick={(e) => {
            e.stopPropagation()
            onMarkerClick?.(marker)
          }}
        >
          <div className="w-6 h-6 bg-current rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
            📍
          </div>
          {marker.title && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {marker.title}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default MapView
