import React from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout({ children }) {
  const { teamId } = useParams()
  const location = useLocation()

  const isTeamRoute = Boolean(teamId)

  // Subnav tabs if inside a team context
  const teamTabs = teamId
    ? [
        { label: 'Overview', path: `/teams/${teamId}`, exact: true },
        { label: 'Projects', path: `/teams/${teamId}/projects` },
        { label: 'Activity Feed', path: `/teams/${teamId}/activity` },
        { label: 'Contribution Report', path: `/teams/${teamId}/report` },
      ]
    : []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />

      {/* Team Context Secondary Navigation Bar */}
      {isTeamRoute && (
        <div className="bg-slate-900/95 border-b border-slate-800 text-slate-300 backdrop-blur-xs no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none">
              {teamTabs.map((tab) => {
                const isActive = tab.exact
                  ? location.pathname === tab.path
                  : location.pathname.startsWith(tab.path)
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} TeamProof. Built for radical contribution transparency.</p>
        </div>
      </footer>
    </div>
  )
}
