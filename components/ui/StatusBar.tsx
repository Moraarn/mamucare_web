import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StatusBarProps {
  title: string
  showBack?: boolean
  rightContent?: string
  color?: 'primary' | 'danger' | 'warning'
}

export default function StatusBar({ 
  title, 
  showBack = false, 
  rightContent,
  color = 'primary' 
}: StatusBarProps) {
  const router = useRouter()
  
  const getBackgroundColor = () => {
    switch (color) {
      case 'danger':
        return 'var(--color-danger)'
      case 'warning':
        return 'var(--color-warning)'
      default:
        return 'var(--color-primary)'
    }
  }
  
  return (
    <div 
      className="status-bar"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      {showBack && (
        <button 
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <div className="flex-1 text-left">
        <h1 className="text-white font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="text-white text-sm font-medium shrink-0">
        {rightContent}
      </div>
    </div>
  )
}
