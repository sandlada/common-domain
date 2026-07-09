import { ok, err } from '@sandlada/result'
import type { IResultOfT } from '@sandlada/result'
import { GenderError } from '../errors/gender.error.js'

export class Gender {
    public readonly value: string
    private readonly displayName: string

    // ---- Predefined instances ----

    /** Male */
    public static readonly Male = new Gender('male', 'Male')

    /** Female */
    public static readonly Female = new Gender('female', 'Female')

    /** Other */
    public static readonly Other = new Gender('other', 'Other')

    /** Unknown / not specified */
    public static readonly Unknown = new Gender('unknown', 'Unknown')

    // ---- Enumeration ----

    private static readonly _All: readonly Gender[] = [
        Gender.Male,
        Gender.Female,
        Gender.Other,
        Gender.Unknown,
    ]

    /** All valid Gender values. */
    public static get All(): readonly Gender[] {
        return Gender._All
    }

    // ---- Constructor ----

    private constructor(value: string, displayName: string) {
        this.value = value
        this.displayName = displayName
    }

    // ---- Factory ----

    /**
     * Creates a `Gender` from its string value.
     * Matching is case-sensitive.
     *
     * @param value - The raw value to match (e.g. `"male"`, `"female"`).
     * @returns `ok(Gender)` on match, or `err(GenderError)` if the value is unknown.
     */
    public static From(value: string): IResultOfT<Gender, GenderError> {
        const match = Gender._All.find(g => g.value === value)
        if (match) {
            return ok(match)
        }

        return err(GenderError.InvalidValue(value))
    }

    // ---- Display ----

    /** Returns the human-readable display name (e.g. `"Male"`, `"Female"`). */
    public toString(): string {
        return this.displayName
    }
}
