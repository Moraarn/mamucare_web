'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import LocationPickerModal from './LocationPickerModal'

interface LocationPickerProps {
  locationValue: string
  onLocationChange: (location: string) => void
}

export default function LocationPicker({
  locationValue,
  onLocationChange,
}: LocationPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    onLocationChange(address)
    // Store coordinates in a data attribute or separate state if needed
    // For now, we're just storing the address
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Your location
      </label>
      <div className="relative">
        <input
          type="text"
          value={locationValue}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Search or pick your location"
          className="w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
          }}
          required
          readOnly
          onClick={() => setIsModalOpen(true)}
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: 'var(--color-primary)' }}
          title="Pick location from map"
        >
          <MapPin size={20} />
        </button>
      </div>

      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialAddress={locationValue}
      />
    </div>
  )
}
