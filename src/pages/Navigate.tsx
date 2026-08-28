import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, Car, ChevronDown, Compass, Crosshair, ExternalLink, Footprints, Loader2, MapPin, Navigation, RotateCcw, ShieldCheck, Square, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/AppShell";
import { NavigationMap } from "@/components/NavigationMap";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { deriveCoordinatesFromAddress, getRouteProgress, hasArrived, haversineMeters, offRouteThresholdMeters, type GeoPoint } from "@shared/navigationMath";

const PRESET_LOCATIONS: { label: string; labelBn: string; lat: number; lng: number }[] = [
  { label: "Home", labelBn: "বাড়ি", lat: 22.6646761, lng: 88.4009521 },
];

type Position = GeoPoint & { accuracy: number; heading: number | null; speed: number | null; timestamp: number };
type Mode = "walking" | "driving";
type NavigationState = "ready" | "requesting" | "routing" | "active" | "off-route" | "arrived" | "denied" | "unavailable" | "error";

function externalDirectionsUrl(name: string, destination: GeoPoint) { return `https://www.google.com/maps/dir/?${new URLSearchParams({ api: "1", destination: `${destination.lat},${destination.lng}`, query: name }).toString()}`; }
const formatDistance = (meters: number) => meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.max(0, Math.round(meters))} m`;

export default function Navigate() {
  const { id } = useParams<{ id: string }>();
  const [location, navigate] = useLocation();
  const { language } = useLanguage(); const bn = language === "bn";
  const detail = trpc.pandals.detail.useQuery({ id });
  const estimate = trpc.routes.estimate.useMutation();
  const [mode, setMode] = useState<Mode>("walking");
  const [navState, setNavState] = useState<NavigationState>("ready");
  const [position, setPosition] = useState<Position | null>(null);
  const [route, setRoute] = useState<{ geometry: GeoPoint[]; destination: GeoPoint; distanceKm: number; durationMinutes: number; calculatedAt: string; mode: Mode } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [followLocation, setFollowLocation] = useState(true); const [recenterSignal, setRecenterSignal] = useState(0);
  const [presetOpen, setPresetOpen] = useState(false); const [activePreset, setActivePreset] = useState<string | null>(null);
  const watcher = useRef<number | null>(null); const rerouteAt = useRef(0); const offRouteHits = useRef(0); const started = useRef(false); const modeRef = useRef(mode);
  const pandal = detail.data?.data;
  const eligible = Boolean(pandal);
  const stopIds = useMemo(() => (new URLSearchParams(location.split("?")[1] ?? "").get("stops") ?? "").split(",").filter(Boolean), [location]);
  const nextStopId = stopIds.slice(Math.max(0, stopIds.indexOf(id) + 1)).find(stopId => stopId !== id);
  const nextLegHref = nextStopId ? `/navigate/${nextStopId}?stops=${encodeURIComponent(stopIds.join(","))}` : null;

  const stopWatching = useCallback(() => { if (watcher.current !== null) navigator.geolocation.clearWatch(watcher.current); watcher.current = null; }, []);
  useEffect(() => () => stopWatching(), [stopWatching]);

  const requestClientRoute = useCallback(async (origin: Position, destination: GeoPoint, activeMode: Mode) => {
    try {
      const osrmProfile = activeMode === "driving" ? "driving" : "foot";
      const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        const osrmRoute = data.routes?.[0];
        if (osrmRoute && typeof osrmRoute.distance === "number" && typeof osrmRoute.duration === "number") {
          const rawCoords = osrmRoute.geometry?.coordinates;
          const routeGeometry = Array.isArray(rawCoords)
            ? rawCoords.flatMap((p: any) => Array.isArray(p) && typeof p[0] === "number" && typeof p[1] === "number" ? [{ lat: p[1], lng: p[0] }] : [])
            : [];
          if (routeGeometry.length >= 2) {
            setRoute({
              geometry: routeGeometry,
              destination,
              distanceKm: Number((osrmRoute.distance / 1000).toFixed(1)),
              durationMinutes: Math.max(1, Math.round(osrmRoute.duration / 60)),
              calculatedAt: new Date().toISOString(),
              mode: activeMode,
            });
            setNavState("active");
            offRouteHits.current = 0;
            setRouteError(null);
            return;
          }
        }
      }
    } catch {
      // Fall through
    }

    const distM = haversineMeters(origin, destination);
    const distKm = Number((distM / 1000).toFixed(1));
    const speedKmh = activeMode === "driving" ? 25 : 5;
    const durMin = Math.max(1, Math.round((distKm / speedKmh) * 60));
    const stepsCount = 15;
    const geom = Array.from({ length: stepsCount + 1 }, (_, i) => ({
      lat: Number((origin.lat + (destination.lat - origin.lat) * (i / stepsCount)).toFixed(6)),
      lng: Number((origin.lng + (destination.lng - origin.lng) * (i / stepsCount)).toFixed(6)),
    }));
    setRoute({
      geometry: geom,
      destination,
      distanceKm: distKm,
      durationMinutes: durMin,
      calculatedAt: new Date().toISOString(),
      mode: activeMode,
    });
    setNavState("active");
    offRouteHits.current = 0;
    setRouteError(null);
  }, []);

  const requestRoute = useCallback((origin: Position, reroute = false, overrideMode?: Mode) => {
    if (!pandal) return;
    setNavState(reroute ? "off-route" : "routing");
    setRouteError(null);
    const activeMode = overrideMode ?? modeRef.current;
    const dest = (pandal.latitude && pandal.longitude)
      ? { lat: pandal.latitude, lng: pandal.longitude }
      : deriveCoordinatesFromAddress(pandal.address, pandal.subArea, pandal.section);

    estimate.mutate({ recordId: pandal.id, originLat: origin.lat, originLng: origin.lng, mode: activeMode, allowCandidate: true }, {
      onSuccess: result => {
        if (result.state === "route-available") {
          setRoute({ geometry: result.routeGeometry, destination: result.destination, distanceKm: result.distanceKm, durationMinutes: result.durationMinutes, calculatedAt: result.calculatedAt, mode: activeMode });
          setNavState("active"); offRouteHits.current = 0; setRouteError(null);
        } else {
          requestClientRoute(origin, dest, activeMode);
        }
      },
      onError: () => {
        requestClientRoute(origin, dest, activeMode);
      }
    });
  }, [estimate, pandal, requestClientRoute]);

  const updatePosition = useCallback((browserPosition: GeolocationPosition) => {
    const next: Position = { lat: browserPosition.coords.latitude, lng: browserPosition.coords.longitude, accuracy: browserPosition.coords.accuracy, heading: browserPosition.coords.heading, speed: browserPosition.coords.speed, timestamp: browserPosition.timestamp };
    setPosition(next);
    if (!started.current) { started.current = true; requestRoute(next); return; }
    if (!route) return;
    if (hasArrived(next, route.destination, next.accuracy)) { setNavState("arrived"); stopWatching(); return; }
    const progress = getRouteProgress(route.geometry, next);
    if (progress.distanceFromRouteMeters > offRouteThresholdMeters(next.accuracy)) {
      offRouteHits.current += 1;
      if (offRouteHits.current >= 2 && Date.now() - rerouteAt.current > 30_000) { rerouteAt.current = Date.now(); requestRoute(next, true); }
    } else { offRouteHits.current = 0; if (navState === "off-route") setNavState("active"); }
  }, [navState, requestRoute, route, stopWatching]);

  const startNavigation = () => {
    if (!navigator.geolocation) { setNavState("unavailable"); return; }
    setNavState("requesting"); started.current = false;
    watcher.current = navigator.geolocation.watchPosition(updatePosition, error => setNavState(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable"), { enableHighAccuracy: true, timeout: 15_000, maximumAge: 8_000 });
  };
  const stopNavigation = () => { stopWatching(); setNavState("ready"); setRoute(null); started.current = false; setActivePreset(null); navigate(`/pandals/${id}`); };
  const selectPreset = (preset: typeof PRESET_LOCATIONS[number]) => {
    const fakePos: Position = { lat: preset.lat, lng: preset.lng, accuracy: 0, heading: null, speed: null, timestamp: Date.now() };
    setActivePreset(preset.label); setPresetOpen(false); setPosition(fakePos); started.current = false; requestRoute(fakePos);
  };
  const clearPreset = () => { setActivePreset(null); setPresetOpen(false); setRoute(null); setNavState("ready"); started.current = false; };
  const progress = useMemo(() => route && position ? getRouteProgress(route.geometry, position) : null, [route, position]);
  const remainingMinutes = progress && route ? Math.max(1, Math.round(route.durationMinutes * (progress.remainingMeters / Math.max(1, progress.totalMeters)))) : route?.durationMinutes;

  if (detail.isLoading) return <AppShell><main className="container py-12">{bn ? "নেভিগেশন লোড হচ্ছে…" : "Loading navigation…"}</main></AppShell>;
  if (!pandal) return <AppShell><main className="container py-12"><p>{bn ? "পুজোটি পাওয়া যায়নি।" : "This Pujo could not be found."}</p></main></AppShell>;
  if (!eligible) return <AppShell><main className="container py-8"><Link href={`/pandals/${pandal.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#8c1e21]"><ArrowLeft size={16}/>{bn ? "পুজো তথ্য" : "Back to Pujo"}</Link><section className="mt-5 max-w-xl rounded-3xl border border-[#e8cda2] bg-[#fff7e8] p-6"><MapPin className="text-[#8c1e21]"/><h1 className="mt-3 font-display text-3xl font-bold text-[#4a2520]">{bn ? "নির্ভুল নেভিগেশন নেই" : "Precise navigation unavailable"}</h1><p className="mt-3 text-[#75594c]">{bn ? "এই পুজোর যাচাই করা ম্যাপ কোঅর্ডিনেট নেই, তাই PujoParikroma নির্ভুল ইন-অ্যাপ নেভিগেশন শুরু করবে না।" : "This Pujo has no verified map coordinates, so PujoParikroma will not start precision in-app navigation."}</p><Button asChild className="mt-5 bg-[#8c1e21]"><a href={pandal.mapSearchUrl} target="_blank" rel="noreferrer"><ExternalLink size={16}/>{bn ? "ঠিকানা খুলুন" : "Open address"}</a></Button></section></main></AppShell>;

  return <div className="navigation-page min-h-dvh bg-[#171216] text-white">
    <header className="navigation-header"><button onClick={stopNavigation} className="navigation-icon-button" aria-label={bn ? "নেভিগেশন বন্ধ করুন" : "Exit navigation"}><ArrowLeft size={20}/></button><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#f5c96f]">{bn ? "পুজোপথ নেভিগেশন" : "PujoParikroma navigation"}</p><h1 className="truncate font-display text-lg font-bold">{pandal.name}</h1></div><div className="navigation-mode-toggle"><button className={`navigation-mode-btn ${mode === "walking" ? "is-active" : ""}`} onClick={() => { const m: Mode = "walking"; setMode(m); modeRef.current = m; if (position && (navState === "active" || navState === "error")) { started.current = false; requestRoute(position, false, m); } }} aria-label={bn ? "হেঁটে" : "Walking"}><Footprints size={13}/>{bn ? "হাঁটা" : "Walk"}</button><button className={`navigation-mode-btn ${mode === "driving" ? "is-active" : ""}`} onClick={() => { const m: Mode = "driving"; setMode(m); modeRef.current = m; if (position && (navState === "active" || navState === "error")) { started.current = false; requestRoute(position, false, m); } }} aria-label={bn ? "গাড়ি" : "Driving"}><Car size={13}/>{bn ? "গাড়ি" : "Drive"}</button></div><button onClick={() => { setFollowLocation(true); setRecenterSignal(value => value + 1); }} className="navigation-icon-button" aria-label={bn ? "রিসেন্টার" : "Recenter"}><Crosshair size={19}/></button></header>
    <main className="navigation-content">
      {route ? <NavigationMap route={route.geometry} userLocation={position} destination={route.destination} destinationName={pandal.name} followLocation={followLocation} onPan={() => setFollowLocation(false)} recenterSignal={recenterSignal} /> : position ? <NavigationMap route={[]} userLocation={position} destination={(pandal.latitude && pandal.longitude) ? { lat: pandal.latitude, lng: pandal.longitude } : deriveCoordinatesFromAddress(pandal.address, pandal.subArea, pandal.section)} destinationName={pandal.name} followLocation={followLocation} onPan={() => setFollowLocation(false)} recenterSignal={recenterSignal} /> : <div className="navigation-map-prompt"><Navigation size={36}/><p>{bn ? "লোকেশন অনুমতি দিলে আপনার লাইভ অবস্থান এবং রুট এখানে দেখা যাবে।" : "Allow location to see your live position and route here."}</p></div>}
      <section className="navigation-bottom-sheet">
        {navState === "arrived" ? <div className="navigation-arrived"><p className="text-sm font-bold text-[#f5c96f]">{bn ? "পৌঁছে গেছেন" : "You’ve arrived"}</p><h2 className="font-display text-2xl font-bold">{pandal.name}</h2><p>{nextLegHref ? (bn ? "পরের স্টপ শুরু করতে নিচের বোতাম চাপুন; এটি নিজে থেকে শুরু হবে না।" : "Use the button below to start the next leg; it will not start automatically.") : (bn ? "এখন আপনার Amar Pujo-তে এই সফরটি যোগ করতে পারেন।" : "You can now add this visit to Amar Pujo.")}</p><div className="mt-4 flex flex-wrap gap-2"><Button asChild className="bg-[#f4b942] text-[#39211d] hover:bg-[#f7cd72]"><Link href={`/capture/${pandal.id}`}>{bn ? "এই পুজো ক্যাপচার করুন" : "Capture this Pujo"}</Link></Button>{nextLegHref && <Button asChild className="bg-white/12 text-white hover:bg-white/20"><Link href={nextLegHref}><Navigation size={16}/>{bn ? "পরের স্টপ শুরু করুন" : "Start next leg"}</Link></Button>}<Button variant="outline" onClick={stopNavigation} className="border-white/30 text-white">{bn ? "নেভিগেশন বন্ধ" : "Stop navigation"}</Button></div></div> : <>
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#f5c96f]">{navState === "off-route" ? (bn ? "রুটের বাইরে" : "Off route") : (bn ? "আনুমানিক ভ্রমণ" : "Estimated journey")} · {route?.mode === "driving" ? (bn ? "🚗 গাড়ি" : "🚗 Drive") : (bn ? "🚶 হাঁটা" : "🚶 Walk")}</p><div className="mt-1 flex items-baseline gap-2"><strong className="text-3xl">{remainingMinutes ? `${remainingMinutes} ${bn ? "মিনিট" : "min"}` : "—"}</strong><span className="text-sm text-white/65">{progress ? `${formatDistance(progress.remainingMeters)} ${bn ? "বাকি" : "remaining"}` : (bn ? "রুট শুরু করুন" : "Start to route")}</span></div></div><span className={`navigation-status ${navState === "off-route" ? "is-warning" : ""}`}>{navState === "off-route" ? <TriangleAlert size={14}/> : <Compass size={14}/>} {navState === "active" ? (bn ? "রুটে আছেন" : "On route") : navState === "off-route" ? (bn ? "রুট আপডেট হচ্ছে" : "Updating route") : (bn ? "শুরু করার জন্য প্রস্তুত" : "Ready")}</span></div>
          {progress && <><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#f4b942]" style={{ width: `${progress.progressPercent}%` }}/></div><p className="mt-2 text-xs text-white/65">{progress.progressPercent}% {bn ? "সম্পন্ন" : "complete"} · {bn ? "রুট থেকে" : "from route"} {formatDistance(progress.distanceFromRouteMeters)}</p></>}
          {position && !activePreset && <p className="mt-3 text-xs text-white/60">{bn ? "GPS নির্ভুলতা" : "GPS accuracy"}: ~{Math.round(position.accuracy)} m · {new Date(position.timestamp).toLocaleTimeString()}</p>}
          {activePreset && <p className="mt-3 text-xs text-[#f5c96f]/80">📍 {bn ? "প্রিসেট অরিজিন" : "Preset origin"}: {activePreset} <button onClick={clearPreset} className="ml-1 underline text-white/60 hover:text-white/90">{bn ? "সরান" : "Clear"}</button></p>}
          {/* Preset origin dropdown */}
          <div className="preset-origin-wrapper mt-3">
            <button onClick={() => setPresetOpen(v => !v)} className="preset-origin-trigger">
              <MapPin size={13}/> {bn ? "প্রিসেট অরিজিন" : "Preset origin"} <ChevronDown size={13} className={`preset-chevron ${presetOpen ? "is-open" : ""}`}/>
            </button>
            {presetOpen && <div className="preset-origin-menu">
              {PRESET_LOCATIONS.map(p => (
                <button key={p.label} onClick={() => selectPreset(p)} className={`preset-origin-item ${activePreset === p.label ? "is-active" : ""}`}>
                  <span>{bn ? p.labelBn : p.label}</span>
                  <span className="text-[10px] text-white/40">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
                </button>
              ))}
            </div>}
          </div>
          {navState === "requesting" || navState === "routing" ? <p className="mt-4 inline-flex items-center gap-2 text-sm"><Loader2 className="animate-spin" size={16}/>{navState === "requesting" ? (bn ? "আপনার লাইভ লোকেশন চাওয়া হচ্ছে…" : "Requesting your live location…") : (bn ? "রুট হিসাব করা হচ্ছে…" : "Calculating your route…")}</p> : null}
          {navState === "denied" || navState === "unavailable" || navState === "error" ? <div className="mt-4 rounded-xl bg-[#4b2925] p-3 text-sm text-[#ffe6c7]">{navState === "denied" ? (bn ? "লোকেশন অনুমতি বন্ধ আছে। চাইলে নিচের বাহ্যিক ম্যাপ বিকল্প ব্যবহার করুন।" : "Location permission is disabled. You can use the optional external-map fallback below.") : navState === "error" ? (routeError === "service-unavailable" ? (bn ? "রাউটিং সার্ভিস এখন পাওয়া যাচ্ছে না। বাহ্যিক ম্যাপ ব্যবহার করুন অথবা পরে আবার চেষ্টা করুন।" : "The routing service is currently unavailable. Use external maps or try again later.") : routeError === "destination-unverified" ? (bn ? "এই পুজোর যাচাই করা কোঅর্ডিনেট নেই। ঠিকানা প্রিভিউ ব্যবহার করুন।" : "This Pujo has no verified coordinates yet. Use the address preview instead.") : routeError === "no-route" ? (bn ? "এই অবস্থান থেকে কোনও রুট পাওয়া যায়নি। আপনি কি কলকাতায় আছেন?" : "No route found from your location. Are you in Kolkata?") : routeError === "network-error" ? (bn ? "নেটওয়ার্ক ত্রুটি। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।" : "Network error. Check your internet connection.") : (bn ? "রুট পাওয়া যায়নি। আপনার GPS চলতে থাকলে আবার চেষ্টা করুন।" : "A route could not be loaded. Try again while GPS is available.")) : (bn ? "লাইভ GPS এখন পাওয়া যাচ্ছে না।" : "Live GPS is currently unavailable.")}</div> : null}
          <div className="mt-4 flex flex-wrap gap-2">{navState === "ready" || navState === "denied" || navState === "unavailable" || navState === "error" ? <Button onClick={startNavigation} className="min-h-12 bg-[#f4b942] text-[#39211d] hover:bg-[#f7cd72]"><Navigation size={17}/>{bn ? "নেভিগেশন শুরু করুন" : "Start navigation"}</Button> : <Button onClick={() => { setFollowLocation(true); setRecenterSignal(value => value + 1); }} className="min-h-11 bg-white/12 text-white hover:bg-white/20"><Crosshair size={16}/>{bn ? "রিসেন্টার" : "Recenter"}</Button>}<Button onClick={() => position && requestRoute(position, true)} disabled={!position || estimate.isPending} variant="outline" className="min-h-11 border-white/30 text-white hover:bg-white/10"><RotateCcw size={16}/>{bn ? "রুট রিফ্রেশ" : "Refresh route"}</Button><Button asChild variant="ghost" className="min-h-11 text-white/70 hover:bg-white/10 hover:text-white"><a href={externalDirectionsUrl(pandal.name, { lat: pandal.latitude, lng: pandal.longitude })} target="_blank" rel="noreferrer"><ExternalLink size={16}/>{bn ? "বাহ্যিক ম্যাপ" : "External maps"}</a></Button></div>
          <p className="mt-3 flex gap-1 text-[11px] leading-relaxed text-white/55"><ShieldCheck size={13} className="mt-0.5 shrink-0"/>{bn ? "লাইভ অবস্থান শুধুমাত্র এই নেভিগেশন সেশনে ব্যবহৃত হয়; এটি সংরক্ষণ করা হয় না। সময় ট্রাফিক-লাইভ নয়।" : "Live location is used only during this navigation session and is not stored. Timing is not traffic-live."}</p>
        </>}
      </section>
    </main>
  </div>;
}
