import { NextRequest, NextResponse } from "next/server";
import { hotel } from "@/lib/travelrobot";
import { TravelrobotError } from "@/lib/travelrobot/token-manager";

export async function POST(req: NextRequest) {
  try {
    const { productCode } = await req.json();
    if (!productCode) {
      return NextResponse.json({ error: "productCode zorunludur" }, { status: 400 });
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
