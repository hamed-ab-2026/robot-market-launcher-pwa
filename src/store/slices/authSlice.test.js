import {describe, expect, it, vi} from "vitest";

import authReducer, {
    lockSession,
    resetAttempts,
    selectAuthStatus,
    selectIsUnlocked,
    unlockWithBiometrics,
    unlockWithPasscode
} from "./authSlice";

describe("authSlice", () => {
    it("locks and unlocks biometric sessions without storing passcodes", () => {
        const unlocked = authReducer(undefined, unlockWithBiometrics.fulfilled(true));

        expect(unlocked.isUnlocked).toBe(true);
        expect(unlocked).not.toHaveProperty("passcode");

        const locked = authReducer(unlocked, lockSession());

        expect(locked.isUnlocked).toBe(false);
    });

    it("starts a temporary lockout after too many failed PIN attempts", () => {
        vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
        let state = authReducer(undefined, {type: "init"});

        for (let attempt = 0; attempt < 5; attempt += 1) {
            state = authReducer(state, unlockWithPasscode.rejected(null, "", ""));
        }

        expect(state.attemptsRemaining).toBe(0);
        expect(state.lockedUntil).toBe(Date.now() + 30_000);

        const reset = authReducer(state, resetAttempts());

        expect(reset.attemptsRemaining).toBe(5);
        expect(reset.lockedUntil).toBeNull();
    });

    it("selects shared auth state through named selectors", () => {
        const state = {auth: {...authReducer(undefined, {type: "init"}), isUnlocked: true}};

        expect(selectIsUnlocked(state)).toBe(true);
        expect(selectAuthStatus(state)).toBe(state.auth);
    });
});
