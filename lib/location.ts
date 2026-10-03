interface Location {
  lat: number
  lng: number
}

interface GoogleMapsPlaceResult {
  name: string
  vicinity?: string
  rating?: number
  user_ratings_total?: number
  opening_hours?: {
    open_now: boolean
  }
  geometry: {
    location: {
      lat: () => number
      lng: () => number
    }
  }
  types?: string[]
}

interface NearbyHospital {
  name: string
  vicinity: string
  rating?: number
  user_ratings_total?: number
  opening_hours?: {
    open_now: boolean
  }
  geometry: {
    location: Location
  }
  types: string[]
  distance: string
  mapsUrl: string
}

export interface Hospital {
  name: string
  distance: string
  hours: string
  services?: string
  mapsUrl: string
  rating?: number
}

export class LocationService {
  static async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  static calculateDistance(from: Location, to: Location): string {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRad(to.lat - from.lat)
    const dLng = this.toRad(to.lng - from.lng)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) *
      Math.cos(this.toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    }
    return `${distance.toFixed(1)} km`
  }

  private static toRad(value: number): number {
    return (value * Math.PI) / 180
  }
}

export class GoogleMapsService {
  private static apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  static getApiKey(): string | undefined {
    console.log('🔑 Google Maps API Key:', this.apiKey ? 'Set' : 'Not set')
    return this.apiKey
  }

  static async findNearbyHospitals(location: Location): Promise<Hospital[]> {
    console.log('🏥 [GoogleMapsService] Starting hospital search at location:', location)
    
    if (!this.apiKey) {
      console.error('❌ [GoogleMapsService] Google Maps API key is not configured')
      return []
    }

    // Ensure Google Maps script is loaded
    if (!window.google || !window.google.maps) {
      console.error('❌ [GoogleMapsService] Google Maps not loaded. Call loadGoogleMapsScript first.')
      return []
    }

    console.log('✅ [GoogleMapsService] Google Maps is available, creating PlacesService')
    
    // Create a map element (required for PlacesService)
    const mapElement = document.createElement('div')
    const map = new window.google.maps.Map(mapElement, {
      center: location,
      zoom: 15
    })
    
    const service = new window.google.maps.places.PlacesService(map)
    
    // Try increasing radius until we find hospitals
    const radii = [5000, 10000, 20000, 50000] // 5km, 10km, 20km, 50km
    
    for (const radius of radii) {
      console.log(`🔍 [GoogleMapsService] Searching within ${radius}m radius...`)
      
      try {
        const results = await new Promise<any[]>((resolve, reject) => {
          const request = {
            location: location,
            radius: radius,
            type: 'hospital',
            keyword: 'maternity medical clinic hospital health'
          }
          
          service.nearbySearch(request, (results: GoogleMapsPlaceResult[] | null, status: string) => {
            console.log(`📍 [GoogleMapsService] Search completed with status: ${status}`)

            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              console.log(`✅ [GoogleMapsService] Found ${results.length} places within ${radius}m`)
              resolve(results)
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              console.log(`⚠️ [GoogleMapsService] No results within ${radius}m, trying larger radius...`)
              resolve([])
            } else {
              console.error(`❌ [GoogleMapsService] PlacesService error: ${status}`)
              reject(new Error(`PlacesService error: ${status}`))
            }
          })
        })
        
        if (results.length > 0) {
          console.log(`🎉 [GoogleMapsService] Found hospitals at radius ${radius}m, processing results...`)
          
          const hospitals = results
            .slice(0, 10)
            .filter((place: any) => {
              const hasLocation = !!place.geometry?.location
              if (!hasLocation) {
                console.warn('⚠️ [GoogleMapsService] Place missing location:', place.name)
              }
              return hasLocation
            })
            .map((place: any): Hospital => {
              const placeLocation = place.geometry.location
              const distance = LocationService.calculateDistance(location, {
                lat: placeLocation.lat(),
                lng: placeLocation.lng()
              })
              
              console.log(`📊 [GoogleMapsService] Processing: ${place.name} (${distance})`)
              
              return {
                name: place.name,
                distance: distance,
                hours: place.opening_hours?.open_now ? 'Open now' : 'Closed',
                services: place.types?.includes('hospital') ? 'Hospital' : 'Medical Center',
                mapsUrl: `https://maps.google.com/?q=${encodeURIComponent(place.name)}&ll=${placeLocation.lat()},${placeLocation.lng()}`,
                rating: place.rating
              }
            })
            .sort((a: Hospital, b: Hospital) => {
              const aDistance = parseFloat(a.distance.replace(/[^\d.]/g, ''))
              const bDistance = parseFloat(b.distance.replace(/[^\d.]/g, ''))
              return aDistance - bDistance
            })
          
          console.log(`✅ [GoogleMapsService] Returning ${hospitals.length} hospitals`)
          return hospitals
        }
      } catch (error) {
        console.error(`❌ [GoogleMapsService] Error at radius ${radius}m:`, error)
        // Continue to next radius
      }
    }
    
    console.log('❌ [GoogleMapsService] No hospitals found even at 50km radius')
    return []
  }

  static async loadGoogleMapsScript(): Promise<void> {
    if (!this.apiKey) {
      console.error('Google Maps API key is not configured')
      return
    }

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      return
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.async = true
      script.defer = true
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`

      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google Maps script'))

      document.head.appendChild(script)
    })
  }

  static async geocodeAddress(address: string): Promise<Location> {
    console.log('🗺️ [GoogleMapsService] Geocoding address:', address)

    if (!this.apiKey) {
      console.error('❌ [GoogleMapsService] Google Maps API key is not configured')
      throw new Error('Google Maps API key is not configured')
    }

    // Ensure Google Maps script is loaded
    if (!window.google || !window.google.maps) {
      console.error('❌ [GoogleMapsService] Google Maps not loaded. Call loadGoogleMapsScript first.')
      throw new Error('Google Maps not loaded')
    }

    const geocoder = new window.google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode(
        { address: address },
        (results: any[], status: string) => {
          console.log(`📍 [GoogleMapsService] Geocode status: ${status}`)

          if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
            const location = results[0].geometry.location
            console.log(`✅ [GoogleMapsService] Geocoded to: ${location.lat()}, ${location.lng()}`)
            resolve({
              lat: location.lat(),
              lng: location.lng()
            })
          } else {
            console.error(`❌ [GoogleMapsService] Geocoding failed: ${status}`)
            reject(new Error(`Geocoding failed: ${status}`))
          }
        }
      )
    })
  }
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any
  }
}
