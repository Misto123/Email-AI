export function normalizeAffiliateUrl(value: string): string {
  const url = value.trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/+/, "")}`;
}

export function themeVariants(primary: string) {
  const hex = /^#?([0-9a-f]{6})$/i.exec(primary.trim())?.[1] || "163300";
  const rgb = [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  const mix = (amount: number) => `#${rgb.map((channel) => Math.max(0, Math.min(255, Math.round(channel + (255 - channel) * amount))).toString(16).padStart(2, "0")).join("")}`;
  return { primary: `#${hex}`, soft: mix(0.9), pale: mix(0.96), light: mix(0.72) };
}
