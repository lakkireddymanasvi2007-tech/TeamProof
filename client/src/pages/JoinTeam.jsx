import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import Layout from '../components/Layout'
import { useToast } from '../components/Toast'

export default function JoinTeam() {
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const toast = useToast()

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    const code = inviteCode.trim().toLowerCase()

    if (!code) {
      setError('Please enter a team invite code')
      return
    }

    setIsSubmitting(true)
    try {
      const teamData = await api.post('/api/teams/join', { inviteCode: code })

      toast.success('Joined team successfully!')
      const teamId = teamData?._id || teamData?.id
      navigate(`/teams/${teamId}`)
    } catch (err) {
      const msg = err.message || 'Failed to join team'
      if (msg.toLowerCase().includes('already')) {
        setError('You are already a member of this team.')
        toast.info('You are already a member of this team.')
      } else if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('invalid')) {
        setError('Invalid invite code. Please verify with your team owner.')
        toast.error('Invalid invite code')
      } else {
        setError(msg)
        toast.error(msg)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        {/* Breadcrumb */}
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

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-5">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Join a Team</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 mb-6">
            Enter the invite code shared by your team owner.
          </p>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label htmlFor="invite-code" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Invite Code
              </label>
              <input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. a3f9b21c"
                className="w-full px-4 py-3.5 rounded-xl border border-slate-300 text-base font-mono tracking-widest text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-center"
                maxLength={20}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md shadow-violet-600/30 transition-all disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Joining Team...</span>
                </>
              ) : (
                'Join Team'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Need to start a new workspace instead?{' '}
              <Link to="/teams/new" className="font-semibold text-violet-600 hover:text-violet-700">
                Create a team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
