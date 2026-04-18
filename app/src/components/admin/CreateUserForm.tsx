'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROLE_LABELS } from '@/types'
import type { Role } from '@/types'

const ROLES: Role[] = ['TECHNICIAN', 'SITE_MANAGER', 'BUSINESS_ADMIN', 'SUPER_ADMIN']

export function CreateUserForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TECHNICIAN' as Role,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create user')
      } else {
        router.push('/admin/users?success=created')
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
        <div className="sm:col-span-2 rounded-lg px-4 py-3 text-sm font-jakarta bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label className="form-label">Full name</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Jane Smith"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Email address</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="jane@example.com"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Temporary password</label>
        <input
          type="text"
          required
          minLength={8}
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          placeholder="Min 8 characters"
          className="form-input"
        />
      </div>

      <div>
        <label className="form-label">Role</label>
        <select
          value={form.role}
          onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
          className="form-input"
        >
          {ROLES.map(r => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create user'}
        </button>
        <a href="/admin/users" className="btn-secondary">Cancel</a>
      </div>
    </form>
  )
}
