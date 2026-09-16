import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getApiUrl } from '../utils/constants.js'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [actions, setActions] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, totalActions: 0, newToday: 0 })

  useEffect(() => {
    fetchUsers()
    fetchActions()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch(getApiUrl('/admin/users'), { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
        setStats(prev => ({ ...prev, totalUsers: (data.users || []).length }))
      }
    } catch {
      setUsers([])
    }
  }

  const fetchActions = async () => {
    try {
      const res = await fetch(getApiUrl('/admin/actions'), { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      if (res.ok) {
        const data = await res.json()
        setActions(data.actions || [])
        setStats(prev => ({ ...prev, totalActions: (data.actions || []).length }))
      }
    } catch {
      setActions([])
    }
  }

  const deleteUser = async (id) => {
    try {
      await fetch(getApiUrl(`/admin/users/${id}`), { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
      setUsers(users.filter(u => u.id !== id))
    } catch {
      setUsers(users.filter(u => u.id !== id))
    }
  }

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">🥗 Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {['Overview', 'Users', 'Actions'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
              {item === 'Overview' ? '📊' : item === 'Users' ? '👥' : '📝'} {item}
            </a>
          ))}
        </nav>
      </aside>

      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
              { label: 'Total Actions', value: stats.totalActions, icon: '📝', color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30' },
              { label: 'New Today', value: stats.newToday, icon: '🆕', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
            ].map(stat => (
              <div key={stat.label} className="card flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-xl`}>{stat.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div id="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Users</h3>
              <span className="text-sm text-slate-500">{users.length} users</span>
            </div>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                              {u.username?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{u.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => deleteUser(u.id)} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">No users found.</p>
              </div>
            )}
          </motion.div>

          <motion.div id="actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Actions Log</h3>
              <span className="text-sm text-slate-500">{actions.length} entries</span>
            </div>
            {actions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actions.map(a => (
                      <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-slate-900 dark:text-white">{a.username || 'Unknown'}</td>
                        <td className="py-3 px-4">
                          <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">{a.action_type}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{a.action_details || '-'}</td>
                        <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{a.created_at ? new Date(a.created_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-12 text-slate-500 dark:text-slate-400">No actions logged yet.</p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
