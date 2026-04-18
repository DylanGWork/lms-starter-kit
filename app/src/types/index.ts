import type { Role, ContentStatus, AssetType, Locale } from '@prisma/client'

export type { Role, ContentStatus, AssetType, Locale }

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
  preferredLocale: Locale
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface SearchResult {
  id: string
  type: 'lesson' | 'course' | 'category'
  title: string
  summary?: string
  slug: string
  categoryName?: string
  courseName?: string
  moduleId?: string
  courseId?: string
}

export const ROLE_LABELS: Record<Role, string> = {
  TECHNICIAN: 'Technician',
  SITE_MANAGER: 'Site Manager',
  BUSINESS_ADMIN: 'Business Admin',
  SUPER_ADMIN: 'Super Admin',
}

export const ROLE_COLORS: Record<Role, string> = {
  TECHNICIAN: 'bg-blue-100 text-blue-800',
  SITE_MANAGER: 'bg-purple-100 text-purple-800',
  BUSINESS_ADMIN: 'bg-orange-100 text-orange-800',
  SUPER_ADMIN: 'bg-green-100 text-green-800',
}

export const STATUS_COLORS: Record<ContentStatus, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  TECHNICIAN: 'Field technician — practical device and site training',
  SITE_MANAGER: 'Site oversight, reports, and team management',
  BUSINESS_ADMIN: 'Full business administration and platform control',
  SUPER_ADMIN: 'PestSense internal — full platform access',
}

// Which roles can access admin features
export const ADMIN_ROLES: Role[] = ['BUSINESS_ADMIN', 'SUPER_ADMIN']
export const MANAGER_ROLES: Role[] = ['SITE_MANAGER', 'BUSINESS_ADMIN', 'SUPER_ADMIN']
