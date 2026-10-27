import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getInitials,
  getAvatarColor,
  getPriorityColor,
  getStatusColor,
  isOverdue,
  normalizeStatus,
} from '../utils/helpers'

export default function TaskDetail() {
  const { teamId, projectId, taskId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [task, setTask] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Edit Task State
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPriority, setEditPriority] = useState('medium')
  const [editAssigneeId, setEditAssigneeId] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editStatus, setEditStatus] = useState('todo')
  const [editCompletionSummary, setEditCompletionSummary] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Add Evidence State
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [evidenceLabel, setEvidenceLabel] = useState('')
  const [isAddingEvidence, setIsAddingEvidence] = useState(false)

  // Add Blocker State
  const [blockerDesc, setBlockerDesc] = useState('')
  const [isAddingBlocker, setIsAddingBlocker] = useState(false)

  // Resolving blocker ID
  const [resolvingBlockerId, setResolvingBlockerId] = useState(null)

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadTask = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const taskData = await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}`,
      )
      const t = taskData.task || taskData
      setTask(t)

      // Initialize edit fields
      setEditTitle(t.title || '')
      setEditDesc(t.description || '')
      setEditPriority(t.priority || 'medium')
      setEditAssigneeId(t.assigneeId || t.assignee?.id || t.assignee?._id || '')
      setEditDueDate(t.dueDate ? t.dueDate.split('T')[0] : '')
      setEditStatus(normalizeStatus(t.status))
      setEditCompletionSummary(t.completionSummary || '')

      // Load team members for assignee dropdown
      try {
        const teamData = await api(`/api/teams/${teamId}`)
        setTeamMembers(teamData.team?.members || teamData.members || [])
      } catch {
        // non-blocking
      }
    } catch (err) {
      setError(err.message || 'Failed to load task details')
    } finally {
      setLoading(false)
    }
  }, [teamId, projectId, taskId])

  useEffect(() => {
    loadTask()
  }, [loadTask])

  // Save Task Updates
  const handleSaveTask = async (e) => {
    e.preventDefault()
    if (!editTitle.trim()) {
      toast.error('Task title is required')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        assigneeId: editAssigneeId || undefined,
        dueDate: editDueDate || undefined,
        status: editStatus,
        completionSummary: editCompletionSummary.trim() || undefined,
      }

      if (editStatus === 'done' && !task.completedAt) {
        payload.completedAt = new Date().toISOString()
      }

      const res = await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}`,
        {
          method: 'PUT',
          body: payload,
        },
      )
      const updated = res.task || res
      setTask(updated)
      setIsEditing(false)
      toast.success('Task updated successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to update task')
    } finally {
      setIsSaving(false)
    }
  }

  // Quick Status change from dropdown/buttons
  const handleStatusChange = async (newStatus) => {
    try {
      const payload = { status: newStatus }
      if (newStatus === 'done' && !task.completedAt) {
        payload.completedAt = new Date().toISOString()
      }
      const res = await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}`,
        {
          method: 'PUT',
          body: payload,
        },
      )
      const updated = res.task || res
      setTask(updated)
      setEditStatus(newStatus)
      toast.success(`Status updated to ${newStatus}`)
    } catch (err) {
      toast.error(err.message || 'Failed to change status')
    }
  }

  // Add Evidence
  const handleAddEvidence = async (e) => {
    e.preventDefault()
    if (!evidenceUrl.trim()) {
      toast.error('URL is required')
      return
    }

    setIsAddingEvidence(true)
    try {
      const payload = {
        url: evidenceUrl.trim(),
        label: evidenceLabel.trim() || 'Contribution Artifact',
      }
      const res = await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}/evidence`,
        {
          method: 'POST',
          body: payload,
        },
      )
      const updatedTask = res.task || (res.evidence ? { ...task, evidence: [...(task.evidence || []), res.evidence] } : res)
      setTask(updatedTask)
      setEvidenceUrl('')
      setEvidenceLabel('')
      toast.success('Evidence artifact attached successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to add evidence')
    } finally {
      setIsAddingEvidence(false)
    }
  }

  // Delete Evidence
  const handleDeleteEvidence = async (evidenceId) => {
    if (!window.confirm('Are you sure you want to remove this evidence?')) return
    try {
      await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}/evidence/${evidenceId}`,
        {
          method: 'DELETE',
        },
      )
      setTask((prev) => ({
        ...prev,
        evidence: (prev.evidence || []).filter(
          (ev) => (ev.id || ev._id) !== evidenceId,
        ),
      }))
      toast.success('Evidence removed')
    } catch (err) {
      toast.error(err.message || 'Failed to remove evidence')
    }
  }

  // Add Blocker
  const handleAddBlocker = async (e) => {
    e.preventDefault()
    if (!blockerDesc.trim()) {
      toast.error('Blocker description cannot be empty')
      return
    }

    setIsAddingBlocker(true)
    try {
      const res = await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}/blockers`,
        {
          method: 'POST',
          body: { description: blockerDesc.trim() },
        },
      )
      const updatedTask = res.task || (res.blocker ? { ...task, blockers: [...(task.blockers || []), res.blocker] } : res)
      setTask(updatedTask)
      setBlockerDesc('')
      toast.warning('Blocker reported and logged to activity stream')
    } catch (err) {
      toast.error(err.message || 'Failed to log blocker')
    } finally {
      setIsAddingBlocker(false)
    }
  }

  // Resolve Blocker
  const handleResolveBlocker = async (blockerId) => {
    setResolvingBlockerId(blockerId)
    try {
      await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}/blockers/${blockerId}/resolve`,
        {
          method: 'PUT',
          body: { resolved: true },
        },
      )
      setTask((prev) => ({
        ...prev,
        blockers: (prev.blockers || []).map((b) =>
          (b.id || b._id) === blockerId ? { ...b, resolved: true, status: 'resolved' } : b,
        ),
      }))
      toast.success('Blocker resolved!')
    } catch (err) {
      toast.error(err.message || 'Failed to resolve blocker')
    } finally {
      setResolvingBlockerId(null)
    }
  }

  // Delete Task
  const handleDeleteTask = async () => {
    setIsDeleting(true)
    try {
      await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}`,
        {
          method: 'DELETE',
        },
      )
      toast.success('Task deleted')
      navigate(`/teams/${teamId}/projects/${projectId}`)
    } catch (err) {
      toast.error(err.message || 'Failed to delete task')
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" message="Loading task details..." />
        </div>
      </Layout>
    )
  }

  if (error || !task) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-12 text-center bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700">
          <h3 className="font-bold text-lg mb-2">Task not found</h3>
          <p className="text-xs mb-4">{error || 'This task does not exist or has been removed.'}</p>
          <Link
            to={`/teams/${teamId}/projects/${projectId}`}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
          >
            Back to Kanban Board
          </Link>
        </div>
      </Layout>
    )
  }

  const statusColor = getStatusColor(task.status)
  const priorityColor = getPriorityColor(task.priority)
  const overdue = isOverdue(task.dueDate, task.status)
  const evidenceList = task.evidence || []
  const blockersList = task.blockers || []
  const activityList = task.activity || task.timeline || []

  const assigneeName =
    task.assignee?.name ||
    teamMembers.find(
      (m) =>
        (m.id || m._id || m.userId) === task.assigneeId ||
        m.user?.id === task.assigneeId,
    )?.name ||
    task.assigneeName ||
    'Unassigned'

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to={`/teams/${teamId}/projects/${projectId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Project Kanban Board
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {isEditing ? 'Cancel Editing' : 'Edit Task'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Task Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          {/* Header & Status Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor.bg}`}
              >
                {statusColor.label}
              </span>

              {/* Priority Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${priorityColor.bg}`}
              >
                {priorityColor.label} Priority
              </span>

              {/* Overdue Warning */}
              {overdue && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                  ⚠️ Overdue
                </span>
              )}

              {/* Proof Indicator */}
              {evidenceList.length > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {evidenceList.length} Verified {evidenceList.length === 1 ? 'Artifact' : 'Artifacts'}
                </span>
              )}
            </div>

            {/* Status Switcher Quick Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Quick Status:</span>
              <select
                value={normalizeStatus(task.status)}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Edit Form or View Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveTask} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Assignee
                  </label>
                  <select
                    value={editAssigneeId}
                    onChange={(e) => setEditAssigneeId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((m, idx) => {
                      const u = m.user || m
                      const id = u.id || u._id || m.id || m.userId
                      return (
                        <option key={id || idx} value={id}>
                          {u.name || u.email}
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Completion Summary
                </label>
                <textarea
                  rows={2}
                  value={editCompletionSummary}
                  onChange={(e) => setEditCompletionSummary(e.target.value)}
                  placeholder="Summary of finished deliverables..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {task.title}
              </h1>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {task.description || (
                  <span className="text-slate-400 italic">No description provided for this task.</span>
                )}
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Assignee</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${getAvatarColor(
                        assigneeName,
                      )}`}
                    >
                      {getInitials(assigneeName)}
                    </div>
                    <span>{assigneeName}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Due Date</span>
                  <span className={`font-semibold ${overdue ? 'text-rose-600' : 'text-slate-800'}`}>
                    {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Created By</span>
                  <span className="font-semibold text-slate-800">
                    {task.createdBy?.name || task.createdByName || 'Team member'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Created At</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(task.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completion Section (if completed or has summary) */}
        {(task.completionSummary || normalizeStatus(task.status) === 'done') && (
          <div className="bg-emerald-50/60 rounded-3xl p-6 border border-emerald-200 text-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <h3 className="text-base font-bold text-emerald-950">Completion Record</h3>
              {task.completedAt && (
                <span className="text-xs text-emerald-700 ml-auto font-medium">
                  Completed on {formatDateTime(task.completedAt)}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 mt-2 bg-white/80 p-3.5 rounded-xl border border-emerald-200/80 leading-relaxed">
              {task.completionSummary || 'Marked as completed without summary notes.'}
            </p>
          </div>
        )}

        {/* Grid: Evidence Section & Blockers Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evidence Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Proof & Evidence
                </h3>
                <p className="text-xs text-slate-500">Live PRs, Figma, docs, and deliverables</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {evidenceList.length}
              </span>
            </div>

            {/* Evidence List */}
            {evidenceList.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No proof artifacts attached yet. Attach a link below to verify your work.
              </div>
            ) : (
              <div className="space-y-2.5">
                {evidenceList.map((ev, index) => {
                  const evId = ev.id || ev._id || index
                  return (
                    <div
                      key={evId}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 group hover:border-violet-300 transition-colors text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 truncate">
                            {ev.label || 'Artifact Link'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatRelativeTime(ev.createdAt || ev.timestamp)}
                          </span>
                        </div>
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-600 hover:text-violet-700 hover:underline truncate block mt-0.5 text-[11px]"
                        >
                          {ev.url} ↗
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEvidence(evId)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Remove evidence"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add Evidence Form */}
            <form onSubmit={handleAddEvidence} className="pt-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Attach New Evidence Link
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. GitHub PR #4, Figma Link)"
                  value={evidenceLabel}
                  onChange={(e) => setEvidenceLabel(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="url"
                  placeholder="URL (https://github.com/...)"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <button
                type="submit"
                disabled={isAddingEvidence}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAddingEvidence ? 'Attaching...' : 'Add Evidence'}
              </button>
            </form>
          </div>

          {/* Blockers Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Blockers & Impediments
                </h3>
                <p className="text-xs text-slate-500">Flag issues requiring team assistance</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {blockersList.length}
              </span>
            </div>

            {/* Blockers List */}
            {blockersList.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                No blockers reported. Everything is running smoothly.
              </div>
            ) : (
              <div className="space-y-2.5">
                {blockersList.map((blocker, index) => {
                  const bId = blocker.id || blocker._id || index
                  const isResolved =
                    blocker.resolved ||
                    blocker.status === 'resolved' ||
                    Boolean(blocker.resolvedAt)

                  return (
                    <div
                      key={bId}
                      className={`p-3 rounded-xl border text-xs transition-colors flex items-start justify-between gap-3 ${
                        isResolved
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'bg-rose-50/70 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isResolved
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-rose-200 text-rose-800'
                            }`}
                          >
                            {isResolved ? 'Resolved' : 'Active Blocker'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatRelativeTime(blocker.createdAt || blocker.timestamp)}
                          </span>
                        </div>
                        <p className={`text-xs ${isResolved ? 'line-through text-slate-400' : 'font-medium'}`}>
                          {blocker.description}
                        </p>
                      </div>

                      {!isResolved && (
                        <button
                          type="button"
                          disabled={resolvingBlockerId === bId}
                          onClick={() => handleResolveBlocker(bId)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add Blocker Form */}
            <form onSubmit={handleAddBlocker} className="pt-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Report a New Blocker
              </span>
              <textarea
                rows={2}
                placeholder="What is preventing you from completing this task?"
                value={blockerDesc}
                onChange={(e) => setBlockerDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
              <button
                type="submit"
                disabled={isAddingBlocker}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAddingBlocker ? 'Reporting...' : 'Flag Blocker'}
              </button>
            </form>
          </div>
        </div>

        {/* Task Activity Timeline */}
        {activityList.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Task Timeline</h3>
            <div className="space-y-3">
              {activityList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="font-semibold text-slate-900">
                    {item.user?.name || item.userName || 'Member'}
                  </span>
                  <span>{item.action || item.description}</span>
                  <span className="text-slate-400 text-[10px] ml-auto">
                    {formatRelativeTime(item.createdAt || item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Task"
          subtitle="This action cannot be undone"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">{task.title}</strong>? All evidence and blocker
              logs linked to this task will be removed.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTask}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
