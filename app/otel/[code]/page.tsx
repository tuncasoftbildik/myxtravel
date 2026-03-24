"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import dynamic from "next/dynamic";

const HotelMap = dynamic(() => import("@/components/hotel-map"), { ssr: false });

interface HotelDistance {
  name: string;
  distance: number;
  unit: string;
  type: string;
}

interface HotelDetail {
  productCode: string;
  name: string;
  stars: number;
  description: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  location: { lat: number; lng: number } | null;
  thumbnail: string;
  images: string[];
  facilities: { name: string; category: string }[];
  distances: HotelDistance[];
  checkInTime: string;
  checkOutTime: string;
}

interface RoomAlternative {
  roomCode: string;
  roomName: string;
  boardCode: string;
  boardName: string;
  totalAmount: number;
  baseAmount: number;
  discountAmount: number;
  currency: string;
  allotment: number;
  cancellationPolicies: { description: string; penaltyAmount: number; currency: string }[];
}

interface Room {
  roomIndex: number;
  alternatives: RoomAlternative[];
}

export default function HotelDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = params.code as string;
  const searchKey = searchParams.get("searchKey") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const adults = searchParams.get("adults") || "2";
  const nights = searchParams.get("nights") || "2";

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch hotel details
  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch("/api/hotels/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productCode: code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Otel bilgisi alınamadı");
        setHotel(data.hotel);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [code]);

  // Fetch room offers — fresh search for this specific hotel
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setRoomsLoading(false);
      return;
    }
    async function fetchRooms() {
      try {
        const res = await fetch("/api/hotels/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productCode: code, checkIn, checkOut, adults: Number(adults) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Oda bilgileri alınamadı");
        setRooms(data.rooms || []);
      } catch {
        // Room fetch can fail silently — we still show hotel info
      } finally {
        setRoomsLoading(false);
      }
    }
    fetchRooms();
  }, [code, checkIn, checkOut, adults]);

  if (loading) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8]">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-white/60 rounded w-1/3" />
              <div className="h-80 bg-white/60 rounded-2xl" />
              <div className="h-40 bg-white/60 rounded-2xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !hotel) {
    return (
      <>
        <Header variant="solid" />
        <main className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md">
            <p className="text-brand-red font-semibold mb-4">{error || "Otel bulunamadı"}</p>
            <button onClick={() => router.push("/otel")} className="text-sm text-blue-600 hover:underline">
              Otellere dön
            </button>
          </div>
        </main>
      </>
    );
  }

  const allImages = hotel.images.length > 0 ? hotel.images : (hotel.thumbnail ? [hotel.thumbnail] : []);
  // Use first image as thumbnail fallback
  if (!hotel.thumbnail && allImages.length > 0) hotel.thumbnail = allImages[0];
  const ratingScore = Math.min(10, (hotel.stars / 5) * 10);

  return (
    <>
      <Header variant="solid" />
      <main className="min-h-screen bg-[#f5f0e8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button onClick={() => router.push("/otel")} className="hover:text-blue-600 transition">Oteller</button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{hotel.name}</span>
          </div>

          {/* Hotel header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Stars count={hotel.stars} />
                {hotel.city && <span className="text-xs text-gray-400">{hotel.city}, {hotel.country}</span>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{hotel.name}</h1>
              {hotel.address && (
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                  {hotel.address}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-700">Değerlendirme</p>
              </div>
              <div className="w-11 h-11 rounded-tl-lg rounded-tr-lg rounded-br-lg bg-brand-dark text-white flex items-center justify-center text-lg font-bold">
                {ratingScore.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Photo gallery */}
          {allImages.length > 0 && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
              <div className="flex flex-col lg:flex-row">
                {/* Main image */}
                <div className="lg:flex-1 h-72 sm:h-96 bg-gray-100">
                  <img
                    src={allImages[selectedImage]}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="lg:w-48 flex lg:flex-col gap-1 p-1 overflow-x-auto lg:overflow-y-auto lg:max-h-96">
                    {allImages.slice(0, 6).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`shrink-0 w-20 h-16 lg:w-full lg:h-20 rounded-lg overflow-hidden border-2 transition ${i === selectedImage ? "border-brand-red" : "border-transparent hover:border-gray-300"}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {allImages.length > 6 && (
                      <div className="shrink-0 w-20 h-16 lg:w-full lg:h-20 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-medium">
                        +{allImages.length - 6}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left — Info & Rooms */}
            <div className="flex-1 min-w-0 space-y-6">

              {/* Description */}
              {hotel.description && (
                <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Otel Hakkında</h2>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{hotel.description}</div>
                </div>
              )}

              {/* Facilities */}
              {hotel.facilities.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Olanaklar</h2>
                  <div className="flex flex-wrap gap-2">
                    {hotel.facilities.map((f, i) => (
                      <span key={i} className="text-xs bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-100">
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Room offers */}
              <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Müsait Odalar</h2>
                {checkIn && checkOut && (
                  <p className="text-xs text-gray-400 mb-4">{checkIn} — {checkOut} · {adults} misafir · {nights} gece</p>
                )}

                {roomsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      {checkIn ? "Bu tarihler için müsait oda bulunamadı." : "Oda fiyatlarını görmek için tarih seçerek arama yapın."}
                    </p>
                    <button onClick={() => router.push("/otel")} className="text-sm text-blue-600 hover:underline mt-2">
                      Otel ara
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rooms.map((room) =>
                      room.alternatives.map((alt, i) => (
                        <div key={`${room.roomIndex}-${i}`} className="border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-gray-900">{alt.roomName}</h3>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {alt.boardName && (
                                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                                    {alt.boardName}
                                  </span>
                                )}
                                {alt.allotment > 0 && alt.allotment <= 3 && (
                                  <span className="text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded font-medium">
                                    Son {alt.allotment} oda!
                                  </span>
                                )}
                              </div>
                              {alt.cancellationPolicies.length > 0 && (
                                <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-1">
                                  {alt.cancellationPolicies[0].description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                {alt.discountAmount > 0 && (
                                  <p className="text-xs text-gray-400 line-through">
                                    {alt.currency} {alt.baseAmount.toLocaleString("tr-TR")}
                                  </p>
                                )}
                                <p className="text-xl font-bold text-gray-900">
                                  {alt.currency} {alt.totalAmount.toLocaleString("tr-TR")}
                                </p>
                                <p className="text-[10px] text-gray-400">{nights} gece için toplam</p>
                              </div>
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    hotelCode: code,
                                    hotelName: hotel.name,
                                    roomCode: alt.roomCode,
                                    roomName: alt.roomName,
                                    boardName: alt.boardName,
                                    totalAmount: String(alt.totalAmount),
                                    currency: alt.currency,
                                    checkIn,
                                    checkOut,
                                    adults,
                                    nights,
                                  });
                                  router.push(`/rezervasyon?${params.toString()}`);
                                }}
                                className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition whitespace-nowrap"
                              >
                                Rezervasyon
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right — Map & Info card */}
            <div className="lg:w-80 shrink-0 space-y-5">
              {/* Mini map */}
              {hotel.location && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-56">
                  <HotelMap
                    hotels={[{
                      productCode: hotel.productCode,
                      name: hotel.name,
                      stars: hotel.stars,
                      thumbnail: hotel.thumbnail,
                      location: hotel.location,
                      city: hotel.city,
                      price: { total: 0, currency: "" },
                    }]}
                  />
                </div>
              )}

              {/* Hotel info card */}
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Otel Bilgileri</h3>
                <div className="space-y-2.5 text-sm">
                  {hotel.address && (
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-500 shrink-0">Adres</span>
                      <span className="font-medium text-gray-900 text-right text-xs">{hotel.address}</span>
                    </div>
                  )}
                  {hotel.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Şehir</span>
                      <span className="font-medium text-gray-900">{hotel.city}{hotel.country ? `, ${hotel.country}` : ""}</span>
                    </div>
                  )}
                  {hotel.checkInTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Giriş</span>
                      <span className="font-medium text-gray-900">{hotel.checkInTime}</span>
                    </div>
                  )}
                  {hotel.checkOutTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Çıkış</span>
                      <span className="font-medium text-gray-900">{hotel.checkOutTime}</span>
                    </div>
                  )}
                  {hotel.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Telefon</span>
                      <span className="font-medium text-gray-900">{hotel.phone}</span>
                    </div>
                  )}
                  {hotel.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">E-posta</span>
                      <span className="font-medium text-gray-900 text-xs">{hotel.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Distances / POIs */}
              {hotel.distances && hotel.distances.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Yakın Noktalar</h3>
                  <div className="space-y-2.5 text-sm">
                    {[...hotel.distances]
                      .sort((a, b) => a.distance - b.distance)
                      .slice(0, 8)
                      .map((d, i) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gray-400 shrink-0">
                            {d.type?.toLowerCase().includes("airport") ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            )}
                          </span>
                          <span className="text-gray-700 truncate">{d.name}</span>
                        </div>
                        <span className="text-gray-500 shrink-0 font-medium">
                          {d.distance < 1 ? `${Math.round(d.distance * 1000)} m` : `${d.distance} ${d.unit}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: Math.max(0, Math.min(5, count)) }, (_, i) => (
        <svg key={i} className="w-4 h-4 fill-amber-500" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}
