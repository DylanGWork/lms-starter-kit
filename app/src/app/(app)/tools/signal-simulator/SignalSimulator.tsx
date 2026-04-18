'use client'

import { useRef, useEffect, useState } from 'react'
import {
  Trash2,
  RotateCcw,
  Info,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronUp,
  Trees,
  Waves,
  Shield,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

interface Point { x: number; y: number }

type SegmentMaterial = 'glass' | 'wood' | 'brick' | 'double_brick' | 'concrete' | 'reinforced' | 'metal'
type ObstacleMaterial = SegmentMaterial | 'vegetation'

interface Wall {
  id: number
  start: Point
  end: Point
  material: SegmentMaterial
}

interface TreeCluster {
  id: number
  pos: Point
  radius: number
  material: 'vegetation'
}

interface Device {
  id: number
  pos: Point
  label: string
}

type Tool = 'gateway' | 'device' | ObstacleMaterial | 'erase'

type DragTarget =
  | { type: 'gateway' }
  | { type: 'device'; id: number }
  | { type: 'tree'; id: number }
  | null

const LINK_BUDGET_DB = 155
const GRID_PX = 20
const TREE_CLUSTER_RADIUS = 24

const WALL_LOSS: Record<ObstacleMaterial, number> = {
  glass: 2,
  wood: 4,
  brick: 12,
  double_brick: 16,
  concrete: 18,
  reinforced: 22,
  metal: 28,
  vegetation: 10,
}

const WALL_COLORS: Record<ObstacleMaterial, string> = {
  glass: '#60a5fa',
  wood: '#b7791f',
  brick: '#ef4444',
  double_brick: '#b91c1c',
  concrete: '#6b7280',
  reinforced: '#374151',
  metal: '#f59e0b',
  vegetation: '#16a34a',
}

const WALL_LABELS: Record<ObstacleMaterial, string> = {
  glass: 'Glass / window (2 dB)',
  wood: 'Wood / plasterboard (4 dB)',
  brick: 'Single brick (12 dB)',
  double_brick: 'Double brick (16 dB)',
  concrete: 'Concrete floor / wall (18 dB)',
  reinforced: 'Reinforced concrete (22 dB)',
  metal: 'Metal / steel (28 dB)',
  vegetation: 'Trees / dense vegetation (10 dB)',
}

const MATERIAL_NOTES: Record<ObstacleMaterial, string> = {
  glass: 'Clear glazing or internal windows',
  wood: 'Partitions, timber, plasterboard',
  brick: 'Standard masonry wall',
  double_brick: 'Heavy masonry or cavity brick',
  concrete: 'Dense slab or concrete wall',
  reinforced: 'Concrete with embedded steel',
  metal: 'Steel barriers, cabinets, shutters',
  vegetation: 'Outdoor tree line or dense green cover',
}

const SEGMENT_WIDTHS: Record<SegmentMaterial, number> = {
  glass: 12,
  wood: 14,
  brick: 16,
  double_brick: 20,
  concrete: 18,
  reinforced: 22,
  metal: 16,
}

const SCALE_OPTIONS = [
  { label: '1m / cell (small rooms)', metersPerCell: 1 },
  { label: '2m / cell (standard)', metersPerCell: 2 },
  { label: '5m / cell (large buildings)', metersPerCell: 5 },
  { label: '10m / cell (outdoor / site)', metersPerCell: 10 },
]

const ZOOM_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2]

function fspl(distMeters: number): number {
  if (distMeters < 0.1) return 0
  return 20 * Math.log10(distMeters) + 31.67
}

function signalQuality(marginDb: number): {
  label: string
  bars: number
  color: string
  lineColor: string
  bg: string
} {
  if (marginDb > 100) return { label: 'Excellent', bars: 5, color: '#16a34a', lineColor: '#22c55e', bg: '#f0fdf4' }
  if (marginDb > 75) return { label: 'Good', bars: 4, color: '#0d9488', lineColor: '#14b8a6', bg: '#f0fdfa' }
  if (marginDb > 45) return { label: 'Marginal', bars: 3, color: '#d97706', lineColor: '#f59e0b', bg: '#fffbeb' }
  if (marginDb > 15) return { label: 'Weak', bars: 2, color: '#ea580c', lineColor: '#f97316', bg: '#fff7ed' }
  if (marginDb > 0) return { label: 'Very poor', bars: 1, color: '#dc2626', lineColor: '#ef4444', bg: '#fef2f2' }
  return { label: 'No signal', bars: 0, color: '#6b7280', lineColor: '#d1d5db', bg: '#f9fafb' }
}

function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const d1x = p2.x - p1.x
  const d1y = p2.y - p1.y
  const d2x = p4.x - p3.x
  const d2y = p4.y - p3.y
  const denom = d1x * d2y - d1y * d2x
  if (Math.abs(denom) < 1e-10) return false
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom
  const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denom
  return t > 0.001 && t < 0.999 && u > 0.001 && u < 0.999
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
}

function distancePointToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  if (dx === 0 && dy === 0) return distance(point, start)

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)))
  const closest = { x: start.x + t * dx, y: start.y + t * dy }
  return distance(point, closest)
}

function segmentIntersectsCircle(start: Point, end: Point, center: Point, radius: number): boolean {
  return distancePointToSegment(center, start, end) <= radius
}

interface LinkResult {
  distMeters: number
  fsplDb: number
  obstaclesDb: number
  totalLossDb: number
  marginDb: number
  intersectedObstacles: ObstacleMaterial[]
  quality: ReturnType<typeof signalQuality>
}

function calculateLink(
  gateway: Point,
  device: Point,
  walls: Wall[],
  trees: TreeCluster[],
  metersPerPx: number
): LinkResult {
  const distPx = distance(gateway, device)
  const distMeters = distPx * metersPerPx
  const fsplDb = fspl(distMeters)

  const intersectedWalls = walls.filter((wall) => segmentsIntersect(gateway, device, wall.start, wall.end))
  const intersectedTrees = trees.filter((tree) => segmentIntersectsCircle(gateway, device, tree.pos, tree.radius))

  const obstaclesDb =
    intersectedWalls.reduce((sum, wall) => sum + WALL_LOSS[wall.material], 0) +
    intersectedTrees.reduce((sum, tree) => sum + WALL_LOSS[tree.material], 0)

  const totalLossDb = fsplDb + obstaclesDb
  const marginDb = LINK_BUDGET_DB - totalLossDb

  return {
    distMeters,
    fsplDb,
    obstaclesDb,
    totalLossDb,
    marginDb: Math.round(marginDb * 10) / 10,
    intersectedObstacles: [
      ...intersectedWalls.map((wall) => wall.material),
      ...intersectedTrees.map((tree) => tree.material),
    ],
    quality: signalQuality(marginDb),
  }
}

