import { useMemo, useState, useEffect } from "react";
import {
  Crosshair,
  Loader2,
  MapPin,
  Navigation,
  Train,
  Bath,
  Star,
  ChevronRight,
  AlertTriangle,
  Search,
  Eye,
  EyeOff,
  ExternalLink,
  Bike,
  Footprints,
  Home,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ALL_PANDALS, type PandalRecord } from "@shared/pujaData";
import { METRO_STATIONS, getMetroLineColor } from "@shared/metroStations";
import { PUBLIC_TOILETS } from "@shared/publicToilets";
import {
  findNearestPandals,
  findTopPicks,
  findNearestMetroStations,
  findNearestToilets,
  type NearbyPandalResult,
  type TopPickResult,
  type NearbyMetroResult,
  type NearbyToiletResult,
} from "@shared/nearestDiscovery";

/** Exact Home Location coordinates */
const HOME_LOCATION = {
  lat: 22.6641983,
  lng: 88.4024476,
};

type LocationMode = "home" | "live";
type LocationState = "idle" | "finding" | "denied" | "unavailable";

function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

function estimateWalkMinutes(meters: number): number {
  return Math.max(1, Math.round((meters / 1000 / 4.5) * 60));
}

function estimateBikeMinutes(meters: number): number {
  return Math.max(1, Math.round((meters / 1000 / 20) * 60));
}

