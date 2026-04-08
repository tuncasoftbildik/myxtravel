/**
 * RateHawk image URLs are templates with a `{size}` placeholder that must be
 * replaced before rendering, e.g.:
 *   https://cdn.worldota.net/t/{size}/content/.../img.jpeg
 *
 * Common sizes: "240x240", "640x400", "1024x768", "x500".
 */
export function rhImage(url: string, size = "640x400"): string {
  return url.replace("{size}", size);
}
