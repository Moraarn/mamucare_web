import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', fullWidth = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'theme-button py-3 px-6 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
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
        color: 'var(--color-on-primary)',
        borderColor: 'transparent'
      }
    }
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${widthClasses} ${className} ${
          variant === 'outline' ? 'theme-button-outline' : 'theme-button-primary'
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
