'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search } from 'lucide-react'
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js/max'
import 'react-phone-input-2/lib/style.css'

const names = new Intl.DisplayNames(['en'], { type: 'region' })
const countries = getCountries().sort((a, b) => (names.of(a) || a).localeCompare(names.of(b) || b))

function Flag({ country }: { country: CountryCode }) {
  return <span className="react-tel-input shrink-0" aria-hidden="true" style={{ width: 16, height: 11 }}><span className={`flag ${country.toLowerCase()}`} style={{ display: 'block' }} /></span>
}

export default function CountrySelect({ country, onChange, label }: { country: CountryCode; onChange: (country: CountryCode) => void; label: string }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState({ top: 0, left: 0, width: 320, maxHeight: 320 })
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const filtered = countries.filter(code => `${names.of(code)} ${code} +${getCountryCallingCode(code)}`.toLowerCase().includes(query.trim().toLowerCase()))

  const close = (restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) trigger.current?.focus()
  }

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const rect = trigger.current?.getBoundingClientRect()
      if (!rect) return
      const viewport = window.visualViewport
      const height = viewport?.height ?? window.innerHeight
      const offset = viewport?.offsetTop ?? 0
      const width = Math.min(340, window.innerWidth - 24)
      const below = height + offset - rect.bottom - 12
      const above = rect.top - offset - 12
      const useBelow = below >= 240 || below >= above
      const maxHeight = Math.max(100, Math.min(340, useBelow ? below : above))
      setPosition({ top: useBelow ? rect.bottom + 6 : Math.max(offset + 6, rect.top - maxHeight - 6), left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), width, maxHeight })
    }
    place()
    const onScroll = (event: Event) => { if (!panel.current?.contains(event.target as Node)) place() }
    window.addEventListener('resize', place)
    window.addEventListener('scroll', onScroll, true)
    window.visualViewport?.addEventListener('resize', place)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onScroll, true)
      window.visualViewport?.removeEventListener('resize', place)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    search.current?.focus({ preventScroll: true })
    const outside = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  return (
    <>
      <button ref={trigger} type="button" aria-label={`${label} country: ${names.of(country)} +${getCountryCallingCode(country)}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined}
        onClick={() => { setQuery(''); setOpen(!open) }}
        className="flex shrink-0 items-center gap-2 rounded-l-xl border-r px-3">
        <Flag country={country} /><span className="text-sm">+{getCountryCallingCode(country)}</span><ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && createPortal(
        <div ref={panel} id={id} role="dialog" aria-label={`Choose ${label.toLowerCase()} country`}
          className="fixed z-[100] flex flex-col overflow-hidden rounded-xl border shadow-xl"
          style={{ ...position, background: 'var(--color-background)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border)' }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node) && event.relatedTarget !== trigger.current) close() }}
          onKeyDown={event => {
            if (event.key === 'Escape') { event.preventDefault(); close(true) }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              const buttons = Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('[data-country]') ?? [])
              const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
              const next = index + (event.key === 'ArrowDown' ? 1 : -1)
              if (next < 0) search.current?.focus()
              else buttons[Math.min(next, buttons.length - 1)]?.focus()
            }
          }}>
          <div className="flex shrink-0 items-center gap-2 border-b p-3">
            <Search size={18} aria-hidden="true" className="shrink-0 text-[var(--color-text-secondary)]" />
            <input ref={search} type="search" aria-label="Search countries" placeholder="Search country or calling code" value={query} onChange={event => setQuery(event.target.value)} className="min-w-0 w-full bg-transparent py-1 text-sm outline-none" />
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-contain p-1">
            {filtered.map(code => (
              <button key={code} data-country={code} type="button" aria-pressed={code === country} onClick={() => { onChange(code); close(true) }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[var(--color-surface)] focus:bg-[var(--color-surface)]">
                <Flag country={code} /><span className="min-w-0 flex-1">{names.of(code)}</span><span className="text-[var(--color-text-secondary)]">+{getCountryCallingCode(code)}</span>
                {code === country && <Check size={15} aria-label="Selected" className="text-[var(--color-primary)]" />}
              </button>
            ))}
            {filtered.length === 0 && <p role="status" className="p-4 text-sm text-[var(--color-text-secondary)]">No countries found.</p>}
          </div>
        </div>, document.body
      )}
    </>
  )
}
