export const config = {
  apiUrl: process.env.TRAVELROBOT_API_URL!,
  channelCode: process.env.TRAVELROBOT_CHANNEL_CODE!,
  channelPassword: process.env.TRAVELROBOT_CHANNEL_PASSWORD!,
} as const;

/**
 * URL pattern: {apiUrl}/{Service}.svc/Rest/Json/{Operation}
 * Örnek: http://sandbox.kplus.com.tr/kplus/v0/General.svc/Rest/Json/CreateTokenV2
 */
export type ServiceName = "General" | "Air" | "Transfer" | "Hotel" | "Tour" | "StaticContent";

export function buildUrl(service: ServiceName, operation: string): string {
  return `${config.apiUrl}/${service}.svc/Rest/Json/${operation}`;
}
