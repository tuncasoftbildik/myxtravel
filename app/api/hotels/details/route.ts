import { NextRequest, NextResponse } from "next/server";
import { hotel } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";
import { hotel as rhHotel, rhImage, hotelInfoBatchCached } from "@/lib/ratehawk";
import type { HotelSupplier } from "@/lib/hotels";

export async function POST(req: NextRequest) {
  try {
    const { productCode, supplier = "travelrobot" } = (await req.json()) as {
      productCode?: string;
      supplier?: HotelSupplier;
    };
    if (!productCode) {
      return NextResponse.json({ error: "productCode zorunludur" }, { status: 400 });
    }

    if (supplier === "ratehawk") {
      // RateHawk: pull from cached hotelInfo (service role). Cold misses go
      // to the live API via the same fetcher used by search aggregation.
      const map = await hotelInfoBatchCached([productCode], (ids) => rhHotel.hotelInfoBatch(ids));
      const info = map.get(productCode);
      if (!info) {
        return NextResponse.json({ error: "Otel bulunamadı" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        hotel: {
          productCode: info.id,
          name: info.name,
          stars: info.star_rating || 0,
          description: "",
          address: info.address || "",
          city: info.region?.name || "",
          country: info.region?.country_code || "",
          phone: info.phone || "",
          email: info.email || "",
          location: info.latitude != null ? { lat: info.latitude, lng: info.longitude } : null,
          thumbnail: info.images?.[0] ? rhImage(info.images[0], "1024x768") : "",
          images: (info.images || []).map((u) => rhImage(u, "1024x768")),
          facilities: [],
          distances: [],
          checkInTime: info.check_in_time || "",
          checkOutTime: info.check_out_time || "",
        },
      });
    }

    const result = await hotel.getHotelDetails({ ProductCode: productCode });
    const data = result as Record<string, unknown>;

    // The API may nest differently - try multiple paths
    const h = (data.Result as Record<string, unknown>) || data;
    const hotelData = (h.Hotel as Record<string, unknown>) || h;

    if (!hotelData) {
      return NextResponse.json({ error: "Otel bulunamadı" }, { status: 404 });
    }

    // Try multiple paths for images
    const images =
      (hotelData.Images as Record<string, unknown>[]) ||
      (hotelData.HotelImages as Record<string, unknown>[]) ||
      (h.Images as Record<string, unknown>[]) ||
      [];

    // Try multiple paths for facilities
    const facilities =
      (hotelData.Facilities as Record<string, unknown>[]) ||
      (hotelData.HotelFacilities as Record<string, unknown>[]) ||
      (h.Facilities as Record<string, unknown>[]) ||
      [];

    const geo = hotelData.GeoLocation as Record<string, unknown> | null;

    // Parse hotel distances (airport, POIs, etc.)
    const distances =
      (hotelData.HotelDistances as Record<string, unknown>[]) ||
      (hotelData.Distances as Record<string, unknown>[]) ||
      (h.HotelDistances as Record<string, unknown>[]) ||
      [];

    return NextResponse.json({
      success: true,
      hotel: {
        productCode: hotelData.HotelCode || hotelData.ProductCode || productCode,
        name: hotelData.HotelName || hotelData.Name || "",
        stars: hotelData.Star || hotelData.Stars || 0,
        description: hotelData.Description || hotelData.HotelDescription || hotelData.GeneralDescription || "",
        address: [hotelData.Address, hotelData.FullLocation].filter(Boolean).join(", ") || "",
        city: hotelData.Location || hotelData.CityName || hotelData.City || "",
        country: hotelData.CountryCode || hotelData.CountryName || "",
        phone: hotelData.Phone || "",
        email: hotelData.Email || "",
        location: geo ? { lat: geo.Latitude, lng: geo.Longitude } : null,
        thumbnail: hotelData.HotelImageURL || hotelData.ThumbnailUrl || "",
        images: images.map((img: Record<string, unknown>) =>
          img.Url || img.ImageUrl || img.URL || img.FullSizeUrl || img.ThumbUrl || ""
        ).filter(Boolean),
        facilities: facilities.map((f: Record<string, unknown>) => ({
          name: f.Name || f.FacilityName || f.Value || "",
          category: f.Category || f.FacilityCategory || f.GroupName || "",
        })),
        distances: distances.map((d: Record<string, unknown>) => ({
          name: (d.Description as string) || (d.Name as string) || "",
          distance: d.Distance as number || 0,
          unit: d.UnitType === 1 ? "km" : d.UnitType === 2 ? "m" : "km",
          type: (d.Name as string) || "",
        })),
        checkInTime: hotelData.CheckInTime || "",
        checkOutTime: hotelData.CheckOutTime || "",
      },
    });
  } catch (error) {
    if (error instanceof TravelrobotError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Beklenmeyen hata oluştu" }, { status: 500 });
  }
}
