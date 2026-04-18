import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { UserPlus, Edit } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '@/types'
import type { Role } from '@/types'
import { formatDate } from '@/lib/utils'
import { CreateUserForm } from '@/components/admin/CreateUserForm'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Users' }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { action?: string; success?: string }
}) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { progress: true } },
    },
  })

  const showCreateForm = searchParams.action === 'create'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-geologica font-black text-3xl text-gray-900 mb-1">Users</h1>
          <p className="text-gray-500 font-jakarta">{users.length} user{users.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Link
          href="/admin/users?action=create"
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          Add user
        </Link>
      </div>

      {searchParams.success === 'created' && (
        <div className="rounded-lg px-4 py-3 mb-6 text-sm font-jakarta bg-green-50 text-green-800 border border-green-200">
          User created successfully.
        </div>
      )}

      {showCreateForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-geologica font-bold text-lg text-gray-900 mb-4">Create new user</h2>
          <CreateUserForm />
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Lessons started</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600 hidden lg:table-cell">Last login</th>
              <th className="text-left px-4 py-3 font-jakarta font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-jakarta flex-shrink-0"
                      style={{ backgroundColor: '#002400', color: '#61ce70' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-jakarta font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-400 font-jakarta">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${ROLE_COLORS[user.role as Role]}`}>
                    {ROLE_LABELS[user.role as Role]}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-jakarta text-gray-600">{user._count.progress}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="font-jakarta text-gray-400 text-xs">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
