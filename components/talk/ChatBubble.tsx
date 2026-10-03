interface ChatBubbleProps {
  message: string
  isUser: boolean
  timestamp?: string
  showAvatar?: boolean
}

export default function ChatBubble({ 
  message, 
  isUser, 
  timestamp, 
  showAvatar = true 
}: ChatBubbleProps) {
  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="min-w-0 max-w-[85%] sm:max-w-[75%] break-words">
          <div 
            className="rounded-2xl rounded-tr-sm px-4 py-3"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white'
            }}
          >
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
          {timestamp && (
            <p 
              className="text-xs mt-1 text-right"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {timestamp}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="min-w-0 max-w-[85%] sm:max-w-[75%] break-words">
        {showAvatar && (
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span 
              className="text-xs font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              CystaNiva AI
            </span>
          </div>
        )}
        <div 
          className="border rounded-2xl rounded-tl-sm px-4 py-3"
          style={{
            backgroundColor: 'var(--color-green-light)',
            borderColor: 'var(--color-green-dark)'
          }}
        >
          <p 
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-green-dark)' }}
          >
            {message}
          </p>
        </div>
        {timestamp && (
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}
