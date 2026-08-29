import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DURGA_PUJO_MAP_PANDALS, getCategoryColor, getCategoryLabel, type MapPandalCategory, type MapPandalItem } from "@shared/durgaPujoMapData";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExternalLink, Navigation, Search, MapPin, Info } from "lucide-react";
import { Link } from "wouter";

function createPinSvg(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 25 41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#000" stroke-width="1.2" stroke-opacity="0.4"/>
    <circle cx="12.5" cy="12.5" r="5" fill="#fff" fill-opacity="0.95"/>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const iconsCache: Record<string, L.Icon> = {};
function getMarkerIcon(category: MapPandalCategory): L.Icon {
  const color = getCategoryColor(category);
  if (!iconsCache[color]) {
    iconsCache[color] = L.icon({
      iconUrl: createPinSvg(color),
      iconSize: [28, 42],
      iconAnchor: [14, 42],
      popupAnchor: [0, -38],
    });
  }
  return iconsCache[color];
}

function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export function PandalMap({ initialCategory = "all" }: { initialCategory?: string }) {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const [selectedCat, setSelectedCat] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePandal, setActivePandal] = useState<MapPandalItem | null>(null);

  const filteredPandals = useMemo(() => {
    return DURGA_PUJO_MAP_PANDALS.filter(p => {
      const matchesCat = selectedCat === "all" || p.cat === selectedCat;
      const haystack = `${p.name} ${p.subArea} ${p.address} ${p.section}`.toLowerCase();
      const matchesSearch = !searchQuery.trim() || haystack.includes(searchQuery.trim().toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCat, searchQuery]);

  const mapCenter: [number, number] = useMemo(() => {
    if (activePandal) return [activePandal.lat, activePandal.lng];
    if (filteredPandals.length > 0) return [filteredPandals[0].lat, filteredPandals[0].lng];
    return [22.5726, 88.3639];
  }, [activePandal, filteredPandals]);

  const categoryCounts = useMemo(() => {
    const counts = { all: DURGA_PUJO_MAP_PANDALS.length, north: 0, south: 0, salt_lake: 0, aristocratic: 0 };
    DURGA_PUJO_MAP_PANDALS.forEach(p => {
      if (counts[p.cat] !== undefined) counts[p.cat]++;
    });
    return counts;
  }, []);

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#17151e]/90 p-3 shadow-xl backdrop-blur-md">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-2.5 text-[#f5c85b]" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={bengali ? "ম্যাপে প্যান্ডেল বা এলাকা খুঁজুন..." : "Search pandal or locality on map..."}
            className="h-9 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-xs text-white placeholder:text-[#f8edd8]/50 focus:outline-none focus:ring-1 focus:ring-[#f5c85b]"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setSelectedCat("all")}
            className={`rounded-full px-3 py-1.5 font-bold transition ${
              selectedCat === "all" ? "bg-[#f5c85b] text-[#241f1a]" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {bengali ? "সবকটি" : "All"} ({categoryCounts.all})
          </button>
          <button
            onClick={() => setSelectedCat("north")}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-bold transition ${
              selectedCat === "north" ? "bg-[#e0342c] text-white" : "bg-white/10 text-[#ff8b85] hover:bg-white/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#e0342c]" />
            {bengali ? "উত্তর কলকাতা" : "North"} ({categoryCounts.north})
          </button>
          <button
            onClick={() => setSelectedCat("south")}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-bold transition ${
              selectedCat === "south" ? "bg-[#3388ff] text-white" : "bg-white/10 text-[#85b7ff] hover:bg-white/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#3388ff]" />
            {bengali ? "দক্ষিণ কলকাতা" : "South"} ({categoryCounts.south})
          </button>
          <button
            onClick={() => setSelectedCat("salt_lake")}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-bold transition ${
              selectedCat === "salt_lake" ? "bg-[#2ecc40] text-white" : "bg-white/10 text-[#7aff89] hover:bg-white/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#2ecc40]" />
            {bengali ? "সল্টলেক" : "Salt Lake"} ({categoryCounts.salt_lake})
          </button>
          <button
            onClick={() => setSelectedCat("aristocratic")}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 font-bold transition ${
              selectedCat === "aristocratic" ? "bg-[#ff9f1c] text-[#241f1a]" : "bg-white/10 text-[#ffd58b] hover:bg-white/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-[#ff9f1c]" />
            {bengali ? "বনেদি বাড়ি" : "Bonedi Bari"} ({categoryCounts.aristocratic})
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative h-[min(680px,calc(100svh-12rem))] min-h-[500px] overflow-hidden rounded-[1.75rem] bg-[#0b0b0f] shadow-[0_24px_70px_rgba(18,10,14,.33)] ring-1 ring-white/15">
        <MapContainer
          center={[22.5726, 88.3639]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          attributionControl={false}
        >
          <MapViewController center={mapCenter} zoom={activePandal ? 15 : 12} />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="leaflet-dark-tiles"
          />

          {filteredPandals.map(pandal => (
            <Marker
              key={pandal.id}
              position={[pandal.lat, pandal.lng]}
              icon={getMarkerIcon(pandal.cat)}
              eventHandlers={{
                click: () => setActivePandal(pandal),
              }}
            >
              <Popup className="custom-pandal-popup">
                <div className="p-1 min-w-[210px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: getCategoryColor(pandal.cat) }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#a56922]">
                        {getCategoryLabel(pandal.cat, bengali)}
                      </span>
                    </div>
                  </div>
                  <h4 className="mt-1 font-display text-base font-bold text-[#4a2520]">{pandal.name}</h4>
                  <p className="mt-0.5 text-xs text-[#75594c]">{pandal.address}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#e8cda2]/50 pt-2">
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
                        {bengali ? "Google Maps-এ রুট দেখুন" : "Directions on Google Maps"}
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <style>{`
          .leaflet-dark-tiles {
            filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.92) saturate(0.85);
          }
          .custom-pandal-popup .leaflet-popup-content-wrapper {
            background: #fff7e8;
            border: 1px solid #e8cda2;
            border-radius: 14px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          }
          .custom-pandal-popup .leaflet-popup-tip {
            background: #fff7e8;
          }
        `}</style>

        <div className="absolute bottom-4 left-4 z-[400] flex items-center gap-2 rounded-full border border-white/20 bg-[#17161e]/90 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md">
          <MapPin size={14} className="text-[#f5c85b]" />
          <span>
            {bengali ? `${filteredPandals.length} টি প্যান্ডেল ম্যাপে প্রদর্শিত` : `Showing ${filteredPandals.length} pandals on map`}
          </span>
        </div>
      </div>
    </div>
  );
}
