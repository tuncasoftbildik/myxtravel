import { getToken, clearToken, TravelrobotError } from "./token-manager";
import { buildUrl, type ServiceName } from "./config";

type BodyWrapper = "filter" | "request" | "flat";

interface RequestOptions {
  service: ServiceName;
  operation: string;
  body?: Record<string, unknown>;
  /** Body wrapper: "filter", "request", or "flat" (no wrapper) */
  wrapper?: BodyWrapper;
  /** How token is placed: "nested" = Token.TokenCode, "direct" = TokenCode */
  tokenStyle?: "nested" | "direct";
  /** Skip token injection */
  withToken?: boolean;
  retryOnAuth?: boolean;
}

export async function travelrobotRequest<T = unknown>({
  service,
  operation,
  body = {},
  wrapper = "request",
  tokenStyle = "nested",
  withToken = true,
  retryOnAuth = true,
}: RequestOptions): Promise<T> {
  let requestBody: Record<string, unknown>;

  if (!withToken) {
    requestBody = wrapper === "flat" ? body : { [wrapper]: body };
  } else {
    const tokenCode = await getToken();
    const tokenField =
      tokenStyle === "nested"
        ? { Token: { TokenCode: tokenCode } }
        : { TokenCode: tokenCode };

    if (wrapper === "flat") {
      requestBody = { tokenCode, ...body };
    } else {
      requestBody = {
        [wrapper]: { ...tokenField, ...body },
      };
    }
  }

  const url = buildUrl(service, operation);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, application/xml",
    },
    body: JSON.stringify(requestBody),
  });

  if ((res.status === 401 || res.status === 403) && retryOnAuth && withToken) {
    clearToken();
    return travelrobotRequest<T>({
      service, operation, body, wrapper, tokenStyle, withToken, retryOnAuth: false,
    });
  }

  const data = await res.json();

  if (!res.ok) {
    throw new TravelrobotError(
      data.ErrorMessage || `${service}/${operation} failed`,
      res.status,
      data,
    );
  }

  // Invalid token — retry with fresh token
  if (data.HasError && data.ErrorCode === "GE0002" && retryOnAuth && withToken) {
    clearToken();
    return travelrobotRequest<T>({
      service, operation, body, wrapper, tokenStyle, withToken, retryOnAuth: false,
    });
  }

  if (data.HasError) {
    throw new TravelrobotError(
      data.ErrorMessage || data.UserFriendlyErrorMessage || `${operation} error`,
      0,
      data,
    );
  }

  return data as T;
}
