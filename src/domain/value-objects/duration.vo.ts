import { ok, err } from '@sandlada/result'
import type { IResultOfT } from '@sandlada/result'
import { DurationError } from '../errors/duration.error.js'
import { isValidNumeric } from '../shared/is-valid-numeric.js'
import { clampDay } from '../shared/clamp-day.js'

const SecondsPerMinute = 60
const SecondsPerHour   = 60 * SecondsPerMinute
const SecondsPerDay    = 24 * SecondsPerHour
const SecondsPerWeek   = 7 * SecondsPerDay
const MonthsPerQuarter = 3
const MonthsPerYear    = 12

export interface IDurationConstructorArgs {
    readonly seconds ?: number
    readonly minutes ?: number
    readonly hours   ?: number
    readonly days    ?: number
    readonly weeks   ?: number
    readonly months  ?: number
    readonly quarters?: number
    readonly years   ?: number
}

export class Duration<T extends number | IDurationConstructorArgs | number[] = number> {
    /** @internal Phantom type to track construction args at the type level. */
    declare private readonly _brand: T

    public readonly totalSeconds: number
    public readonly totalMonths: number

    /** A zero-length duration. */
    public static readonly Zero: Duration = new Duration({})
    public static readonly OneMinute: Duration = new Duration({ seconds: 1 })

    private constructor(args: IDurationConstructorArgs) {
        const {
            seconds = 0, minutes = 0, hours = 0, days = 0, weeks = 0,
            months = 0, quarters = 0, years = 0,
        } = args

        // Normalize -0 to 0 for predictable equality checks
        this.totalSeconds = (seconds + minutes * SecondsPerMinute + hours * SecondsPerHour + days * SecondsPerDay + weeks * SecondsPerWeek) || 0
        this.totalMonths = (months + quarters * MonthsPerQuarter + years * MonthsPerYear) || 0
    }

    /** Creates a `Duration` from a single number representing seconds. */
    public static From<const T extends number>(value: T): IResultOfT<Duration<T>, DurationError>
    /** Creates a `Duration` from positional [minutes, seconds]. */
    public static From<const T extends number, const U extends number>(minutes: T, seconds: U): IResultOfT<Duration<{minutes: T; seconds: U}>, DurationError>
    /** Creates a `Duration` from positional [hours, minutes, seconds]. */
    public static From<const T extends number, const U extends number, const V extends number>(hours: T, minutes: U, seconds: V): IResultOfT<Duration<{hours: T; minutes: U; seconds: V}>, DurationError>
    /** Creates a `Duration` from an array [s], [m, s], or [h, m, s]. */
    public static From<const T extends number[]>(values: T): IResultOfT<Duration<T>, DurationError>
    /** Creates a `Duration` from a named arguments object. */
    public static From<const T extends IDurationConstructorArgs>(args: T): IResultOfT<Duration<T>, DurationError>

    public static From(
        arg0: number | number[] | IDurationConstructorArgs,
        arg1?: number,
        arg2?: number,
    ): IResultOfT<Duration<any>, DurationError> {
        // Single number → seconds
        if (typeof arg0 === 'number' && arg1 === undefined) {
            if (!isValidNumeric(arg0)) {
                return err(DurationError.InvalidValue(arg0, `Invalid seconds value: '${String(arg0)}'.`))
            }
            return ok(new Duration({ seconds: arg0 }))
        }

        // Positional: (hours, minutes, seconds) or (minutes, seconds)
        if (typeof arg0 === 'number' && typeof arg1 === 'number') {
            const values = [arg0, arg1]
            if (arg2 !== undefined) {
                values.push(arg2)
            }
            return Duration.fromPositional(values)
        }

        // Array
        if (Array.isArray(arg0)) {
            if (arg0.length === 0) {
                return err(DurationError.InvalidValue(arg0, 'Duration array must not be empty.'))
            }
            return Duration.fromPositional(arg0)
        }

        // Object
        if (typeof arg0 === 'object' && arg0 !== null) {
            return Duration.fromObject(arg0)
        }

        return err(DurationError.InvalidValue(arg0, 'Invalid duration input format.'))
    }

    private static fromPositional(values: number[]): IResultOfT<Duration, DurationError> {
        for (const v of values) {
            if (!isValidNumeric(v)) {
                return err(DurationError.InvalidValue(v, `Invalid duration value: '${String(v)}'.`))
            }
        }

        if (values.length === 1) {
            // [s]
            return ok(new Duration({ seconds: values[0]! }))
        }

        if (values.length === 2) {
            // [m, s]
            return ok(new Duration({ minutes: values[0]!, seconds: values[1]! }))
        }

        if (values.length === 3) {
            // [h, m, s]
            return ok(new Duration({ hours: values[0]!, minutes: values[1]!, seconds: values[2]! }))
        }

        return err(DurationError.InvalidValue(
            values,
            'Duration array must have 1-3 elements.',
        ))
    }

    private static fromObject(args: IDurationConstructorArgs): IResultOfT<Duration, DurationError> {
        const {
            seconds = 0,
            minutes = 0,
            hours = 0,
            days = 0,
            weeks = 0,
            months = 0,
            quarters = 0,
            years = 0,
        } = args

        const allValues: Record<string, number> = {
            seconds, minutes, hours, days, weeks, months, quarters, years,
        }
        for (const [key, value] of Object.entries(allValues)) {
            if (!isValidNumeric(value)) {
                return err(DurationError.InvalidValue(
                    value,
                    `Invalid duration '${key}': '${String(value)}'.`,
                ))
            }
        }

        return ok(new Duration(args))
    }

