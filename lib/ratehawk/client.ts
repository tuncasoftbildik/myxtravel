import { assertConfigured, authHeader, buildUrl } from "./config";

export class RatehawkError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "RatehawkError";
  }
}

interface RequestOptions {
  path: string;
  body?: Record<string, unknown>;
  method?: "GET" | "POST";
  /** Abort after N ms (default 15000) */
  timeoutMs?: number;
}

/**
 * Minimal JSON client for RateHawk B2B v3. All endpoints use POST with JSON bodies.
 * Response envelope: { status: "ok" | "error", data: ..., error: ..., debug: ... }
 */
export async function ratehawkRequest<T = unknown>({
  path,
  body = {},
  method = "POST",
  timeoutMs = 15000,
}: RequestOptions): Promise<T> {
  assertConfigured();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(buildUrl(path), {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(),
      },
      body: method === "POST" ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      throw new RatehawkError(`Invalid JSON from RateHawk (${res.status})`, res.status, text);
    }

    if (!res.ok) {
      throw new RatehawkError(
        `RateHawk HTTP ${res.status}`,
        res.status,
        json,
      );
    }

    const envelope = json as { status?: string; data?: T; error?: string } | null;
    if (envelope && envelope.status === "error") {
      throw new RatehawkError(
        `RateHawk error: ${envelope.error || "unknown"}`,
        res.status,
        envelope,
      );
    }

    return (envelope?.data ?? (json as T)) as T;
  } catch (err) {
    if (err instanceof RatehawkError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new RatehawkError("RateHawk request timed out", 0);
    }
    throw new RatehawkError((err as Error).message, 0);
  } finally {
    clearTimeout(timer);
  }
}
