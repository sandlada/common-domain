import { DomainError } from '../primitives/domain-error.js'

export class GenderError extends DomainError {
    public readonly code: string

    private constructor(code: string, message: string) {
        super(message)
        this.code = code
    }

    public static InvalidValue(value: string): GenderError {
        return new GenderError(
            'InvalidValue',
            `Invalid gender value: '${value}'. Allowed values are: male, female, other, unknown.`,
        )
    }
}
