// pages/BookingPage.jsx - Public booking page at /book/:username
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { generateTimeSlots, formatTime, formatDateToString, isSlotBooked, getNext30Days, getDayName, getDayShort } from '../utils/timeUtils'
import socket from "../services/socket";


const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function BookingPage() {
  const { username } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [step, setStep] = useState(1) // 1=pick date/time, 2=fill form, 3=confirmed
  const [form, setForm] = useState({ name: '', email: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const next30 = getNext30Days()
  

  useEffect(() => {
    socket.on("availability-updated", (data) => {
      // only update if same user
      if (data.userId !== profileData?.user?._id) return;

      setProfileData((prev) => ({
        ...prev,
        availability: data,
      }));
    });

    return () => socket.off("availability-updated");
  }, [profileData]);

  
  useEffect(() => {
    socket.on("new-booking", (booking) => {
      setBookedSlots((prev) => [...prev, booking]);
    });

    return () => socket.off("new-booking");
  }, []);


  useEffect(() => {
    socket.on("new-booking", (booking) => {
      setBookedSlots((prev) => [...prev, booking]);
    });

    return () => socket.off("new-booking");
  }, []);

  // Load user profile & availability
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/availability/${username}`)
        setProfileData(data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'User not found')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  // When date is selected, compute available slots
  useEffect(() => {
    if (!selectedDate || !profileData) return
    const dayOfWeek = selectedDate.getDay()
    const { availability } = profileData
    const daySchedule = availability.schedule.find(s => s.day === dayOfWeek)

    if (!daySchedule || !daySchedule.isActive || !daySchedule.slots?.length) {
      setAvailableSlots([])
      return
    }

    // Generate all slots from each time range
    const allSlots = daySchedule.slots.flatMap(range =>
      generateTimeSlots(range.start, range.end, availability.meetingDuration, availability.bufferTime)
    )
    setAvailableSlots(allSlots)

    // Fetch already booked slots
    const fetchBooked = async () => {
      try {
        const { data } = await api.get('/bookings/slots', {
          params: { username, date: formatDateToString(selectedDate) }
        })
        setBookedSlots(data)
      } catch {
        setBookedSlots([])
      }
    }
    fetchBooked()
    setSelectedSlot(null)
  }, [selectedDate, profileData])

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return toast.error('Name and email are required')
    setSubmitting(true)
    try {
      await api.post('/bookings', {
        username,
        bookedByName: form.name,
        bookedByEmail: form.email,
        date: formatDateToString(selectedDate),
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        notes: form.notes,
      })
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  const isDayAvailable = (date) => {
    if (!profileData) return false
    const { schedule } = profileData.availability
    const d = schedule.find(s => s.day === date.getDay())
    return d && d.isActive && d.slots?.length > 0
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-zinc-800 mb-2">Page not found</h2>
        <p className="text-zinc-500">{error}</p>
      </div>
    </div>
  )

  const { user, availability } = profileData

  // Step 3 - Booking confirmed
  if (step === 3) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="card max-w-md w-full p-10 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Booking Confirmed!</h2>
        <p className="text-zinc-500 mb-6">
          Your meeting with <strong>{user.name}</strong> on{' '}
          <strong>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>{' '}
          at <strong>{formatTime(selectedSlot?.start)}</strong> is confirmed.
        </p>
        <p className="text-sm text-zinc-400 mb-6">A confirmation email has been sent to <strong>{form.email}</strong>.</p>
        <button onClick={() => { setStep(1); setSelectedDate(null); setSelectedSlot(null); setForm({ name:'',email:'',notes:'' }) }}
          className="btn-primary w-full">
          Book another time
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="bg-white border-b border-zinc-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-bold">{user.name[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="font-bold text-zinc-900 text-sm">{user.name}</p>
            <p className="text-xs text-zinc-400">@{user.username}</p>
          </div>
          <div className="ml-auto text-right">
            <span className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full">
              {availability.meetingDuration} min meeting
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Book a time with {user.name}</h1>
          <p className="text-zinc-500 text-sm">Select an available date and time slot below.</p>
        </div>

        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-zinc-700 mb-4">Select a Date</h2>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S','M','T','W','T','F','S'].map((d,i) => (
                  <div key={i} className="text-center text-xs font-medium text-zinc-400 py-1">{d}</div>
                ))}
              </div>
              {/* Show next 30 days in a grid */}
              <div className="space-y-2">
                {/* Group by week */}
                {(() => {
                  const weeks = []
                  const start = next30[0]
                  // Add empty cells before start
                  const startDay = start.getDay()
                  let curr = []
                  for (let i = 0; i < startDay; i++) curr.push(null)
                  next30.forEach(d => {
                    if (curr.length === 7) { weeks.push(curr); curr = [] }
                    curr.push(d)
                  })
                  while (curr.length < 7) curr.push(null)
                  weeks.push(curr)
                  return weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 gap-1">
                      {week.map((d, di) => {
                        if (!d) return <div key={di} />
                        const available = isDayAvailable(d)
                        const selected = selectedDate && d.toDateString() === selectedDate.toDateString()
                        const today = d.toDateString() === new Date().toDateString()
                        return (
                          <button key={di} disabled={!available}
                            onClick={() => { setSelectedDate(d); setStep(1) }}
                            className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                              selected ? 'bg-indigo-500 text-white shadow-sm' :
                              available ? 'hover:bg-indigo-50 text-zinc-700 hover:text-indigo-600' :
                              'text-zinc-300 cursor-not-allowed'
                            } ${today && !selected ? 'ring-1 ring-indigo-300' : ''}`}>
                            {d.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  ))
                })()}
              </div>
            </div>

            {/* Time slots */}
            <div className="card p-6">
              <h2 className="text-sm font-semibold text-zinc-700 mb-4">
                {selectedDate
                  ? `Available times — ${selectedDate.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}`
                  : 'Pick a date to see times'}
              </h2>
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-300">
                  <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">Select a date first</p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-zinc-300">
                  <p className="text-sm">No slots available this day</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                  {availableSlots.map(slot => {
                    const booked = isSlotBooked(slot, bookedSlots)
                    const selected = selectedSlot?.start === slot.start
                    return (
                      <button key={slot.start} disabled={booked}
                        onClick={() => { setSelectedSlot(slot); setStep(2) }}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                          booked ? 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed line-through' :
                          selected ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' :
                          'bg-white text-zinc-700 border-zinc-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}>
                        {formatTime(slot.start)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && selectedDate && selectedSlot && (
          <div className="max-w-md mx-auto">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to times
            </button>

            {/* Booking summary */}
            <div className="bg-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-indigo-900">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-indigo-600 text-sm">
                    {formatTime(selectedSlot.start)} – {formatTime(selectedSlot.end)} UTC · {availability.meetingDuration} min
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-5">Enter your details</h2>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Your name *</label>
                  <input type="text" placeholder="Jane Smith" className="input-field"
                    value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email address *</label>
                  <input type="email" placeholder="jane@example.com" className="input-field"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Notes <span className="text-zinc-400">(optional)</span></label>
                  <textarea placeholder="Anything you'd like to share..." rows={3} className="input-field resize-none"
                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Confirming...
                    </span>
                  ) : 'Confirm Booking'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
