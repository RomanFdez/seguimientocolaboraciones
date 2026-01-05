import { describe, it, expect } from 'vitest';
import { formatDate, isCurrentMonth, formatMonthYear, timestampToDate } from '../../utils/dateHelpers';

describe('dateHelpers', () => {
    describe('formatDate', () => {
        it('formats a date string correctly', () => {
            const date = '2026-01-15';
            const result = formatDate(date);
            expect(result).toBe('15/01/2026');
        });

        it('formats a Date object correctly', () => {
            const date = new Date(2026, 0, 15);
            const result = formatDate(date);
            expect(result).toBe('15/01/2026');
        });

        it('handles invalid dates gracefully', () => {
            const result = formatDate('invalid-date');
            expect(result).toBe('');
        });

        it('handles null/undefined gracefully', () => {
            expect(formatDate(null)).toBe('');
            expect(formatDate(undefined)).toBe('');
        });

        it('accepts custom format string', () => {
            const date = new Date(2026, 0, 15);
            const result = formatDate(date, 'yyyy-MM-dd');
            expect(result).toBe('2026-01-15');
        });
    });

    describe('isCurrentMonth', () => {
        it('returns true for current month', () => {
            const now = new Date();
            expect(isCurrentMonth(now)).toBe(true);
        });

        it('returns false for past month', () => {
            const pastDate = new Date();
            pastDate.setMonth(pastDate.getMonth() - 1);
            expect(isCurrentMonth(pastDate)).toBe(false);
        });

        it('returns false for future month', () => {
            const futureDate = new Date();
            futureDate.setMonth(futureDate.getMonth() + 1);
            expect(isCurrentMonth(futureDate)).toBe(false);
        });

        it('handles string dates', () => {
            const now = new Date();
            const dateString = now.toISOString();
            expect(isCurrentMonth(dateString)).toBe(true);
        });

        it('returns false for null/undefined', () => {
            expect(isCurrentMonth(null)).toBe(false);
            expect(isCurrentMonth(undefined)).toBe(false);
        });
    });

    describe('formatMonthYear', () => {
        it('formats month and year correctly', () => {
            const date = new Date(2026, 0, 15);
            const result = formatMonthYear(date);
            expect(result).toMatch(/enero.*2026/i);
        });

        it('handles empty date', () => {
            expect(formatMonthYear(null)).toBe('');
        });
    });

    describe('timestampToDate', () => {
        it('converts Firestore timestamp to Date', () => {
            const mockTimestamp = {
                toDate: () => new Date(2026, 0, 15),
            };
            const result = timestampToDate(mockTimestamp);
            expect(result).toBeInstanceOf(Date);
        });

        it('handles regular Date object', () => {
            const date = new Date(2026, 0, 15);
            const result = timestampToDate(date);
            expect(result).toBeInstanceOf(Date);
        });

        it('returns null for null input', () => {
            expect(timestampToDate(null)).toBe(null);
        });
    });
});
