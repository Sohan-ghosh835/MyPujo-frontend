import { useCallback, useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import * as Switch from "@radix-ui/react-switch";
import { ExternalLink, Info, MapPin, Navigation, Train, Bath } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DURGA_PUJO_MAP_PANDALS,
  deriveIconicPandals,
  getCategoryColor,
  getCategoryLabel,
  type MapPandalCategory,
  type MapPandalItem,
} from "@shared/durgaPujoMapData";
import { METRO_STATIONS, getMetroLineColor, type MetroStation } from "@shared/metroStations";
import { PUBLIC_TOILETS, type PublicToilet } from "@shared/publicToilets";

// ── Icon generators (same pattern as PandalMap.tsx) ──

function createPinSvg(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 25 41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#000" stroke-width="1.2" stroke-opacity="0.4"/>
    <circle cx="12.5" cy="12.5" r="5" fill="#fff" fill-opacity="0.95"/>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function createMetroSvg(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <rect x="1" y="1" width="22" height="22" rx="6" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    <text x="12" y="17" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold" font-family="sans-serif">M</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function createToiletSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <rect x="1" y="1" width="20" height="20" rx="4" fill="#0891b2" stroke="#fff" stroke-width="1.5"/>
    <text x="11" y="16" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold" font-family="sans-serif">T</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const pandalIconCache: Record<string, L.Icon> = {};
function getPandalIcon(cat: MapPandalCategory): L.Icon {
  const color = getCategoryColor(cat);
  if (!pandalIconCache[color]) {
    pandalIconCache[color] = L.icon({
      iconUrl: createPinSvg(color),
      iconSize: [28, 42],
      iconAnchor: [14, 42],
      popupAnchor: [0, -38],
    });
  }
  return pandalIconCache[color];
}

const metroIconCache: Record<string, L.Icon> = {};
function getMetroIcon(line: MetroStation["line"]): L.Icon {
  const color = getMetroLineColor(line);
  if (!metroIconCache[color]) {
    metroIconCache[color] = L.icon({
      iconUrl: createMetroSvg(color),
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -14],
    });
  }
  return metroIconCache[color];
}

const toiletIcon = L.icon({
  iconUrl: createToiletSvg(),
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

// ── Category filter definition ──

type CategoryFilter = "all" | MapPandalCategory;
const CATEGORY_FILTERS: { value: CategoryFilter; labelEn: string; labelBn: string }[] = [
  { value: "all", labelEn: "All", labelBn: "সবকটি" },
  { value: "iconic", labelEn: "Iconic", labelBn: "আইকনিক" },
  { value: "north", labelEn: "North Kolkata", labelBn: "উত্তর কলকাতা" },
  { value: "south", labelEn: "South Kolkata", labelBn: "দক্ষিণ কলকাতা" },
  { value: "salt_lake", labelEn: "Salt Lake", labelBn: "সল্টলেক" },
  { value: "aristocratic", labelEn: "Bonedi Bari", labelBn: "বনেদি বাড়ি" },
];

// ── Map view controller ──

function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// ── Main component ──

export function PujoDiscoveryMap() {
  const { language } = useLanguage();
  const bengali = language === "bn";

  // Filter state — all internal, no props from parent
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [showMetro, setShowMetro] = useState(false);
  const [showToilets, setShowToilets] = useState(false);

  // Derive iconic pandals once
  const iconicPandals = useMemo(() => deriveIconicPandals(), []);

  // Build the active pandal list based on category
  const activePandals = useMemo<MapPandalItem[]>(() => {
    if (selectedCategory === "all") return DURGA_PUJO_MAP_PANDALS;
    if (selectedCategory === "iconic") return iconicPandals;
    return DURGA_PUJO_MAP_PANDALS.filter((p) => p.cat === selectedCategory);
  }, [selectedCategory, iconicPandals]);

  const mapCenter: [number, number] = useMemo(() => {
    if (activePandals.length > 0) return [activePandals[0].lat, activePandals[0].lng];
    return [22.5726, 88.3639];
  }, [activePandals]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* ── Compact control strip ── */}
      <div className="flex-shrink-0 space-y-2 rounded-t-[1.25rem] border-b border-white/10 bg-[#17151e]/95 px-3 py-2.5 backdrop-blur-md">
        {/* Category selector — horizontally scrollable */}
        <div className="discovery-map-categories flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all ${
                selectedCategory === cat.value
                  ? "bg-[#9d2529] text-[#f5c85b] shadow-md"
                  : "border border-white/15 bg-white/8 text-[#f8edd8]/80 hover:bg-white/15"
              }`}
            >
              {bengali ? cat.labelBn : cat.labelEn}
              {selectedCategory === cat.value && cat.value !== "all" && (
                <span className="ml-1 opacity-80">
                  ({cat.value === "iconic" ? iconicPandals.length : activePandals.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overlay toggles */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[11px] font-semibold text-[#f8edd8]/80">
            <Train size={13} className="text-[#2563eb]" />
            <span>{bengali ? "মেট্রো" : "Metro"}</span>
            <Switch.Root
              checked={showMetro}
              onCheckedChange={setShowMetro}
              className="relative h-[20px] w-[36px] rounded-full bg-white/15 transition-colors data-[state=checked]:bg-[#2563eb]"
            >
              <Switch.Thumb className="block h-[16px] w-[16px] translate-x-[2px] rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[18px]" />
            </Switch.Root>
          </label>

          <label className="flex items-center gap-2 text-[11px] font-semibold text-[#f8edd8]/80">
            <Bath size={13} className="text-[#0891b2]" />
            <span>{bengali ? "টয়লেট" : "Toilets"}</span>
            <Switch.Root
              checked={showToilets}
              onCheckedChange={setShowToilets}
              className="relative h-[20px] w-[36px] rounded-full bg-white/15 transition-colors data-[state=checked]:bg-[#0891b2]"
            >
              <Switch.Thumb className="block h-[16px] w-[16px] translate-x-[2px] rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[18px]" />
            </Switch.Root>
          </label>

          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-[#f5c85b]">
            <MapPin size={11} />
            {activePandals.length} {bengali ? "টি" : ""}
          </span>
        </div>
      </div>

      {/* ── Leaflet map ── */}
      <div className="relative flex-1 overflow-hidden rounded-b-[1.25rem]">
        <MapContainer
          center={[22.5726, 88.3639]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          attributionControl={false}
        >
          <MapViewController center={mapCenter} zoom={12} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="leaflet-dark-tiles"
          />

          {/* Pandal markers — clustered */}
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
          >
            {activePandals.map((pandal) => (
              <Marker
                key={pandal.id}
                position={[pandal.lat, pandal.lng]}
                icon={getPandalIcon(pandal.cat)}
              >
                <Popup className="discovery-popup">
                  <div className="min-w-[200px] p-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: getCategoryColor(pandal.cat) }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#a56922]">
                        {getCategoryLabel(pandal.cat, bengali)}
                      </span>
                    </div>
                    <h4 className="mt-1 font-display text-base font-bold text-[#4a2520]">
                      {pandal.name}
                    </h4>
                    <p className="mt-0.5 text-xs text-[#75594c]">{pandal.address}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-[#e8cda2]/50 pt-2">
                      {pandal.websitePandalId ? (
                        <>
                          <Link
                            href={`/navigate/${pandal.websitePandalId}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#8c1e21] px-2.5 py-1 text-xs font-bold text-white transition hover:bg-[#6f1719]"
                          >
                            <Navigation size={12} />
                            {bengali ? "নেভিগেট" : "Navigate"}
                          </Link>
                          <Link
                            href={`/pandals/${pandal.websitePandalId}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#8c1e21]/40 px-2.5 py-1 text-xs font-bold text-[#8c1e21] transition hover:bg-[#8c1e21]/10"
                          >
                            <Info size={12} />
                            {bengali ? "গাইড" : "Guide"}
                          </Link>
                        </>
                      ) : (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${pandal.lat},${pandal.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#8c1e21] px-3 py-1.5 text-xs font-bold text-white shadow transition hover:bg-[#6f1719]"
                        >
                          <ExternalLink size={13} />
                          {bengali ? "Google Maps-এ দেখুন" : "Directions"}
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

          {/* Metro markers — unclustered (small count) */}
          {showMetro &&
            METRO_STATIONS.map((station) => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={getMetroIcon(station.line)}
              >
                <Popup className="discovery-popup">
                  <div className="min-w-[160px] p-1">
                    <div className="flex items-center gap-1.5">
                      <Train size={13} style={{ color: getMetroLineColor(station.line) }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: getMetroLineColor(station.line) }}>
                        {station.line} Line
                      </span>
                    </div>
                    <h4 className="mt-1 font-display text-sm font-bold text-[#4a2520]">
                      {bengali ? station.nameBn : station.name}
                    </h4>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Toilet markers — unclustered (small count) */}
          {showToilets &&
            PUBLIC_TOILETS.map((toilet) => (
              <Marker
                key={toilet.id}
                position={[toilet.lat, toilet.lng]}
                icon={toiletIcon}
              >
                <Popup className="discovery-popup">
                  <div className="min-w-[160px] p-1">
                    <div className="flex items-center gap-1.5">
                      <Bath size={13} className="text-[#0891b2]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0891b2]">
                        {bengali ? "পাবলিক টয়লেট" : "Public Toilet"}
                      </span>
                    </div>
                    <h4 className="mt-1 text-sm font-bold text-[#4a2520]">
                      {bengali ? toilet.nameBn : toilet.name}
                    </h4>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Dark tile filter + popup styles (same as PandalMap) */}
        <style>{`
          .leaflet-dark-tiles {
            filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.92) saturate(0.85);
          }
          .discovery-popup .leaflet-popup-content-wrapper {
            background: #fff7e8;
            border: 1px solid #e8cda2;
            border-radius: 14px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          }
          .discovery-popup .leaflet-popup-tip {
            background: #fff7e8;
          }
          .discovery-map-categories::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </div>
  );
}
