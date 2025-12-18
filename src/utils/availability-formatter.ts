/**
 * Utility functions for formatting availability information
 * 
 * Converts between internal ISO 8601 format and user-readable year/month format
 */

/**
 * Month names for availability display
 */
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
] as const;

/**
 * Availability object as stored internally
 */
export interface InternalAvailability {
    ring: string;
    date: string | null;
}

/**
 * Availability object as returned to users
 */
export interface FormattedAvailability {
    ring: string;
    year?: number;
    month?: string;
}

/**
 * Get month name from month number (1-12)
 * 
 * @param monthNum Month number (1 = January, 12 = December)
 * @returns Month name, or empty string if invalid
 */
export function getMonthName(monthNum: number): string {
    if (monthNum < 1 || monthNum > 12) {
        return '';
    }
    return MONTH_NAMES[monthNum - 1];
}

/**
 * Format availability from internal ISO 8601 format to year/month
 * 
 * Converts:
 * - "2026-03-01" → { ring, year: 2026, month: "March" }
 * - null date → { ring }
 * - unexpected format → { ring, date }
 * 
 * @param availability Internal availability object
 * @returns Formatted availability object
 */
export function formatAvailability(availability: InternalAvailability): FormattedAvailability {
    if (!availability.date) {
        return { ring: availability.ring };
    }

    // Parse date: "2026-03-01" format
    // Extract year and month, convert to readable format
    const match = availability.date.match(/^(\d{4})-(\d{2})/);
    if (!match) {
        return { ring: availability.ring };
    }

    const year = parseInt(match[1], 10);
    const monthNum = parseInt(match[2], 10);
    const monthName = getMonthName(monthNum);

    return {
        ring: availability.ring,
        year,
        month: monthName,
    };
}

/**
 * Format multiple availabilities at once
 * 
 * @param availabilities Array of internal availability objects
 * @returns Array of formatted availability objects
 */
export function formatAvailabilities(availabilities: InternalAvailability[]): FormattedAvailability[] {
    return availabilities.map(formatAvailability);
}
