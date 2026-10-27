import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  formatDate,
  formatDateTime,
  getInitials,
  getAvatarColor,
} from '../utils/helpers'

export default function ContributionReport() {
  const { teamId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReportData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const dashData = await api(`/api/teams/${teamId}/dashboard`)

      // Also fetch projects list for the report
      let projects = []
      try {
        projects = await api(`/api/teams/${teamId}/projects`)
        if (!Array.isArray(projects)) projects = []
      } catch {
        // projects may fail if none exist
      }

      setData({ ...dashData, projects })
    } catch (err) {
      setError(err.message || 'Failed to generate contribution report')
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <Layout>
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" message="Compiling team contribution report..." />
        </div>
      </Layout>
    )
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-12 text-center bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700">
          <h3 className="font-bold text-lg mb-2">Report Generation Failed</h3>
          <p className="text-xs mb-4">{error || 'Could not load report details.'}</p>
          <Link
            to={`/teams/${teamId}`}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
          >
            Back to Team
          </Link>
        </div>
      </Layout>
    )
  }

  const team = data.team || {}
  const stats = {
    projects: data.totalProjects || 0,
    tasks: data.totalTasks || 0,
    completed: data.completedTasks || 0,
    overdue: data.overdueTasks || 0,
    blockers: data.openBlockers || 0,
    completionPercentage: data.completionPercentage || 0,
  }
  const members = team.members || []
  const memberStats = data.memberStats || []
  const projects = data.projects || []

  // Report Generation Timestamp
  const generatedAt = new Date()

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 print:p-0">
        {/* Action Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/teams/${teamId}`}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Team Workspace
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-violet-600">Contribution Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Contribution & Proof Audit Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Verified individual deliverables, evidence links, and accountability dossier.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Dossier / Save PDF
          </button>
        </div>

        {/* Printable Report Document Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-lg print:shadow-none print:border-none print:p-0 space-y-8">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Team<span className="text-violet-600">Proof</span>
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  AUDIT-DOSSIER
                </span>
              </div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">{team.name}</h2>
              {team.description && (
                <p className="text-xs text-slate-600 mt-1 max-w-lg">{team.description}</p>
              )}
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 space-y-1">
              <div>
                <span className="font-semibold text-slate-900">Generated:</span>{' '}
                {formatDateTime(generatedAt)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Team Code:</span>{' '}
                <span className="font-mono">{team.inviteCode || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-900">Scope:</span> Full Workspace History
              </div>
            </div>
          </div>

          {/* Team Overall Health & Metrics Summary */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              1. Team Aggregate Performance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Tasks</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{stats.tasks || 0}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-emerald-50/50">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase">Completed Tasks</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">{stats.completed || 0}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-rose-50/50">
                <span className="text-[11px] font-semibold text-rose-700 uppercase">Overdue Tasks</span>
                <div className="text-2xl font-black text-rose-700 mt-1">{stats.overdue || 0}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-amber-50/50">
                <span className="text-[11px] font-semibold text-amber-700 uppercase">Active Blockers</span>
                <div className="text-2xl font-black text-amber-700 mt-1">{stats.blockers || 0}</div>
              </div>
            </div>
          </div>

          {/* Project Summaries */}
          {projects.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                2. Project Deliverables Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((proj, idx) => {
                  const tasksTotal = proj.tasksCount ?? proj.tasks?.length ?? 0
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span className="text-sm">{proj.name}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {proj.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-slate-500 mb-2 line-clamp-1">{proj.description}</p>
                      <div className="text-[11px] text-slate-600 flex justify-between">
                        <span>Tasks Tracked: {tasksTotal}</span>
                        <span>Deadline: {formatDate(proj.deadline)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Member Contribution Breakdown */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">
              3. Individual Member Audits & Verified Artifacts
            </h3>

            <div className="space-y-6">
              {(memberStats.length > 0 ? memberStats : members).map((m, index) => {
                const u = m.user || m.member || m
                const name = u.name || u.email || `Member ${index + 1}`
                const email = u.email || ''
                const assigned = m.assigned ?? 0
                const completed = m.completed ?? 0
                const evidenceBacked = m.evidenceBacked ?? m.evidenceCount ?? 0
                const overdue = m.overdue ?? 0
                const completedTasks = m.completedTasks || []

                return (
                  <div
                    key={index}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4"
                  >
                    {/* Member Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${getAvatarColor(
                            name,
                          )}`}
                        >
                          {getInitials(name)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900">{name}</h4>
                            {m.role === 'owner' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-100 text-violet-700">
                                Team Owner
                              </span>
                            )}
                          </div>
                          {email && <span className="text-[11px] text-slate-400">{email}</span>}
                        </div>
                      </div>

                      {/* Member Mini-Stats */}
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Assigned</span>
                          <span className="text-slate-800">{assigned}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Completed</span>
                          <span className="text-emerald-700">{completed}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Proof Links</span>
                          <span className="text-violet-700 font-bold">{evidenceBacked}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block uppercase">Overdue</span>
                          <span className={overdue > 0 ? 'text-rose-600' : 'text-slate-400'}>
                            {overdue}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Completed Tasks List */}
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-700 uppercase mb-2">
                        Completed Deliverables & Proof Artifacts
                      </h5>

                      {completedTasks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          No completed tasks recorded in current audit cycle.
                        </p>
                      ) : (
                        <div className="space-y-2 text-xs">
                          {completedTasks.map((t, tIdx) => {
                            const taskEvidence = t.evidence || []
                            return (
                              <div
                                key={tIdx}
                                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                              >
                                <div className="flex items-center justify-between font-semibold text-slate-900">
                                  <span>{t.title}</span>
                                  {t.completedAt && (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      {formatDate(t.completedAt)}
                                    </span>
                                  )}
                                </div>

                                {t.completionSummary && (
                                  <p className="text-[11px] text-slate-600 italic">
                                    "{t.completionSummary}"
                                  </p>
                                )}

                                {taskEvidence.length > 0 && (
                                  <div className="pt-1 flex flex-wrap gap-2 text-[10px]">
                                    {taskEvidence.map((ev, evIdx) => (
                                      <a
                                        key={evIdx}
                                        href={ev.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-medium hover:underline"
                                      >
                                        <span>🔗 {ev.label || 'Artifact'}</span>
                                        <span className="text-slate-400">({ev.url})</span>
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legal Audit Disclaimer (Required) */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700 mb-1">Audit Verification Notice</p>
            <p className="max-w-2xl mx-auto italic">
              "This report summarizes recorded task activity and attached evidence. It does not
              independently verify the quality or completeness of contributions."
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
