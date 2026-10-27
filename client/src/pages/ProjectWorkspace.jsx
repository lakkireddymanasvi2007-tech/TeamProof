import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import {
  formatDate,
  getTimeRemaining,
  getInitials,
  getAvatarColor,
  getPriorityColor,
  isOverdue,
  normalizeStatus,
} from '../utils/helpers'

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'blocked', label: 'Blocked', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'done', label: 'Done', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
]

export default function ProjectWorkspace() {
  const { teamId, projectId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Task creation state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [defaultColumn, setDefaultColumn] = useState('todo')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quick move status state for active task
  const [updatingTaskId, setUpdatingTaskId] = useState(null)

  // Completion note prompt modal for Done transition
  const [completionModalTask, setCompletionModalTask] = useState(null)
  const [completionSummary, setCompletionSummary] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Load Project details
      try {
        const projData = await api(`/api/teams/${teamId}/projects/${projectId}`)
        setProject(projData.project || projData)
      } catch {
        // Fallback: load project from project list
        const projListData = await api(`/api/teams/${teamId}/projects`)
        const found = (projListData.projects || projListData || []).find(
          (p) => (p.id || p._id) === projectId,
        )
        if (found) setProject(found)
      }

      // Load Tasks
      const tasksData = await api(`/api/teams/${teamId}/projects/${projectId}/tasks`)
      const taskList = Array.isArray(tasksData) ? tasksData : tasksData.tasks || []
      setTasks(taskList)

      // Load Team members
      const teamData = await api(`/api/teams/${teamId}`)
      const members = teamData.team?.members || teamData.members || []
      setTeamMembers(members)
    } catch (err) {
      setError(err.message || 'Failed to load project workspace')
    } finally {
      setLoading(false)
    }
  }, [teamId, projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openAddTaskModal = (colId = 'todo') => {
    setDefaultColumn(colId)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setAssigneeId('')
    setDueDate('')
    setFormErrors({})
    setIsTaskModalOpen(true)
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setFormErrors({ title: 'Task title is required' })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status: defaultColumn,
        priority,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
      }

      const res = await api(`/api/teams/${teamId}/projects/${projectId}/tasks`, {
        method: 'POST',
        body: payload,
      })

      const created = res.task || res
      setTasks((prev) => [...prev, created])
      toast.success(`Task "${created.title}" created!`)
      setIsTaskModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to create task')
      setFormErrors({ submit: err.message || 'Failed to create task' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickStatusChange = async (task, newStatus) => {
    const taskId = task.id || task._id
    if (newStatus === 'done') {
      // Require or prompt completion summary
      setCompletionModalTask({ ...task, targetStatus: 'done' })
      setCompletionSummary('')
      return
    }

    setUpdatingTaskId(taskId)
    try {
      const updated = await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}`,
        {
          method: 'PUT',
          body: { status: newStatus },
        },
      )
      const resTask = updated.task || updated
      setTasks((prev) =>
        prev.map((t) => ((t.id || t._id) === taskId ? { ...t, ...resTask, status: newStatus } : t)),
      )
      toast.success(`Moved to ${COLUMNS.find((c) => c.id === newStatus)?.label}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update task status')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const submitCompletion = async (e) => {
    e.preventDefault()
    if (!completionModalTask) return
    const taskId = completionModalTask.id || completionModalTask._id

    setUpdatingTaskId(taskId)
    try {
      const updated = await api(
        `/api/teams/${teamId}/projects/${projectId}/tasks/${taskId}`,
        {
          method: 'PUT',
          body: {
            status: 'done',
            completionSummary: completionSummary.trim() || undefined,
            completedAt: new Date().toISOString(),
          },
        },
      )
      const resTask = updated.task || updated
      setTasks((prev) =>
        prev.map((t) =>
          (t.id || t._id) === taskId
            ? { ...t, ...resTask, status: 'done', completionSummary }
            : t,
        ),
      )
      toast.success('Task marked as Done with completion record!')
      setCompletionModalTask(null)
    } catch (err) {
      toast.error(err.message || 'Failed to complete task')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" message="Loading Kanban Workspace..." />
        </div>
      </Layout>
    )
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-12 text-center bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700">
          <h3 className="font-bold text-lg mb-2">Project not accessible</h3>
          <p className="text-xs mb-4">{error || 'Could not find this project.'}</p>
          <Link
            to={`/teams/${teamId}/projects`}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
          >
            Back to Projects
          </Link>
        </div>
      </Layout>
    )
  }

  const countdown = getTimeRemaining(project.deadline)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Project Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                to={`/teams/${teamId}`}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Team
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                to={`/teams/${teamId}/projects`}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Projects
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-violet-600 truncate max-w-[200px]">
                {project.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {project.description || 'Deliverables board with verified contribution tracking.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {countdown && (
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                  countdown.expired
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {countdown.label}
              </div>
            )}

            <button
              type="button"
              onClick={() => openAddTaskModal('todo')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-violet-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>

        {/* Kanban Board Grid (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => normalizeStatus(t.status) === col.id)

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white text-slate-600 border border-slate-200 shadow-2xs">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openAddTaskModal(col.id)}
                    className="p-1 text-slate-400 hover:text-violet-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title={`Add task to ${col.label}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                      No {col.label.toLowerCase()} tasks
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const taskId = task.id || task._id
                      const taskAssignee =
                        task.assignee ||
                        teamMembers.find(
                          (m) =>
                            (m.id || m._id || m.userId) === task.assigneeId ||
                            m.user?.id === task.assigneeId,
                        )
                      const assigneeName =
                        taskAssignee?.name ||
                        taskAssignee?.user?.name ||
                        task.assigneeName ||
                        'Unassigned'

                      const evidenceList = task.evidence || []
                      const hasEvidence = evidenceList.length > 0
                      const overdue = isOverdue(task.dueDate, task.status)
                      const priorityColor = getPriorityColor(task.priority)

                      return (
                        <div
                          key={taskId}
                          className={`group/card bg-white rounded-xl p-4 shadow-xs border transition-all duration-150 hover:shadow-md cursor-pointer ${
                            overdue
                              ? 'border-rose-300 ring-1 ring-rose-300/40'
                              : 'border-slate-200 hover:border-violet-300'
                          }`}
                          onClick={() =>
                            navigate(
                              `/teams/${teamId}/projects/${projectId}/tasks/${taskId}`,
                            )
                          }
                        >
                          {/* Priority & Evidence Status Badges */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor.bg}`}
                            >
                              {priorityColor.label}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {hasEvidence ? (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  title={`${evidenceList.length} evidence artifacts attached`}
                                >
                                  <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  {evidenceList.length} Proof
                                </span>
                              ) : col.id === 'done' ? (
                                <span
                                  className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                                  title="No proof attached yet"
                                >
                                  Needs Proof
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-sm font-bold text-slate-800 group-hover/card:text-violet-600 transition-colors line-clamp-2 leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Assignee & Due Date Row */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            {/* Assignee */}
                            <div className="flex items-center gap-1.5" title={`Assignee: ${assigneeName}`}>
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${getAvatarColor(
                                  assigneeName,
                                )}`}
                              >
                                {getInitials(assigneeName)}
                              </div>
                              <span className="text-[11px] font-medium text-slate-600 truncate max-w-[80px]">
                                {assigneeName}
                              </span>
                            </div>

                            {/* Due Date */}
                            {task.dueDate ? (
                              <span
                                className={`text-[10px] font-semibold flex items-center gap-1 ${
                                  overdue ? 'text-rose-600 font-bold' : 'text-slate-400'
                                }`}
                              >
                                {overdue && '⚠️ '}
                                {formatDate(task.dueDate)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">No due date</span>
                            )}
                          </div>

                          {/* Quick Status Shift Row (stops propagation so it moves without opening task) */}
                          <div
                            className="mt-2 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Move to:</span>
                            <div className="flex items-center gap-1">
                              {COLUMNS.filter((c) => c.id !== col.id).map((targetCol) => (
                                <button
                                  key={targetCol.id}
                                  type="button"
                                  disabled={updatingTaskId === taskId}
                                  onClick={() => handleQuickStatusChange(task, targetCol.id)}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-violet-100 hover:text-violet-800 text-slate-600 font-medium transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {targetCol.id === 'in-progress'
                                    ? 'Progress'
                                    : targetCol.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Task Creation Modal */}
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title="Add New Task"
          subtitle={`Create a task under "${project.name}"`}
        >
          {formErrors.submit && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formErrors.submit}
            </div>
          )}

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label htmlFor="t-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="t-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (formErrors.title) setFormErrors({ ...formErrors, title: null })
                }}
                placeholder="e.g., Build Auth Context and Protected Routes"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  formErrors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {formErrors.title && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="t-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                id="t-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details, acceptance criteria, or links to specifications..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="t-assignee" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Assignee
                </label>
                <select
                  id="t-assignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member, idx) => {
                    const u = member.user || member
                    const id = u.id || u._id || member.id || member.userId
                    const name = u.name || u.email || `Member ${idx + 1}`
                    return (
                      <option key={id || idx} value={id}>
                        {name}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="t-priority" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority
                </label>
                <select
                  id="t-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="t-due" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Due Date
                </label>
                <input
                  id="t-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label htmlFor="t-column" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Initial Status
                </label>
                <select
                  id="t-column"
                  value={defaultColumn}
                  onChange={(e) => setDefaultColumn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Completion Confirmation Modal */}
        <Modal
          isOpen={Boolean(completionModalTask)}
          onClose={() => setCompletionModalTask(null)}
          title="Mark Task as Done"
          subtitle="Record what was accomplished for team contribution transparency"
        >
          <form onSubmit={submitCompletion} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              <p className="font-semibold">Task: {completionModalTask?.title}</p>
              <p className="mt-0.5 text-emerald-700">
                You can attach URLs and proof artifacts on the Task Detail page after completing.
              </p>
            </div>

            <div>
              <label htmlFor="c-summary" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Completion Summary <span className="text-slate-400 font-normal">(Brief explanation)</span>
              </label>
              <textarea
                id="c-summary"
                rows={3}
                value={completionSummary}
                onChange={(e) => setCompletionSummary(e.target.value)}
                placeholder="e.g. Implemented cookie authentication with automated test pass rate of 100%."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCompletionModalTask(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={Boolean(updatingTaskId)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                Confirm Completion
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
