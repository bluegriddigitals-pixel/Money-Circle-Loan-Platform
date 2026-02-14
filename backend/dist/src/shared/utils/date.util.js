"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtil = void 0;
const date_fns_1 = require("date-fns");
class DateUtil {
    static formatDate(date, formatStr = this.DEFAULT_DATE_FORMAT) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.format)(dateObj, formatStr);
    }
    static parseDate(dateStr, formatStr = this.DEFAULT_DATE_FORMAT) {
        return (0, date_fns_1.parse)(dateStr, formatStr, new Date());
    }
    static getDifference(dateLeft, dateRight, unit) {
        const left = typeof dateLeft === 'string' ? new Date(dateLeft) : dateLeft;
        const right = typeof dateRight === 'string' ? new Date(dateRight) : dateRight;
        switch (unit) {
            case 'days':
                return (0, date_fns_1.differenceInDays)(left, right);
            case 'hours':
                return (0, date_fns_1.differenceInHours)(left, right);
            case 'minutes':
                return (0, date_fns_1.differenceInMinutes)(left, right);
            case 'months':
                return (0, date_fns_1.differenceInMonths)(left, right);
            case 'years':
                return (0, date_fns_1.differenceInYears)(left, right);
            default:
                return 0;
        }
    }
    static add(date, amount, unit) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        switch (unit) {
            case 'days':
                return (0, date_fns_1.addDays)(dateObj, amount);
            case 'months':
                return (0, date_fns_1.addMonths)(dateObj, amount);
            case 'years':
                return (0, date_fns_1.addYears)(dateObj, amount);
            default:
                return dateObj;
        }
    }
    static isAfter(date, dateToCompare) {
        const left = typeof date === 'string' ? new Date(date) : date;
        const right = typeof dateToCompare === 'string' ? new Date(dateToCompare) : dateToCompare;
        return (0, date_fns_1.isAfter)(left, right);
    }
    static isBefore(date, dateToCompare) {
        const left = typeof date === 'string' ? new Date(date) : date;
        const right = typeof dateToCompare === 'string' ? new Date(dateToCompare) : dateToCompare;
        return (0, date_fns_1.isBefore)(left, right);
    }
    static isWithin(date, startDate, endDate) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
        const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
        return (0, date_fns_1.isWithinInterval)(dateObj, { start, end });
    }
    static startOfDay(date = new Date()) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.startOfDay)(dateObj);
    }
    static endOfDay(date = new Date()) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.endOfDay)(dateObj);
    }
    static startOfMonth(date = new Date()) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.startOfMonth)(dateObj);
    }
    static endOfMonth(date = new Date()) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.endOfMonth)(dateObj);
    }
    static startOfYear(date = new Date()) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.startOfYear)(dateObj);
    }
    static endOfYear(date = new Date()) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return (0, date_fns_1.endOfYear)(dateObj);
    }
    static isValidDate(date) {
        if (!date)
            return false;
        const dateObj = new Date(date);
        return dateObj instanceof Date && !isNaN(dateObj.getTime());
    }
    static calculateAge(dateOfBirth) {
        const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
        return (0, date_fns_1.differenceInYears)(new Date(), dob);
    }
    static getBusinessDays(startDate, endDate) {
        let count = 0;
        const curDate = new Date(startDate.getTime());
        while (curDate <= endDate) {
            const dayOfWeek = curDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6)
                count++;
            curDate.setDate(curDate.getDate() + 1);
        }
        return count;
    }
}
exports.DateUtil = DateUtil;
DateUtil.DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
DateUtil.DEFAULT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
DateUtil.DEFAULT_TIME_FORMAT = 'HH:mm:ss';
//# sourceMappingURL=date.util.js.map