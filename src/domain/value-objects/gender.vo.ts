import { ok, err } from '@sandlada/result'
import type { IResultOfT } from '@sandlada/result'
import { GenderError } from '../errors/gender.error.js'

export interface IGenderConstructorArgs {
    readonly value: string
    readonly displayName: string
}

export class Gender {

    /* #region Properties */
    public readonly value: string
    public readonly displayName: string
    /* #endregion */

    /* #region Start Enums */
    public static readonly Male = new Gender({ value: 'male', displayName: 'Male' })
    public static readonly Female = new Gender({ value: 'female', displayName: 'Female' })
    public static readonly Other = new Gender({ value: 'other', displayName: 'Other' })
    public static readonly Unknown = new Gender({ value: 'unknown', displayName: 'Unknown' })
    /* #endregion */

    public static readonly All: readonly Gender[] = [
        Gender.Male,
        Gender.Female,
        Gender.Other,
        Gender.Unknown,
    ]

    /* #region Constructors */
    private constructor(args: IGenderConstructorArgs) {
        this.value = args.value
        this.displayName = args.displayName
    }
    public static From(args: IGenderConstructorArgs): IResultOfT<Gender, GenderError> {
        const match = Gender.All.find(g => g.value === args.value)
        if (match) {
            return ok(match)
        }

        return err(GenderError.InvalidValue(args.value))
    }
    /* #endregion */

    /** Returns the human-readable display name (e.g. `"Male"`, `"Female"`). */
    public toString(): string {
        return this.displayName
    }
}
