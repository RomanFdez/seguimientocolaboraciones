import { format, isThisMonth, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Check if a date is in the current month
 */
export const isCurrentMonth = (date) => {
    if (!date) return false;
    try {
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        if (isNaN(dateObj.getTime())) return false;
        return isThisMonth(dateObj);
    } catch (e) {
        return false;
    }
};

/**
 * Format a date for display
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
    if (!date) return '';
    try {
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        return format(dateObj, formatStr, { locale: es });
    } catch (e) {
        return '';
    }
};

/**
 * Format a date for month/year display
 */
export const formatMonthYear = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return format(dateObj, 'MMMM yyyy', { locale: es });
};

/**
 * Get the start and end of current month
 */
export const getCurrentMonthRange = () => {
    const now = new Date();
    return {
        start: startOfMonth(now),
        end: endOfMonth(now),
    };
};

/**
 * Get months of the current year
 */
export const getMonthsOfYear = (year = new Date().getFullYear()) => {
    const months = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date(year, i, 1);
        months.push({
            index: i,
            name: format(date, 'MMMM', { locale: es }),
            shortName: format(date, 'MMM', { locale: es }),
            date,
        });
    }
    return months;
};

/**
 * Convert Firestore Timestamp to Date
 */
export const timestampToDate = (timestamp) => {
    if (!timestamp) return null;
    return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
};
