import { useState, useCallback, useEffect } from 'react'
import { Coordinates } from '../types'
import { mapHelpers } from '../utils/mapHelpers'

interface UseMapOptions {
  initialCenter?: Coordinates
  initialZoom?: number
  onLocationChange?: (coordinates: Coordinates) => void
}

interface UseMapReturn {
  center: Coordinates
  zoom: number
  selectedLocation: Coordinates | null
  setCenter: (coordinates: Coordinates) => void
  setZoom: (zoom: number) => void
  setSelectedLocation: (coordinates: Coordinates | null) => void
  handleMapClick: (coordinates: Coordinates) => void
  getCurrentLocation: () => Promise<Coordinates | null>
  calculateDistance: (coord1: Coordinates, coord2: Coordinates) => number
}

export function useMap(options: UseMapOptions = {}): UseMapReturn {
  const {
    initialCenter = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
    initialZoom = 10,
    onLocationChange,
  } = options

  const [center, setCenter] = useState<Coordinates>(initialCenter)
  const [zoom, setZoom] = useState(initialZoom)
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null)

  const handleMapClick = useCallback((coordinates: Coordinates) => {
    setSelectedLocation(coordinates)
    onLocationChange?.(coordinates)
  }, [onLocationChange])

  const getCurrentLocation = useCallback((): Promise<Coordinates | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          resolve(coordinates)
        },
        (error) => {
          console.error('Error getting current location:', error)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      )
    })
  }, [])

  const calculateDistance = useCallback((coord1: Coordinates, coord2: Coordinates) => {
    return mapHelpers.calculateDistance(coord1, coord2)
  }, [])

  // Auto-center on selected location
  useEffect(() => {
    if (selectedLocation) {
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => {
        setCenter(selectedLocation)
      }, 0)
    }
  }, [selectedLocation])

  return {
    center,
    zoom,
    selectedLocation,
    setCenter,
    setZoom,
    setSelectedLocation,
    handleMapClick,
    getCurrentLocation,
    calculateDistance,
  }
}