function openGoogleMaps(lat: number, lng: number, mode: "walking" | "bicycling" | "driving" = "walking") {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`, "_blank");
}

export function NearestPujoPanel() {
  const { language } = useLanguage();
  const bengali = language === "bn";

  const defaultHomeLabel = bengali ? "হোম অবস্থান" : "Home Location";

  const [locationMode, setLocationMode] = useState<LocationMode>("home");
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [activePos, setActivePos] = useState<{ lat: number; lng: number }>(HOME_LOCATION);
  const [locationName, setLocationName] = useState<string>(defaultHomeLabel);

  const [topPicks, setTopPicks] = useState<TopPickResult[]>([]);
  const [nearbyPandals, setNearbyPandals] = useState<NearbyPandalResult[]>([]);
  const [nearbyMetro, setNearbyMetro] = useState<NearbyMetroResult[]>([]);
  const [nearbyToilets, setNearbyToilets] = useState<NearbyToiletResult[]>([]);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [hiddenPandalIds, setHiddenPandalIds] = useState<Set<string>>(new Set());
  const [expandedPandalId, setExpandedPandalId] = useState<string | null>(null);
  const [showMetro, setShowMetro] = useState(true);
  const [showToilets, setShowToilets] = useState(true);

  // Recalculate results whenever active position changes
  const calculateResultsForPosition = (pos: { lat: number; lng: number }) => {
    setActivePos(pos);
    setTopPicks(findTopPicks(ALL_PANDALS, pos, { radiusMeters: 50000, limit: 3 }));
    setNearbyPandals(findNearestPandals(ALL_PANDALS, pos, { radiusMeters: 50000 }));
    setNearbyMetro(findNearestMetroStations(METRO_STATIONS, pos, 10));
    setNearbyToilets(findNearestToilets(PUBLIC_TOILETS, pos, 10));
    setLocationState("idle");
  };

  // On initial mount, default to Home Location
  useEffect(() => {
    calculateResultsForPosition(HOME_LOCATION);
    setLocationName(defaultHomeLabel);
  }, [bengali]);

  // Switch to Home Location
  const setHomeMode = () => {
    setLocationMode("home");
    setLocationName(defaultHomeLabel);
    calculateResultsForPosition(HOME_LOCATION);
  };

  // Switch to Live GPS Location
  const setLiveMode = () => {
    setLocationMode("live");
    if (!navigator.geolocation) {
      setLocationState("unavailable");
      return;
    }
    setLocationState("finding");
    navigator.geolocation.getCurrentPosition(
      (result) => {
        const pos = { lat: result.coords.latitude, lng: result.coords.longitude };
        setLocationName(bengali ? "লাইভ জিপিএস অবস্থান" : "Live GPS Location");
        calculateResultsForPosition(pos);
      },
      (error) => {
        setLocationState(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 10_000 },
    );
  };

  const toggleHidePandal = (id: string) => {
    setHiddenPandalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered pandals
  const filteredTopPicks = useMemo(() => {
    return topPicks.filter((item) => {
      if (hiddenPandalIds.has(item.pandal.id)) return false;
      const matchesCat =
        selectedCategory === "all" ||
        (selectedCategory === "iconic" && (item.pandal.priority === "S" || item.pandal.crowd === "High" || item.pandal.crowd === "Very high")) ||
        (selectedCategory === "south" && item.pandal.section === "South Kolkata") ||
        (selectedCategory === "north" && item.pandal.section === "North Kolkata") ||
        (selectedCategory === "bonedi" && item.pandal.tags?.includes("Bonedi Bari")) ||
        (selectedCategory === "saltlake" && item.pandal.section === "Salt Lake");
      const haystack = `${item.pandal.name} ${item.pandal.subArea} ${item.pandal.address}`.toLowerCase();
      const matchesQuery = !searchQuery.trim() || haystack.includes(searchQuery.trim().toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [topPicks, selectedCategory, searchQuery, hiddenPandalIds]);

  const filteredOthers = useMemo(() => {
    const topIds = new Set(filteredTopPicks.map((tp) => tp.pandal.id));
    return nearbyPandals.filter((item) => {
      if (topIds.has(item.pandal.id)) return false;
      const matchesCat =
        selectedCategory === "all" ||
        (selectedCategory === "iconic" && (item.pandal.priority === "S" || item.pandal.crowd === "High" || item.pandal.crowd === "Very high")) ||
        (selectedCategory === "south" && item.pandal.section === "South Kolkata") ||
        (selectedCategory === "north" && item.pandal.section === "North Kolkata") ||
        (selectedCategory === "bonedi" && item.pandal.tags?.includes("Bonedi Bari")) ||
        (selectedCategory === "saltlake" && item.pandal.section === "Salt Lake");
      const haystack = `${item.pandal.name} ${item.pandal.subArea} ${item.pandal.address}`.toLowerCase();
      const matchesQuery = !searchQuery.trim() || haystack.includes(searchQuery.trim().toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [nearbyPandals, filteredTopPicks, selectedCategory, searchQuery]);

  const hiddenPandalsList = useMemo(() => {
    return nearbyPandals.filter((item) => hiddenPandalIds.has(item.pandal.id));
  }, [nearbyPandals, hiddenPandalIds]);

  return (
    <div className="space-y-6">
      {/* ── Location Mode Toggle Bar (Home vs Live GPS) ── */}
      <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-2xl font-bold text-[#f8edd8]">
            {bengali ? "নিকটবর্তী আবিষ্কার কেন্দ্র" : "Proximity Discovery Center"}
          </h2>
          <p className="mt-1 text-xs text-[#f8edd8]/70">
            {bengali
              ? "হোম অবস্থান অথবা লাইভ জিপিএস অবস্থান থেকে দূরত্ব হিসাব করুন।"
              : "Calculate distances and transit times from your Home Location or Live GPS position."}
          </p>
        </div>

        {/* 2-Option Buttons: Home Location vs Live GPS Location */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            onClick={setHomeMode}
            className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
              locationMode === "home"
                ? "border-[#f5c85b] bg-[#8c1e21] text-white shadow-lg"
                : "border-white/15 bg-white/5 text-[#f8edd8]/80 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${locationMode === "home" ? "bg-[#f5c85b] text-[#8c1e21]" : "bg-white/10 text-[#f5c85b]"}`}>
                <Home size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">{bengali ? "হোম অবস্থান" : "Home Location"}</p>
                <p className="text-[11px] opacity-80">{bengali ? "সংরক্ষিত প্রাথমিক অবস্থান" : "Primary set position"}</p>
              </div>
            </div>
            {locationMode === "home" && <Check className="text-[#f5c85b]" size={18} />}
          </button>

          <button
            onClick={setLiveMode}
            disabled={locationState === "finding"}
            className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
              locationMode === "live"
                ? "border-[#f5c85b] bg-[#8c1e21] text-white shadow-lg"
                : "border-white/15 bg-white/5 text-[#f8edd8]/80 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${locationMode === "live" ? "bg-[#f5c85b] text-[#8c1e21]" : "bg-white/10 text-[#f5c85b]"}`}>
                {locationState === "finding" ? <Loader2 className="animate-spin" size={18} /> : <Crosshair size={18} />}
              </div>
              <div>
                <p className="text-sm font-bold">{bengali ? "লাইভ জিপিএস অবস্থান" : "Live GPS Location"}</p>
                <p className="text-[11px] opacity-80">
                  {locationState === "finding" ? (bengali ? "অবস্থান খোঁজা হচ্ছে…" : "Locating GPS…") : (bengali ? "ডিভাইসের বর্তমান অবস্থান" : "Device current position")}
                </p>
              </div>
            </div>
            {locationMode === "live" && <Check className="text-[#f5c85b]" size={18} />}
          </button>
        </div>

        {/* Active Reference Point Badge */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#f5c85b]">
          <MapPin size={14} />
          <span>
            {bengali ? "বর্তমান রেফারেন্স অবস্থান:" : "Active Reference Point:"}{" "}
            {locationMode === "home"
              ? (bengali ? "হোম অবস্থান" : "Home Location")
              : `${locationName} (${activePos.lat.toFixed(5)}, ${activePos.lng.toFixed(5)})`}
          </span>
        </div>
      </div>

      {/* Permission Errors */}
      {locationState === "denied" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-[#f8edd8]">
          <AlertTriangle className="mt-0.5 flex-shrink-0 text-amber-400" size={18} />
          <p>
            {bengali
              ? "লাইভ জিপিএস অনুমতি বন্ধ আছে। হোম অবস্থান ব্যবহার করা হচ্ছে।"
              : "Live GPS permission is disabled. Falling back to Home Location."}
          </p>
        </div>
      )}
      {locationState === "unavailable" && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-[#f8edd8]">
          <AlertTriangle className="mt-0.5 flex-shrink-0 text-amber-400" size={18} />
          <p>
            {bengali
              ? "লাইভ জিপিএস পাওয়া যাচ্ছে না। হোম অবস্থান ব্যবহার করা হচ্ছে।"
              : "Live GPS is unavailable on this device. Using Home Location."}
          </p>
        </div>
      )}

      {/* ── Search & Category Controls ── */}
      <div className="space-y-3">
        {/* Quick Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-[#f5c85b]" size={16} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={bengali ? "কাছের প্যান্ডেল বা এলাকা খুঁজুন..." : "Search nearby pandals or areas..."}
            className="h-10 border-white/20 bg-white/10 pl-9 text-xs text-white placeholder:text-[#f8edd8]/60 focus-visible:ring-[#f5c85b]"
          />
        </div>

        {/* Category Filter Pills & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", labelEn: "All Pandals", labelBn: "সব প্যান্ডেল" },
              { id: "iconic", labelEn: "⭐ Iconic", labelBn: "⭐ আইকনিক" },
              { id: "south", labelEn: "South Kolkata", labelBn: "দক্ষিণ কলকাতা" },
              { id: "north", labelEn: "North Kolkata", labelBn: "উত্তর কলকাতা" },
              { id: "saltlake", labelEn: "Salt Lake", labelBn: "সল্ট লেক" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  selectedCategory === cat.id
                    ? "bg-[#9d2529] text-[#f5c85b]"
                    : "border border-white/15 bg-white/5 text-[#f8edd8]/80 hover:bg-white/15"
                }`}
              >
                {bengali ? cat.labelBn : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Metro & Toilet Amenities Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMetro(!showMetro)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                showMetro ? "bg-[#2563eb] text-white" : "border border-white/15 bg-white/5 text-[#f8edd8]/60"
              }`}
            >
              <Train size={12} /> {bengali ? "মেট্রো" : "Metro"}
            </button>
            <button
              onClick={() => setShowToilets(!showToilets)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                showToilets ? "bg-[#0891b2] text-white" : "border border-white/15 bg-white/5 text-[#f8edd8]/60"
              }`}
            >
              <Bath size={12} /> {bengali ? "টয়লেট" : "Toilets"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Results Container ── */}
      <div className="space-y-6">
        {/* Top Recommendations (🥇 Gold, 🥈 Silver, 🥉 Bronze Badges) */}
        {filteredTopPicks.length > 0 && (
          <section className="rounded-[1.35rem] border border-[#f5c85b]/30 bg-[#f5c85b]/8 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[#f5c85b]">
              <div className="flex items-center gap-2">
                <Star size={17} />
                <h3 className="font-display text-lg font-bold">
                  {bengali ? "🥇 শীর্ষ সুপারিশসমূহ" : "Top Recommendations"}
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#f5c85b]/80">
                {bengali ? "দূরত্ব ও রেটিং সেরা" : "Ranked by Proximity & Priority"}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTopPicks.map((item, index) => {
                const badgeLabel = index === 0 ? "🥇 First Choice" : index === 1 ? "🥈 Alternative" : "🥉 Backup Choice";
                const badgeClass = index === 0 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : index === 1 ? "bg-slate-300/20 text-slate-200 border-slate-300/30" : "bg-orange-600/20 text-orange-300 border-orange-600/30";
                const walkMins = estimateWalkMinutes(item.distanceMeters);
                const bikeMins = estimateBikeMinutes(item.distanceMeters);

                return (
                  <div
                    key={item.pandal.id}
                    className="rounded-2xl border border-white/15 bg-[#1b0f10]/80 p-4 transition hover:border-[#f5c85b]/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                        <h4 className="mt-1.5 text-base font-bold text-[#f8edd8]">{item.pandal.name}</h4>
                        <p className="mt-0.5 text-xs text-[#f8edd8]/70">
                          {item.pandal.subArea} · {item.pandal.section}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f5c85b]/20 px-2.5 py-1 text-xs font-bold text-[#f5c85b]">
                        📏 {formatDistance(item.distanceMeters)}
                      </span>
                    </div>

                    {/* Transit Estimates & Metro Info */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/10 pt-2.5 text-xs text-[#f8edd8]/80">
                      <span className="flex items-center gap-1 font-medium text-emerald-400">
                        <Footprints size={13} /> 🚶 {walkMins} min walk
                      </span>
                      <span className="flex items-center gap-1 font-medium text-sky-400">
                        <Bike size={13} /> 🏍️ {bikeMins} min bike
                      </span>
                      {item.pandal.metro && (
                        <span className="flex items-center gap-1 text-[#f8edd8]/60">
                          <Train size={12} className="text-[#2563eb]" /> {item.pandal.metro}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openGoogleMaps(item.pandal.latitude, item.pandal.longitude, "walking")}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20"
                        >
                          <Footprints size={12} /> Walk Maps
                        </button>
                        <button
                          onClick={() => openGoogleMaps(item.pandal.latitude, item.pandal.longitude, "bicycling")}
                          className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-500/20"
                        >
                          <Bike size={12} /> Bike Maps
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleHidePandal(item.pandal.id)}
                          title={bengali ? "লুকান" : "Hide pandal"}
                          className="p-1.5 text-[#f8edd8]/50 hover:text-white"
                        >
                          <EyeOff size={15} />
                        </button>
                        <Button asChild size="sm" className="h-8 rounded-full bg-[#9d2529] px-3.5 text-xs font-bold text-[#f5c85b] hover:bg-[#7e1d21]">
                          <Link href={`/pandals/${item.pandal.id}`}>
                            {bengali ? "বিস্তারিত" : "Details"} <ChevronRight size={13} />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Other Nearby Pandals List */}
        {filteredOthers.length > 0 && (
          <section className="rounded-[1.35rem] border border-white/15 bg-white/5 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[#f8edd8]">
              <div className="flex items-center gap-2">
                <MapPin size={17} className="text-[#f5c85b]" />
                <h3 className="font-display text-lg font-bold">
                  {bengali ? "📍 অন্যান্য কাছাকাছি প্যান্ডেল" : "Other Nearby Pandals"}
                </h3>
              </div>
              <span className="text-xs font-bold text-[#f5c85b]">
                {filteredOthers.length} {bengali ? "টি পাওয়া গেছে" : "found"}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {filteredOthers.slice(0, 12).map((item) => {
                const isExpanded = expandedPandalId === item.pandal.id;
                const walkMins = estimateWalkMinutes(item.distanceMeters);
                const bikeMins = estimateBikeMinutes(item.distanceMeters);

                return (
                  <div
                    key={item.pandal.id}
                    className="rounded-xl border border-white/10 bg-black/30 transition hover:bg-black/50"
                  >
                    <div
                      onClick={() => setExpandedPandalId(isExpanded ? null : item.pandal.id)}
                      className="flex cursor-pointer items-center justify-between p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#f8edd8]">{item.pandal.name}</p>
                        <p className="text-xs text-[#f8edd8]/60">
                          {item.pandal.subArea} · <span className="font-semibold text-[#f5c85b]">{formatDistance(item.distanceMeters)}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-400">🚶 {walkMins}m</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHidePandal(item.pandal.id);
                          }}
                          className="p-1 text-[#f8edd8]/50 hover:text-white"
                        >
                          <EyeOff size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Drawer Details */}
                    {isExpanded && (
                      <div className="border-t border-white/10 p-3 pt-2 text-xs text-[#f8edd8]/80">
                        <p className="text-[#f8edd8]/70">{item.pandal.address}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-emerald-400">🚶 {walkMins} min walk</span>
                          <span className="text-sky-400">🏍️ {bikeMins} min bike</span>
                          {item.pandal.metro && <span>🚇 {item.pandal.metro}</span>}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <button
                            onClick={() => openGoogleMaps(item.pandal.latitude, item.pandal.longitude, "walking")}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#f5c85b] underline"
                          >
                            Open in Google Maps <ExternalLink size={11} />
                          </button>
                          <Link href={`/pandals/${item.pandal.id}`} className="font-bold text-[#f5c85b] hover:underline">
                            View Pandal Page →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Hidden Pandals Section */}
        {hiddenPandalsList.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[#f8edd8]/70">
            <span className="font-semibold">🙈 Hidden ({hiddenPandalsList.length}):</span>{" "}
            {hiddenPandalsList.map((h) => (
              <span key={h.pandal.id} className="mr-2 inline-flex items-center gap-1 rounded bg-black/40 px-2 py-0.5">
                {h.pandal.name}{" "}
                <button onClick={() => toggleHidePandal(h.pandal.id)} className="text-[#f5c85b] hover:underline">
                  <Eye size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Nearest Metro Stations Section */}
        {showMetro && nearbyMetro.length > 0 && (
          <section className="rounded-[1.35rem] border border-[#2563eb]/30 bg-[#2563eb]/10 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[#60a5fa]">
              <div className="flex items-center gap-2">
                <Train size={18} />
                <h3 className="font-display text-lg font-bold">
                  {bengali ? "🚇 নিকটতম মেট্রো স্টেশনসমূহ" : "Nearest Metro & Bus Stops"}
                </h3>
              </div>
              <span className="text-xs font-bold text-[#60a5fa]">
                {nearbyMetro.length} {bengali ? "টি" : "stations"}
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {nearbyMetro.map((r) => {
                const walkMins = estimateWalkMinutes(r.distanceMeters);
                return (
                  <div
                    key={r.station.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3 transition hover:bg-black/60"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold text-white shadow"
                        style={{ backgroundColor: getMetroLineColor(r.station.line) }}
                      >
                        M
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#f8edd8]">
                          {bengali ? r.station.nameBn : r.station.name}
                        </p>
                        <p className="text-xs text-[#f8edd8]/60">
                          {r.station.line} Line · 🚶 {walkMins} min walk
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#60a5fa]">{formatDistance(r.distanceMeters)}</span>
                      <button
                        onClick={() => openGoogleMaps(r.station.lat, r.station.lng, "walking")}
                        className="grid h-7 w-7 place-items-center rounded-full bg-[#2563eb]/20 text-[#60a5fa] hover:bg-[#2563eb]/40"
                        title="Navigate to station"
                      >
                        <Navigation size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Nearest Public Toilets Section */}
        {showToilets && nearbyToilets.length > 0 && (
          <section className="rounded-[1.35rem] border border-[#0891b2]/30 bg-[#0891b2]/10 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[#22d3ee]">
              <div className="flex items-center gap-2">
                <Bath size={18} />
                <h3 className="font-display text-lg font-bold">
                  {bengali ? "🚻 নিকটতম পাবলিক টয়লেট" : "Nearest Public Toilets"}
                </h3>
              </div>
              <span className="text-xs font-bold text-[#22d3ee]">
                {nearbyToilets.length} {bengali ? "টি" : "locations"}
              </span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {nearbyToilets.map((r) => {
                const walkMins = estimateWalkMinutes(r.distanceMeters);
                return (
                  <div
                    key={r.toilet.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3 transition hover:bg-black/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#0891b2] text-xs font-bold text-white shadow">
                        🚻
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#f8edd8]">
                          {bengali ? r.toilet.nameBn : r.toilet.name}
                        </p>
                        <p className="text-xs text-[#f8edd8]/60">
                          {bengali ? "পাবলিক টয়লেট" : "Public Toilet"} · 🚶 {walkMins} min walk
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#22d3ee]">{formatDistance(r.distanceMeters)}</span>
                      <button
                        onClick={() => openGoogleMaps(r.toilet.lat, r.toilet.lng, "walking")}
                        className="grid h-7 w-7 place-items-center rounded-full bg-[#0891b2]/20 text-[#22d3ee] hover:bg-[#0891b2]/40"
                        title="Navigate to toilet"
                      >
                        <Navigation size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredTopPicks.length === 0 && filteredOthers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center">
            <MapPin className="mx-auto text-[#f5c85b]" size={28} />
            <h3 className="mt-3 font-display text-xl font-bold text-[#f8edd8]">
              {bengali ? "কোনও প্যান্ডেল পাওয়া যায়নি" : "No pandals match filters"}
            </h3>
            <p className="mt-1 text-sm text-[#f8edd8]/60">
              {bengali
                ? "আপনার ফিল্টার বা অনুসন্ধান শব্দ পরিবর্তন করে আবার চেষ্টা করুন।"
                : "Try clearing your search query or changing category filter."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
