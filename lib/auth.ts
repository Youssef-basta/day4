export const ADMIN_COOKIE = "kbs_admin";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}
