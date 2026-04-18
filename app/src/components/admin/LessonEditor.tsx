'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Trash2, Plus, X } from 'lucide-react'
import { slugify } from '@/lib/utils'

type Asset = { id: string; title: string | null; originalName: string; type: string; url: string; size: number }
type Module = { id: string; title: string }

interface LessonFormData {
  id?: string
  title: string
  slug: string
  summary: string
  content: string
  videoUrl: string
  videoProvider: string
  status: string
  version: string
  moduleId: string
  sortOrder: number
  assetIds: string[]
  tagNames: string[]
}

export function LessonEditor({
  lesson,
  modules,
  availableAssets,
}: {
  lesson: LessonFormData | null
  modules: Module[]
  availableAssets: Asset[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')

  const [form, setForm] = useState<LessonFormData>({
    title: lesson?.title || '',
    slug: lesson?.slug || '',
    summary: lesson?.summary || '',
    content: lesson?.content || '',
    videoUrl: lesson?.videoUrl || '',
    videoProvider: lesson?.videoProvider || 'youtube',
    status: lesson?.status || 'DRAFT',
    version: lesson?.version || '1.0',
    moduleId: lesson?.moduleId || (modules[0]?.id || ''),
    sortOrder: lesson?.sortOrder ?? 0,
    assetIds: lesson?.assetIds || [],
    tagNames: lesson?.tagNames || [],
  })

  function setField<K extends keyof LessonFormData>(key: K, value: LessonFormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function onTitleChange(title: string) {
    setForm(f => ({
      ...f,
      title,
      slug: lesson?.id ? f.slug : slugify(title),
    }))
  }

  function toggleAsset(assetId: string) {
    setField('assetIds', form.assetIds.includes(assetId)
      ? form.assetIds.filter(id => id !== assetId)
      : [...form.assetIds, assetId])
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !form.tagNames.includes(tag)) {
      setField('tagNames', [...form.tagNames, tag])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setField('tagNames', form.tagNames.filter(t => t !== tag))
  }

  async function save(status?: string) {
    setError('')
    setLoading(true)
    const payload = { ...form, ...(status ? { status } : {}) }

    try {
      const url = lesson?.id ? `/api/admin/lessons/${lesson.id}` : '/api/admin/lessons'
      const method = lesson?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save')
      } else {
        router.push(`/admin/content/lessons/${data.lesson.id}`)
        router.refresh()
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm font-jakarta bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      {/* Basic info */}
      <div className="card p-5 space-y-4">
        <h2 className="font-jakarta font-semibold text-gray-800">Basic information</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="e.g. What the Gateway Does"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Slug (URL-safe ID)</label>
            <input
              type="text"
              value={form.slug}
              onChange={e => setField('slug', e.target.value)}
              className="form-input font-mono text-xs"
            />
          </div>

          <div>
            <label className="form-label">Module *</label>
            <select
              value={form.moduleId}
              onChange={e => setField('moduleId', e.target.value)}
              className="form-input"
            >
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="form-label">Summary (shown in listings)</label>
            <textarea
              rows={2}
              value={form.summary}
              onChange={e => setField('summary', e.target.value)}
              placeholder="One or two sentences about what this lesson covers"
              className="form-input resize-none"
            />
          </div>
        </div>
      </div>

      {/* Video */}
      <div className="card p-5 space-y-4">
        <h2 className="font-jakarta font-semibold text-gray-800">Video (optional)</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Provider</label>
            <select
              value={form.videoProvider}
              onChange={e => setField('videoProvider', e.target.value)}
              className="form-input"
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="local">Uploaded file</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Video URL or file path</label>
            <input
              type="text"
              value={form.videoUrl}
              onChange={e => setField('videoUrl', e.target.value)}
              placeholder={form.videoProvider === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://...'}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card p-5 space-y-4">
        <h2 className="font-jakarta font-semibold text-gray-800">Written content</h2>
        <p className="text-xs text-gray-500 font-jakarta">HTML content. Use headings, lists, tables, and bold text. Full rich editor coming soon.</p>
        <textarea
          rows={16}
          value={form.content}
          onChange={e => setField('content', e.target.value)}
          placeholder="<h2>Section heading</h2><p>Your content here...</p>"
          className="form-input font-mono text-xs resize-y"
        />
      </div>

      {/* Assets */}
      <div className="card p-5 space-y-4">
        <h2 className="font-jakarta font-semibold text-gray-800">Attach assets</h2>
        <p className="text-xs text-gray-500 font-jakarta">Select from published assets in the library.</p>
        <div className="grid sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {availableAssets.map(asset => (
            <label key={asset.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={form.assetIds.includes(asset.id)}
                onChange={() => toggleAsset(asset.id)}
                className="rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-jakarta text-gray-800 truncate">{asset.title || asset.originalName}</div>
                <div className="text-xs text-gray-400 font-jakarta">{asset.type}</div>
              </div>
            </label>
          ))}
          {availableAssets.length === 0 && (
            <p className="text-sm text-gray-400 font-jakarta">No published assets yet. Upload assets first.</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="card p-5 space-y-4">
        <h2 className="font-jakarta font-semibold text-gray-800">Tags</h2>
        <div className="flex gap-2 flex-wrap mb-2">
          {form.tagNames.map(tag => (
            <span key={tag} className="flex items-center gap-1 badge bg-gray-100 text-gray-700">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500 ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add tag and press Enter"
            className="form-input flex-1"
          />
          <button onClick={addTag} className="btn-secondary">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="card p-5">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Status</label>
            <select
              value={form.status}
              onChange={e => setField('status', e.target.value)}
              className="form-input"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="form-label">Version</label>
            <input
              type="text"
              value={form.version}
              onChange={e => setField('version', e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Sort order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => setField('sortOrder', parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-8">
        <button
          onClick={() => save()}
          disabled={loading || !form.title || !form.moduleId}
          className="btn-primary disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save'}
        </button>
        {form.status === 'DRAFT' && (
          <button
            onClick={() => save('PUBLISHED')}
            disabled={loading || !form.title || !form.moduleId}
            className="btn-secondary disabled:opacity-60"
            style={{ color: '#018902', borderColor: '#018902' }}
          >
            Save & Publish
          </button>
        )}
        {lesson?.id && (
          <a href={`/lessons/${lesson.id}`} className="btn-secondary flex items-center gap-2" target="_blank" rel="noreferrer">
            <Eye className="w-4 h-4" />
            Preview
          </a>
        )}
        <a href="/admin/content/lessons" className="btn-secondary">Cancel</a>
      </div>
    </div>
  )
}
