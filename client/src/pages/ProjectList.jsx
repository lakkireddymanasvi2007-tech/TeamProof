import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../utils/api'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { formatDate, getTimeRemaining } from '../utils/helpers'

export default function ProjectList() {
  const { teamId } = useParams()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [deadline, setDeadline] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toast = useToast()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api(`/api/teams/${teamId}/projects`)
      const list = Array.isArray(data) ? data : data.projects || []
      setProjects(list)
    } catch (err) {
      setError(err.message || 'Failed to fetch team projects')
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const validateForm = () => {
    const errs = {}
    if (!name.trim()) {
      errs.name = 'Project name is required'
    }
    if (startDate && deadline && new Date(startDate) > new Date(deadline)) {
      errs.deadline = 'Deadline cannot be before the start date'
    }
    return errs
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    const errs = validateForm()
    setFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        startDate: startDate || undefined,
        deadline: deadline || undefined,
      }
      const data = await api(`/api/teams/${teamId}/projects`, {
        method: 'POST',
        body: payload,
      })
      const newProj = data.project || data
      setProjects((prev) => [newProj, ...prev])
      toast.success(`Project "${newProj.name}" created!`)
      setIsModalOpen(false)
      setName('')
      setDescription('')
      setStartDate('')
      setDeadline('')
      setFormErrors({})
    } catch (err) {
      toast.error(err.message || 'Failed to create project')
      setFormErrors({ submit: err.message || 'Failed to create project' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/teams/${teamId}`}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Team Workspace
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold text-violet-600">Projects</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Team Projects
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage sprints, track kanban deliverables, and audit completion evidence.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Loading team projects..." />
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700 max-w-lg mx-auto">
            <p className="font-semibold mb-2">Could not load projects</p>
            <p className="text-xs mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchProjects}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects created yet"
            description="Organize your team's assignments into projects and track kanban tasks with proof."
            actionLabel="Create First Project"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const projectId = proj.id || proj._id
              const totalTasks = proj.tasksCount ?? proj.tasks?.length ?? 0
              const completedTasks = proj.completedTasksCount ?? 0
              const progress =
                totalTasks > 0
                  ? Math.round((completedTasks / totalTasks) * 100)
                  : proj.progress || 0

              const countdown = getTimeRemaining(proj.deadline)

              return (
                <Link
                  key={projectId}
                  to={`/teams/${teamId}/projects/${projectId}`}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                        {proj.status || 'Active'}
                      </span>
                      {countdown && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            countdown.expired
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {countdown.label}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                      {proj.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3 pt-4 border-t border-slate-100">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">Task Completion</span>
                        <span className="font-bold text-slate-800">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>
                        {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
                      </span>
                      {proj.deadline && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due {formatDate(proj.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Create Project Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Project"
          subtitle="Set scope, milestones, and deadlines for your team"
        >
          {formErrors.submit && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formErrors.submit}
            </div>
          )}

          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label htmlFor="p-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="p-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (formErrors.name) setFormErrors({ ...formErrors, name: null })
                }}
                placeholder="e.g., Sprint 1: API & DB Schema"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                  formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="p-desc" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                id="p-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What objectives must be accomplished in this project?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="p-start" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Start Date
                </label>
                <input
                  id="p-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label htmlFor="p-deadline" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Deadline
                </label>
                <input
                  id="p-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value)
                    if (formErrors.deadline) setFormErrors({ ...formErrors, deadline: null })
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                    formErrors.deadline ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                {formErrors.deadline && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{formErrors.deadline}</p>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}
