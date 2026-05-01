// OfferMap — shows a pulsing red dot on the wilaya location, with optional
// precise lat/lng pin and an optional interactive picker mode for posting
// offers (the wizard uses `interactive` to let the client zoom in and drag
// the pin to the exact spot inside their wilaya).
import { useEffect, useRef } from "react";
import { useApp } from "@/lib/context";

// Coordinates for all 58 Algerian wilayas
export const WILAYA_COORDS: Record<string, [number, number]> = {
  "Adrar": [27.874, -0.294], "Chlef": [36.165, 1.330], "Laghouat": [33.800, 2.865],
  "Oum El Bouaghi": [35.870, 7.114], "Batna": [35.556, 6.174], "Béjaïa": [36.752, 5.084],
  "Biskra": [34.850, 5.728], "Béchar": [31.617, -2.216], "Blida": [36.470, 2.829],
  "Bouira": [36.372, 3.900], "Tamanrasset": [22.785, 5.523], "Tébessa": [35.404, 8.124],
  "Tlemcen": [34.878, -1.315], "Tiaret": [35.371, 1.317], "Tizi Ouzou": [36.717, 4.046],
  "Alger": [36.737, 3.086], "Djelfa": [34.674, 3.263], "Jijel": [36.819, 5.766],
  "Sétif": [36.191, 5.408], "Saïda": [34.831, 0.149], "Skikda": [36.876, 6.908],
  "Sidi Bel Abbès": [35.190, -0.630], "Annaba": [36.897, 7.765], "Guelma": [36.462, 7.428],
  "Constantine": [36.365, 6.615], "Médéa": [36.264, 2.750], "Mostaganem": [35.931, 0.089],
  "M'Sila": [35.706, 4.543], "Mascara": [35.400, 0.140], "Ouargla": [31.949, 5.325],
  "Oran": [35.698, -0.634], "El Bayadh": [33.683, 1.017], "Illizi": [26.507, 8.476],
  "Bordj Bou Arréridj": [36.073, 4.763], "Boumerdès": [36.762, 3.477], "El Tarf": [36.768, 8.307],
  "Tindouf": [27.674, -8.167], "Tissemsilt": [35.608, 1.812], "El Oued": [33.368, 6.857],
  "Khenchela": [35.436, 7.144], "Souk Ahras": [36.286, 7.951], "Tipaza": [36.589, 2.447],
  "Mila": [36.450, 6.264], "Aïn Defla": [36.264, 1.968], "Naâma": [33.267, -0.317],
  "Aïn Témouchent": [35.298, -1.139], "Ghardaïa": [32.490, 3.674], "Relizane": [35.738, 0.556],
  "Timimoun": [29.263, 0.241], "Bordj Badji Mokhtar": [21.329, 0.946],
  "Ouled Djellal": [34.417, 5.067], "Béni Abbès": [30.131, -2.172],
  "In Salah": [27.197, 2.464], "In Guezzam": [19.567, 5.767],
  "Touggourt": [33.097, 6.070], "Djanet": [24.555, 9.484],
  "El M'Ghair": [33.954, 5.925], "El Meniaa": [30.581, 2.880],
};

interface OfferMapProps {
  wilaya: string;
  className?: string;
  /** Optional precise [lat, lng]. Falls back to the wilaya centroid. */
  lat?: number;
  lng?: number;
  /** Interactive pick mode — pan/zoom + draggable pin. Wizard uses this. */
  interactive?: boolean;
  /** Initial zoom (overrides default). 8 = wilaya view, 12 = town, 14 = street. */
  zoom?: number;
  /** Pixel height of the map container. */
  height?: number;
  /** Fired when the user drags the pin (interactive mode only). */
  onPinChange?: (lat: number, lng: number) => void;
}

export const OfferMap = ({
  wilaya, className = "",
  lat, lng, interactive = false, zoom, height = 140,
  onPinChange,
}: OfferMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onPinChangeRef = useRef(onPinChange);
  onPinChangeRef.current = onPinChange;
  const { dark } = useApp();

  const fallback = WILAYA_COORDS[wilaya];
  const coords: [number, number] | undefined =
    typeof lat === "number" && typeof lng === "number" ? [lat, lng] : fallback;
  const initialZoom = zoom ?? (interactive ? 12 : 8);

  // (Re)create the map only when wilaya / interactive / dark changes. We
  // update the marker imperatively below to avoid recreating Leaflet on every
  // pin drag.
  useEffect(() => {
    if (!mapRef.current || !coords) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const map = L.map(mapRef.current!, {
        center: coords,
        zoom: initialZoom,
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        attributionControl: false,
      });

      const tileUrl = dark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

      // Pulsing red dot (display) OR draggable native pin (interactive).
      if (interactive) {
        const m = L.marker(coords, { draggable: true }).addTo(map);
        m.on("dragend", () => {
          const p = m.getLatLng();
          onPinChangeRef.current?.(p.lat, p.lng);
        });
        // Click to set: tap anywhere on the map to move the pin there.
        map.on("click", (e: any) => {
          m.setLatLng(e.latlng);
          onPinChangeRef.current?.(e.latlng.lat, e.latlng.lng);
        });
        markerRef.current = m;
      } else {
        const pulsingIcon = L.divIcon({
          className: "",
          html: `<div style="
            width:18px;height:18px;
            background:rgba(239,68,68,0.9);
            border-radius:50%;
            border:2px solid white;
            box-shadow:0 0 0 0 rgba(239,68,68,0.7);
            animation:np-pulse 1.8s ease-out infinite;
          "></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        markerRef.current = L.marker(coords, { icon: pulsingIcon }).addTo(map);
      }
      mapInstance.current = map;
    });

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markerRef.current = null;
    };
    // We intentionally exclude `coords`/`initialZoom` from deps — those are
    // applied imperatively below so the map isn't recreated on every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wilaya, interactive, dark]);

  // Imperative marker update when lat/lng change from the parent.
  useEffect(() => {
    if (!mapInstance.current || !markerRef.current || !coords) return;
    markerRef.current.setLatLng(coords);
    if (!interactive) {
      mapInstance.current.setView(coords, initialZoom, { animate: false });
    }
  }, [coords?.[0], coords?.[1], interactive, initialZoom]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!coords) return null;

  return (
    <>
      <style>{`
        @keyframes np-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
          70%  { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        .leaflet-container { background: transparent !important; }
      `}</style>
      <div
        ref={mapRef}
        className={`rounded-xl overflow-hidden ${className}`}
        style={{ height }}
      />
    </>
  );
};
