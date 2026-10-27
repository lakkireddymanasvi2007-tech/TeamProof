import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'
import {
  copyToClipboard,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
} from '../utils/helpers'

export default function TeamDashboard() {
  const { teamId } = useParams()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const toast = useToast()

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api(`/api/teams/${teamId}/dashboard`)
      setDashboardData(data)
    } catch (err) {
      setError(err.message || 'Failed to load team dashboard')
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleCopyCode = async (code) => {
    if (!code) return
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      toast.success('Invite code copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" message="Loading team workspace dashboard..." />
        </div>
      </Layout>
    )
  }

  if (error || !dashboardData) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto py-12">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700">
            <h3 className="font-bold text-lg mb-2">Unable to load team</h3>
            <p className="text-sm mb-4">{error || 'Team not found or access restricted.'}</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={fetchDashboard}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 cursor-pointer"
              >
                Retry
              </button>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-300"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Parse dashboard API response
  const team = dashboardData.team || {}
  const totalProjects = dashboardData.totalProjects || 0
  const totalTasks = dashboardData.totalTasks || 0
  const completedTasks = dashboardData.completedTasks || 0
  const completionPercentage = dashboardData.completionPercentage || 0
  const overdueTasks = dashboardData.overdueTasks || 0
  const openBlockers = dashboardData.openBlockers || 0
  const memberStats = dashboardData.memberStats || []
  const recentActivity = dashboardData.recentActivity || []
  const projectHealth = dashboardData.projectHealth || { status: 'healthy', reasons: [] }

  const members = team.members || []
  const health = projectHealth.status || 'healthy'

  // Health Badge Config
  const healthBadge = {
    healthy: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Healthy Workspace',
      desc: projectHealth.reasons?.[0] || 'All deadlines on track & zero critical blockers',
    },
    'at-risk': {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
      label: 'At Risk',
      desc: projectHealth.reasons?.[0] || 'Overdue deliverables or active blockers detected',
    },
    critical: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Critical Intervention Needed',
      desc: projectHealth.reasons?.[0] || 'High blocker ratio or multiple delayed tasks',
    },
  }[health] || {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Healthy',
    desc: 'Normal operations',
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {team.name || 'Team Dashboard'}
              </h1>
              {team.inviteCode && (
                <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 text-xs font-mono">
                  <span className="text-slate-500">Invite Code:</span>
                  <span className="font-bold text-violet-700">{team.inviteCode}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(team.inviteCode)}
                    className="p-1 hover:text-violet-600 transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? (
                      <span className="text-emerald-600 text-[10px] font-sans font-bold">Copied!</span>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              {team.description || 'Welcome to your team coordination and verification dashboard.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={`/teams/${teamId}/projects`}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-violet-600/30 transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              View Projects
            </Link>
            <Link
              to={`/teams/${teamId}/report`}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Contribution Report
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-400">Projects</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalProjects}
            </div>
            <span className="text-[11px] text-slate-400">Active workspaces</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-400">Total Tasks</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-indigo-600">
              {totalTasks}
            </div>
            <span className="text-[11px] text-slate-400">Tracked items</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-400">Completed</span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {completedTasks}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {completionPercentage}% velocity
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-semibold uppercase text-slate-400">Overdue</span>
            <div className={`mt-2 text-2xl sm:text-3xl font-extrabold ${overdueTasks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {overdueTasks}
            </div>
            <span className="text-[11px] text-slate-400">Needs attention</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs col-span-2 lg:col-span-1">
            <span className="text-xs font-semibold uppercase text-slate-400">Active Blockers</span>
            <div className={`mt-2 text-2xl sm:text-3xl font-extrabold ${openBlockers > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {openBlockers}
            </div>
            <span className="text-[11px] text-slate-400">Unresolved bottlenecks</span>
          </div>
        </div>

        {/* Project Health Indicator */}
        <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${healthBadge.bg}`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-3.5 h-3.5 rounded-full ${healthBadge.dot} animate-pulse`} />
            <div>
              <h3 className="font-bold text-sm tracking-tight">{healthBadge.label}</h3>
              <p className="text-xs opacity-85 mt-0.5">{healthBadge.desc}</p>
            </div>
          </div>
          <div className="text-xs font-semibold">
            Status assessment updated in real-time
          </div>
        </div>

        {/* Two Column Layout: Member Contribution Summary & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Member Stats Table (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Member Contribution Audit</h2>
                <p className="text-xs text-slate-500">Live breakdown of individual task accountability</p>
              </div>
              <Link
                to={`/teams/${teamId}/report`}
                className="text-xs font-bold text-violet-600 hover:text-violet-700"
              >
                Full Report →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-1">Teammate</th>
                    <th className="pb-3 text-center">Assigned</th>
                    <th className="pb-3 text-center">Completed</th>
                    <th className="pb-3 text-center">Proof-Backed</th>
                    <th className="pb-3 text-center pr-1">Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {memberStats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No team members registered yet.
                      </td>
                    </tr>
                  ) : (
                    memberStats.map((item, idx) => {
                      const userObj = item.user || {}
                      const name = userObj.name || `Member ${idx + 1}`
                      const isOwner = members.some(
                        (m) => m.role === 'owner' && ((m.user?._id || m.user) === userObj._id)
                      )

                      return (
                        <tr key={userObj._id || idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 pl-1">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${getAvatarColor(name)}`}
                              >
                                {getInitials(name)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-900 truncate max-w-[140px] sm:max-w-none">
                                    {name}
                                  </span>
                                  {isOwner && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700">
                                      Owner
                                    </span>
                                  )}
                                </div>
                                {userObj.email && (
                                  <span className="text-[10px] text-slate-400 block truncate">
                                    {userObj.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-center font-semibold text-slate-700">{item.assigned || 0}</td>
                          <td className="py-3.5 text-center font-semibold text-emerald-600">{item.completed || 0}</td>
                          <td className="py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {item.evidenceBacked || 0}
                            </span>
                          </td>
                          <td className="py-3.5 text-center pr-1">
                            <span className={`font-semibold ${(item.overdue || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                              {item.overdue || 0}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity Feed (1 Col) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                  <p className="text-xs text-slate-500">Live operational log</p>
                </div>
                <Link
                  to={`/teams/${teamId}/activity`}
                  className="text-xs font-bold text-violet-600 hover:text-violet-700"
                >
                  View All →
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No activity recorded yet for this team.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((act, index) => {
                    const userName = act.user?.name || 'Team member'
                    return (
                      <div key={act._id || index} className="flex items-start gap-3 text-xs">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 font-bold text-[11px] mt-0.5">
                          {getInitials(userName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 leading-snug">
                            <span className="font-semibold text-slate-900">{userName}</span>{' '}
                            <span className="text-slate-600">{act.description || act.action}</span>
                          </p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            {formatRelativeTime(act.createdAt)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 text-center">
              <Link
                to={`/teams/${teamId}/activity`}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Inspect Complete Audit Trail
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
