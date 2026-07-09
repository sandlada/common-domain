import { daysInMonth } from './days-in-month.js'

/**
 * Clamps a day-of-month to the last valid day if it exceeds the month length.
 * @param year - The full year.
 * @param month - The month, 0-indexed (0 = January).
 * @param day - The desired day (1-based).
 * @returns The clamped day, never exceeding the month's actual length.
 */
export function clampDay(year: number, month: number, day: number): number {
    return Math.min(day, daysInMonth(year, month))
}
