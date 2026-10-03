'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { UserStatus, Trimester } from '@/store/useStore'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onSave: (updatedUser: any) => Promise<void>
}

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    status: 'unknown' as UserStatus,
    trimester: undefined as Trimester | undefined,
    chwName: '',
    chwPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        location: user.location || '',
        status: user.status || 'unknown',
        trimester: user.trimester || undefined,
        chwName: user.chwName || '',
        chwPhone: user.chwPhone || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      await onSave({ ...user, ...formData })
      onClose()
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: 'pregnant' as UserStatus, label: '🤰 Pregnant', subtitle: 'Currently expecting' },
    { value: 'postpartum_early' as UserStatus, label: '👶 New Mama', subtitle: 'Gave birth recently (0–6 wks)' },
    { value: 'postpartum_late' as UserStatus, label: '🌸 Recovering', subtitle: 'Birth was 6–12 weeks ago' },
    { value: 'unknown' as UserStatus, label: '❓ Not sure', subtitle: "I'll check both" }
  ]

  const trimesterOptions = [
    { value: 'first' as Trimester, label: '1st Trimester (1–12 weeks)' },
    { value: 'second' as Trimester, label: '2nd Trimester (13–26 weeks)' },
    { value: 'third' as Trimester, label: '3rd Trimester (27–36 weeks)' },
    { value: 'term' as Trimester, label: 'Term (37+ weeks)' }
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .ep-wrap {
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* Section */
        .ep-section {}

        .ep-section-title {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--color-text-secondary);
          opacity: 0.6;
          margin-bottom: 12px;
        }

        .ep-fields {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Field */
        .ep-field {}

        .ep-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-text-secondary);
          letter-spacing: 0.04em;
          margin-bottom: 5px;
          opacity: 0.8;
        }

        .ep-input, .ep-select {
          width: 100%;
          padding: 10px 13px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.845rem;
          font-weight: 500;
          color: var(--color-text-primary);
          background: rgba(0,0,0,0.02);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          box-sizing: border-box;
          appearance: none;
          -webkit-appearance: none;
        }

        [data-theme="dark"] .ep-input,
        [data-theme="dark"] .ep-select {
          background: rgba(255,255,255,0.04);
        }

        .ep-input::placeholder {
          color: var(--color-text-secondary);
          opacity: 0.4;
          font-weight: 400;
        }

        .ep-input:focus, .ep-select:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 99,102,241), 0.1);
          background: rgba(0,0,0,0.01);
        }

        .ep-select-wrap {
          position: relative;
        }

        .ep-select-wrap::after {
          content: '';
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid var(--color-text-secondary);
          opacity: 0.5;
          pointer-events: none;
        }

        /* Status radio cards */
        .ep-status-grid {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .ep-status-option {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 13px;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          background: rgba(0,0,0,0.02);
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          position: relative;
        }

        [data-theme="dark"] .ep-status-option {
          background: rgba(255,255,255,0.03);
        }

        .ep-status-option:hover {
          background: rgba(0,0,0,0.03);
          border-color: var(--color-primary);
        }

        .ep-status-option.selected {
          border-color: var(--color-primary);
          background: rgba(var(--color-primary-rgb, 99,102,241), 0.05);
          box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb, 99,102,241), 0.08);
        }

        .ep-status-option input[type="radio"] {
          display: none;
        }

        .ep-radio-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1.5px solid var(--color-border);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.18s;
        }

        .ep-status-option.selected .ep-radio-dot {
          border-color: var(--color-primary);
        }

        .ep-radio-dot::after {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-primary);
          opacity: 0;
          transition: opacity 0.18s;
        }

        .ep-status-option.selected .ep-radio-dot::after {
          opacity: 1;
        }

        .ep-status-label {
          font-size: 0.845rem;
          font-weight: 600;
          color: var(--color-text-primary);
          letter-spacing: -0.01em;
        }

        .ep-status-sub {
          font-size: 0.72rem;
          color: var(--color-text-secondary);
          margin-top: 1px;
          opacity: 0.65;
        }

        /* Divider */
        .ep-divider {
          height: 1px;
          background: var(--color-border);
          opacity: 0.6;
        }

        /* Actions */
        .ep-actions {
          display: flex;
          gap: 10px;
          padding-top: 4px;
        }

        .ep-actions > * {
          flex: 1;
        }
      `}</style>

      <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
        <div className="ep-wrap">

          {/* Personal Information */}
          <div className="ep-section">
            <div className="ep-section-title">Personal Information</div>
            <div className="ep-fields">
              <div className="ep-field">
                <label className="ep-label">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="ep-input"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="ep-field">
                <label className="ep-label">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="ep-input"
                  placeholder="+254 7__ ___ ___"
                />
              </div>
              <div className="ep-field">
                <label className="ep-label">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="ep-input"
                  placeholder="Your location"
                />
              </div>
            </div>
          </div>

          <div className="ep-divider" />

          {/* Health Status */}
          <div className="ep-section">
            <div className="ep-section-title">Health Status</div>
            <div className="ep-status-grid">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`ep-status-option ${formData.status === option.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  />
                  <div className="ep-radio-dot" />
                  <div>
                    <div className="ep-status-label">{option.label}</div>
                    <div className="ep-status-sub">{option.subtitle}</div>
                  </div>
                </label>
              ))}
            </div>

            {formData.status === 'pregnant' && (
              <div className="ep-field" style={{ marginTop: '10px' }}>
                <label className="ep-label">Trimester</label>
                <div className="ep-select-wrap">
                  <select
                    value={formData.trimester || ''}
                    onChange={(e) => handleInputChange('trimester', e.target.value)}
                    className="ep-select"
                  >
                    <option value="">Select trimester</option>
                    {trimesterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="ep-divider" />

          {/* Emergency Contacts */}
          <div className="ep-section">
            <div className="ep-section-title">Emergency Contacts</div>
            <div className="ep-fields">
              <div className="ep-field">
                <label className="ep-label">Community Health Worker Name</label>
                <input
                  type="text"
                  value={formData.chwName}
                  onChange={(e) => handleInputChange('chwName', e.target.value)}
                  className="ep-input"
                  placeholder="CHW name (optional)"
                />
              </div>
              <div className="ep-field">
                <label className="ep-label">CHW Phone Number</label>
                <input
                  type="tel"
                  value={formData.chwPhone}
                  onChange={(e) => handleInputChange('chwPhone', e.target.value)}
                  className="ep-input"
                  placeholder="CHW phone (optional)"
                />
              </div>
              <div className="ep-field">
                <label className="ep-label">Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  className="ep-input"
                  placeholder="Emergency contact name (optional)"
                />
              </div>
              <div className="ep-field">
                <label className="ep-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  className="ep-input"
                  placeholder="Emergency contact phone (optional)"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="ep-actions">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

        </div>
      </Modal>
    </>
  )
}