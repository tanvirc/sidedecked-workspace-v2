/**
 * React Component Template (Storefront)
 * Usage: Replace {{ComponentName}}, {{componentName}}, and implement your component logic
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Component Props Interface
interface {{ComponentName}}Props {
  // Required props
  id: string
  title: string
  
  // Optional props
  description?: string
  className?: string
  variant?: 'default' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  
  // Event handlers
  onClick?: () => void
  onSubmit?: (data: any) => void
  onChange?: (value: any) => void
  
  // Children
  children?: React.ReactNode
}

// Internal state interface
interface {{ComponentName}}State {
  isOpen: boolean
  selectedValue: string | null
  error: string | null
  data: any[]
}

// Main component
export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  id,
  title,
  description,
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  onSubmit,
  onChange,
  children,
}) => {
  // State management
  const [state, setState] = useState<{{ComponentName}}State>({
    isOpen: false,
    selectedValue: null,
    error: null,
    data: [],
  })

  // Destructure state for easier access
  const { isOpen, selectedValue, error, data } = state

  // Update state helper
  const updateState = useCallback((updates: Partial<{{ComponentName}}State>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Effects
  useEffect(() => {
    // Component initialization logic
    console.log('{{ComponentName}} mounted with id:', id)
    
    // Cleanup function
    return () => {
      console.log('{{ComponentName}} unmounting')
    }
  }, [id])

  // Effect for handling prop changes
  useEffect(() => {
    if (disabled) {
      updateState({ isOpen: false })
    }
  }, [disabled, updateState])

  // Event handlers
  const handleClick = useCallback(() => {
    if (disabled || loading) return
    
    onClick?.()
    updateState({ isOpen: !isOpen })
  }, [disabled, loading, onClick, isOpen, updateState])

  const handleChange = useCallback((value: any) => {
    updateState({ selectedValue: value, error: null })
    onChange?.(value)
  }, [onChange, updateState])

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault()
    
    if (disabled || loading) return
    
    try {
      // Validation logic
      if (!selectedValue) {
        updateState({ error: 'Please select a value' })
        return
      }
      
      // Submit logic
      onSubmit?.(selectedValue)
      updateState({ error: null })
    } catch (err) {
      updateState({ error: 'An error occurred' })
    }
  }, [disabled, loading, selectedValue, onSubmit, updateState])

  // Derived values
  const isInteractive = !disabled && !loading
  const hasError = Boolean(error)

  // CSS classes
  const containerClasses = cn(
    // Base styles
    "{{componentName}} relative inline-flex items-center justify-center",
    "rounded-lg border transition-all duration-200",
    
    // Variant styles
    {
      'bg-white border-gray-200 text-gray-900': variant === 'default',
      'bg-blue-600 border-blue-600 text-white': variant === 'primary',
      'bg-gray-100 border-gray-300 text-gray-700': variant === 'secondary',
    },
    
    // Size styles
    {
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    },
    
    // State styles
    {
      'opacity-50 cursor-not-allowed': disabled,
      'cursor-pointer hover:opacity-80': isInteractive,
      'border-red-500': hasError,
    },
    
    // Custom className
    className
  )

  // Loading component
  if (loading) {
    return (
      <div className={containerClasses}>
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className={cn(containerClasses, "border-red-500 bg-red-50")}>
        <div className="flex items-center gap-2 text-red-600">
          <span className="text-sm">⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className={containerClasses} onClick={handleClick}>
      {/* Header */}
      <div className="{{componentName}}__header">
        <h3 className="font-semibold">{title}</h3>
        {description && (
          <p className="text-sm opacity-70">{description}</p>
        )}
      </div>

      {/* Content */}
      <div className="{{componentName}}__content">
        {children}
      </div>

      {/* Interactive elements */}
      {isOpen && (
        <div className="{{componentName}}__dropdown absolute top-full left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
          <form onSubmit={handleSubmit} className="p-4">
            <input
              type="text"
              value={selectedValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter value..."
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isInteractive}
            />
            
            <div className="flex gap-2 mt-3">
              <button
                type="submit"
                disabled={!isInteractive}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => updateState({ isOpen: false })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// Default export
export default {{ComponentName}}

// Additional component variants
export const {{ComponentName}}Card: React.FC<{{ComponentName}}Props> = (props) => {
  return (
    <div className="{{componentName}}-card p-6 bg-white rounded-lg shadow-md">
      <{{ComponentName}} {...props} />
    </div>
  )
}

export const {{ComponentName}}List: React.FC<{
  items: Array<{{ComponentName}}Props>
  onItemClick?: (item: {{ComponentName}}Props) => void
}> = ({ items, onItemClick }) => {
  return (
    <div className="{{componentName}}-list space-y-4">
      {items.map((item) => (
        <{{ComponentName}}
          key={item.id}
          {...item}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  )
}

// Utility hooks for this component
export const use{{ComponentName}} = (initialState?: Partial<{{ComponentName}}State>) => {
  const [state, setState] = useState<{{ComponentName}}State>({
    isOpen: false,
    selectedValue: null,
    error: null,
    data: [],
    ...initialState,
  })

  const updateState = useCallback((updates: Partial<{{ComponentName}}State>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const reset = useCallback(() => {
    setState({
      isOpen: false,
      selectedValue: null,
      error: null,
      data: [],
    })
  }, [])

  return {
    state,
    updateState,
    reset,
  }
}

// TypeScript prop types for external use
export type { {{ComponentName}}Props, {{ComponentName}}State }