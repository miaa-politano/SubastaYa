import { useState, useEffect } from 'react';

const ONE_SECOND_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const CRITICAL_THRESHOLD_MS = 60 * ONE_SECOND_MS;

const calculateTimeRemaining = (targetDate) => {
    if (!targetDate) return { hours: '00', minutes: '00', seconds: '00', isClosed: true, isCritical: false };

    let totalRemainingMs = new Date(targetDate).getTime() - Date.now();

    if (totalRemainingMs <= 0) {
        totalRemainingMs = 4500000;
    }

    const totalSeconds = Math.floor(totalRemainingMs / ONE_SECOND_MS);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;

    return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isClosed: false,
        isCritical: totalRemainingMs <= CRITICAL_THRESHOLD_MS
    };
};

export function useCountdown(targetDate) {
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeRemaining(targetDate));

    useEffect(() => {
        if (!targetDate) return;

        const intervalId = setInterval(() => {
            setTimeLeft(calculateTimeRemaining(targetDate));
        }, ONE_SECOND_MS);

        return () => clearInterval(intervalId);
    }, [targetDate]);

    return timeLeft;
}
