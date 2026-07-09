/**
 * Returns the number of days in a given month.
 * @param year - The full year (e.g. 2024).
 * @param month - The month, 0-indexed (0 = January).
 */
export function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate()
}
