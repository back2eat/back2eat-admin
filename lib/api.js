// ADMIN PANEL (Next.js)
// lib/api.js

import axios from "axios";
import Cookies from "js-cookie";

const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://back2eat-api.onrender.com/api/v1";

const api = axios.create({ baseURL: BASE });

// ── Attach token ──────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = Cookies.get("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

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
      original._retry  = true;
      isRefreshing     = true;
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
        Cookies.set("adminToken",   accessToken, { expires: 1  });
        Cookies.set("adminRefresh", newRefresh,  { expires: 30 });
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

// ── Auth ──────────────────────────────────────────────────────────────────────
export const requestOtp  = (mobile) => api.post("/auth/request-otp", { mobile, appType: "CUSTOMER" });
export const verifyOtp   = (mobile, otp) => api.post("/auth/verify-otp", { mobile, otp });
export const refreshAuth = (token) => api.post("/auth/refresh", { refreshToken: token });
export const getMe       = () => api.get("/auth/me");

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getStats = () => api.get("/admin/stats");

// ── Restaurants ───────────────────────────────────────────────────────────────
export const getRestaurants    = (params) => api.get("/admin/restaurants",                 { params });
export const getRestaurantById = (id)     => api.get(`/restaurants/${id}`);
export const approveRestaurant = (id)     => api.patch(`/admin/restaurants/${id}/approve`);
export const suspendRestaurant = (id)     => api.patch(`/admin/restaurants/${id}/suspend`);
export const updatePlan        = (id, plan)  => api.patch(`/admin/restaurants/${id}/plan`, { plan });
export const renewSubscription = (id, plan)  => api.post(`/admin/restaurants/${id}/renew`, { plan });

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = (params) => api.get("/admin/users", { params });

// ── Orders ────────────────────────────────────────────────────────────────────
export const getAdminOrders = (params) => api.get("/admin/orders", { params });

// ── Payouts ───────────────────────────────────────────────────────────────────
export const getPayouts    = (params)    => api.get("/payouts/admin/list",          { params });
export const processPayout = (id, data)  => api.patch(`/payouts/admin/${id}/process`, data);

// ── Settlement ────────────────────────────────────────────────────────────────
export const triggerSettlement = () => api.post("/payments/settle");

// ── Coupons (all via /admin/coupons) ─────────────────────────────────────────
export const getCoupons   = (params) => api.get("/admin/coupons",              { params });
export const createCoupon = (data)   => api.post("/admin/coupons",             data);
export const toggleCoupon = (id)     => api.patch(`/admin/coupons/${id}/toggle`);
export const deleteCoupon = (id)     => api.delete(`/admin/coupons/${id}`);

// ── Lucky Draw ────────────────────────────────────────────────────────────────
export const getDraws     = (params) => api.get("/admin/draws",                { params });
export const createDraw   = (data)   => api.post("/admin/draws",               data);
export const getDrawById  = (id)     => api.get(`/admin/draws/${id}`);
export const conductDraw  = (id)     => api.post(`/admin/draws/${id}/conduct`);
export const cancelDraw   = (id)     => api.patch(`/admin/draws/${id}/cancel`);

export default api;