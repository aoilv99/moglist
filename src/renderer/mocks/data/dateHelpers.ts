import { addDays, setHours, setMinutes, startOfDay } from 'date-fns'

/** Returns an ISO datetime N days from now at the given hour/minute (defaults to 23:59). */
export function deadlineAt(daysFromNow: number, hour = 23, minute = 59): string {
  const base = setMinutes(setHours(startOfDay(addDays(new Date(), daysFromNow)), hour), minute)
  return base.toISOString()
}

export function nowIso(): string {
  return new Date().toISOString()
}
