import { Mic } from 'lucide-react'

interface MicButtonProps {
  isRecording: boolean
  onClick: () => void
}

export default function MicButton({ isRecording, onClick }: MicButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
        isRecording ? 'animate-pulse-ring' : 'hover:opacity-90'
      }`}
      style={{
        backgroundColor: isRecording 
          ? 'var(--color-danger)' 
          : 'var(--color-primary)'
      }}
    >
      <Mic size={16} className="text-white" />
    </button>
  )
}
