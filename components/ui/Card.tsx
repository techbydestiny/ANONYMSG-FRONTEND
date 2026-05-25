// components/ui/Card.tsx
import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'dark'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-dark-400/50 backdrop-blur-sm border border-dark-100 rounded-2xl',
      glass: 'glass rounded-2xl',
      dark: 'bg-dark-300 border border-dark-100 rounded-2xl',
    }
    
    return (
      <div
        className={cn(variants[variant], 'p-6', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'