function SignalBars({ bars, color }: { bars: number; color: string }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          style={{
            width: 4,
            height: 4 + bar * 2,
            backgroundColor: bar <= bars ? color : '#e5e7eb',
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  )
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawMaterialPattern(ctx: CanvasRenderingContext2D, material: SegmentMaterial, length: number, width: number) {
  const half = width / 2

  switch (material) {
    case 'glass': {
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'
      ctx.lineWidth = 1.2
      ;[-half + 3, half - 3].forEach((y) => {
        ctx.beginPath()
        ctx.moveTo(3, y)
        ctx.lineTo(length - 3, y)
        ctx.stroke()
      })

      ctx.strokeStyle = 'rgba(255,255,255,0.65)'
      ;[12, 38, 64].forEach((x) => {
        if (x >= length - 10) return
        ctx.beginPath()
        ctx.moveTo(x, -half + 3)
        ctx.lineTo(Math.min(x + 10, length - 4), half - 3)
        ctx.stroke()
      })
      break
    }

    case 'wood': {
      ctx.strokeStyle = '#8b5a2b'
      ctx.lineWidth = 1
      ;[-4, 0, 4].forEach((y) => {
        ctx.beginPath()
        ctx.moveTo(4, y)
        ctx.lineTo(length - 4, y)
        ctx.stroke()
      })

      ctx.strokeStyle = 'rgba(111, 78, 36, 0.55)'
      ;[18, 44, 70].forEach((x) => {
        if (x >= length - 6) return
        ctx.beginPath()
        ctx.moveTo(x, -3)
        ctx.quadraticCurveTo(x + 4, 0, x, 3)
        ctx.stroke()
      })
      break
    }

    case 'brick':
    case 'double_brick': {
      const brickHeight = material === 'double_brick' ? 8 : 7
      const brickLength = material === 'double_brick' ? 18 : 16
      ctx.strokeStyle = material === 'double_brick' ? '#7f1d1d' : '#b91c1c'
      ctx.lineWidth = 1

      for (let y = -half + brickHeight; y < half; y += brickHeight) {
        ctx.beginPath()
        ctx.moveTo(1, y)
        ctx.lineTo(length - 1, y)
        ctx.stroke()
      }

      let row = 0
      for (let y = -half; y < half; y += brickHeight) {
        const offset = row % 2 === 0 ? 0 : brickLength / 2
        for (let x = offset; x < length; x += brickLength) {
          ctx.beginPath()
          ctx.moveTo(x, y + 1)
          ctx.lineTo(x, Math.min(y + brickHeight - 1, half - 1))
          ctx.stroke()
        }
        row += 1
      }
      break
    }

    case 'concrete': {
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      for (let x = 10; x < length - 6; x += 14) {
        const y = x % 28 === 0 ? -3 : 4
        ctx.beginPath()
        ctx.arc(x, y, 1.2, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }

    case 'reinforced': {
      ctx.strokeStyle = '#111827'
      ctx.lineWidth = 2
      for (let x = 12; x < length - 6; x += 18) {
        ctx.beginPath()
        ctx.moveTo(x, -half + 3)
        ctx.lineTo(x, half - 3)
        ctx.stroke()
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 1
      for (let y = -half + 5; y < half; y += 8) {
        ctx.beginPath()
        ctx.moveTo(4, y)
        ctx.lineTo(length - 4, y)
        ctx.stroke()
      }
      break
    }

    case 'metal': {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'
      ctx.lineWidth = 1.2
      for (let x = -width; x < length + width; x += 10) {
        ctx.beginPath()
        ctx.moveTo(x, half - 2)
        ctx.lineTo(x + width, -half + 2)
        ctx.stroke()
      }

      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      for (let x = 12; x < length - 8; x += 24) {
        ctx.beginPath()
        ctx.arc(x, 0, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
  }
}

function drawObstacleSegment(
  ctx: CanvasRenderingContext2D,
  wall: Pick<Wall, 'start' | 'end' | 'material'>,
  options?: { preview?: boolean }
) {
  const preview = options?.preview ?? false
  const dx = wall.end.x - wall.start.x
  const dy = wall.end.y - wall.start.y
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length < 1) return

  const angle = Math.atan2(dy, dx)
  const width = SEGMENT_WIDTHS[wall.material]
  const half = width / 2

  const fills: Record<SegmentMaterial, string> = {
    glass: 'rgba(147, 197, 253, 0.28)',
    wood: '#d6a26e',
    brick: '#ef8b75',
    double_brick: '#d45757',
    concrete: '#9ca3af',
    reinforced: '#4b5563',
    metal: '#94a3b8',
  }

  ctx.save()
  ctx.translate(wall.start.x, wall.start.y)
  ctx.rotate(angle)
  ctx.globalAlpha = preview ? 0.72 : 1

  if (!preview) {
    ctx.shadowColor = 'rgba(15, 23, 42, 0.12)'
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 2
  }

  roundedRectPath(ctx, 0, -half, length, width, Math.min(8, half))
  ctx.fillStyle = fills[wall.material]
  ctx.fill()
  ctx.shadowColor = 'transparent'

  ctx.strokeStyle = WALL_COLORS[wall.material]
  ctx.lineWidth = wall.material === 'glass' ? 1.5 : 1.2
  ctx.stroke()

  drawMaterialPattern(ctx, wall.material, length, width)

  if (preview) {
    ctx.setLineDash([6, 5])
    ctx.strokeStyle = WALL_COLORS[wall.material]
    ctx.lineWidth = 1.2
    roundedRectPath(ctx, 0, -half, length, width, Math.min(8, half))
    ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.restore()
}

function drawSingleTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.fillStyle = '#8b5e34'
  ctx.fillRect(x - 2 * scale, y + 5 * scale, 4 * scale, 9 * scale)

  ctx.fillStyle = '#15803d'
  ctx.beginPath()
  ctx.arc(x, y, 8 * scale, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#22c55e'
  ctx.beginPath()
  ctx.arc(x - 6 * scale, y + 1 * scale, 5 * scale, 0, Math.PI * 2)
  ctx.arc(x + 5 * scale, y + 1 * scale, 5 * scale, 0, Math.PI * 2)
  ctx.arc(x, y - 6 * scale, 5 * scale, 0, Math.PI * 2)
  ctx.fill()
}

function drawTreeCluster(
  ctx: CanvasRenderingContext2D,
  tree: TreeCluster,
  options?: { preview?: boolean }
) {
  const preview = options?.preview ?? false

  ctx.save()
  ctx.globalAlpha = preview ? 0.7 : 1

  if (!preview) {
    ctx.fillStyle = 'rgba(34, 197, 94, 0.14)'
    ctx.beginPath()
    ctx.arc(tree.pos.x, tree.pos.y, tree.radius + 5, 0, Math.PI * 2)
    ctx.fill()
  }

  drawSingleTree(ctx, tree.pos.x - 10, tree.pos.y + 4, 0.72)
  drawSingleTree(ctx, tree.pos.x + 11, tree.pos.y + 5, 0.76)
  drawSingleTree(ctx, tree.pos.x, tree.pos.y - 8, 0.95)

  ctx.strokeStyle = preview ? WALL_COLORS.vegetation : 'rgba(34, 197, 94, 0.4)'
  ctx.lineWidth = preview ? 1.5 : 1
  if (preview) ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.arc(tree.pos.x, tree.pos.y, tree.radius, 0, Math.PI * 2)
  ctx.stroke()
  if (preview) ctx.setLineDash([])

  ctx.restore()
}

function ToolGlyph({ tool, active }: { tool: Tool | ObstacleMaterial; active?: boolean }) {
  const accent = active ? '#d1fae5' : '#61ce70'

  if (tool === 'gateway') {
    return (
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <circle cx="17" cy="17" r="12" fill="#002400" />
        <path d="M10 17a7 7 0 0 1 14 0" fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M8 18a10 10 0 0 1 20 0" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 20a5 5 0 0 1 10 0" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="17" cy="20" r="2" fill={accent} />
      </svg>
    )
  }

  if (tool === 'device') {
    return (
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <circle cx="17" cy="17" r="11" fill="#6b7280" />
        <circle cx="17" cy="17" r="4" fill="#ffffff" opacity="0.9" />
        <circle cx="17" cy="17" r="2" fill="#d1d5db" />
      </svg>
    )
  }

  if (tool === 'erase') {
    return (
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect x="6" y="8" width="22" height="18" rx="5" fill="#ffffff" stroke="#d1d5db" />
        <path d="M12 8h10l-1.5-3h-7z" fill="#e5e7eb" />
        <path d="M13 13v8M17 13v8M21 13v8" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  switch (tool) {
    case 'glass':
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="5" y="10" width="24" height="14" rx="5" fill="rgba(147,197,253,0.22)" stroke="#60a5fa" strokeWidth="1.6" />
          <line x1="9" y1="13" x2="25" y2="13" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="9" y1="21" x2="25" y2="21" stroke="#ffffff" strokeWidth="1.2" />
          <path d="M12 14l4 6M18 14l4 6" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
        </svg>
      )
    case 'wood':
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="5" y="10" width="24" height="14" rx="5" fill="#d6a26e" stroke="#b7791f" strokeWidth="1.6" />
          <path d="M8 14h18M8 17h18M8 20h18" stroke="#8b5a2b" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      )
    case 'brick':
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="5" y="9" width="24" height="16" rx="5" fill="#ef8b75" stroke="#ef4444" strokeWidth="1.6" />
          <path d="M6 15h22M6 20h22M13 9v6M21 9v6M9 15v5M17 15v5M25 15v5" stroke="#b91c1c" strokeWidth="1" />
        </svg>
      )
    case 'double_brick':
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="4" y="8" width="26" height="18" rx="6" fill="#d45757" stroke="#b91c1c" strokeWidth="1.8" />
          <path d="M5 14h24M5 20h24M12 8v6M22 8v6M8 14v6M18 14v6M28 14v6" stroke="#7f1d1d" strokeWidth="1.1" />
        </svg>
      )
    case 'concrete':
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="5" y="9" width="24" height="16" rx="5" fill="#9ca3af" stroke="#6b7280" strokeWidth="1.6" />
          <circle cx="11" cy="14" r="1.2" fill="#e5e7eb" />
          <circle cx="16" cy="18" r="1.2" fill="#e5e7eb" />
          <circle cx="22" cy="13" r="1.2" fill="#e5e7eb" />
          <circle cx="25" cy="20" r="1.2" fill="#e5e7eb" />
        </svg>
      )
    case 'reinforced':
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="5" y="8" width="24" height="18" rx="5" fill="#4b5563" stroke="#374151" strokeWidth="1.7" />
          <path d="M11 10v14M17 10v14M23 10v14" stroke="#111827" strokeWidth="1.8" />
          <path d="M7 15h20M7 20h20" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        </svg>
      )
    case 'metal':
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="5" y="9" width="24" height="16" rx="5" fill="#94a3b8" stroke="#f59e0b" strokeWidth="1.6" />
          <path d="M8 23l7-14M14 23l7-14M20 23l6-12" stroke="#ffffff" strokeWidth="1.1" opacity="0.9" />
          <circle cx="12" cy="17" r="1.3" fill="#ffffff" opacity="0.85" />
          <circle cx="22" cy="17" r="1.3" fill="#ffffff" opacity="0.85" />
        </svg>
      )
    case 'vegetation':
      return (
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <circle cx="17" cy="17" r="13" fill="rgba(34,197,94,0.12)" stroke="#16a34a" strokeWidth="1.2" />
          <path d="M11 24v-5M17 26v-7M23 24v-5" stroke="#8b5e34" strokeWidth="2" strokeLinecap="round" />
          <circle cx="11" cy="17" r="4.8" fill="#16a34a" />
          <circle cx="17" cy="14" r="6" fill="#22c55e" />
          <circle cx="23" cy="17" r="4.8" fill="#16a34a" />
        </svg>
      )
  }
}

function PlacementToolButton({
  title,
  note,
  toolValue,
  selected,
  onClick,
}: {
  title: string
  note: string
  toolValue: Tool
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border px-3 py-2.5 transition-all text-left ${
        selected ? 'shadow-sm ring-2 ring-offset-1' : 'hover:bg-gray-50'
      }`}
      style={
        selected
          ? { borderColor: '#002400', backgroundColor: '#002400', color: '#d1fae5' }
          : { borderColor: '#e5e7eb', backgroundColor: '#ffffff', color: '#111827' }
      }
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 shrink-0">
          <ToolGlyph tool={toolValue} active={selected} />
        </div>
        <div className="min-w-0">
          <div className="font-jakarta font-semibold text-sm">{title}</div>
          <div className={`text-xs mt-0.5 ${selected ? 'text-emerald-100' : 'text-gray-500'}`}>{note}</div>
        </div>
      </div>
    </button>
  )
}

function MaterialToolButton({
  material,
  selected,
  onClick,
}: {
  material: ObstacleMaterial
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border px-3 py-2.5 transition-all text-left ${
        selected ? 'shadow-sm ring-2 ring-offset-1' : 'hover:bg-gray-50'
      }`}
      style={{
        borderColor: selected ? WALL_COLORS[material] : '#e5e7eb',
        backgroundColor: selected ? `${WALL_COLORS[material]}18` : '#ffffff',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-gray-100">
          <ToolGlyph tool={material} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-jakarta font-semibold text-sm text-gray-900">{WALL_LABELS[material].split('(')[0].trim()}</div>
          <div className="text-xs mt-0.5 text-gray-500">{MATERIAL_NOTES[material]}</div>
        </div>
        <div
          className="shrink-0 rounded-full px-2 py-1 text-[11px] font-jakarta font-semibold"
          style={{ backgroundColor: `${WALL_COLORS[material]}20`, color: WALL_COLORS[material] }}
        >
          {WALL_LOSS[material]} dB
        </div>
      </div>
    </button>
  )
}

export function SignalSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 })
  const [scaleIdx, setScaleIdx] = useState(1)
  const [viewZoom, setViewZoom] = useState(1)
  const [tool, setTool] = useState<Tool>('gateway')
  const [wallMaterial, setWallMaterial] = useState<SegmentMaterial>('brick')

  const [gateway, setGateway] = useState<Point | null>(null)
  const [devices, setDevices] = useState<Device[]>([])
  const [walls, setWalls] = useState<Wall[]>([])
  const [trees, setTrees] = useState<TreeCluster[]>([])

  const [drawingWall, setDrawingWall] = useState<{ start: Point; end: Point } | null>(null)
  const [dragging, setDragging] = useState<DragTarget>(null)
  const [hovered, setHovered] = useState<Point | null>(null)
  const [nextId, setNextId] = useState(1)
  const [showTips, setShowTips] = useState(false)

  const metersPerPx = SCALE_OPTIONS[scaleIdx].metersPerCell / GRID_PX

  useEffect(() => {
    function resize() {
      if (!containerRef.current) return
      const visibleW = Math.max(480, containerRef.current.clientWidth)
      const visibleH = Math.max(340, Math.min(640, window.innerHeight - 250))
      const w = Math.max(1200, Math.round(visibleW * 1.6))
      const h = Math.max(760, Math.round(visibleH * 1.35))
      setCanvasSize({ w, h })
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h)

    const gradient = ctx.createLinearGradient(0, 0, canvasSize.w, canvasSize.h)
    gradient.addColorStop(0, '#f8fafc')
    gradient.addColorStop(1, '#f3f4f6')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h)

    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 0.5
    for (let x = 0; x < canvasSize.w; x += GRID_PX) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasSize.h)
      ctx.stroke()
    }
    for (let y = 0; y < canvasSize.h; y += GRID_PX) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasSize.w, y)
      ctx.stroke()
    }

    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px sans-serif'
    ctx.fillText(`Grid: ${SCALE_OPTIONS[scaleIdx].metersPerCell}m x ${SCALE_OPTIONS[scaleIdx].metersPerCell}m per cell`, 12, canvasSize.h - 10)

    walls.forEach((wall) => drawObstacleSegment(ctx, wall))

    if (drawingWall) {
      drawObstacleSegment(ctx, { start: drawingWall.start, end: drawingWall.end, material: wallMaterial }, { preview: true })
    }

    if (gateway) {
      devices.forEach((device) => {
        const result = calculateLink(gateway, device.pos, walls, trees, metersPerPx)
        ctx.strokeStyle = result.quality.lineColor
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 3])
        ctx.globalAlpha = 0.75
        ctx.beginPath()
        ctx.moveTo(gateway.x, gateway.y)
        ctx.lineTo(device.pos.x, device.pos.y)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      })
    }

    trees.forEach((tree) => drawTreeCluster(ctx, tree))

    if (hovered && tool === 'vegetation' && !dragging) {
      const previewPos = {
        x: Math.round(hovered.x / GRID_PX) * GRID_PX,
        y: Math.round(hovered.y / GRID_PX) * GRID_PX,
      }
      drawTreeCluster(ctx, { id: -1, pos: previewPos, radius: TREE_CLUSTER_RADIUS, material: 'vegetation' }, { preview: true })
    }

    if (gateway) {
      const r = 16
      ctx.fillStyle = '#002400'
      ctx.beginPath()
      ctx.arc(gateway.x, gateway.y, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#61ce70'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      for (const radius of [6, 10, 14]) {
        ctx.beginPath()
        ctx.arc(gateway.x, gateway.y + 2, radius, -Math.PI * 0.8, -Math.PI * 0.2)
        ctx.stroke()
      }
      ctx.fillStyle = '#61ce70'
      ctx.beginPath()
      ctx.arc(gateway.x, gateway.y + 2, 2.2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#002400'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GW', gateway.x, gateway.y + r + 12)
    }

    devices.forEach((device) => {
      const result = gateway ? calculateLink(gateway, device.pos, walls, trees, metersPerPx) : null
      const fill = result ? result.quality.color : '#6b7280'
      const ring = result ? result.quality.lineColor : '#9ca3af'

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(device.pos.x, device.pos.y, 13, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = ring
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(device.pos.x, device.pos.y, 11.5, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.arc(device.pos.x, device.pos.y, 8, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`D${device.id}`, device.pos.x, device.pos.y)
      ctx.textBaseline = 'alphabetic'
    })

    if (hovered && (tool === 'gateway' || tool === 'device')) {
      ctx.strokeStyle = '#61ce70'
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.55
      ctx.beginPath()
      ctx.moveTo(hovered.x - 12, hovered.y)
      ctx.lineTo(hovered.x + 12, hovered.y)
      ctx.moveTo(hovered.x, hovered.y - 12)
      ctx.lineTo(hovered.x, hovered.y + 12)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }, [canvasSize, scaleIdx, gateway, devices, walls, trees, drawingWall, hovered, tool, wallMaterial, metersPerPx])

  function snapToGrid(point: Point): Point {
    return {
      x: Math.round(point.x / GRID_PX) * GRID_PX,
      y: Math.round(point.y / GRID_PX) * GRID_PX,
    }
  }

  function getCanvasPoint(e: React.MouseEvent<HTMLCanvasElement>): Point {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasSize.w,
      y: ((e.clientY - rect.top) / rect.height) * canvasSize.h,
    }
  }

  function getTouchPoint(e: React.TouchEvent<HTMLCanvasElement>): Point {
    const rect = canvasRef.current!.getBoundingClientRect()
    const touch = e.touches[0] || e.changedTouches[0]
    return {
      x: ((touch.clientX - rect.left) / rect.width) * canvasSize.w,
      y: ((touch.clientY - rect.top) / rect.height) * canvasSize.h,
    }
  }

  function isNear(a: Point, b: Point, radius = 16): boolean {
    return distance(a, b) < radius
  }

  function addDevice(point: Point) {
    const id = nextId
    setNextId((current) => current + 1)
    setDevices((current) => [...current, { id, pos: point, label: `D${id}` }])
  }

  function addTree(point: Point) {
    setTrees((current) => [
      ...current,
      { id: Date.now() + current.length, pos: point, radius: TREE_CLUSTER_RADIUS, material: 'vegetation' },
    ])
  }

  function startDragIfExisting(raw: Point): boolean {
    if (gateway && isNear(raw, gateway)) {
      setDragging({ type: 'gateway' })
      return true
    }

    const hitDevice = devices.find((device) => isNear(raw, device.pos))
    if (hitDevice) {
      setDragging({ type: 'device', id: hitDevice.id })
      return true
    }

    const hitTree = trees.find((tree) => isNear(raw, tree.pos, tree.radius))
    if (hitTree) {
      setDragging({ type: 'tree', id: hitTree.id })
      return true
    }

    return false
  }

  function eraseAt(raw: Point) {
    if (gateway && isNear(raw, gateway)) {
      setGateway(null)
      return
    }

    const hitDevice = devices.find((device) => isNear(raw, device.pos))
    if (hitDevice) {
      setDevices((current) => current.filter((device) => device.id !== hitDevice.id))
      return
    }

    const hitTree = trees.find((tree) => isNear(raw, tree.pos, tree.radius))
    if (hitTree) {
      setTrees((current) => current.filter((tree) => tree.id !== hitTree.id))
      return
    }

    const hitWall = walls.find((wall) => {
      const midpoint = { x: (wall.start.x + wall.end.x) / 2, y: (wall.start.y + wall.end.y) / 2 }
      return isNear(raw, midpoint, 16)
    })

    if (hitWall) {
      setWalls((current) => current.filter((wall) => wall.id !== hitWall.id))
    }
  }

  function handlePointerDown(raw: Point) {
    const snapped = snapToGrid(raw)

    if (tool === 'erase') {
      eraseAt(raw)
      return
    }

    if (startDragIfExisting(raw)) return

    if (tool === 'gateway') {
      setGateway(snapped)
      return
    }

    if (tool === 'device') {
      addDevice(snapped)
      return
    }

    if (tool === 'vegetation') {
      addTree(snapped)
      return
    }

    setDrawingWall({ start: snapped, end: snapped })
    setWallMaterial(tool)
  }

  function handlePointerMove(raw: Point) {
    const snapped = snapToGrid(raw)
    setHovered(raw)

    if (!dragging) {
      if (drawingWall) {
        setDrawingWall((current) => (current ? { ...current, end: snapped } : null))
      }
      return
    }

    if (dragging.type === 'gateway') {
      setGateway(snapped)
      return
    }

    if (dragging.type === 'device') {
      setDevices((current) =>
        current.map((device) => (device.id === dragging.id ? { ...device, pos: snapped } : device))
      )
      return
    }

    setTrees((current) =>
      current.map((tree) => (tree.id === dragging.id ? { ...tree, pos: snapped } : tree))
    )
  }

  function handlePointerUp() {
    if (dragging) {
      setDragging(null)
      return
    }

    if (drawingWall) {
      if (distance(drawingWall.start, drawingWall.end) > 5) {
        setWalls((current) => [
          ...current,
          { id: Date.now(), start: drawingWall.start, end: drawingWall.end, material: wallMaterial },
        ])
      }
      setDrawingWall(null)
    }
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    handlePointerDown(getCanvasPoint(e))
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    handlePointerMove(getCanvasPoint(e))
  }

  function onMouseUp() {
    handlePointerUp()
  }

  function onMouseLeave() {
    setHovered(null)
    if (drawingWall) setDrawingWall(null)
    if (dragging) setDragging(null)
  }

  function onTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    handlePointerDown(getTouchPoint(e))
  }

  function onTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    handlePointerMove(getTouchPoint(e))
  }

  function onTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault()
    handlePointerUp()
  }

  const cursorStyle =
    tool === 'erase'
      ? 'crosshair'
      : dragging
        ? 'grabbing'
        : tool === 'vegetation'
          ? 'copy'
          : 'crosshair'

  const results = gateway
    ? devices.map((device) => ({
        dev: device,
        link: calculateLink(gateway, device.pos, walls, trees, metersPerPx),
      }))
    : []

  const segmentTools: SegmentMaterial[] = ['glass', 'wood', 'brick', 'double_brick', 'concrete', 'reinforced', 'metal']
  const zoomPct = Math.round(viewZoom * 100)

  function changeZoom(direction: -1 | 1) {
    const currentIndex = ZOOM_OPTIONS.findIndex((value) => value === viewZoom)
    const nextIndex = Math.max(0, Math.min(ZOOM_OPTIONS.length - 1, currentIndex + direction))
    setViewZoom(ZOOM_OPTIONS[nextIndex])
  }

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      <div className="lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-4 space-y-5">
          <div>
            <div className="text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wide mb-2">Scale</div>
            <select
              value={scaleIdx}
              onChange={(e) => setScaleIdx(Number(e.target.value))}
              className="w-full text-sm font-jakarta rounded-xl border border-gray-200 px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {SCALE_OPTIONS.map((option, index) => (
                <option key={index} value={index}>{option.label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs font-jakarta text-gray-400">
              Scale changes the RF model distance. Use view zoom below when you only want to inspect the layout visually.
            </p>
          </div>

          <div>
            <div className="text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wide mb-2">View zoom</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeZoom(-1)}
                disabled={viewZoom === ZOOM_OPTIONS[0]}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <select
                value={viewZoom}
                onChange={(e) => setViewZoom(Number(e.target.value))}
                className="flex-1 text-sm font-jakarta rounded-xl border border-gray-200 px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {ZOOM_OPTIONS.map((option) => (
                  <option key={option} value={option}>{Math.round(option * 100)}%</option>
                ))}
              </select>
              <button
                onClick={() => changeZoom(1)}
                disabled={viewZoom === ZOOM_OPTIONS[ZOOM_OPTIONS.length - 1]}
                className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-xs font-jakarta text-gray-400">
              View zoom only changes what you see on the canvas. It does not change the signal calculation.
            </p>
          </div>

          <div>
            <div className="text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wide mb-2">Place key items</div>
            <div className="space-y-2">
              <PlacementToolButton
                title="Gateway"
                note="Drop the site gateway first"
                toolValue="gateway"
                selected={tool === 'gateway'}
                onClick={() => setTool('gateway')}
              />
              <PlacementToolButton
                title="Device / sensor"
                note="Place points you want to test"
                toolValue="device"
                selected={tool === 'device'}
                onClick={() => setTool('device')}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <Shield className="w-3.5 h-3.5" />
              Draw walls and barriers
            </div>
            <div className="space-y-2">
              {segmentTools.map((material) => (
                <MaterialToolButton
                  key={material}
                  material={material}
                  selected={tool === material}
                  onClick={() => {
                    setTool(material)
                    setWallMaterial(material)
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wide mb-2">
              <Trees className="w-3.5 h-3.5" />
              Drop-in outdoor obstacles
            </div>
            <MaterialToolButton
              material="vegetation"
              selected={tool === 'vegetation'}
              onClick={() => setTool('vegetation')}
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setTool('erase')}
              className={`w-full rounded-2xl border px-3 py-2.5 transition-all text-left ${
                tool === 'erase' ? 'bg-red-50 text-red-700 ring-2 ring-red-300' : 'hover:bg-gray-50 text-gray-700'
              }`}
              style={{ borderColor: tool === 'erase' ? '#fca5a5' : '#e5e7eb' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-gray-100">
                  <ToolGlyph tool="erase" />
                </div>
                <div>
                  <div className="font-jakarta font-semibold text-sm">Eraser</div>
                  <div className="text-xs text-gray-500">Remove a placed item or obstacle</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setGateway(null)
                setDevices([])
                setWalls([])
                setTrees([])
              }}
              className="w-full flex items-center gap-2 px-3 py-3 rounded-2xl text-sm font-jakarta text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 p-2">
          <canvas
            ref={canvasRef}
            width={canvasSize.w}
            height={canvasSize.h}
            style={{
              cursor: cursorStyle,
              touchAction: 'none',
              display: 'block',
              borderRadius: 20,
              width: `${canvasSize.w * viewZoom}px`,
              height: `${canvasSize.h * viewZoom}px`,
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </div>

          <div className="shrink-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
            <Info className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm font-jakarta text-gray-500">
              {tool === 'gateway' && 'Click to place the gateway, then drag it if you want to reposition it.'}
              {tool === 'device' && 'Click to place a device or sensor point. Drag an existing point to move it.'}
            {tool === 'vegetation' && 'Click to drop a tree cluster. Drag an existing cluster if you want to reposition it.'}
            {tool === 'erase' && 'Click a gateway, device, tree cluster, or wall midpoint to remove it.'}
            {segmentTools.includes(tool as SegmentMaterial) &&
              `Click and drag to draw a ${WALL_LABELS[tool as SegmentMaterial].split('(')[0].trim().toLowerCase()}.`}
            </span>
            <span className="text-xs font-jakarta text-gray-400 shrink-0">View {zoomPct}%</span>
            <button
              onClick={() => setShowTips((current) => !current)}
              className="ml-auto text-xs font-jakarta text-gray-400 hover:text-gray-700 flex items-center gap-1 shrink-0"
            >
              Tips {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {showTips && (
          <div className="shrink-0 bg-green-50 border-t border-green-100 px-4 py-3 text-xs font-jakarta text-gray-600 space-y-1.5">
            <p><strong>Getting started:</strong> place a gateway near the centre of the site, then add devices where you want to test coverage.</p>
            <p><strong>Walls and barriers:</strong> drag the material across the map to draw a realistic obstacle band rather than a thin reference line.</p>
            <p><strong>Trees and dense cover:</strong> use the tree tool as a drop-in obstacle for outdoor runs, garden edges, or heavily planted areas.</p>
            <p><strong>Current scale:</strong> each grid cell equals {SCALE_OPTIONS[scaleIdx].metersPerCell}m x {SCALE_OPTIONS[scaleIdx].metersPerCell}m.</p>
            <p><strong>Signal reading:</strong> green is strongest, then teal, amber, and red as the link margin gets tighter.</p>
          </div>
        )}
      </div>

      <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white overflow-y-auto max-h-72 lg:max-h-none">
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs font-jakarta font-semibold text-gray-500 uppercase tracking-wide mb-3">
            <Waves className="w-3.5 h-3.5" />
            Signal results
          </div>

          {!gateway && (
            <div className="text-sm font-jakarta text-gray-400 text-center py-10">
              <Wifi className="w-7 h-7 mx-auto mb-2 opacity-40" />
              Place a gateway to start the simulation
            </div>
          )}

          {gateway && devices.length === 0 && (
            <div className="text-sm font-jakarta text-gray-400 text-center py-10">
              <WifiOff className="w-7 h-7 mx-auto mb-2 opacity-40" />
              Place at least one device to see predicted link quality
            </div>
          )}

          {results.map(({ dev, link }) => (
            <div
              key={dev.id}
              className="rounded-2xl border p-4 mb-3 last:mb-0 shadow-sm"
              style={{ borderColor: `${link.quality.color}33`, backgroundColor: link.quality.bg }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-geologica font-bold text-base text-gray-900">{dev.label}</span>
                <SignalBars bars={link.quality.bars} color={link.quality.color} />
              </div>

              <div className="font-jakarta font-semibold text-sm mb-2" style={{ color: link.quality.color }}>
                {link.quality.label}
              </div>

              <div className="space-y-1.5 text-xs font-jakarta text-gray-600">
                <div className="flex justify-between">
                  <span>Distance</span>
                  <span className="font-medium">
                    {link.distMeters < 1000 ? `${Math.round(link.distMeters)}m` : `${(link.distMeters / 1000).toFixed(1)}km`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Distance loss</span>
                  <span className="font-medium">{Math.round(link.fsplDb)} dB</span>
                </div>
                {link.obstaclesDb > 0 && (
                  <div className="flex justify-between">
                    <span>Obstacle loss</span>
                    <span className="font-medium">
                      {link.obstaclesDb} dB ({link.intersectedObstacles.length} obstacle{link.intersectedObstacles.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span>Margin left</span>
                  <span className="font-semibold" style={{ color: link.quality.color }}>
                    {link.marginDb > 0 ? `+${link.marginDb} dB` : `${link.marginDb} dB`}
                  </span>
                </div>
              </div>

              {link.intersectedObstacles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(Array.from(new Set(link.intersectedObstacles)) as ObstacleMaterial[]).map((material) => (
                    <span
                      key={material}
                      className="text-xs px-2 py-1 rounded-full font-jakarta flex items-center gap-1"
                      style={{ backgroundColor: `${WALL_COLORS[material]}18`, color: WALL_COLORS[material] }}
                    >
                      {material === 'vegetation' ? <Trees className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      {WALL_LABELS[material].split('(')[0].trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {results.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs font-jakarta text-gray-400">
              Link budget: 155 dB total
              <br />
              Recommended spare margin: &gt;=20 dB
              <br />
              Bars show spare headroom tiers, not absolute maximum LoS range.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
