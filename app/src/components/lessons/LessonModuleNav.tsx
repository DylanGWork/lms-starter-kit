'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useLocale } from '@/components/i18n/LocaleProvider'
import { withLocalePrefix } from '@/lib/i18n/paths'

interface Lesson {
  id: string
  title: string
}

interface LessonModuleNavProps {
  currentLessonId: string
  moduleTitle: string
  lessons: Lesson[]
}

export function LessonModuleNav({ currentLessonId, moduleTitle, lessons }: LessonModuleNavProps) {
  const currentIdx = lessons.findIndex(l => l.id === currentLessonId)
  const [expanded, setExpanded] = useState(false)
  const { locale, messages } = useLocale()

  return (
    <div className="card overflow-hidden">
      {/* Header — always visible, acts as toggle on mobile */}
      <button
        className="w-full px-4 py-3 border-b border-gray-100 flex items-center justify-between text-left lg:cursor-default"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div>
          <div className="text-xs font-jakarta text-gray-400 mb-0.5">{messages.learn.module}</div>
          <div className="text-sm font-jakarta font-semibold text-gray-800">{moduleTitle}</div>
          <div className="text-xs font-jakarta text-gray-400 mt-0.5 lg:hidden">
            {messages.search.lesson} {currentIdx + 1} / {lessons.length}
          </div>
        </div>
        <span className="lg:hidden text-gray-400 ml-2 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Lesson list — always visible on lg, toggled on mobile */}
      <div className={`divide-y divide-gray-50 overflow-y-auto lg:max-h-80 ${expanded ? 'block' : 'hidden lg:block'}`}>
        {lessons.map((l, idx) => (
          <Link
            key={l.id}
            href={withLocalePrefix(locale, `/lessons/${l.id}`)}
            className={`flex items-start gap-2 px-4 py-3 text-sm font-jakarta transition-colors hover:bg-gray-50 ${l.id === currentLessonId ? 'bg-green-50' : ''}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold ${l.id === currentLessonId ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {idx + 1}
            </span>
            <span className={l.id === currentLessonId ? 'text-green-800 font-medium' : 'text-gray-600'}>
              {l.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
