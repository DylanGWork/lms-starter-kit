'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Course = { id: string; label: string }

export function ModuleForm({ courses, defaultCourseId }: { courses: Course[]; defaultCourseId?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    courseId: defaultCourseId || courses[0]?.id || '',
    sortOrder: 0,
    status: 'DRAFT',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Failed')
      else {
        router.push('/admin/content/modules?success=created')
        router.refresh()
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
      {error && (
        <div className="sm:col-span-2 rounded-lg px-4 py-3 text-sm font-jakarta bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}
      <div className="sm:col-span-2">
        <label className="form-label">Module title *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Module 1: Introduction"
          className="form-input"
        />
      </div>
      <div>
        <label className="form-label">Course *</label>
        <select
          value={form.courseId}
          onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
          className="form-input"
        >
          {courses.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="form-label">Status</label>
        <select
          value={form.status}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          className="form-input"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>
      <div className="sm:col-span-2 flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? 'Creating...' : 'Create module'}
        </button>
        <a href="/admin/content/modules" className="btn-secondary">Cancel</a>
      </div>
    </form>
  )
}
