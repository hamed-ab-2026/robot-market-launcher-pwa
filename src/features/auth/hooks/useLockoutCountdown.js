import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";

import {resetAttempts} from "../../../store/slices/authSlice";

/**
 * Tracks the remaining lockout time for failed PIN attempts.
 * When the lockout expires, it resets the shared attempt counter exactly once.
 */
export function useLockoutCountdown(lockedUntil) {
    const dispatch = useDispatch();
    const [remainingLockSeconds, setRemainingLockSeconds] = useState(0);

    useEffect(() => {
        if (!lockedUntil) {
            setRemainingLockSeconds(0);
            return;
        }

        function tick() {
            const remainingSeconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
            setRemainingLockSeconds(remainingSeconds);

            if (remainingSeconds === 0 && Date.now() >= lockedUntil) {
                dispatch(resetAttempts());
            }
        }

        tick();
        const interval = window.setInterval(tick, 1000);
        return () => window.clearInterval(interval);
    }, [dispatch, lockedUntil]);

    return remainingLockSeconds;
}
