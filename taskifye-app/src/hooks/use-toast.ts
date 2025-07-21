import { useState } from 'react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    // For now, just show an alert
    // In production, this would show a proper toast notification
    if (variant === 'destructive') {
      alert(`Error: ${title}\n${description || ''}`)
    } else {
      alert(`${title}\n${description || ''}`)
    }
  }

  return { toast }
}