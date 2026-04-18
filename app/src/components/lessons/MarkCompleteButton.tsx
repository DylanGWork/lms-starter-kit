'use client'

import { useState, useTransition } from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/components/i18n/LocaleProvider'

export function MarkCompleteButton({
  lessonId,
  isCompleted: initialCompleted,
}: {
  lessonId: string
  isCompleted: boolean
}) {
  const router = useRouter()
  const [completed, setCompleted] = useState(initialCompleted)
  const [isPending, startTransition] = useTransition()
  const { messages } = useLocale()

  async function toggle() {
    const newState = !completed
    setCompleted(newState)

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: newState }),
      })
      if (!res.ok) setCompleted(!newState) // revert on error
      else startTransition(() => router.refresh())
    } catch {
      setCompleted(!newState)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-jakarta font-semibold text-gray-900 text-sm mb-0.5">
          {completed ? messages.lesson.completedLessonTitle : messages.lesson.markCompleteTitle}
        </div>
        <div className="text-xs text-gray-500 font-jakarta">
          {completed ? messages.lesson.completedLessonCopy : messages.lesson.markCompleteCopy}
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-jakarta font-semibold transition-all disabled:opacity-60"
        style={completed
          ? { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }
          : { backgroundColor: '#002400', color: '#61ce70', border: '1px solid #61ce70' }
        }
      >
        {completed
          ? <><CheckCircle className="w-4 h-4" /> {messages.lesson.completed}</>
          : <><Circle className="w-4 h-4" /> {messages.lesson.markCompleteButton}</>
        }
      </button>
    </div>
  )
}
