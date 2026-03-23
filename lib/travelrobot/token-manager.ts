import { config, buildUrl } from "./config";

interface TokenData {
  tokenCode: string;
  expiresAt: number;
}

let cachedToken: TokenData | null = null;

export async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.tokenCode;
  }

  if (cachedToken) {
    try {
      const refreshed = await refreshToken(cachedToken.tokenCode);
      if (refreshed) return refreshed;
    } catch {
      // Refresh failed, create new
    }
  }

  return createToken();
}

async function createToken(): Promise<string> {
  const res = await fetch(buildUrl("General", "CreateTokenV2"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, application/xml",
    },
    body: JSON.stringify({
      channelCredential: {
        ChannelCode: config.channelCode,
        ChannelPassword: config.channelPassword,
      },
    }),
  });

  if (!res.ok) {
    throw new TravelrobotError(`Token oluşturulamadı: ${res.status}`, res.status);
  }

  const data = await res.json();

  if (data.HasError) {
    throw new TravelrobotError(data.ErrorMessage || "Token hatası", 0, data);
  }

  const tokenCode = data.Result?.TokenCode;
  if (!tokenCode) {
    throw new TravelrobotError("TokenCode yanıtta bulunamadı", 0, data);
  }

  const expiresAt = data.Result?.ExpiresAt
    ? new Date(data.Result.ExpiresAt).getTime()
    : Date.now() + 110 * 60 * 1000; // TokenDuration: 120 min, 10 min buffer

  cachedToken = { tokenCode, expiresAt };
  return tokenCode;
}

async function refreshToken(currentToken: string): Promise<string | null> {
  const res = await fetch(buildUrl("General", "RefreshToken"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      Token: { TokenCode: currentToken },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (data.HasError) return null;

  const tokenCode = data.Result?.TokenCode;
  if (!tokenCode) return null;

  const expiresAt = data.Result?.ExpiresAt
    ? new Date(data.Result.ExpiresAt).getTime()
    : Date.now() + 110 * 60 * 1000;

  cachedToken = { tokenCode, expiresAt };
  return tokenCode;
}

export function clearToken() {
  cachedToken = null;
}

export class TravelrobotError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public responseData?: unknown,
  ) {
    super(message);
    this.name = "TravelrobotError";
  }
}
