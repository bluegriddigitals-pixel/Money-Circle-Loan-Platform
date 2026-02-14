import {
  format,
  parse,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInYears,
  addDays,
  addMonths,
  addYears,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

export class DateUtil {
  static readonly DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
  static readonly DEFAULT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
  static readonly DEFAULT_TIME_FORMAT = 'HH:mm:ss';

  /**
   * Format a date to string
   */
  static formatDate(date: Date | string, formatStr: string = this.DEFAULT_DATE_FORMAT): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
  }

  /**
   * Parse a date string to Date object
   */
  static parseDate(dateStr: string, formatStr: string = this.DEFAULT_DATE_FORMAT): Date {
    return parse(dateStr, formatStr, new Date());
  }

  /**
   * Get difference between two dates in specified unit
   */
  static getDifference(
    dateLeft: Date | string,
    dateRight: Date | string,
    unit: 'days' | 'hours' | 'minutes' | 'months' | 'years',
  ): number {
    const left = typeof dateLeft === 'string' ? new Date(dateLeft) : dateLeft;
    const right = typeof dateRight === 'string' ? new Date(dateRight) : dateRight;

    switch (unit) {
      case 'days':
        return differenceInDays(left, right);
      case 'hours':
        return differenceInHours(left, right);
      case 'minutes':
        return differenceInMinutes(left, right);
      case 'months':
        return differenceInMonths(left, right);
      case 'years':
        return differenceInYears(left, right);
      default:
        return 0;
    }
  }

  /**
   * Add time to a date
   */
  static add(
    date: Date | string,
    amount: number,
    unit: 'days' | 'months' | 'years',
  ): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    switch (unit) {
      case 'days':
        return addDays(dateObj, amount);
      case 'months':
        return addMonths(dateObj, amount);
      case 'years':
        return addYears(dateObj, amount);
      default:
        return dateObj;
    }
  }

  /**
   * Check if date is after another date
   */
  static isAfter(date: Date | string, dateToCompare: Date | string): boolean {
    const left = typeof date === 'string' ? new Date(date) : date;
    const right = typeof dateToCompare === 'string' ? new Date(dateToCompare) : dateToCompare;
    return isAfter(left, right);
  }

  /**
   * Check if date is before another date
   */
  static isBefore(date: Date | string, dateToCompare: Date | string): boolean {
    const left = typeof date === 'string' ? new Date(date) : date;
    const right = typeof dateToCompare === 'string' ? new Date(dateToCompare) : dateToCompare;
    return isBefore(left, right);
  }

  /**
   * Check if date is within an interval
   */
  static isWithin(
    date: Date | string,
    startDate: Date | string,
    endDate: Date | string,
  ): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    return isWithinInterval(dateObj, { start, end });
  }

  /**
   * Get start of day
   */
  static startOfDay(date: Date | string = new Date()): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return startOfDay(dateObj);
  }

  /**
   * Get end of day
   */
  static endOfDay(date: Date | string = new Date()): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return endOfDay(dateObj);
  }

  /**
   * Get start of month
   */
  static startOfMonth(date: Date | string = new Date()): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return startOfMonth(dateObj);
  }

  /**
   * Get end of month
   */
  static endOfMonth(date: Date | string = new Date()): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return endOfMonth(dateObj);
  }

  /**
   * Get start of year
   */
  static startOfYear(date: Date | string = new Date()): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return startOfYear(dateObj);
  }

  /**
   * Get end of year
   */
  static endOfYear(date: Date | string = new Date()): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return endOfYear(dateObj);
  }

  /**
   * Check if a date is valid
   */
  static isValidDate(date: any): boolean {
    if (!date) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  /**
   * Calculate age from date of birth
   */
  static calculateAge(dateOfBirth: Date | string): number {
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    return differenceInYears(new Date(), dob);
  }

  /**
   * Get business days between two dates (excluding weekends)
   */
  static getBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }
}