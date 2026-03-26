"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, OverlayViewF, OverlayView } from "@react-google-maps/api";

interface Hotel {
  productCode: string;
  name: string;
  stars: number;
  thumbnail: string | null;
  location: { lat: number; lng: number } | null;
  city: string;
  price: {
    total: number;
    currency: string;
  };
}

interface HotelMapProps {
  hotels: Hotel[];
  hoveredHotel?: string | null;
  onHotelClick?: (productCode: string) => void;
}

const MAP_STYLES = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
];

export default function HotelMap({ hotels, hoveredHotel, onHotelClick }: HotelMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCscDJMy4GTEP_Mv-SBu3H7iadRBUzstvY",
  });

  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const mappable = useMemo(
    () => hotels.filter((h) => h.location && h.location.lat !== 0 && h.location.lng !== 0),
    [hotels]
  );

  const isSingle = mappable.length === 1;

  // Fit bounds when hotels change
  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      if (mappable.length === 0) return;
      if (isSingle && mappable[0].location) {
        map.setCenter({ lat: mappable[0].location.lat, lng: mappable[0].location.lng });
        map.setZoom(15);
        return;
      }
      const bounds = new google.maps.LatLngBounds();
      mappable.forEach((h) => {
        if (h.location) bounds.extend({ lat: h.location.lat, lng: h.location.lng });
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    },
    [mappable, isSingle]
  );

  // Re-fit when hotels change
  useEffect(() => {
    if (!mapRef.current || mappable.length === 0) return;
    if (isSingle && mappable[0].location) {
      mapRef.current.setCenter({ lat: mappable[0].location.lat, lng: mappable[0].location.lng });
      mapRef.current.setZoom(15);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    mappable.forEach((h) => {
      if (h.location) bounds.extend({ lat: h.location.lat, lng: h.location.lng });
    });
    mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, [mappable, isSingle]);

  const selected = mappable.find((h) => h.productCode === selectedHotel);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      onLoad={onLoad}
      zoom={8}
      center={mappable[0]?.location || { lat: 37, lng: 35 }}
      options={{
        styles: MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_TOP },
        clickableIcons: false,
        gestureHandling: "greedy",
      }}
      onClick={() => setSelectedHotel(null)}
    >
      {/* Price markers */}
      {mappable.map((h) => {
        if (!h.location) return null;
        const isHovered = h.productCode === hoveredHotel;
        const isSelected = h.productCode === selectedHotel;
        const active = isHovered || isSelected;
        const price = h.price.total ? `${Math.round(h.price.total).toLocaleString("tr-TR")} ₺` : h.name;

        return (
          <OverlayViewF
            key={h.productCode}
            position={{ lat: h.location.lat, lng: h.location.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHotel(h.productCode);
                onHotelClick?.(h.productCode);
              }}
              className={`
                px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer
                shadow-lg transition-all duration-150 -translate-x-1/2 -translate-y-full
                ${active
                  ? "bg-brand-red text-white scale-110 z-50"
                  : "bg-white text-brand-dark hover:bg-brand-red hover:text-white border border-gray-200"
                }
              `}
              style={{ position: "relative", zIndex: active ? 50 : 1 }}
            >
              {price}
            </div>
          </OverlayViewF>
        );
      })}

      {/* Info popup for selected hotel */}
      {selected && selected.location && (
        <OverlayViewF
          position={{ lat: selected.location.lat, lng: selected.location.lng }}
          mapPaneName={OverlayView.FLOAT_PANE}
        >
          <div
            className="bg-white rounded-xl shadow-2xl overflow-hidden w-52 sm:w-64 -translate-x-1/2 -translate-y-[calc(100%+40px)]"
            style={{ position: "relative", zIndex: 100 }}
          >
            {selected.thumbnail && (
              <img src={selected.thumbnail} alt={selected.name} className="w-full h-32 object-cover" />
            )}
            <div className="p-3">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: selected.stars }, (_, i) => (
                  <svg key={i} className="w-3 h-3 fill-amber-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs text-gray-400 ml-1">{selected.city}</span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{selected.name}</h4>
              {selected.price.total > 0 && (
                <p className="text-lg font-bold text-brand-red mt-1">
                  {Math.round(selected.price.total).toLocaleString("tr-TR")} ₺
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedHotel(null)}
              className="absolute top-2 right-2 w-6 h-6 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xs transition"
            >
              ✕
            </button>
          </div>
        </OverlayViewF>
      )}
    </GoogleMap>
  );
}
