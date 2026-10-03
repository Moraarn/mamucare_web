// Global singleton for Google Maps script loading
let loadPromise: Promise<void> | null = null

export const loadGoogleMaps = (): Promise<void> => {
  // Return existing promise if already loading or loaded
  if (loadPromise) {
    return loadPromise
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    console.error('❌ Google Maps API key missing')
    return Promise.reject(new Error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'))
  }

  // Check if already loaded
  if (typeof window !== 'undefined') {
    const win = window as any
    if (win.google && win.google.maps) {
      loadPromise = Promise.resolve()
      return loadPromise
    }
  }

  // Create and append script only once
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geocoding&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    script.id = 'google-maps-script' // Prevent duplicate IDs

    // Set up global callback
    ;(window as any).initGoogleMaps = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Google Maps API loaded successfully')
      }
      resolve()
    }

    script.onerror = () => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Failed to load Google Maps API')
      }
      loadPromise = null // Reset on error so retry is possible
      reject(new Error('Failed to load Google Maps'))
    }

    // Check if script already exists in DOM
    const existing = document.querySelector('script#google-maps-script')
    if (!existing) {
      document.head.appendChild(script)
    } else {
      resolve()
    }
  })

  return loadPromise
}

export const waitForGoogleMaps = async () => {
  await loadGoogleMaps()
  const win = window as any
  if (!win.google || !win.google.maps) {
    throw new Error('Google Maps failed to load')
  }
  return win.google.maps
}
