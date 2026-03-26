// pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.username || !form.password) {
      return toast.error('Please fill in all fields')
    }
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!/^[a-z0-9_]+$/.test(form.username)) {
      return toast.error('Username: only lowercase letters, numbers, and underscores')
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.token, data.user)
      toast.success('Account created! Welcome to Scheduly 🎉')
      navigate('/availability')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm({...form, [key]: e.target.value})

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-900 p-12">
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Start scheduling smarter in minutes
          </h2>
          <p className="text-zinc-400 text-lg mb-8">
            Free forever for individuals.
          </p>
          <div className="space-y-3">
            {[
              "Set your weekly availability",
              "Get a personal booking link",
              "Zero double bookings, guaranteed",
              "Email confirmations for every booking",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-zinc-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-zinc-600 text-sm">© 2025 Scheduly. Built with ❤️</p>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 mb-12 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-black mb-12 font-bold text-lg">Scheduly</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              Create account
            </h1>
            <p className="text-zinc-500">
              Get your scheduling link in under 2 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  className="input-field"
                  value={form.name}
                  onChange={set("name")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="janesmith"
                  className="input-field"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value.toLowerCase() })
                  }
                />
                <p className="text-xs text-zinc-400 mt-1">
                  /book/<strong>{form.username || "you"}</strong>
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-field"
                value={form.email}
                onChange={set("email")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                className="input-field"
                value={form.password}
                onChange={set("password")}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-500 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
