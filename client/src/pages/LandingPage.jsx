import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function LandingPage() {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide uppercase mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Radical Contribution Transparency
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Your Team's Work, <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Indisputably Proven.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 mb-10 leading-relaxed">
            Eliminate guesswork, free-riders, and invisible heroics. TeamProof turns task completions
            into verified, evidence-backed records with git commits, live URLs, and automated audits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-600/30 transition-all hover:scale-105 active:scale-95 text-center"
            >
              Get Started Free
            </Link>
            <button
              type="button"
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors text-center cursor-pointer"
            >
              Learn More
            </button>
          </div>

          {/* Hero Feature Visual Snippet */}
          <div className="mt-16 p-2 rounded-2xl bg-gradient-to-b from-slate-700/40 to-slate-800/40 border border-slate-700/60 shadow-2xl shadow-violet-950/40 max-w-4xl mx-auto">
            <div className="bg-slate-900 rounded-xl p-5 sm:p-7 border border-slate-800/80 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">Verified Task Proof #104</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Proof Attached
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <h4 className="text-lg font-bold text-white">Implement JWT Authentication & Cookie Storage</h4>
                  <p className="text-sm text-slate-400">Completed by Alex Chen with verified PR review & test suite run.</p>
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-slate-800 text-violet-300 px-2.5 py-1 rounded-md border border-slate-700">PR #42 (Merged)</span>
                    <span className="bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-md border border-slate-700">Passed 24/24 Tests</span>
                  </div>
                </div>
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 flex flex-col justify-center">
                  <span className="text-xs text-slate-400">Health Audit</span>
                  <span className="text-lg font-bold text-emerald-400">100% Verified</span>
                  <span className="text-xs text-slate-500">Auto-logged in activity stream</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section (White Background) */}
      <section className="py-20 bg-white text-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">The Problem</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Group projects are broken by asymmetric effort.
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              When work happens silently, contributions become contested, accountability evaporates, and grades or reputations suffer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Unfair Work Distribution</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                One or two teammates pull all-nighters carrying the load while others claim equal credit without producing verifiable deliverables.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Invisible Contributions</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Crucial unglamorous tasks—debugging, CI setup, documentation, refactoring—go unnoticed by managers and professors.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Late & Silent Blockers</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Problems stay hidden until hours before the final deadline. Without instant blocker flagging, entire project delivery chains collapse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-slate-50 text-slate-900 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">The Solution</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A single source of truth for work done.
            </h3>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              TeamProof replaces unverified claims with cryptographic clarity and tangible proof links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-3xl font-extrabold text-violet-600 mb-4 block">01</span>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Proof of Contribution</h4>
              <p className="text-sm text-slate-600">
                Marking a task 'Done' prompts for artifact evidence (Figma, GitHub PR, Loom video, or docs) and a concise summary.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-3xl font-extrabold text-violet-600 mb-4 block">02</span>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Real-Time Blocker Radar</h4>
              <p className="text-sm text-slate-600">
                Team members register roadblocks instantly. The team dashboard flags blocked pipelines before milestones are threatened.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-3xl font-extrabold text-violet-600 mb-4 block">03</span>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Printable Audit Reports</h4>
              <p className="text-sm text-slate-600">
                Export comprehensive, tamper-evident contribution dossiers for instructors, team leads, or project portfolio reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">Core Features</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for velocity and accountability
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/80 flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Team Workspaces</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Generate instant team invite codes. Onboard teammates in seconds with zero friction and manage owner and member access privileges.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/80 flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Visual Kanban Task Tracking</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Intuitive 4-stage kanban boards (Todo, In Progress, Blocked, Done) with priority highlights, assignee avatars, and countdown indicators.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/80 flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Proof of Contribution</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Attach permanent evidence links to every completed deliverable. Verify who wrote code, designed assets, or drafted specs.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/80 flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Automated Health Dashboard</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Calculates project health status (Healthy, At Risk, Critical) based on overdue deadlines, unresolved blockers, and evidence ratio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="py-20 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2">Built For You</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Designed for high-stakes collaborative environments
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-violet-500/50 transition-colors">
              <div className="text-3xl mb-3">🎓</div>
              <h4 className="font-bold text-white mb-1">College Projects</h4>
              <p className="text-xs text-slate-400">Prove fair individual marks to grading professors.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-violet-500/50 transition-colors">
              <div className="text-3xl mb-3">⚡</div>
              <h4 className="font-bold text-white mb-1">Hackathons</h4>
              <p className="text-xs text-slate-400">Keep velocity lightning-fast during 48-hour sprints.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-violet-500/50 transition-colors">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="font-bold text-white mb-1">Bootcamps</h4>
              <p className="text-xs text-slate-400">Build portfolio-ready evidence of production contributions.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center hover:border-violet-500/50 transition-colors">
              <div className="text-3xl mb-3">💼</div>
              <h4 className="font-bold text-white mb-1">Small Teams</h4>
              <p className="text-xs text-slate-400">Keep remote async team projects crystal clear and accountable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-tr from-violet-900 via-indigo-900 to-slate-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Start proving your contributions today.
          </h2>
          <p className="text-lg text-violet-200 mb-8 max-w-xl mx-auto">
            Join thousands of students and engineers demonstrating undeniable project value.
          </p>
          <Link
            to="/register"
            className="inline-block px-9 py-4 bg-white text-violet-900 hover:bg-slate-100 font-extrabold rounded-xl shadow-2xl transition-all hover:scale-105 active:scale-95 text-base"
          >
            Create Your First Team Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800 text-center text-slate-400 text-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="font-extrabold text-white text-base">TeamProof</span>
            <span className="text-slate-600">•</span>
            <span>Your Team's Work, Proven.</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} TeamProof Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
