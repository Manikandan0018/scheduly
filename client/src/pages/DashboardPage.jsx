// pages/DashboardPage.jsx - View and manage all bookings
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import { formatTime, getDayName } from '../utils/timeUtils'
import socket from "../services/socket";

const statusBadge = {
  confirmed:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled:  'bg-red-50 text-red-600 border border-red-200',
  completed:  'bg-zinc-100 text-zinc-500 border border-zinc-200',
}

const formatBookingDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming')

  useEffect(() => {
    socket.on("new-booking", (booking) => {
      setBookings((prev) => [booking, ...prev]);
    });

    return () => socket.off("new-booking");
  }, []);
  
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("joinUserRoom", user._id);

    socket.on("new-booking", (booking) => {
      setBookings((prev) => [booking, ...prev]);
    });

    socket.on("booking-cancelled", (updated) => {
      setBookings((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b)),
      );
    });

    return () => {
      socket.off("new-booking");
      socket.off("booking-cancelled");
    };
  }, [user]);

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my')
      setBookings(data)
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await api.patch(`/bookings/${id}/cancel`)
      toast.success('Booking cancelled')
      setBookings(prev => prev.map(b => b._id === id ? {...b, status: 'cancelled'} : b))
    } catch (err) {
      toast.error('Failed to cancel booking')
    }
  }

  const today = new Date(); today.setHours(0,0,0,0)

  const filtered = bookings.filter(b => {
    const bDate = new Date(b.date); bDate.setHours(0,0,0,0)
    if (filter === 'upcoming') return bDate >= today && b.status === 'confirmed'
    if (filter === 'past') return bDate < today || b.status === 'completed'
    if (filter === 'cancelled') return b.status === 'cancelled'
    return true
  })

  const upcoming = bookings.filter(b => new Date(b.date) >= today && b.status === 'confirmed').length
  const total = bookings.length
  const bookingLink = `${window.location.origin}/book/${user?.username}`

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink)
    toast.success('Booking link copied!')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Manage all your bookings from here.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Upcoming', value: upcoming, color: 'text-indigo-600' },
          { label: 'Total Bookings', value: total, color: 'text-zinc-900' },
          { label: 'Your Username', value: `@${user?.username}`, color: 'text-zinc-600', small: true },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <p className="text-xs text-zinc-400 font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} ${s.small ? '!text-base' : ''}`}>{s.value}</p>
          </div>
        ))}
        {/* Share link card */}
        <div className="card p-5 bg-indigo-500 border-0">
          <p className="text-xs text-indigo-200 font-medium mb-1">Booking Link</p>
          <button onClick={copyLink} className="text-white text-sm font-semibold hover:underline truncate block w-full text-left">
            Copy link →
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Link to="/availability" className="btn-primary text-sm">
          + Set Availability
        </Link>
        <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
          Preview Booking Page ↗
        </a>
      </div>

      {/* Bookings table */}
      <div className="card overflow-hidden">
        {/* Filter tabs */}
        <div className="border-b border-zinc-100 px-6 pt-5 flex gap-1">
          {['upcoming', 'past', 'cancelled', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize transition-colors ${
                filter === f ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-700'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-zinc-500 font-medium">No bookings here yet</p>
            <p className="text-zinc-400 text-sm mt-1">Share your link to start receiving bookings</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {filtered.map(booking => (
              <div key={booking._id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 text-sm font-bold">{booking.bookedByName?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 truncate">{booking.bookedByName}</p>
                    <p className="text-xs text-zinc-400 truncate">{booking.bookedByEmail}</p>
                  </div>
                </div>
                <div className="hidden sm:block text-center">
                  <p className="text-sm font-medium text-zinc-700">{formatBookingDate(booking.date)}</p>
                  <p className="text-xs text-zinc-400">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge[booking.status]}`}>
                    {booking.status}
                  </span>
                  {booking.status === 'confirmed' && (
                    <button onClick={() => cancelBooking(booking._id)} className="btn-danger text-xs px-3 py-1.5">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
