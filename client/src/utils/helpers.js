/**
 * Format a date string or timestamp to a readable date (e.g., 'Oct 24, 2026')
 */
export function formatDate(date) {
  if (!date) return 'No date'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid date'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format a date string to include time (e.g., 'Oct 24, 2026 at 3:45 PM')
 */
export function formatDateTime(date) {
  if (!date) return 'No date'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid date'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Relative time helper (e.g., 'Just now', '15m ago', '2h ago', '3d ago')
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const diffInSeconds = Math.floor((now - d) / 1000)

  if (diffInSeconds < 0) {
    const futureSec = Math.abs(diffInSeconds)
    if (futureSec < 60) return 'in moments'
    if (futureSec < 3600) return `in ${Math.floor(futureSec / 60)}m`
    if (futureSec < 86400) return `in ${Math.floor(futureSec / 3600)}h`
    return `in ${Math.floor(futureSec / 86400)}d`
  }

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return formatDate(date)
}

/**
 * Get remaining time before a deadline string
 */
export function getTimeRemaining(deadline) {
  if (!deadline) return null
  const target = new Date(deadline).getTime()
  if (isNaN(target)) return null
  const now = Date.now()
  const diff = target - now

  if (diff <= 0) {
    const daysAgo = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24))
    return {
      expired: true,
      label: daysAgo === 0 ? 'Due today' : `${daysAgo}d overdue`,
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) {
    return { expired: false, label: `${days}d ${hours}h left` }
  }
  return { expired: false, label: `${hours}h left` }
}

/**
 * Get user initials from name (e.g., 'Manasvi Lakkireddy' -> 'ML')
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Get consistent avatar background color based on name
 */
export function getAvatarColor(name) {
  const colors = [
    'bg-violet-600 text-white',
    'bg-indigo-600 text-white',
    'bg-blue-600 text-white',
    'bg-teal-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-fuchsia-600 text-white',
  ]
  if (!name) return colors[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

/**
 * Get tailwind classes for priority badge
 */
export function getPriorityColor(priority) {
  const p = (priority || '').toLowerCase()
  switch (p) {
    case 'high':
    case 'urgent':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        text: 'text-rose-700',
        label: 'High',
      }
    case 'medium':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        text: 'text-amber-700',
        label: 'Medium',
      }
    case 'low':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        text: 'text-slate-700',
        label: 'Low',
      }
    default:
      return {
        bg: 'bg-slate-100 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
        text: 'text-slate-600',
        label: priority || 'Normal',
      }
  }
}

/**
 * Normalize status to lowercase key
 */
export function normalizeStatus(status) {
  if (!status) return 'todo'
  const s = status.toLowerCase().replace(/[\s_-]+/g, '')
  if (s.includes('done') || s.includes('complete')) return 'done'
  if (s.includes('block')) return 'blocked'
  if (s.includes('progress') || s.includes('doing')) return 'in-progress'
  return 'todo'
}

/**
 * Get tailwind classes for status badge
 */
export function getStatusColor(status) {
  const norm = normalizeStatus(status)
  switch (norm) {
    case 'done':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500',
        text: 'text-emerald-700',
        label: 'Done',
      }
    case 'in-progress':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-100 text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500',
        text: 'text-amber-700',
        label: 'In Progress',
      }
    case 'blocked':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        badge: 'bg-rose-100 text-rose-800',
        border: 'border-rose-300',
        dot: 'bg-rose-500',
        text: 'text-rose-700',
        label: 'Blocked',
      }
    case 'todo':
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        badge: 'bg-slate-100 text-slate-800',
        border: 'border-slate-300',
        dot: 'bg-slate-400',
        text: 'text-slate-700',
        label: 'To Do',
      }
  }
}

/**
 * Checks if task is overdue (past due date and not done)
 */
export function isOverdue(dueDate, status) {
  if (!dueDate) return false
  const norm = normalizeStatus(status)
  if (norm === 'done') return false
  const due = new Date(dueDate).getTime()
  if (isNaN(due)) return false
  return due < Date.now()
}

/**
 * Copy text to clipboard utility with fallback
 */
export async function copyToClipboard(text) {
  if (!text) return false
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall back to legacy method
  }

  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch (err) {
    console.error('Failed to copy to clipboard', err)
    return false
  }
}
