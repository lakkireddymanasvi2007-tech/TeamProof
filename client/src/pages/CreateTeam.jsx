import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import Layout from '../components/Layout'
import { useToast } from '../components/Toast'
import { copyToClipboard } from '../utils/helpers'

export default function CreateTeam() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdTeam, setCreatedTeam] = useState(null)
  const [copied, setCopied] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  const validate = () => {
    const errs = {}
    if (!name.trim()) {
      errs.name = 'Team name is required'
    } else if (name.trim().length < 2) {
      errs.name = 'Team name must be at least 2 characters'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsSubmitting(true)
    try {
      const data = await api('/api/teams', {
        method: 'POST',
        body: { name: name.trim(), description: description.trim() },
      })
      const team = data.team || data
      setCreatedTeam(team)
      toast.success(`Team "${name}" created successfully!`)
    } catch (err) {
      toast.error(err.message || 'Failed to create team')
      setErrors({ form: err.message || 'Failed to create team' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyCode = async () => {
    const code = createdTeam?.inviteCode
    if (!code) return
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      toast.success('Invite code copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-4">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {createdTeam ? (
          /* Success Screen with Invite Code */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Team Created
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {createdTeam.name}
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                Share this unique invite code with your teammates so they can join your workspace.
              </p>
            </div>

            {/* Invite Code Display Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-inner max-w-md mx-auto">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                Team Invite Code
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-violet-400 select-all">
                  {createdTeam.inviteCode || 'N/A'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700"
                  title="Copy Code"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-3">
                {copied ? 'Copied to clipboard!' : 'Click the copy icon or select the text'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/teams/${createdTeam.id || createdTeam._id}`)}
                className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md shadow-violet-600/30 transition-all cursor-pointer"
              >
                Go to Team Workspace
              </button>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-center"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Create Form */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create a New Team</h1>
              <p className="mt-1 text-sm text-slate-500">
                Set up a workspace to track projects, deliverables, and verified contributions.
              </p>
            </div>

            {errors.form && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="team-name" className="block text-sm font-semibold text-slate-800 mb-2">
                  Team Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="team-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) setErrors({ ...errors, name: null })
                  }}
                  placeholder="e.g., CS490 Senior Capstone, Hackathon Alpha"
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300 bg-white'
                  }`}
                />
                {errors.name && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="team-desc" className="block text-sm font-semibold text-slate-800 mb-2">
                  Description <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="team-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the mission, scope, or course details for this team..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-md shadow-violet-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating Team...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
