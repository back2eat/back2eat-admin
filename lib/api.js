import axios from "axios";
import Cookies from "js-cookie";

const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://back2eat-api.onrender.com/api/v1";

const api = axios.create({ baseURL: BASE });

// ── Attach token to every request ────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh on 401 ──────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = Cookies.get("adminRefresh");
      if (!refreshToken) {
        isRefreshing = false;
        Cookies.remove("adminToken");
        Cookies.remove("adminRefresh");
        Cookies.remove("adminUser");
        window.location.href = "/login";
        return Promise.reject(err);
      }
      try {
        const res = await axios.post(`${BASE}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data;
        Cookies.set("adminToken", accessToken, { expires: 1 });
        Cookies.set("adminRefresh", newRefresh, { expires: 30 });
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        Cookies.remove("adminToken");
        Cookies.remove("adminRefresh");
        Cookies.remove("adminUser");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────
// NOTE: Admin logs in via OTP with appType CUSTOMER (admin role check happens on backend)
export const requestOtp = (mobile) =>
  api.post("/auth/request-otp", { mobile, appType: "CUSTOMER" });
export const verifyOtp = (mobile, otp) =>
  api.post("/auth/verify-otp", { mobile, otp });
export const refreshAuth = (token) =>
  api.post("/auth/refresh", { refreshToken: token });
export const getMe = () => api.get("/auth/me");

// ── Dashboard / Stats ─────────────────────────────────────────────────
export const getStats = () => api.get("/admin/stats");

// ── Restaurants ───────────────────────────────────────────────────────
// GET /admin/restaurants   — list with status/search/page params
export const getRestaurants = (params) =>
  api.get("/admin/restaurants", { params });

// GET /restaurants/:id     — public endpoint returns full restaurant + branches
// (there is no /admin/restaurants/:id — use public endpoint instead)
export const getRestaurantById = (id) => api.get(`/restaurants/${id}`);

export const approveRestaurant = (id) =>
  api.patch(`/admin/restaurants/${id}/approve`);

export const suspendRestaurant = (id) =>
  api.patch(`/admin/restaurants/${id}/suspend`);

// PATCH /admin/restaurants/:id/plan  — change plan AND start subscription
export const updatePlan = (id, plan) =>
  api.patch(`/admin/restaurants/${id}/plan`, { plan });

// NOTE: declineRestaurant and getRestaurantPayments do NOT exist in the API.
// Removed — was hitting non-existent endpoints.

// ── Users ─────────────────────────────────────────────────────────────
// GET /admin/users  — list users with pagination
export const getUsers = (params) => api.get("/admin/users", { params });
// NOTE: deleteUser (/admin/users/:id) does NOT exist in the API. Removed.

// ── Payouts ───────────────────────────────────────────────────────────
export const getPayouts = (params) =>
  api.get("/payouts/admin/list", { params });
export const processPayout = (id, data) =>
  api.patch(`/payouts/admin/${id}/process`, data);

// ── Payments / Settlement ─────────────────────────────────────────────
// POST /payments/settle — triggers T+5 settlement (ADMIN only)
export const triggerSettlement = () => api.post("/payments/settle");

// ── Coupons ───────────────────────────────────────────────────────────
export const getCoupons   = (params) => api.get("/coupons",              { params });
export const createCoupon = (data)   => api.post("/coupons",             data);
export const toggleCoupon = (id)     => api.patch(`/coupons/${id}/toggle`);
// Use createCoupon to create new ones; there is no toggle endpoint documented.

// ── Billing Plans (read-only for admin reference) ──────────────────────
export const getBillingPlans = () => api.get("/billing/plans");

export default api;