    // (totalSeconds and totalMonths are public readonly fields — see above)

    /** Whether this duration is zero-length. */
    public get isZero(): boolean {
        return this.totalSeconds === 0 && this.totalMonths === 0
    }

    /** Whether this duration is negative in either component. */
    public get isNegative(): boolean {
        return this.totalSeconds < 0 || this.totalMonths < 0
    }

    // ---- Arithmetic ----

    /**
     * Returns a new `Duration` that is the sum of this and the other.
     * Fixed and calendar components are added independently.
     */
    public add(other: Duration<number>): Duration<number> {
        return new Duration({
            seconds: this.totalSeconds + other.totalSeconds,
            months: this.totalMonths + other.totalMonths,
        })
    }

    /**
     * Returns a new `Duration` that is the difference of this and the other.
     */
    public subtract(other: Duration<number>): Duration<number> {
        return new Duration({
            seconds: this.totalSeconds - other.totalSeconds,
            months: this.totalMonths - other.totalMonths,
        })
    }

    /**
     * Returns a new `Duration` with both components negated.
     */
    public negate(): Duration<number> {
        return new Duration({
            seconds: -this.totalSeconds,
            months: -this.totalMonths,
        })
    }

    // ---- Date operations ----

    /**
     * Applies this duration to a Date.
     *
     * Calendar units (months, quarters, years) are applied first with automatic
     * day-clamping (e.g., Jan 31 + 1 month → Feb 28/29), then fixed units
     * (seconds, minutes, hours, days, weeks) are added as milliseconds.
     *
     * The original Date is not mutated.
     */
    public applyTo(date: Date): Date {
        const result = new Date(date)

        // Step 1: Apply calendar months (with day clamping)
        if (this.totalMonths !== 0) {
            const originalDay = result.getDate()
            let targetYear = result.getFullYear()
            let targetMonth = result.getMonth() + this.totalMonths

            targetYear += Math.floor(targetMonth / 12)
            targetMonth = ((targetMonth % 12) + 12) % 12

            const clampedDay = clampDay(targetYear, targetMonth, originalDay)
            result.setFullYear(targetYear, targetMonth, clampedDay)
        }

        // Step 2: Apply fixed seconds as milliseconds
        if (this.totalSeconds !== 0) {
            result.setTime(result.getTime() + this.totalSeconds * 1000)
        }

        return result
    }

    // ---- Equality ----

    /** Value equality check on both fixed and calendar components. */
    public equals(other: Duration<number>): boolean {
        return this.totalSeconds === other.totalSeconds
            && this.totalMonths === other.totalMonths
    }

    /** Returns a human-readable string representation (e.g. `"2h 30m"`, `"-1mo 15s"`). */
    public toString(): string {
        if (this.isZero) return '0s'

        const parts: string[] = []

        // Calendar components
        let months = Math.abs(this.totalMonths)
        const years = Math.floor(months / MonthsPerYear)
        months = months % MonthsPerYear

        if (years > 0) parts.push(`${years}y`)
        if (months > 0) parts.push(`${months}mo`)

        // Fixed components
        let remaining = Math.abs(this.totalSeconds)
        const weeks = Math.floor(remaining / SecondsPerWeek)
        remaining = remaining % SecondsPerWeek
        const days = Math.floor(remaining / SecondsPerDay)
        remaining = remaining % SecondsPerDay
        const hours = Math.floor(remaining / SecondsPerHour)
        remaining = remaining % SecondsPerHour
        const minutes = Math.floor(remaining / SecondsPerMinute)
        remaining = remaining % SecondsPerMinute
        const seconds = remaining

        if (weeks > 0) parts.push(`${weeks}w`)
        if (days > 0) parts.push(`${days}d`)
        if (hours > 0) parts.push(`${hours}h`)
        if (minutes > 0) parts.push(`${minutes}m`)
        if (seconds > 0) parts.push(`${seconds}s`)

        const sign = this.isNegative ? '-' : ''
        return sign + parts.join(' ')
    }

    public toJSON(): IDurationConstructorArgs {
        const result: Record<string, number> = {}

        let remainingMonths = this.totalMonths
        let remainingSeconds = this.totalSeconds

        if (Math.abs(remainingMonths) >= MonthsPerYear) {
            const years = Math.trunc(remainingMonths / MonthsPerYear)
            result.years = years
            remainingMonths -= years * MonthsPerYear
        }
        if (remainingMonths !== 0) {
            result.months = remainingMonths
        }

        if (Math.abs(remainingSeconds) >= SecondsPerWeek) {
            const weeks = Math.trunc(remainingSeconds / SecondsPerWeek)
            result.weeks = weeks
            remainingSeconds -= weeks * SecondsPerWeek
        }
        if (Math.abs(remainingSeconds) >= SecondsPerDay) {
            const days = Math.trunc(remainingSeconds / SecondsPerDay)
            result.days = days
            remainingSeconds -= days * SecondsPerDay
        }
        if (Math.abs(remainingSeconds) >= SecondsPerHour) {
            const hours = Math.trunc(remainingSeconds / SecondsPerHour)
            result.hours = hours
            remainingSeconds -= hours * SecondsPerHour
        }
        if (Math.abs(remainingSeconds) >= SecondsPerMinute) {
            const minutes = Math.trunc(remainingSeconds / SecondsPerMinute)
            result.minutes = minutes
            remainingSeconds -= minutes * SecondsPerMinute
        }
        if (remainingSeconds !== 0) {
            result.seconds = remainingSeconds
        }

        return result as IDurationConstructorArgs
    }
}
