// pages/LandingPage.jsx - Marketing homepage
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold text-zinc-900">Scheduly</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Sign in</Link>
          <Link to="/register" className="btn-primary text-sm">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-indigo-100">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Smart scheduling, zero friction
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-zinc-900 leading-tight mb-6 tracking-tight">
          Share your link.<br />
          <span className="text-indigo-500">Let people book you.</span>
        </h1>
        <p className="text-xl text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Set your availability once. Share your personal booking link. Let clients, teammates, 
          or friends schedule time with you — no back-and-forth emails.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary text-base px-8 py-3.5">
            Create your free account
          </Link>
          <Link to="/book/demo" className="btn-secondary text-base px-8 py-3.5">
            See a demo booking page
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-8">
        {[
          { icon: '🔗', title: 'Shareable Link', desc: 'Get your personal booking URL at /book/yourname to share anywhere.' },
          { icon: '🚫', title: 'No Double Booking', desc: 'Once a slot is taken, it disappears automatically for new visitors.' },
          { icon: '📊', title: 'Clean Dashboard', desc: 'See all your upcoming meetings in one organized, beautiful view.' },
        ].map((f) => (
          <div key={f.title} className="card p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-base font-bold text-zinc-900 mb-1.5">{f.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
