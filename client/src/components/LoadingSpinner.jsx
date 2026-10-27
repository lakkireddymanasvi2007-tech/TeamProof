import React from 'react'

export default function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  fullScreen = false,
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size] || 'w-8 h-8 border-3'

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses} border-violet-200 border-t-violet-600 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      />
      {message && (
        <p className="text-sm font-medium text-slate-500 animate-pulse">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
          {content}
        </div>
      </div>
    )
  }

  return content
}
