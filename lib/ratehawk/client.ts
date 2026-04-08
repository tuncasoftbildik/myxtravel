import { ProxyAgent, fetch as undiciFetch } from "undici";
import { assertConfigured, authHeader, buildUrl } from "./config";

/**
 * Optional HTTP(S) proxy — when `RATEHAWK_PROXY_URL` is set (e.g.
 * `http://user:pass@63.182.154.248:8888`), every RateHawk request is
 * routed through the static egress proxy so RH sees a stable source IP.
 * Without the env var, fetch runs direct (dev / sandbox).
 *
 * We use undici's own `fetch` (not global fetch) so the ProxyAgent
 * dispatcher is recognized — Node's built-in fetch uses a separate
 * undici instance that won't honor agents from our explicit import.
 */
const proxyUrl = process.env.RATEHAWK_PROXY_URL;
const proxyAgent = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

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
  timeoutMs = 45000,
}: RequestOptions): Promise<T> {
  assertConfigured();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const init = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(),
      },
      body: method === "POST" ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store" as const,
      ...(proxyAgent ? { dispatcher: proxyAgent } : {}),
    };
    const res = proxyAgent
      ? await undiciFetch(buildUrl(path), init)
      : await fetch(buildUrl(path), init as unknown as RequestInit);

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
