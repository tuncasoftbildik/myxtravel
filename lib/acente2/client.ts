/**
 * Acente2 JSON API client — routes through AWS proxy (static IP)
 * Proxy: http://<AWS_IP>:3100/api/proxy/tour
 * Docs: https://www.acente2.com/docs/A2-Tour-API.pdf
 *
 * All requests are POST with: { token, action, data }
 */

export class Acente2Error extends Error {
  constructor(
    message: string,
    public status: number,
    public responseData?: unknown,
  ) {
    super(message);
    this.name = "Acente2Error";
  }
}

const config = {
  proxyUrl: process.env.A2_PROXY_URL!, // e.g. http://63.182.154.248:3100/api/proxy/tour
  proxyKey: process.env.A2_PROXY_KEY!, // shared secret
  token: process.env.A2_TOUR_API_TOKEN!,
};

export async function acente2Request<T = unknown>(
  action: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  if (!config.proxyUrl || !config.token) {
    throw new Acente2Error("Acente2 API yapılandırması eksik", 500);
  }

  const body = {
    token: config.token,
    action,
    data,
  };

  const res = await fetch(config.proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-proxy-key": config.proxyKey || "",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Acente2Error(
      json?.errorDescription || json?.error || `Acente2 ${action} failed (${res.status})`,
      res.status,
      json,
    );
  }

  // Acente2 response: { isSuccess, hasError, errorCode, errorDescription, result, resultDate }
  if (json?.hasError || json?.isSuccess === false) {
    throw new Acente2Error(
      json?.errorDescription || `Acente2 ${action} başarısız (${json?.errorCode || "?"})`,
      0,
      json,
    );
  }

  return json as T;
}
