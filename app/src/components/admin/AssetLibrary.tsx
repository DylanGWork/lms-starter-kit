'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, Video, File, Trash2, ExternalLink, X, Cpu } from 'lucide-react'
import { formatFileSize, formatDate } from '@/lib/utils'
import type { ContentStatus } from '@/types'

type Asset = {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  type: string
  locale: string
  variantKind: string
  title: string | null
  description: string | null
  product: string | null
  status: string
  createdAt: Date
  sourceAsset: { id: string; title: string | null; originalName: string } | null
  tags: { tag: { name: string } }[]
}

export function AssetLibrary({ assets: initialAssets }: { assets: Asset[] }) {
  const [assets, setAssets] = useState(initialAssets)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  // Metadata form for upload
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [meta, setMeta] = useState({
    title: '',
    description: '',
    product: '',
    locale: 'en',
    variantKind: 'BASE',
    sourceAssetId: '',
  })

  const onDrop = useCallback((accepted: File[]) => {
    setPendingFiles(accepted)
    setUploadError('')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.webm'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 5,
    maxSize: 500 * 1024 * 1024,
  })

  async function uploadFiles() {
    if (pendingFiles.length === 0) return
    setUploading(true)
    setUploadError('')

    const uploaded: Asset[] = []
    for (const file of pendingFiles) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        if (meta.title) fd.append('title', meta.title)
        if (meta.description) fd.append('description', meta.description)
        if (meta.product) fd.append('product', meta.product)
        if (meta.locale) fd.append('locale', meta.locale)
        if (meta.variantKind) fd.append('variantKind', meta.variantKind)
        if (meta.sourceAssetId) fd.append('sourceAssetId', meta.sourceAssetId)

        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) uploaded.push(data.asset)
        else setUploadError(data.error || 'Upload failed')
      } catch {
        setUploadError('Upload failed')
      }
    }

    setAssets(prev => [...uploaded, ...prev])
    setPendingFiles([])
    setMeta({ title: '', description: '', product: '', locale: 'en', variantKind: 'BASE', sourceAssetId: '' })
    setUploading(false)
  }

  async function deleteAsset(id: string) {
    if (!confirm('Delete this asset? It will be removed from any lessons it is attached to.')) return
    const res = await fetch(`/api/admin/assets/${id}`, { method: 'DELETE' })
    if (res.ok) setAssets(prev => prev.filter(a => a.id !== id))
  }

  const filtered = assets.filter(a => {
    const matchText = !filter || a.title?.toLowerCase().includes(filter.toLowerCase()) || a.originalName.toLowerCase().includes(filter.toLowerCase())
    const matchType = !typeFilter || a.type === typeFilter
    return matchText && matchType
  })

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="card p-5">
        <h2 className="font-jakarta font-semibold text-gray-800 mb-4">Upload files</h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="font-jakarta font-medium text-gray-700">
            {isDragActive ? 'Drop files here' : 'Drag & drop or click to select'}
          </p>
          <p className="text-xs text-gray-400 font-jakarta mt-1">
            Videos (MP4/MOV), Images (JPG/PNG), PDFs, Documents · Up to 500MB per file
          </p>
        </div>

        {pendingFiles.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {pendingFiles.map(f => (
                <span key={f.name} className="badge bg-blue-50 text-blue-700 text-xs">
                  {f.name} ({formatFileSize(f.size)})
                </span>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="form-label">Title (optional)</label>
                <input
                  type="text"
                  value={meta.title}
                  onChange={e => setMeta(m => ({ ...m, title: e.target.value }))}
                  placeholder="Descriptive title"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Product (optional)</label>
                <input
                  type="text"
                  value={meta.product}
                  onChange={e => setMeta(m => ({ ...m, product: e.target.value }))}
                  placeholder="e.g. Device 1, Gateway"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Description (optional)</label>
                <input
                  type="text"
                  value={meta.description}
                  onChange={e => setMeta(m => ({ ...m, description: e.target.value }))}
                  placeholder="Short description"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Locale</label>
                <select
                  value={meta.locale}
                  onChange={e => setMeta(m => ({ ...m, locale: e.target.value }))}
                  className="form-input"
                >
                  <option value="en">English canonical</option>
                  <option value="fr">French variant</option>
                  <option value="es">Spanish variant</option>
                  <option value="de">German variant</option>
                </select>
              </div>
              <div>
                <label className="form-label">Variant kind</label>
                <select
                  value={meta.variantKind}
                  onChange={e => setMeta(m => ({ ...m, variantKind: e.target.value }))}
                  className="form-input"
                >
                  <option value="BASE">Base asset</option>
                  <option value="LOCALIZED_IMAGE">Localized image</option>
                  <option value="SUBTITLE_TRACK">Subtitle track</option>
                  <option value="DUBBED_VIDEO">Dubbed video</option>
                  <option value="AUDIO_TRACK">Audio track</option>
                  <option value="TRANSCRIPT">Transcript</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Source asset (for variants)</label>
                <select
                  value={meta.sourceAssetId}
                  onChange={e => setMeta(m => ({ ...m, sourceAssetId: e.target.value }))}
                  className="form-input"
                >
                  <option value="">No source asset</option>
                  {assets
                    .filter(asset => asset.locale === 'en')
                    .map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.title || asset.originalName}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="btn-primary disabled:opacity-60"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : `Upload ${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''}`}
              </button>
              <button onClick={() => setPendingFiles([])} className="btn-secondary">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-3 text-sm font-jakarta text-red-600 bg-red-50 rounded-lg px-3 py-2">{uploadError}</div>
        )}
      </div>

      {/* Library */}
      <div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <input
            type="search"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search assets..."
            className="form-input max-w-xs"
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="form-input max-w-xs"
          >
            <option value="">All types</option>
            <option value="VIDEO">Videos</option>
            <option value="IMAGE">Images</option>
            <option value="PDF">PDFs</option>
            <option value="DOCUMENT">Documents</option>
            <option value="SUBTITLE">Subtitles</option>
            <option value="AUDIO">Audio</option>
          </select>
          <span className="text-sm text-gray-500 font-jakarta">{filtered.length} asset{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">File</th>
                <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Size</th>
                <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Uploaded</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
                        {asset.type === 'VIDEO' && <Video className="w-4 h-4 text-blue-500" />}
                        {asset.type === 'IMAGE' && <Image className="w-4 h-4 text-green-500" />}
                        {asset.type === 'PDF' && <FileText className="w-4 h-4 text-red-500" />}
                        {!['VIDEO', 'IMAGE', 'PDF'].includes(asset.type) && <File className="w-4 h-4 text-gray-500" />}
                      </div>
                      <div>
                        <div className="font-jakarta font-medium text-gray-900">{asset.title || asset.originalName}</div>
                        {asset.title && <div className="text-xs text-gray-400 font-jakarta">{asset.originalName}</div>}
                        {asset.product && <div className="text-xs text-gray-400 font-jakarta">{asset.product}</div>}
                        <div className="text-xs text-gray-400 font-jakarta">
                          {asset.locale.toUpperCase()} · {asset.variantKind}
                          {asset.sourceAsset && ` · Source: ${asset.sourceAsset.title || asset.sourceAsset.originalName}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="badge bg-gray-100 text-gray-600 text-xs">{asset.type}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-500 font-jakarta">{formatFileSize(asset.size)}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-gray-400 font-jakarta">{formatDate(asset.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {asset.type === 'VIDEO' && (
                        <Link
                          href={`/admin/content/assets/${asset.id}`}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                          title="Review video & extract frames"
                        >
                          <Cpu className="w-4 h-4" />
                        </Link>
                      )}
                      <a href={asset.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={() => deleteAsset(asset.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 font-jakarta">
                    No assets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
