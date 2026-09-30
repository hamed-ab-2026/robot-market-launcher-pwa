import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import {sha256Hash, verifyHash} from "../../utils/crypto";


const PASSCODE_HASH_KEY = "app_passcode_hash";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000;

/** Reads the persisted PIN hash while tolerating restricted storage access. */
function readStoredHash() {
    try {
        return localStorage.getItem(PASSCODE_HASH_KEY);
    } catch {
        return null;
    }
}


/**
 * Hashes the first PIN and stores only the hash.
 * The raw PIN never enters Redux state or persistent storage.
 */
export const setupPasscode = createAsyncThunk(
    "auth/setupPasscode",
    async (plainPasscode) => {
        const hash = await sha256Hash(plainPasscode);
        localStorage.setItem(PASSCODE_HASH_KEY, hash);
        return true;
    }
);


/**
 * Verifies an entered PIN against the stored hash and rejects with a stable
 * code so the UI can show a friendly message and update the attempt counter.
 */
export const unlockWithPasscode = createAsyncThunk(
    "auth/unlockWithPasscode",
    async (plainPasscode, {rejectWithValue}) => {
        const storedHash = readStoredHash();
        if (!storedHash) {
            return rejectWithValue("NO_PASSCODE_SET");
        }
        const isValid = await verifyHash(plainPasscode, storedHash);
        if (!isValid) {
            return rejectWithValue("WRONG_PASSCODE");
        }
        return true;
    }
);


export const unlockWithBiometrics = createAsyncThunk(
    "auth/unlockWithBiometrics",
    async () => true
);

const initialState = {
    hasPasscode: Boolean(readStoredHash()),
    isUnlocked: false,
    status: "idle",
    attemptsRemaining: MAX_ATTEMPTS,
    lockedUntil: null
};

/**
 * Owns shared authentication state: session lock status, remaining attempts,
 * and temporary lockout time. Reducers store security outcomes, never raw PINs.
 */
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        lockSession(state) {


            state.isUnlocked = false;
        },
        resetAttempts(state) {
            state.attemptsRemaining = MAX_ATTEMPTS;
            state.lockedUntil = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(setupPasscode.fulfilled, (state) => {
            state.hasPasscode = true;
            state.isUnlocked = true;
            state.attemptsRemaining = MAX_ATTEMPTS;
        }).addCase(unlockWithPasscode.pending, (state) => {
            state.status = "loading";
        }).addCase(unlockWithPasscode.fulfilled, (state) => {
            state.status = "idle";
            state.isUnlocked = true;
            state.attemptsRemaining = MAX_ATTEMPTS;
            state.lockedUntil = null;
        }).addCase(unlockWithPasscode.rejected, (state) => {
            state.status = "failed";
            state.attemptsRemaining = Math.max(0, state.attemptsRemaining - 1);
            if (state.attemptsRemaining === 0) {
                state.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
            }
        }).addCase(unlockWithBiometrics.fulfilled, (state) => {
            state.isUnlocked = true;
            state.attemptsRemaining = MAX_ATTEMPTS;
        });
    }
});

export const {lockSession, resetAttempts} = authSlice.actions;

export const selectAuthStatus = (state) => state.auth;
export const selectIsUnlocked = (state) => state.auth.isUnlocked;

export default authSlice.reducer;
