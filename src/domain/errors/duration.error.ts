import { DomainError } from '../primitives/domain-error.js'

export class DurationError extends DomainError {
    public readonly code: string

    private constructor(code: string, message: string) {
        super(message)
        this.code = code
    }

    public static InvalidValue(value: unknown, message?: string): DurationError {
        return new DurationError(
            'InvalidValue',
            message ?? `Invalid duration value: '${String(value)}'.`,
        )
    }
}
