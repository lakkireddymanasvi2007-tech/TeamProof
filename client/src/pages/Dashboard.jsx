import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function Dashboard() {
  const { user } = useAuth()
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTeams = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api('/api/teams')
      // Ensure array
      const teamList = Array.isArray(data) ? data : data.teams || []
      setTeams(teamList)
    } catch (err) {
      setError(err.message || 'Failed to load your teams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 top-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-3 border border-violet-500/30">
                Workspace Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Teammate'} 👋
              </h1>
              <p className="mt-1 text-slate-300 text-sm max-w-xl">
                Track your commitments, attach evidence to tasks, and ensure everyone's contributions are fairly recorded.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/teams/join"
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Join Team
              </Link>
              <Link
                to="/teams/new"
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold shadow-md shadow-violet-600/30 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create Team
              </Link>
            </div>
          </div>
        </div>

        {/* Teams List Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Teams</h2>
              <p className="text-xs text-slate-500">Workspaces you have created or joined</p>
            </div>
            {teams.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner message="Fetching your teams..." />
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700">
              <p className="font-semibold mb-2">Could not load teams</p>
              <p className="text-xs mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchTeams}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : teams.length === 0 ? (
            <EmptyState
              title="No teams joined yet"
              description="Create a new team to organize your next project, or enter an invite code to join an existing group."
              actionLabel="Create a Team"
              onAction={() => (window.location.href = '/teams/new')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => {
                const teamId = team.id || team._id
                const memberCount =
                  team.memberCount !== undefined
                    ? team.memberCount
                    : Array.isArray(team.members)
                    ? team.members.length
                    : 1

                return (
                  <Link
                    key={teamId}
                    to={`/teams/${teamId}`}
                    className="group bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-base border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                          {team.name ? team.name.charAt(0).toUpperCase() : 'T'}
                        </div>
                        {team.inviteCode && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            {team.inviteCode}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                        {team.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {team.description || 'No description provided for this team.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>
                          {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      <span className="font-semibold text-violet-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Open Workspace
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
