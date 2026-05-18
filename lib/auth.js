import Cookies from "js-cookie";

export const getAdminToken   = ()    => Cookies.get("adminToken");
export const getAdminRefresh = ()    => Cookies.get("adminRefresh");
export const getAdminUser    = ()    => {
  try { return JSON.parse(Cookies.get("adminUser") || "{}"); }
  catch { return {}; }
};

export const setAdminSession = (accessToken, refreshToken, user) => {
  Cookies.set("adminToken",   accessToken,          { expires: 1  });
  Cookies.set("adminRefresh", refreshToken,         { expires: 30 });
  Cookies.set("adminUser",    JSON.stringify(user), { expires: 30 });
};

export const clearAdminSession = () => {
  Cookies.remove("adminToken");
  Cookies.remove("adminRefresh");
  Cookies.remove("adminUser");
};

export const isAdminLoggedIn = () => {
  const token = getAdminToken();
  const user  = getAdminUser();
  return !!(token && user?.role === "ADMIN");
};