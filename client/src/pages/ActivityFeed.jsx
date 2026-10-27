import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { formatRelativeTime, formatDateTime, getInitials, getAvatarColor } from '../utils/helpers'

export default function ActivityFeed() {
  const { teamId } = useParams()
  const [activities, setActivities] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  const fetchActivities = useCallback(
    async (pageNum = 1, append = false) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const data = await api(`/api/teams/${teamId}/activity?page=${pageNum}&limit=15`)
        const items = Array.isArray(data)
          ? data
          : data.activities || data.items || []

        if (append) {
          setActivities((prev) => [...prev, ...items])
        } else {
          setActivities(items)
        }

        // Check if more items exist
        if (data.total !== undefined) {
          setHasMore(items.length > 0 && pageNum * 15 < data.total)
        } else {
          setHasMore(items.length >= 15)
        }
      } catch (err) {
        setError(err.message || 'Failed to load activity stream')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [teamId],
  )

  useEffect(() => {
    fetchActivities(1, false)
  }, [fetchActivities])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchActivities(nextPage, true)
  }

  const getActivityTypeConfig = (type = '') => {
    const t = type.toLowerCase()
    if (t.includes('evidence') || t.includes('proof')) {
      return {
        bg: 'bg-emerald-100 text-emerald-700',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      }
    }
    if (t.includes('blocker') || t.includes('blocked')) {
      return {
        bg: 'bg-rose-100 text-rose-700',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      }
    }
    if (t.includes('complete') || t.includes('done')) {
      return {
        bg: 'bg-indigo-100 text-indigo-700',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        ),
      }
    }
    if (t.includes('create') || t.includes('add')) {
      return {
        bg: 'bg-violet-100 text-violet-700',
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        ),
      }
    }
    // Default
    return {
      bg: 'bg-slate-100 text-slate-700',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/teams/${teamId}`}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Team Workspace
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-violet-600">Audit Stream</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Activity & Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Chronological log of tasks, blocker reports, and attached proof artifacts.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchActivities(1, false)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Log
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Retrieving team audit logs..." />
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 max-w-lg mx-auto">
            <p className="font-semibold mb-2">Could not load activity</p>
            <p className="text-xs mb-4">{error}</p>
            <button
              type="button"
              onClick={() => fetchActivities(1, false)}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            title="No activity recorded yet"
            description="When team members create tasks, add evidence, or flag blockers, all events appear here."
            actionLabel="Return to Dashboard"
            onAction={() => (window.location.href = `/teams/${teamId}`)}
          />
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {activities.map((act, index) => {
                const actId = act.id || act._id || index
                const userName = act.user?.name || act.userName || 'Team member'
                const typeConfig = getActivityTypeConfig(act.type || act.action)

                return (
                  <div key={actId} className="relative flex items-start gap-4 text-xs sm:text-sm">
                    {/* Circle on the timeline line */}
                    <div
                      className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${typeConfig.bg}`}
                    >
                      {typeConfig.icon}
                    </div>

                    {/* Activity Content Box */}
                    <div className="flex-1 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${getAvatarColor(
                              userName,
                            )}`}
                          >
                            {getInitials(userName)}
                          </div>
                          <span className="font-bold text-slate-900">{userName}</span>
                        </div>
                        <span
                          className="text-[11px] text-slate-400 font-medium"
                          title={formatDateTime(act.createdAt || act.timestamp)}
                        >
                          {formatRelativeTime(act.createdAt || act.timestamp)}
                        </span>
                      </div>

                      <p className="text-slate-700 mt-1 leading-relaxed">
                        {act.description || act.action || 'Activity recorded'}
                      </p>

                      {/* Attached details or task link if available */}
                      {(act.taskTitle || act.taskId) && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                          Related Task:{' '}
                          <span className="font-semibold text-slate-800">
                            {act.taskTitle || 'Deliverable'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                  className="px-6 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {loadingMore ? 'Loading more logs...' : 'Load Earlier Activity'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
