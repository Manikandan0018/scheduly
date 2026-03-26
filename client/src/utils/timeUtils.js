// utils/timeUtils.js - Time slot generation and formatting helpers

/**
 * Generate time slots between start and end time with given duration
 * @param {string} start - "HH:MM" start time
 * @param {string} end   - "HH:MM" end time  
 * @param {number} duration - slot duration in minutes
 * @param {number} buffer - buffer between slots in minutes
 * @returns {Array} array of { start, end } objects
 */
export const generateTimeSlots = (start, end, duration = 30, buffer = 0) => {
  const slots = []
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)

  let current = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  while (current + duration <= endMinutes) {
    const slotStart = minutesToTime(current)
    const slotEnd = minutesToTime(current + duration)
    slots.push({ start: slotStart, end: slotEnd })
    current += duration + buffer
  }

  return slots
}

/**
 * Convert minutes since midnight to "HH:MM" string
 */
export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Format "HH:MM" to "h:MM AM/PM"
 */
export const formatTime = (time) => {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h % 12 || 12
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`
}

/**
 * Format a Date object to "YYYY-MM-DD"
 */
export const formatDateToString = (date) => {
  return date.toISOString().split('T')[0]
}

/**
 * Get the day name from a number (0 = Sunday)
 */
export const getDayName = (dayNum) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayNum]
}

/**
 * Get short day name
 */
export const getDayShort = (dayNum) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[dayNum]
}

/**
 * Check if a time slot is already booked
 */
export const isSlotBooked = (slot, bookedSlots) => {
  return bookedSlots.some((b) => b.startTime === slot.start)
}

/**
 * Get next 30 days as Date objects for the booking calendar
 */
export const getNext30Days = () => {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}
