import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', fullWidth = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'py-3 px-6 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    const widthClasses = fullWidth ? 'w-full' : ''
    
    const getButtonStyles = () => {
      if (variant === 'outline') {
        return {
          backgroundColor: 'transparent',
          borderColor: 'var(--color-primary)',
          color: 'var(--color-primary)',
          borderWidth: '1px',
          borderStyle: 'solid'
        }
      }
      return {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        borderColor: 'transparent'
      }
    }
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${widthClasses} ${className} ${
          variant === 'outline' ? 'hover:bg-opacity-10' : 'hover:opacity-90'
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`}
        style={getButtonStyles()}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
