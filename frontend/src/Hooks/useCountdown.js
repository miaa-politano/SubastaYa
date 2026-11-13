import { useState, useEffect } from 'react';

const ONE_SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const CRITICAL_THRESHOLD_MS = 60 * ONE_SECOND_MS;

export const parseUtcDate = (rawDate) => {
    if (!rawDate) return NaN;
    const str = String(rawDate).trim();
    const hasTimezone = str.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(str);
    return new Date(hasTimezone ? str : `${str}Z`).getTime();
};

const calculateTimeRemaining = (targetDate) => {
    const parsedTarget = parseUtcDate(targetDate);
    if (Number.isNaN(parsedTarget)) {
        return {
            hours: '00',
            minutes: '00',
            seconds: '00',
            isClosed: false,
            isCritical: false,
            isInvalid: true
        };
    }

    const totalRemainingMs = Math.max(0, parsedTarget - Date.now());
    const totalSeconds = Math.floor(totalRemainingMs / ONE_SECOND_MS);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;

    const isClosed = totalRemainingMs === 0;
    const isCritical = totalRemainingMs > 0 && totalRemainingMs <= CRITICAL_THRESHOLD_MS;

    return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isClosed,
        isCritical,
        isInvalid: false
    };
};

export function useCountdown(targetDate) {
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(targetDate));

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft(calculateTimeRemaining(targetDate));
        }, ONE_SECOND_MS);

        return () => clearInterval(intervalId);
    }, [targetDate]);

    return timeLeft;
}