'use client'

import { useState, useEffect, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { loadGoogleMaps } from '@/lib/googleMapsLoader'

interface LocationPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (address: string, lat: number, lng: number) => void
  initialAddress?: string
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialAddress,
}: LocationPickerModalProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string>(initialAddress || '')
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)
  
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  useEffect(() => {
    if (isOpen && !mapLoaded) {
      loadGoogleMaps()
        .then(() => {
          setMapLoaded(true)
          // Small delay to ensure container is rendered with dimensions
          setTimeout(() => {
            initializeMap()
          }, 100)
        })
        .catch(() => {
          setMapError('Failed to load Google Maps')
        })
    }
  }, [isOpen, mapLoaded])

  const initializeMap = () => {
    const container = mapContainerRef.current
    if (!container || !window.google) return

    const map = new window.google.maps.Map(container, {
      center: { lat: -1.2921, lng: 36.8219 }, // Nairobi default
      zoom: 13,
    })

    mapRef.current = map

    const marker = new window.google.maps.Marker({
      map: map,
      draggable: true,
      position: { lat: -1.2921, lng: 36.8219 },
    })

    markerRef.current = marker

    const geocoder = new window.google.maps.Geocoder()
    geocoderRef.current = geocoder

    // Handle marker drag end
    marker.addListener('dragend', (event: any) => {
      const position = event.latLng
      const lat = position.lat()
      const lng = position.lng()
      setSelectedCoords({ lat, lng })
      
      geocoder.geocode({ location: position }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          setSelectedAddress(results[0].formatted_address)
        }
      })
    })

    // Handle map click
    map.addListener('click', (event: any) => {
      const position = event.latLng
      const lat = position.lat()
      const lng = position.lng()
      marker.setPosition(position)
      setSelectedCoords({ lat, lng })
      
      geocoder.geocode({ location: position }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          setSelectedAddress(results[0].formatted_address)
        }
      })
    })

    // Trigger map resize after a short delay to ensure container has dimensions
    setTimeout(() => {
      if (mapRef.current) {
        window.google.maps.event.trigger(mapRef.current, 'resize')
      }
    }, 100)
  }

  const handleConfirm = () => {
    if (selectedAddress && selectedCoords) {
      onLocationSelect(selectedAddress, selectedCoords.lat, selectedCoords.lng)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pick your location">
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <input
            type="text"
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            placeholder="Search location..."
            className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        {/* Map Container */}
        <div className="relative">
          <div
            ref={mapContainerRef}
            className="w-full h-80 rounded-xl overflow-hidden border border-border"
            style={{ minHeight: '320px' }}
          />
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
              <p className="text-sm text-text-secondary">{mapError}</p>
            </div>
          )}
          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
              <p className="text-sm text-text-secondary">Loading map...</p>
            </div>
          )}
        </div>

        {/* Selected Address Display */}
        {selectedAddress && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Selected location:
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {selectedAddress}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedAddress || !selectedCoords}
            className="flex-1"
          >
            Use this location
          </Button>
        </div>
      </div>
    </Modal>
  )
}
