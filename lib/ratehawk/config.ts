/**
 * RateHawk (Emerging Travel Group) B2B API v3 configuration.
 *
 * Docs: https://docs.emergingtravel.com/docs/b2b-api/
 * Auth: HTTP Basic (KEY_ID:API_KEY)
 * Base paths: sandbox → api-sandbox.worldota.net, prod → api.worldota.net
 */
export const config = {
  baseUrl: process.env.RATEHAWK_BASE_URL || "https://api-sandbox.worldota.net",
  keyId: process.env.RATEHAWK_KEY_ID || "",
  apiKey: process.env.RATEHAWK_API_KEY || "",
  apiPrefix: "/api/b2b/v3",
} as const;

export function buildUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${config.baseUrl}${config.apiPrefix}${clean}`;
}

export function authHeader(): string {
  const token = Buffer.from(`${config.keyId}:${config.apiKey}`).toString("base64");
  return `Basic ${token}`;
}

export function assertConfigured(): void {
  if (!config.keyId || !config.apiKey) {
    throw new Error(
      "RateHawk credentials missing. Set RATEHAWK_KEY_ID and RATEHAWK_API_KEY in .env.local",
    );
  }
}
