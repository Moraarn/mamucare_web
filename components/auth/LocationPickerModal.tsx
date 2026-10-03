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
  const [searchQuery, setSearchQuery] = useState(initialAddress || '')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const searchVersion = useRef(0)
  const searchBusy = useRef(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string>(initialAddress || '')
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)
  
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    setMapLoaded(false)
    setMapError(null)
    setSearching(false)
    searchBusy.current = false
    setSearchError(null)
    loadGoogleMaps().then(() => {
      if (cancelled) return
      timer = setTimeout(() => {
        if (cancelled) return
        initializeMap()
        setMapLoaded(true)
      }, 100)
    }).catch(() => {
      if (!cancelled) setMapError('Failed to load Google Maps')
    })
    return () => {
      cancelled = true
      clearTimeout(timer)
      searchVersion.current++
      if (window.google?.maps) {
        if (mapRef.current) window.google.maps.event.clearInstanceListeners(mapRef.current)
        if (markerRef.current) window.google.maps.event.clearInstanceListeners(markerRef.current)
      }
      markerRef.current?.setMap(null)
      mapRef.current = null
      markerRef.current = null
      geocoderRef.current = null
    }
  }, [isOpen])

  const handleSearch = () => {
    const address = searchQuery.trim()
    if (!address || !geocoderRef.current || searchBusy.current) return
    const version = ++searchVersion.current
    searchBusy.current = true
    setSearching(true)
    setSearchError(null)
    const finish = (results: any, status: string) => {
      if (version !== searchVersion.current) return
      searchBusy.current = false
      setSearching(false)
      const result = results?.[0]
      if (status !== 'OK' || !result?.geometry?.location) {
        setSearchError(status === 'ZERO_RESULTS'
          ? 'No location found. Try a more specific address.'
          : 'Location search is unavailable. Please try again.')
        return
      }
      const position = result.geometry.location
      mapRef.current?.setCenter(position)
      mapRef.current?.setZoom(15)
      markerRef.current?.setPosition(position)
      setSelectedCoords({ lat: position.lat(), lng: position.lng() })
      setSelectedAddress(result.formatted_address)
      setSearchQuery(result.formatted_address)
    }
    try {
      geocoderRef.current.geocode({ address }, finish)
    } catch {
      finish(null, 'ERROR')
    }
  }

  const initializeMap = () => {
    const container = mapContainerRef.current
    if (!container || !window.google) return

    const map = new window.google.maps.Map(container, {
      center: selectedCoords || { lat: -1.2921, lng: 36.8219 }, // Nairobi default
      zoom: 13,
    })

    mapRef.current = map

    const marker = new window.google.maps.Marker({
      map: map,
      draggable: true,
      position: selectedCoords || { lat: -1.2921, lng: 36.8219 },
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
          setSearchQuery(results[0].formatted_address)
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
          setSearchQuery(results[0].formatted_address)
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
        <div className="flex gap-2">
          <input
            type="text"
            aria-label="Search location"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
            placeholder="Search location..."
            className="w-full min-w-0 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          />
          <Button type="button" onClick={handleSearch}
            disabled={!mapLoaded || !!mapError || searching || !searchQuery.trim()}
            className="shrink-0 !px-3" aria-busy={searching}>
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {searchError && <p role="alert" className="text-sm" style={{ color: 'var(--color-danger)' }}>{searchError}</p>}

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
            disabled={!mapLoaded || searching || !selectedAddress || !selectedCoords}
            className="flex-1"
          >
            Use this location
          </Button>
        </div>
      </div>
    </Modal>
  )
}
