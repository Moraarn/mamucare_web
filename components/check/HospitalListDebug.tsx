'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Star, Loader2, AlertCircle } from 'lucide-react'
import { LocationService, GoogleMapsService, Hospital } from '@/lib/location'

interface HospitalListDebugProps {
  userLocation?: string
}

export default function HospitalListDebug({ userLocation }: HospitalListDebugProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [showLocationPopup, setShowLocationPopup] = useState(false)

  useEffect(() => {
    const loadNearbyHospitals = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('🏥 DEBUG: Starting hospital location search...')
        setDebugInfo((prev: any) => ({ ...prev, step: 'Starting search' }))

        // Check API key first
        const apiKey = GoogleMapsService.getApiKey()
        setDebugInfo((prev: any) => ({ ...prev, apiKey: apiKey ? 'Set' : 'Not set' }))

        let location: any

        // Try to get user's current location first
        try {
          location = await LocationService.getCurrentLocation()
          console.log('📍 DEBUG: Location obtained from geolocation:', location)
          setDebugInfo((prev: any) => ({ ...prev, location, locationSource: 'geolocation' }))
        } catch (geoErr) {
          console.warn('⚠️ DEBUG: Geolocation failed, trying user signup location:', geoErr)
          // If geolocation fails, try to use the user's signup location
          if (userLocation) {
            try {
              await GoogleMapsService.loadGoogleMapsScript()
              location = await GoogleMapsService.geocodeAddress(userLocation)
              console.log('📍 DEBUG: Location obtained from signup address:', location)
              setDebugInfo((prev: any) => ({ ...prev, location, locationSource: 'signup_address' }))
            } catch (addressErr) {
              console.error('❌ DEBUG: Failed to geocode signup address:', addressErr)
              throw new Error('Unable to determine your location. Please enable location services.')
            }
          } else {
            // No signup location available, show popup
            console.log('❌ DEBUG: No location available, showing popup')
            setDebugInfo((prev: any) => ({ ...prev, locationSource: 'none' }))
            throw new Error('Location access denied. Please enable location services.')
          }
        }

        // Load Google Maps script
        await GoogleMapsService.loadGoogleMapsScript()
        console.log('🗺️ DEBUG: Google Maps script loaded')
        setDebugInfo((prev: any) => ({ ...prev, scriptLoaded: true }))

        // Find nearby hospitals
        const nearbyHospitals = await GoogleMapsService.findNearbyHospitals(location)
        console.log('🏥 DEBUG: Nearby hospitals found:', nearbyHospitals)
        setDebugInfo((prev: any) => ({ ...prev, hospitalsFound: nearbyHospitals.length }))

        if (nearbyHospitals.length === 0) {
          console.log('❌ DEBUG: No hospitals found nearby')
          setError('No hospitals found nearby')
        } else {
          console.log('✅ DEBUG: Setting hospitals:', nearbyHospitals)
          setHospitals(nearbyHospitals)
        }
      } catch (err) {
        console.error('❌ DEBUG: Error loading hospitals:', err)
        setDebugInfo((prev: any) => ({ ...prev, error: (err as Error).message }))
        if ((err as Error).message.includes('Location access denied')) {
          setError('Location access denied. Please enable location services.')
          setShowLocationPopup(true)
        } else {
          setError((err as Error).message)
        }
      } finally {
        setLoading(false)
      }
    }

    loadNearbyHospitals()
  }, [userLocation])

  const handleRequestLocation = () => {
    setShowLocationPopup(false)
    // Since browser has blocked permission, we need to guide user to browser settings
    // Open Chrome settings for location permissions
    if (navigator.userAgent.includes('Chrome')) {
      window.open('chrome://settings/content/location', '_blank')
    } else if (navigator.userAgent.includes('Firefox')) {
      window.open('about:preferences#privacy', '_blank')
    } else if (navigator.userAgent.includes('Safari')) {
      window.open('x-apple.systempreferences:com.apple.preference.security', '_blank')
    } else {
      // Generic fallback - show instructions
      alert('Please enable location services in your browser settings:\n\n1. Click the lock/info icon next to the URL\n2. Find "Location" in the permissions\n3. Change it to "Allow"\n4. Refresh the page')
    }
  }

  console.log('🏥 DEBUG: HospitalList render state:', { loading, error, hospitalsCount: hospitals.length })

  return (
    <div className="space-y-3">
      {/* Location Permission Popup */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  Location Access Required
                </h3>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Your browser has blocked location access. To show you the nearest hospitals, please enable location services in your browser settings and refresh the page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLocationPopup(false)}
                className="flex-1 py-2 px-4 border rounded-lg font-medium transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'transparent'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRequestLocation}
                className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white'
                }}
              >
                Open Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {hospitals.map((hospital, index) => (
          <div
            key={index}
            className="border rounded-xl p-3 flex items-center gap-3"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)'
            }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--color-green-light)' }}
            >
              <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {hospital.name}
              </h4>
              <div className="flex items-center gap-2 text-xs"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span>{hospital.distance}</span>
                <span>•</span>
                <span>{hospital.hours}</span>
                {hospital.services && (
                  <>
                    <span>•</span>
                    <span>{hospital.services}</span>
                  </>
                )}
                {hospital.rating && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-current" />
                      <span>{hospital.rating.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => window.open(hospital.mapsUrl, '_blank')}
              className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-opacity-90 transition-colors"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white'
              }}
            >
              Go
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
