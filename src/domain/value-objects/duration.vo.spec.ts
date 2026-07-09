import { describe, it, expect } from 'vitest'
import { Duration } from './duration.vo.js'
import { DurationError } from '../errors/duration.error.js'

describe('Duration', () => {
    // ========================================================================
    //  Construction — single number (seconds)
    // ========================================================================

    describe('From — single number (seconds)', () => {
        it('should create a duration from positive seconds', () => {
            const result = Duration.From(60)
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(60)
                expect(result.value.totalMonths).toBe(0)
            }
        })

        it('should create a duration from negative seconds', () => {
            const result = Duration.From(-60)
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(-60)
                expect(result.value.totalMonths).toBe(0)
            }
        })

        it('should create a zero duration from 0', () => {
            const result = Duration.From(0)
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.isZero).toBe(true)
            }
        })

        it('should reject NaN', () => {
            const result = Duration.From(NaN)
            expect(result.isFailure).toBe(true)
            if (result.isFailure) {
                expect(result.error).toBeInstanceOf(DurationError)
                expect(result.error.code).toBe('InvalidValue')
            }
        })

        it('should reject Infinity', () => {
            const result = Duration.From(Infinity)
            expect(result.isFailure).toBe(true)
            if (result.isFailure) {
                expect(result.error).toBeInstanceOf(DurationError)
            }
        })

        it('should reject -Infinity', () => {
            const result = Duration.From(-Infinity)
            expect(result.isFailure).toBe(true)
            if (result.isFailure) {
                expect(result.error).toBeInstanceOf(DurationError)
            }
        })

        it('should accept fractional seconds', () => {
            const result = Duration.From(1.5)
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(1.5)
            }
        })
    })

    // ========================================================================
    //  Construction — positional (varargs)
    // ========================================================================

    describe('From — positional varargs', () => {
        it('should parse [hours, minutes, seconds] with 3 args', () => {
            const result = Duration.From(2, 1, 60)
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                // 2*3600 + 1*60 + 60 = 7200 + 60 + 60 = 7320
                expect(result.value.totalSeconds).toBe(7320)
            }
        })

        it('should parse [minutes, seconds] with 2 args', () => {
            const result = Duration.From(1, 60)
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                // 1*60 + 60 = 120
                expect(result.value.totalSeconds).toBe(120)
            }
        })

        it('should handle negative components independently', () => {
            // -1 hour + 10 seconds = -3590
            const result = Duration.From(-1, 0, 10)
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(-3590)
            }
        })

        it('should accept fractional minutes', () => {
            const result = Duration.From(1.5, 30)
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                // 1.5*60 + 30 = 90 + 30 = 120
                expect(result.value.totalSeconds).toBe(120)
            }
        })

        it('should reject NaN in positional args', () => {
            const result = Duration.From(1, NaN)
            expect(result.isFailure).toBe(true)
        })
    })

    // ========================================================================
    //  Construction — array
    // ========================================================================

    describe('From — array', () => {
        it('should parse [seconds]', () => {
            const result = Duration.From([60])
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(60)
            }
        })

        it('should parse [minutes, seconds]', () => {
            const result = Duration.From([1, 60])
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(120)
            }
        })

        it('should parse [hours, minutes, seconds]', () => {
            const result = Duration.From([2, 1, 60])
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(7320)
            }
        })

        it('should handle negative array', () => {
            const result = Duration.From([-1, 0, 10])
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(-3590)
            }
        })

        it('should reject empty array', () => {
            const result = Duration.From([])
            expect(result.isFailure).toBe(true)
        })

        it('should reject array with more than 3 elements', () => {
            const result = Duration.From([1, 2, 3, 4])
            expect(result.isFailure).toBe(true)
        })

        it('should reject array with NaN', () => {
            const result = Duration.From([1, NaN])
            expect(result.isFailure).toBe(true)
        })
    })

    // ========================================================================
    //  Construction — object format
    // ========================================================================

    describe('From — object format', () => {
        it('should create from minutes', () => {
            const result = Duration.From({ minutes: -2 })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(-120)
            }
        })

        it('should combine hours and minutes', () => {
            const result = Duration.From({ hours: 2, minutes: 30 })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(9000)
            }
        })

        it('should handle calendar units (years, months)', () => {
            const result = Duration.From({ years: 1, months: 6 })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalMonths).toBe(18)
                expect(result.value.totalSeconds).toBe(0)
            }
        })

        it('should handle quarters', () => {
            const result = Duration.From({ quarters: 2 })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalMonths).toBe(6)
            }
        })

        it('should handle weeks', () => {
            const result = Duration.From({ weeks: 1 })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalSeconds).toBe(604800)
            }
        })

        it('should create zero duration from empty object', () => {
            const result = Duration.From({})
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.isZero).toBe(true)
            }
        })

        it('should combine all units', () => {
            const result = Duration.From({
                years: 1,
                quarters: 1,
                months: 2,
                weeks: 1,
                days: 3,
                hours: 4,
                minutes: 5,
                seconds: 6,
            })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value.totalMonths).toBe(12 + 3 + 2) // 17
                expect(result.value.totalSeconds).toBe(
                    604800 +       // 1 week
                    3 * 86400 +   // 3 days
                    4 * 3600 +    // 4 hours
                    5 * 60 +      // 5 minutes
                    6,            // 6 seconds
                )
            }
        })

        it('should reject NaN in any property', () => {
            const result = Duration.From({ minutes: NaN } as unknown as Record<string, unknown>)
            expect(result.isFailure).toBe(true)
        })

        it('should reject Infinity in any property', () => {
            const result = Duration.From({ hours: Infinity } as unknown as Record<string, unknown>)
            expect(result.isFailure).toBe(true)
        })
    })

    // ========================================================================
    //  Properties
    // ========================================================================

    describe('isZero', () => {
        it('should be true for zero duration', () => {
            expect(Duration.Zero.isZero).toBe(true)
        })

        it('should be false for non-zero duration', () => {
            const d = Duration.From(1)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                expect(d.value.isZero).toBe(false)
            }
        })
    })

    describe('isNegative', () => {
        it('should be true for negative seconds', () => {
            const d = Duration.From(-1)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                expect(d.value.isNegative).toBe(true)
            }
        })

        it('should be true for negative months', () => {
            const d = Duration.From({ months: -1 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                expect(d.value.isNegative).toBe(true)
            }
        })

        it('should be false for positive duration', () => {
            const d = Duration.From(60)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                expect(d.value.isNegative).toBe(false)
            }
        })

        it('should be false for zero duration', () => {
            expect(Duration.Zero.isNegative).toBe(false)
        })
    })

    // ========================================================================
    //  Arithmetic
    // ========================================================================

    describe('add', () => {
        it('should add two fixed-unit durations', () => {
            const a = Duration.From(60)
            const b = Duration.From(120)
            expect(a.isSuccess && b.isSuccess).toBe(true)
            if (a.isSuccess && b.isSuccess) {
                const sum = a.value.add(b.value)
                expect(sum.totalSeconds).toBe(180)
                expect(sum.totalMonths).toBe(0)
            }
        })

        it('should add two calendar-unit durations', () => {
            const a = Duration.From({ months: 1 })
            const b = Duration.From({ months: 2 })
            expect(a.isSuccess && b.isSuccess).toBe(true)
            if (a.isSuccess && b.isSuccess) {
                const sum = a.value.add(b.value)
                expect(sum.totalMonths).toBe(3)
            }
        })

        it('should be additive identity with Zero', () => {
            const d = Duration.From(60)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const sum = d.value.add(Duration.Zero)
                expect(sum.totalSeconds).toBe(60)
                expect(sum.equals(d.value)).toBe(true)
            }
        })
    })

    describe('subtract', () => {
        it('should subtract two fixed-unit durations', () => {
            const a = Duration.From(120)
            const b = Duration.From(60)
            expect(a.isSuccess && b.isSuccess).toBe(true)
            if (a.isSuccess && b.isSuccess) {
                const diff = a.value.subtract(b.value)
                expect(diff.totalSeconds).toBe(60)
            }
        })

        it('should work with calendar units', () => {
            const a = Duration.From({ months: 5 })
            const b = Duration.From({ months: 2 })
            expect(a.isSuccess && b.isSuccess).toBe(true)
            if (a.isSuccess && b.isSuccess) {
                const diff = a.value.subtract(b.value)
                expect(diff.totalMonths).toBe(3)
            }
        })
    })

    describe('negate', () => {
        it('should negate a positive duration', () => {
            const d = Duration.From(60)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const neg = d.value.negate()
                expect(neg.totalSeconds).toBe(-60)
                expect(neg.totalMonths).toBe(0)
            }
        })

        it('should negate a negative duration', () => {
            const d = Duration.From(-120)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const neg = d.value.negate()
                expect(neg.totalSeconds).toBe(120)
            }
        })

        it('should negate calendar units', () => {
            const d = Duration.From({ months: 3, seconds: 30 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const neg = d.value.negate()
                expect(neg.totalMonths).toBe(-3)
                expect(neg.totalSeconds).toBe(-30)
            }
        })

        it('should be self-inverse: negate twice returns original', () => {
            const d = Duration.From(60)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const doubleNeg = d.value.negate().negate()
                expect(doubleNeg.equals(d.value)).toBe(true)
            }
        })
    })

    // ========================================================================
    //  Equality
    // ========================================================================

    describe('equals', () => {
        it('should be true for same totalSeconds and totalMonths', () => {
            const a = Duration.From({ hours: 1, minutes: 30 })
            const b = Duration.From({ minutes: 90 })
            expect(a.isSuccess && b.isSuccess).toBe(true)
            if (a.isSuccess && b.isSuccess) {
                // Both are 5400 seconds, 0 months
                expect(a.value.equals(b.value)).toBe(true)
            }
        })

        it('should be false for different durations', () => {
            const a = Duration.From(60)
            const b = Duration.From(120)
            expect(a.isSuccess && b.isSuccess).toBe(true)
            if (a.isSuccess && b.isSuccess) {
                expect(a.value.equals(b.value)).toBe(false)
            }
        })

        it('should be true for Zero compared with Zero', () => {
            expect(Duration.Zero.equals(Duration.Zero)).toBe(true)
        })
    })

    // ========================================================================
    //  applyTo — Date arithmetic
    // ========================================================================

    describe('applyTo', () => {
        it('should add seconds to a date', () => {
            const date = new Date(2024, 0, 1, 12, 0, 0)
            const d = Duration.From(3600)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const result = d.value.applyTo(date)
                expect(result.getHours()).toBe(13)
                expect(result.getMinutes()).toBe(0)
            }
        })

        it('should not mutate the original date', () => {
            const date = new Date(2024, 0, 1)
            const d = Duration.From(3600)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                d.value.applyTo(date)
                expect(date.getTime()).toBe(new Date(2024, 0, 1).getTime())
            }
        })

        it('should add a month with day clamping (Jan 31 + 1mo)', () => {
            const date = new Date(2024, 0, 31) // Jan 31, 2024
            const d = Duration.From({ months: 1 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const result = d.value.applyTo(date)
                // Feb 2024 has 29 days (leap year)
                expect(result.getMonth()).toBe(1) // February
                expect(result.getDate()).toBe(29)
                expect(result.getFullYear()).toBe(2024)
            }
        })

        it('should clamp to Feb 28 in non-leap year (Jan 31 + 1mo, 2023)', () => {
            const date = new Date(2023, 0, 31) // Jan 31, 2023
            const d = Duration.From({ months: 1 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const result = d.value.applyTo(date)
                expect(result.getMonth()).toBe(1) // February
                expect(result.getDate()).toBe(28)
                expect(result.getFullYear()).toBe(2023)
            }
        })

        it('should clamp when subtracting month from Mar 31', () => {
            const date = new Date(2024, 2, 31) // Mar 31, 2024
            const d = Duration.From({ months: -1 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const result = d.value.applyTo(date)
                // Feb 2024 has 29 days
                expect(result.getMonth()).toBe(1) // February
                expect(result.getDate()).toBe(29)
            }
        })

        it('should handle leap year correctly (Feb 28, 2024 + 1mo)', () => {
            const date = new Date(2024, 1, 28) // Feb 28, 2024
            const d = Duration.From({ months: 1 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const result = d.value.applyTo(date)
                expect(result.getMonth()).toBe(2) // March
                expect(result.getDate()).toBe(28)
            }
        })

        it('should add years', () => {
            const date = new Date(2024, 5, 15) // Jun 15, 2024
            const d = Duration.From({ years: 2 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const result = d.value.applyTo(date)
                expect(result.getFullYear()).toBe(2026)
                expect(result.getMonth()).toBe(5)
                expect(result.getDate()).toBe(15)
            }
        })

        it('should add negative (subtract) months', () => {
            const date = new Date(2024, 5, 15) // Jun 15, 2024
            const d = Duration.From({ months: -3 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const result = d.value.applyTo(date)
                expect(result.getMonth()).toBe(2) // March
                expect(result.getDate()).toBe(15)
                expect(result.getFullYear()).toBe(2024)
            }
        })

        it('should combine calendar and fixed units', () => {
            const date = new Date(2024, 0, 1, 12, 0, 0)
            const d = Duration.From({ months: 1, hours: 2 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const result = d.value.applyTo(date)
                expect(result.getMonth()).toBe(1) // February
                expect(result.getDate()).toBe(1)
                expect(result.getHours()).toBe(14)
            }
        })
    })

    // ========================================================================
    //  toString
    // ========================================================================

    describe('toString', () => {
        it('should show "0s" for zero', () => {
            expect(Duration.Zero.toString()).toBe('0s')
        })

        it('should format seconds only', () => {
            const d = Duration.From(45)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                expect(d.value.toString()).toBe('45s')
            }
        })

        it('should format minutes and seconds', () => {
            const d = Duration.From({ minutes: 2, seconds: 30 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                expect(d.value.toString()).toBe('2m 30s')
            }
        })

        it('should format hours and minutes', () => {
            const d = Duration.From({ hours: 1, minutes: 15 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                expect(d.value.toString()).toBe('1h 15m')
            }
        })

        it('should prefix negative durations with "-"', () => {
            const d = Duration.From(-3661)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                // 3661 = 1h 1m 1s
                expect(d.value.toString()).toBe('-1h 1m 1s')
            }
        })

        it('should include calendar units', () => {
            const d = Duration.From({ years: 1, months: 6, days: 5 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                expect(d.value.toString()).toBe('1y 6mo 5d')
            }
        })
    })

    // ========================================================================
    //  toJSON
    // ========================================================================

    describe('toJSON', () => {
        it('should roundtrip with From', () => {
            const d = Duration.From({ hours: 2, minutes: 30, months: 1 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const json = d.value.toJSON()
                const restored = Duration.From(json)
                expect(restored.isSuccess).toBe(true)
                if (restored.isSuccess) {
                    expect(restored.value.equals(d.value)).toBe(true)
                }
            }
        })

        it('should decompose months into years + months', () => {
            const d = Duration.From({ months: 14 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const json = d.value.toJSON()
                expect(json.years).toBe(1)
                expect(json.months).toBe(2)
            }
        })

        it('should decompose seconds into weeks/days/hours/minutes', () => {
            const d = Duration.From({ seconds: 90061 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const json = d.value.toJSON()
                // 1d = 86400, remainder 3661 = 1h 1m 1s
                expect(json.days).toBe(1)
                expect(json.hours).toBe(1)
                expect(json.minutes).toBe(1)
                expect(json.seconds).toBe(1)
            }
        })

        it('should return empty object for zero', () => {
            const json = Duration.Zero.toJSON()
            expect(Object.keys(json).length).toBe(0)
        })

        it('should handle negative values', () => {
            const d = Duration.From(-3661)
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const json = d.value.toJSON()
                expect(json.hours).toBe(-1)
                expect(json.minutes).toBe(-1)
                expect(json.seconds).toBe(-1)
            }
        })

        it('should be serializable via JSON.stringify', () => {
            const d = Duration.From({ hours: 1, minutes: 30 })
            expect(d.isSuccess).toBe(true)
            if (d.isSuccess) {
                const serialized = JSON.stringify(d.value)
                const parsed = JSON.parse(serialized)
                const restored = Duration.From(parsed)
                expect(restored.isSuccess).toBe(true)
                if (restored.isSuccess) {
                    expect(restored.value.equals(d.value)).toBe(true)
                }
            }
        })
    })

    // ========================================================================
    //  Zero constant
    // ========================================================================

    describe('Zero', () => {
        it('should be a zero duration', () => {
            expect(Duration.Zero.isZero).toBe(true)
            expect(Duration.Zero.totalSeconds).toBe(0)
            expect(Duration.Zero.totalMonths).toBe(0)
        })

        it('should be a singleton', () => {
            expect(Duration.Zero).toBe(Duration.Zero)
        })
    })
})
