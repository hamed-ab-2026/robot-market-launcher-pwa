// -----------------------------------------------------------------------
// EN: Fake dataset returned by the mock adapter when VITE_DEV_MODE=true.
//     Shaping this EXACTLY like the real API response means components
//     never need an `if (isMock)` branch — they just consume whatever
//     axiosConfig hands back.
// FA: داده نمایشی که هنگام VITE_DEV_MODE=true توسط mock adapter برگردانده
//     می‌شود. چون دقیقاً شکل پاسخ واقعی API را دارد، کامپوننت‌ها هرگز
//     نیازی به شرط if (isMock) ندارند.
// -----------------------------------------------------------------------

export const mockOverview = {
  onlineDevices: 18,
  activeRobots: 14,
  batteryAvg: 76,
  alerts: 2,
  devices: [
    { id: "rb-001", name: "Arm-Unit A1", ip: "192.168.1.11", battery: 92, status: "online", lastSeen: "2 min ago" },
    { id: "rb-002", name: "Scout-B2", ip: "192.168.1.12", battery: 54, status: "charging", lastSeen: "5 min ago" },
    { id: "rb-003", name: "Loader-C3", ip: "192.168.1.13", battery: 12, status: "error", lastSeen: "1 hr ago" },
    { id: "rb-004", name: "Arm-Unit A2", ip: "192.168.1.14", battery: 88, status: "online", lastSeen: "1 min ago" },
    { id: "rb-005", name: "Scout-B3", ip: "192.168.1.15", battery: 0, status: "offline", lastSeen: "3 hr ago" },
    { id: "rb-006", name: "Sweeper-D1", ip: "192.168.1.16", battery: 67, status: "online", lastSeen: "just now" }
  ],
  // --- Sales trend, matching the reference's 30-day line chart ---
  salesTrend: [
    { label: "1", value: 32 },
    { label: "8", value: 41 },
    { label: "15", value: 38 },
    { label: "22", value: 52 },
    { label: "29", value: 47 },
    { label: "36", value: 61 },
    { label: "43", value: 58 },
    { label: "50", value: 65.43 }
  ],
  // --- Device status breakdown for the donut chart ---
  deviceStatusBreakdown: {
    total: 248,
    online: 168,
    offline: 42,
    pending: 38
  },
  // --- Recent activity feed ---
  recentActivity: [
    { id: "act-1", type: "orderPlaced", meta: "#24564", time: "10:25", day: "today" },
    { id: "act-2", type: "deviceAdded", meta: "X1", time: "09:48", day: "today" },
    { id: "act-3", type: "paymentSuccess", meta: "#4456", time: "—", day: "yesterday" },
    { id: "act-4", type: "systemUpdate", meta: "v2.1.0", time: "—", day: "yesterday" }
  ]
};
