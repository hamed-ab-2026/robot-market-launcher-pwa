import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDeviceOverview } from "../../api/deviceService";

// -----------------------------------------------------------------------
// EN: deviceSlice holds the currently-connected device's address (IP or
//     URL) and the dashboard data fetched from it (stats + device list).
//     `fetchOverview` is an async thunk so loading/error states are
//     handled automatically by extraReducers — no manual setLoading(true)
//     calls scattered around components.
// FA: deviceSlice آدرس دستگاه متصل (IP یا URL) و داده‌های داشبورد
//     دریافت‌شده از آن (آمار + لیست دستگاه‌ها) را نگه می‌دارد.
//     fetchOverview یک thunk ناهمگام است تا وضعیت loading/error به‌صورت
//     خودکار در extraReducers مدیریت شود.
// -----------------------------------------------------------------------

export const fetchOverview = createAsyncThunk(
  "device/fetchOverview",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { connectionType, address } = getState().device;
      const data = await fetchDeviceOverview({ connectionType, address });
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || "FETCH_FAILED");
    }
  }
);

const initialState = {
  // "online"  => connected via a cloud URL
  // "offline" => connected via a local IP address
  connectionType: null,
  address: null, // the raw URL or IP string entered by the user

  overview: {
    onlineDevices: 0,
    activeRobots: 0,
    batteryAvg: 0,
    alerts: 0,
    devices: [], // [{ id, name, ip, battery, status, lastSeen }]
    salesTrend: [], // [{ label, value }]
    deviceStatusBreakdown: { total: 0, online: 0, offline: 0, pending: 0 },
    recentActivity: [] // [{ id, type, meta, time, day }]
  },

  status: "idle", // "idle" | "loading" | "succeeded" | "failed"
  error: null,
  lastFetchedAt: null
};

const deviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    setConnection(state, action) {
      // action.payload: { connectionType: "online"|"offline", address: string }
      state.connectionType = action.payload.connectionType;
      state.address = action.payload.address;
    },
    clearConnection(state) {
      state.connectionType = null;
      state.address = null;
      state.overview = initialState.overview;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.overview = action.payload;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Unknown error";
      });
  }
});

export const { setConnection, clearConnection } = deviceSlice.actions;
export default deviceSlice.reducer;
