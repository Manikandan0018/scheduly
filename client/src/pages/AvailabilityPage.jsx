// pages/AvailabilityPage.jsx - Set weekly schedule
import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { getDayName } from '../utils/timeUtils'
import socket from "../services/socket";


const DAYS = [0,1,2,3,4,5,6]

const defaultSlot = () => ({ start: '09:00', end: '17:00' })

const defaultSchedule = () =>
  DAYS.map(day => ({
    day,
    isActive: day >= 1 && day <= 5, // Mon-Fri active by default
    slots: [defaultSlot()],
  }))

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState(defaultSchedule())
  const [meetingDuration, setMeetingDuration] = useState(30)
  const [bufferTime, setBufferTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    socket.on("availability-updated", (data) => {
      setSchedule(data.schedule);
      setMeetingDuration(data.meetingDuration);
      setBufferTime(data.bufferTime);
    });

    return () => socket.off("availability-updated");
  }, []);

  
  useEffect(() => {
    socket.on("availability-updated", (data) => {
      setSchedule(data.schedule);
      setMeetingDuration(data.meetingDuration);
      setBufferTime(data.bufferTime);
    });

    return () => socket.off("availability-updated");
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const { data } = await api.get('/availability/me')
        if (data.schedule && data.schedule.length > 0) {
          // Merge saved data into all 7 days
          const merged = defaultSchedule().map(def => {
            const saved = data.schedule.find(s => s.day === def.day)
            return saved ? { ...saved } : def
          })
          setSchedule(merged)
          setMeetingDuration(data.meetingDuration || 30)
          setBufferTime(data.bufferTime || 0)
        }
      } catch (err) {
        // No availability set yet - use defaults
      } finally {
        setLoading(false)
      }
    }
    fetchAvailability()
  }, [])

  const toggleDay = (dayIdx) => {
    setSchedule(prev => prev.map(d =>
      d.day === dayIdx ? { ...d, isActive: !d.isActive } : d
    ))
  }

  const updateSlot = (dayIdx, slotIdx, field, value) => {
    setSchedule(prev => prev.map(d => {
      if (d.day !== dayIdx) return d
      const slots = d.slots.map((s, i) => i === slotIdx ? { ...s, [field]: value } : s)
      return { ...d, slots }
    }))
  }

  const addSlot = (dayIdx) => {
    setSchedule(prev => prev.map(d =>
      d.day === dayIdx ? { ...d, slots: [...d.slots, defaultSlot()] } : d
    ))
  }

  const removeSlot = (dayIdx, slotIdx) => {
    setSchedule(prev => prev.map(d => {
      if (d.day !== dayIdx) return d
      return { ...d, slots: d.slots.filter((_, i) => i !== slotIdx) }
    }))
  }

  const handleSave = async () => {
    // Only send active days
    const activeSchedule = schedule.filter(d => d.isActive && d.slots.length > 0)
    setSaving(true)
    try {
      await api.post('/availability', { schedule: activeSchedule, meetingDuration, bufferTime })
      toast.success('Availability saved! ✅')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Set Availability</h1>
        <p className="text-zinc-500 text-sm">Configure which days and times people can book you.</p>
      </div>

      {/* Meeting settings */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-zinc-800 mb-4">Meeting Settings</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-2">Meeting Duration</label>
            <select value={meetingDuration} onChange={e => setMeetingDuration(Number(e.target.value))} className="input-field">
              {[15, 30, 45, 60, 90].map(m => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-600 mb-2">Buffer Between Meetings</label>
            <select value={bufferTime} onChange={e => setBufferTime(Number(e.target.value))} className="input-field">
              {[0, 5, 10, 15, 30].map(m => (
                <option key={m} value={m}>{m === 0 ? 'None' : `${m} minutes`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Weekly schedule */}
      <div className="card overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="text-base font-semibold text-zinc-800">Weekly Schedule</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Times are stored in UTC. Visitors see them in their local timezone.</p>
        </div>
        <div className="divide-y divide-zinc-50">
          {schedule.map(({ day, isActive, slots }) => (
            <div key={day} className={`px-6 py-4 transition-colors ${isActive ? '' : 'bg-zinc-50/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Toggle */}
                  <button onClick={() => toggleDay(day)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-indigo-500' : 'bg-zinc-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className={`text-sm font-semibold ${isActive ? 'text-zinc-800' : 'text-zinc-400'}`}>
                    {getDayName(day)}
                  </span>
                </div>
                {isActive && (
                  <button onClick={() => addSlot(day)}
                    className="text-xs text-indigo-500 font-medium hover:text-indigo-700 transition-colors">
                    + Add slot
                  </button>
                )}
              </div>

              {isActive && (
                <div className="space-y-2 ml-13 pl-1">
                  {slots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" value={slot.start} className="input-field !w-auto !py-1.5 !px-3 text-sm"
                        onChange={e => updateSlot(day, i, 'start', e.target.value)} />
                      <span className="text-zinc-400 text-sm">to</span>
                      <input type="time" value={slot.end} className="input-field !w-auto !py-1.5 !px-3 text-sm"
                        onChange={e => updateSlot(day, i, 'end', e.target.value)} />
                      {slots.length > 1 && (
                        <button onClick={() => removeSlot(day, i)}
                          className="text-zinc-300 hover:text-red-500 transition-colors ml-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isActive && (
                <p className="text-xs text-zinc-400 ml-13 pl-1">Unavailable</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary px-8">
        {saving ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Saving...
          </span>
        ) : 'Save Availability'}
      </button>
    </div>
  )
}
