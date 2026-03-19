/**
 * Subdomain'den tenant slug çözer.
 * xturizm.com          → null (storefront / platform)
 * admin.xturizm.com    → 'admin' (platform admin)
 * acenta.xturizm.com   → 'acenta' (agency panel)
 */
export function resolveTenantSlug(hostname: string): string | null {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'xturizm.com'

  // localhost geliştirme ortamı: localhost:3000 → null
  if (hostname === 'localhost' || hostname.startsWith('localhost:')) return null

  // Root domain ya da www
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) return null

  // Subdomain: acenta.xturizm.com → 'acenta'
  if (hostname.endsWith(`.${rootDomain}`)) {
    return hostname.replace(`.${rootDomain}`, '')
  }

  // Custom domain desteği (ilerleyen aşama)
  // Burada DB'den custom_domain sorgulanacak
  return null
}

export type TenantContext = {
  slug: string | null
  isAdmin: boolean
  isAgency: boolean
  isStorefront: boolean
}

export function buildTenantContext(slug: string | null): TenantContext {
  return {
    slug,
    isAdmin: slug === 'admin',
    isAgency: slug !== null && slug !== 'admin',
    isStorefront: slug === null,
  }
}
