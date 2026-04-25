// OfferMap — shows a pulsing red dot on the wilaya location
// Uses Leaflet with OpenStreetMap tiles (free, no API key)
import { useEffect, useRef } from "react";
import { useApp } from "@/lib/context";

// Coordinates for all 58 Algerian wilayas
const WILAYA_COORDS: Record<string, [number, number]> = {
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
}

export const OfferMap = ({ wilaya, className = "" }: OfferMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const { dark } = useApp();

  const coords = WILAYA_COORDS[wilaya];

  useEffect(() => {
    if (!mapRef.current || !coords) return;

    // Lazy load leaflet
    import("leaflet").then((L) => {
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
        zoom: 8,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        attributionControl: false,
      });

      // Dark/light tile
      const tileUrl = dark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

      // Pulsing red dot using divIcon
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

      L.marker(coords, { icon: pulsingIcon }).addTo(map);
      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [coords, dark]);

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
      <div ref={mapRef} className={`rounded-xl overflow-hidden ${className}`} style={{ height: 140 }} />
    </>
  );
};
