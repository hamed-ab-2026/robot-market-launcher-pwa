import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import {sha256Hash, verifyHash} from "../../utils/crypto";


const PASSCODE_HASH_KEY = "app_passcode_hash";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000;

/** هش PIN را با مدیریت خطای دسترسی از localStorage می‌خواند و در نبود آن null برمی‌گرداند. */
function readStoredHash() {
    try {
        return localStorage.getItem(PASSCODE_HASH_KEY);
    } catch {
        return null;
    }
}


/**
 * PIN اولیه را هش و ذخیره می‌کند؛ مقدار خام PIN هیچ‌وقت در Redux یا localStorage قرار نمی‌گیرد.
 * Fulfilled شدن این عملیات باعث فعال شدن وضعیت hasPasscode و باز شدن نشست جاری می‌شود.
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
 * PIN واردشده را با هش ذخیره‌شده مقایسه می‌کند.
 * در صورت خطا کد مشخص برمی‌گرداند تا رابط کاربری بتواند پیام و محدودیت تلاش را مدیریت کند.
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
 * Slice احراز هویت وضعیت باز بودن نشست، تعداد تلاش‌های باقی‌مانده و زمان قفل موقت را مدیریت می‌کند.
 * Reducerهای این بخش هیچ رمز خامی نگهداری نمی‌کنند و فقط نتیجه عملیات امنیتی را ثبت می‌کنند.
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
export default authSlice.reducer;
