export declare class DateUtil {
    static readonly DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    static readonly DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    static readonly DEFAULT_TIME_FORMAT = "HH:mm:ss";
    static formatDate(date: Date | string, formatStr?: string): string;
    static parseDate(dateStr: string, formatStr?: string): Date;
    static getDifference(dateLeft: Date | string, dateRight: Date | string, unit: 'days' | 'hours' | 'minutes' | 'months' | 'years'): number;
    static add(date: Date | string, amount: number, unit: 'days' | 'months' | 'years'): Date;
    static isAfter(date: Date | string, dateToCompare: Date | string): boolean;
    static isBefore(date: Date | string, dateToCompare: Date | string): boolean;
    static isWithin(date: Date | string, startDate: Date | string, endDate: Date | string): boolean;
    static startOfDay(date?: Date | string): Date;
    static endOfDay(date?: Date | string): Date;
    static startOfMonth(date?: Date | string): Date;
    static endOfMonth(date?: Date | string): Date;
    static startOfYear(date?: Date | string): Date;
    static endOfYear(date?: Date | string): Date;
    static isValidDate(date: any): boolean;
    static calculateAge(dateOfBirth: Date | string): number;
    static getBusinessDays(startDate: Date, endDate: Date): number;
}
