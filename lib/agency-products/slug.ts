import type { SupabaseClient } from "@supabase/supabase-js";

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c",
  ğ: "g", Ğ: "g",
  ı: "i", İ: "i",
  ö: "o", Ö: "o",
  ş: "s", Ş: "s",
  ü: "u", Ü: "u",
};

export function slugify(input: string): string {
  return input
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uniqueSlug(
  supabase: SupabaseClient,
  agencyId: string,
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;
  for (;;) {
    const { data } = await supabase
      .from("agency_products")
      .select("id")
      .eq("agency_id", agencyId)
      .eq("slug", candidate);
    const rows = (data || []).filter((r: { id: string }) => r.id !== excludeId);
    if (rows.length === 0) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
