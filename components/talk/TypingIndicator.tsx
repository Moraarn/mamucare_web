export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="min-w-0 max-w-[85%] sm:max-w-[75%] break-words">
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
        <div 
          className="border rounded-2xl rounded-tl-sm px-4 py-3"
          style={{
            backgroundColor: 'var(--color-green-light)',
            borderColor: 'var(--color-green-dark)'
          }}
        >
          <div className="flex gap-1">
            <div 
              className="w-2 h-2 rounded-full animate-typing-dot" 
              style={{ backgroundColor: 'var(--color-green-dark)' }}
            />
            <div 
              className="w-2 h-2 rounded-full animate-typing-dot" 
              style={{ 
                backgroundColor: 'var(--color-green-dark)',
                animationDelay: '0.2s'
              }} 
            />
            <div 
              className="w-2 h-2 rounded-full animate-typing-dot" 
              style={{ 
                backgroundColor: 'var(--color-green-dark)',
                animationDelay: '0.4s'
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
