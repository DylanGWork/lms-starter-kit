'use client'

import { useTransition } from 'react'
import { CheckSquare, Square, Loader2 } from 'lucide-react'
import { toggleRequirement } from './actions'

interface Props {
  courseId: string
  role: string
  isRequired: boolean
  notes: string
}

export function RequirementToggle({ courseId, role, isRequired, notes }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(() => {
      toggleRequirement(courseId, role, !isRequired, notes)
    })
  }

  if (isPending) return <Loader2 className="w-4 h-4 text-gray-400 animate-spin mx-auto" />

  return (
    <button
      onClick={handleClick}
      className="mx-auto flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
      title={isRequired ? `Remove requirement for ${role}` : `Mark as required for ${role}`}
    >
      {isRequired
        ? <CheckSquare className="w-5 h-5 text-green-600" />
        : <Square className="w-5 h-5 text-gray-300 hover:text-gray-500" />
      }
    </button>
  )
}
