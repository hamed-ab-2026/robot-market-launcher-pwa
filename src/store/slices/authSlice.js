import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sha256Hash, verifyHash } from "../../utils/crypto";

// -----------------------------------------------------------------------
// EN: authSlice tracks:
//       - hasPasscode: does a hashed passcode already exist in localStorage?
//         (decides whether AuthPage shows "Setup" or "Unlock" mode)
//       - isUnlocked: is the CURRENT session unlocked? (resets on reload
//         by design — this is a "lock on every app open" security model)
//       - attemptsRemaining / lockedUntil: brute-force protection
//     The actual hash is never kept in Redux state — only in localStorage,
//     read/written through these thunks — so it never leaks into Redux
//     DevTools history longer than necessary.
// FA: authSlice وضعیت زیر را نگه می‌دارد:
//       - hasPasscode: آیا رمز هش‌شده‌ای از قبل در localStorage هست؟
//       - isUnlocked: آیا سشن فعلی باز است؟ (با رفرش صفحه دوباره قفل می‌شود)
//       - attemptsRemaining / lockedUntil: محافظت در برابر حدس زدن رمز
//     خودِ هش هرگز داخل state رداکس نگه‌داشته نمی‌شود؛ فقط در localStorage
//     است و از طریق این thunk ها خوانده/نوشته می‌شود.
// -----------------------------------------------------------------------

const PASSCODE_HASH_KEY = "app_passcode_hash";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

function readStoredHash() {
  try {
    return localStorage.getItem(PASSCODE_HASH_KEY);
  } catch {
    return null;
  }
}

/**
 * EN: Thunk — hash + persist a brand-new 6-digit passcode (first-time setup).
 * FA: Thunk — یک رمز ۶ رقمی جدید را هش کرده و ذخیره می‌کند (تنظیم اولیه).
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
 * EN: Thunk — verify an entered passcode against the stored hash.
 *     Rejects (throws) on mismatch so the UI can show an error + shake
 *     animation via `.unwrap()` in the component.
 * FA: Thunk — رمز واردشده را با هش ذخیره‌شده مقایسه می‌کند. در صورت
 *     عدم تطابق reject می‌شود تا کامپوننت پیام خطا/انیمیشن نمایش دهد.
 */
export const unlockWithPasscode = createAsyncThunk(
  "auth/unlockWithPasscode",
  async (plainPasscode, { rejectWithValue }) => {
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

/**
 * EN: Thunk — unlock via WebAuthn (fingerprint/FaceID). The actual
 *     browser prompt logic lives in src/hooks/useWebAuthn.js; this thunk
 *     just updates session state once that hook resolves successfully.
 * FA: Thunk — باز کردن قفل با WebAuthn. منطق اصلی در useWebAuthn.js است؛
 *     این thunk فقط بعد از موفقیت، وضعیت سشن را به‌روزرسانی می‌کند.
 */
export const unlockWithBiometrics = createAsyncThunk(
  "auth/unlockWithBiometrics",
  async () => true
);

const initialState = {
  hasPasscode: Boolean(readStoredHash()),
  isUnlocked: false,
  status: "idle", // "idle" | "loading" | "failed"
  attemptsRemaining: MAX_ATTEMPTS,
  lockedUntil: null // epoch ms, or null if not locked
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    lockSession(state) {
      // Called on logout, or automatically when the app regains focus
      // after being backgrounded for a while (see App.jsx).
      state.isUnlocked = false;
    },
    resetAttempts(state) {
      state.attemptsRemaining = MAX_ATTEMPTS;
      state.lockedUntil = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- setupPasscode ---
      .addCase(setupPasscode.fulfilled, (state) => {
        state.hasPasscode = true;
        state.isUnlocked = true;
        state.attemptsRemaining = MAX_ATTEMPTS;
      })
      // --- unlockWithPasscode ---
      .addCase(unlockWithPasscode.pending, (state) => {
        state.status = "loading";
      })
      .addCase(unlockWithPasscode.fulfilled, (state) => {
        state.status = "idle";
        state.isUnlocked = true;
        state.attemptsRemaining = MAX_ATTEMPTS;
        state.lockedUntil = null;
      })
      .addCase(unlockWithPasscode.rejected, (state) => {
        state.status = "failed";
        state.attemptsRemaining = Math.max(0, state.attemptsRemaining - 1);
        if (state.attemptsRemaining === 0) {
          state.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        }
      })
      // --- unlockWithBiometrics ---
      .addCase(unlockWithBiometrics.fulfilled, (state) => {
        state.isUnlocked = true;
        state.attemptsRemaining = MAX_ATTEMPTS;
      });
  }
});

export const { lockSession, resetAttempts } = authSlice.actions;
export default authSlice.reducer;
