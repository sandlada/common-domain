import { describe, it, expect } from 'vitest'
import { Gender } from './gender.vo.js'
import { GenderError } from '../errors/gender.error.js'

describe('Gender', () => {
    describe('static instances', () => {
        it('should have Male with value "male"', () => {
            expect(Gender.Male).toBeInstanceOf(Gender)
            expect(Gender.Male.value).toBe('male')
        })

        it('should have Female with value "female"', () => {
            expect(Gender.Female).toBeInstanceOf(Gender)
            expect(Gender.Female.value).toBe('female')
        })

        it('should have Other with value "other"', () => {
            expect(Gender.Other).toBeInstanceOf(Gender)
            expect(Gender.Other.value).toBe('other')
        })

        it('should have Unknown with value "unknown"', () => {
            expect(Gender.Unknown).toBeInstanceOf(Gender)
            expect(Gender.Unknown.value).toBe('unknown')
        })

        it('should have All return all 4 instances', () => {
            expect(Gender.All).toHaveLength(4)
            expect(Gender.All).toContain(Gender.Male)
            expect(Gender.All).toContain(Gender.Female)
            expect(Gender.All).toContain(Gender.Other)
            expect(Gender.All).toContain(Gender.Unknown)
        })
    })

    describe('From', () => {
        it('should return Male for "male"', () => {
            const result = Gender.From({ value: 'male', displayName: 'Male' })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value).toBe(Gender.Male)
            }
        })

        it('should return Female for "female"', () => {
            const result = Gender.From({ value: 'female', displayName: 'Female' })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value).toBe(Gender.Female)
            }
        })

        it('should return Other for "other"', () => {
            const result = Gender.From({ value: 'other', displayName: 'Other' })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value).toBe(Gender.Other)
            }
        })

        it('should return Unknown for "unknown"', () => {
            const result = Gender.From({ value: 'unknown', displayName: 'Unknown' })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value).toBe(Gender.Unknown)
            }
        })

        it('should use reference equality for cached instances', () => {
            const result = Gender.From({ value: 'male', displayName: 'Male' })
            expect(result.isSuccess).toBe(true)
            if (result.isSuccess) {
                expect(result.value).toBe(Gender.Male)
                expect(result.value === Gender.Male).toBe(true)
            }
        })

        it('should return error for invalid value', () => {
            const result = Gender.From({ value: 'invalid', displayName: 'Invalid' })
            expect(result.isFailure).toBe(true)
            if (result.isFailure) {
                expect(result.error).toBeInstanceOf(GenderError)
                expect(result.error.code).toBe('InvalidValue')
            }
        })

        it('should return error for empty string', () => {
            const result = Gender.From({ value: '', displayName: '' })
            expect(result.isFailure).toBe(true)
            if (result.isFailure) {
                expect(result.error).toBeInstanceOf(GenderError)
            }
        })

        it('should be case-sensitive', () => {
            const result = Gender.From({ value: 'MALE', displayName: 'Male' })
            expect(result.isFailure).toBe(true)
        })
    })

    describe('toString', () => {
        it('should return display name "Male" for Male', () => {
            expect(Gender.Male.toString()).toBe('Male')
        })

        it('should return display name "Female" for Female', () => {
            expect(Gender.Female.toString()).toBe('Female')
        })

        it('should return display name "Other" for Other', () => {
            expect(Gender.Other.toString()).toBe('Other')
        })

        it('should return display name "Unknown" for Unknown', () => {
            expect(Gender.Unknown.toString()).toBe('Unknown')
        })
    })
})
