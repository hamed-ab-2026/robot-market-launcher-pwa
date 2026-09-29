import axios from "axios";


/**
 * تنها نقطهٔ ساخت HTTP client برنامه.
 * سرویس‌های هر دامنه باید این client را مصرف کنند، نه اینکه Axios را در کامپوننت‌ها بسازند.
 */
const apiClient = axios.create({
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10_000,
    headers: {Accept: "application/json"}
});

export default apiClient;
