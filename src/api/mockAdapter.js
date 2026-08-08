import MockAdapter from "axios-mock-adapter";
import { mockOverview } from "./mockData";

// -----------------------------------------------------------------------
// EN: Wraps an existing axios instance with axios-mock-adapter so that,
//     instead of making a real network call, matched routes resolve with
//     fake data after a small artificial delay (to simulate real
//     network latency during UI development / demos).
//
//     Only called from axiosConfig.js, and only when
//     import.meta.env.VITE_DEV_MODE === "true".
//
// FA: یک نمونه axios موجود را با axios-mock-adapter می‌پوشاند تا به‌جای
//     درخواست شبکه واقعی، مسیرهای منطبق با تأخیر مصنوعی کوچک (برای
//     شبیه‌سازی تأخیر شبکه واقعی) داده نمایشی برگردانند.
//
//     فقط از axiosConfig.js و فقط وقتی VITE_DEV_MODE برابر "true" باشد
//     فراخوانی می‌شود.
// -----------------------------------------------------------------------

export function attachMockAdapter(axiosInstance) {
  // `delayResponse` simulates realistic network latency (300ms) so
  // loading spinners / skeletons are actually visible during dev.
  const mock = new MockAdapter(axiosInstance, { delayResponse: 300 });

  // GET /device/overview  ->  returns stats + device list
  mock.onGet(/\/device\/overview/).reply(200, mockOverview);

  // GET /device/ping  ->  used to validate a manually-entered IP/URL
  mock.onGet(/\/device\/ping/).reply(200, { reachable: true });

  // Fallback: any other request just gets a 404 in dev mode, which makes
  // it obvious (rather than silently succeeding) when a new endpoint
  // needs its own mock added above.
  mock.onAny().reply(404, { message: "No mock configured for this request" });

  return mock;
}
