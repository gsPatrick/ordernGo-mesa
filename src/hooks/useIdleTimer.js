import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook to detect user inactivity.
 * @param {number} timeout - Time in milliseconds before user is considered idle.
 * @returns {boolean} - True if user is idle, false otherwise.
 */
export function useIdleTimer(timeout = 180000) { // Default 3 minutes
    const [isIdle, setIsIdle] = useState(false);
    const timerRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const resetTimer = useCallback(() => {
        setIsIdle(false);
        lastActivityRef.current = Date.now();

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            setIsIdle(true);
        }, timeout);
    }, [timeout]);

    useEffect(() => {
        // Simple throttle using requestAnimationFrame
        let ticking = false;

        const handleActivity = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(() => {
                    resetTimer();
                    ticking = false;
                });
            }
        };

        // Events that reset the timer
        const events = ['mousemove', 'mousedown', 'touchstart', 'click', 'keypress', 'scroll'];
        events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

        // Start the timer
        resetTimer();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [resetTimer]);

    return isIdle;
}
