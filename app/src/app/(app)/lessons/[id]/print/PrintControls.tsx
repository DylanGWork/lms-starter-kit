'use client'

import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function PrintControls({
  lessonTitle,
  lessonHref,
  backLabel,
  printLabel,
}: {
  lessonTitle: string
  lessonHref: string
  backLabel: string
  printLabel: string
}) {
  return (
    <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
      <Link
        href={lessonHref}
        className="flex items-center gap-1.5 text-sm font-jakarta text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>
      <span className="text-gray-300">·</span>
      <span className="text-sm font-jakarta text-gray-700 font-medium truncate flex-1">{lessonTitle}</span>
      <button
        onClick={() => window.print()}
        className="btn-primary ml-auto"
      >
        <Printer className="w-4 h-4" />
        {printLabel}
      </button>
    </div>
  )
}
