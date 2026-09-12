import { useState, useEffect } from 'react';

const ONE_SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const CRITICAL_THRESHOLD_MS = 60 * ONE_SECOND_MS;

/**
 * Calculates remaining time until target date and indicates critical threshold.
 *
 * @param {string|Date} targetDate - The auction end date.
 * @returns {object} Formatted time components and critical status flags.
 */
export function useCountdown(targetDate) {
    const calculateTimeRemaining = () => {
        const totalRemainingMs = Math.max(0, new Date(targetDate).getTime() - Date.now());

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
            isCritical
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft(calculateTimeRemaining());
        }, ONE_SECOND_MS);

        return () => clearInterval(intervalId);
    }, [targetDate]);

    return timeLeft;
}