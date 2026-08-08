const XP_STORAGE_KEY = "adaptiv_xp_v1";

export function getEarnedXp(): number {
  if (typeof window === "undefined") return 0;
  const value = Number(window.localStorage.getItem(XP_STORAGE_KEY));
  return Number.isFinite(value) ? value : 0;
}

export function awardXp(points: number): number {
  if (typeof window === "undefined" || points <= 0) return 0;
  const next = getEarnedXp() + Math.round(points);
  window.localStorage.setItem(XP_STORAGE_KEY, String(next));
  window.dispatchEvent(new CustomEvent("adaptiv:xp-updated", { detail: next }));
  return next;
}
