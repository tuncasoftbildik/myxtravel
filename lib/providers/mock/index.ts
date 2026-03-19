/**
 * Mock Provider Adaptörü
 * Gerçek API entegrasyonu hazır olana kadar sahte veri üretir.
 * Her gerçek provider bu interface'i implement edecek.
 */

export interface ProviderProduct {
  externalId: string
  type: 'flight' | 'hotel' | 'tour' | 'transfer' | 'package'
  title: string
  description: string
  basePrice: number
  currency: string
  metadata: Record<string, unknown>
  availableFrom?: string
  availableTo?: string
}

export interface SearchParams {
  type?: string
  destination?: string
  dateFrom?: string
  dateTo?: string
  adults?: number
  children?: number
  keyword?: string
}

// =============================================
// Mock Data
// =============================================
const mockTours: ProviderProduct[] = [
  {
    externalId: 'TOUR-001',
    type: 'tour',
    title: 'Kapadokya 3 Gece 4 Gün',
    description: 'Peri bacaları, balon turu ve yeraltı şehirleri dahil.',
    basePrice: 8500,
    currency: 'TRY',
    metadata: { destination: 'Kapadokya', duration: 4, includes: ['konaklama', 'kahvaltı', 'rehber'] },
    availableFrom: '2026-04-01',
    availableTo: '2026-10-31',
  },
  {
    externalId: 'TOUR-002',
    type: 'tour',
    title: 'Ege Kıyıları Tekne Turu 7 Gün',
    description: 'Marmaris-Fethiye-Antalya güzergahı, mavi yolculuk.',
    basePrice: 14200,
    currency: 'TRY',
    metadata: { destination: 'Ege', duration: 7, includes: ['tekne', 'yemek', 'kaptan'] },
    availableFrom: '2026-06-01',
    availableTo: '2026-09-30',
  },
  {
    externalId: 'TOUR-003',
    type: 'tour',
    title: 'İstanbul Kültür Turu 2 Gün',
    description: 'Ayasofya, Topkapı, Kapalıçarşı, Boğaz turu.',
    basePrice: 3200,
    currency: 'TRY',
    metadata: { destination: 'İstanbul', duration: 2, includes: ['rehber', 'müze girişleri'] },
  },
]

const mockHotels: ProviderProduct[] = [
  {
    externalId: 'HTL-001',
    type: 'hotel',
    title: 'Antalya Luxury Resort 5★',
    description: 'Her şey dahil, özel plaj, 3 havuz.',
    basePrice: 4800,
    currency: 'TRY',
    metadata: { destination: 'Antalya', stars: 5, board: 'all-inclusive', rooms: ['standart', 'suit'] },
  },
  {
    externalId: 'HTL-002',
    type: 'hotel',
    title: 'Bodrum Butik Otel 4★',
    description: 'Deniz manzaralı odalar, SPA dahil.',
    basePrice: 2900,
    currency: 'TRY',
    metadata: { destination: 'Bodrum', stars: 4, board: 'BB', rooms: ['standart', 'deniz manzaralı'] },
  },
]

const mockFlights: ProviderProduct[] = [
  {
    externalId: 'FLT-001',
    type: 'flight',
    title: 'İstanbul → Antalya (Direkt)',
    description: 'TK1234 | 07:00 - 08:30 | 1s 30dk',
    basePrice: 1250,
    currency: 'TRY',
    metadata: { from: 'IST', to: 'AYT', airline: 'THY', duration: 90, class: 'economy' },
  },
  {
    externalId: 'FLT-002',
    type: 'flight',
    title: 'İstanbul → Bodrum (Direkt)',
    description: 'PC456 | 10:00 - 11:15 | 1s 15dk',
    basePrice: 980,
    currency: 'TRY',
    metadata: { from: 'SAW', to: 'BJV', airline: 'Pegasus', duration: 75, class: 'economy' },
  },
]

const allProducts = [...mockTours, ...mockHotels, ...mockFlights]

// =============================================
// Adapter Functions
// =============================================

export async function searchProducts(params: SearchParams): Promise<ProviderProduct[]> {
  // Gerçek API'de burada HTTP çağrısı olacak
  await new Promise(r => setTimeout(r, 200)) // Simüle gecikme

  let results = [...allProducts]

  if (params.type) {
    results = results.filter(p => p.type === params.type)
  }

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    results = results.filter(p =>
      p.title.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw) ||
      JSON.stringify(p.metadata).toLowerCase().includes(kw)
    )
  }

  if (params.destination) {
    const dest = params.destination.toLowerCase()
    results = results.filter(p =>
      JSON.stringify(p.metadata).toLowerCase().includes(dest)
    )
  }

  return results
}

export async function getProduct(externalId: string): Promise<ProviderProduct | null> {
  await new Promise(r => setTimeout(r, 100))
  return allProducts.find(p => p.externalId === externalId) ?? null
}

export async function checkAvailability(externalId: string, _date: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 150))
  return allProducts.some(p => p.externalId === externalId)
}
