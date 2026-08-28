import { Button } from "@/components/ui/button";
import { MapPinned, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "wouter";

export const CURATED_MAPS = [
  {
    id: "puja-company",
    labelEn: "Kolkata Durga Puja Guide",
    labelBn: "কলকাতা দুর্গা পুজো গাইড",
    subtitleEn: "by The Puja Company",
    subtitleBn: "পুজো কোম্পানি থেকে",
    url: "https://www.google.com/maps/d/embed?mid=1GQ8KBEuldEMnoAmccpMiNdoHX-M8UQI&ehbc=2E312F",
  },
  {
    id: "north",
    labelEn: "North Kolkata",
    labelBn: "উত্তর কলকাতা",
    subtitleEn: "Pandal locations",
    subtitleBn: "প্যান্ডেল অবস্থান",
    url: "https://www.google.com/maps/d/embed?mid=1je0yoGaCvW6EKiQQtpPiMHa7C46uBe80&ehbc=2E312F",
  },
  {
    id: "north-central",
    labelEn: "North & Central Kolkata",
    labelBn: "উত্তর ও মধ্য কলকাতা",
    subtitleEn: "Pandal locations",
    subtitleBn: "প্যান্ডেল অবস্থান",
    url: "https://www.google.com/maps/d/embed?mid=1je0yoGaCvW6EKiQQtpPiMHa7C46uBe80&ehbc=2E312F",
  },
  {
    id: "south",
    labelEn: "South Kolkata",
    labelBn: "দক্ষিণ কলকাতা",
    subtitleEn: "Pandal locations",
    subtitleBn: "প্যান্ডেল অবস্থান",
    url: "https://www.google.com/maps/d/embed?mid=1Tl6Nuuk3U-ASzHefAgRoR6aFFXByqC5r&ehbc=2E312F",
  },
  {
    id: "salt-lake",
    labelEn: "Salt Lake",
    labelBn: "সল্ট লেক",
    subtitleEn: "Pandal locations",
    subtitleBn: "প্যান্ডেল অবস্থান",
    url: "https://www.google.com/maps/d/embed?mid=11PsLxgsYOJmt-8u9KxGC3JqH6w0Sfe8&ehbc=2E312F",
  },
];

export function CuratedPujaMap({ bengali }: { bengali: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Track which maps the user has loaded (lazy-load on demand)
  const [loadedSet, setLoadedSet] = useState<Set<number>>(new Set());
  const [failedSet, setFailedSet] = useState<Set<number>>(new Set());

  const activeMap = CURATED_MAPS[activeIndex];
  const isLoaded = loadedSet.has(activeIndex);
  const isFailed = failedSet.has(activeIndex);

  const loadCurrentMap = useCallback(() => {
    setLoadedSet(prev => new Set(prev).add(activeIndex));
  }, [activeIndex]);

  const goTo = useCallback(
    (index: number) => {
      const next = (index + CURATED_MAPS.length) % CURATED_MAPS.length;
      setActiveIndex(next);
    },
    []
  );

  return (
    <section className="mt-8 rounded-[1.75rem] border border-white/20 bg-white/5 p-4 text-[#f8edd8] backdrop-blur-md sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-bengali text-xs font-bold uppercase tracking-[0.18em] text-[#f5c85b]">
            {bengali ? "কিউরেটেড আবিষ্কারের মানচিত্র" : "Curated discovery reference"}
          </p>
          <h2 className="font-bengali mt-1 text-3xl font-bold text-[#f8edd8]">
            {bengali ? "পুজো ম্যাপ" : "Puja Maps"}
          </h2>
          <p className="mt-2 max-w-2xl font-bengali text-sm leading-relaxed text-[#f8edd8]/80">
            {bengali
              ? "কিউরেটেড মানচিত্রে কলকাতার পুজোর স্থানগুলি খুঁজুন। পিন দেখে আবিষ্কার করুন, তারপর আমাদের ক্যাটালগে নামটি খুঁজে নিজস্ব নেভিগেশন ব্যবহার করুন।"
              : "Explore Kolkata's Durga Puja locations across curated maps. Use markers to discover names and localities, then search our catalogue for navigation."}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#9d2529] px-3 py-2 text-xs font-bold text-[#f5c85b]">
          <MapPinned size={15} />
          {bengali ? "আবিষ্কারের জন্য" : "Discovery only"}
        </span>
      </div>

      {/* ── Map Carousel Tabs ── */}
      <div className="curated-map-tabs mt-5">
        <div className="curated-map-tabs__track">
          {CURATED_MAPS.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => goTo(i)}
              className={`curated-map-tab ${i === activeIndex ? "is-active" : ""}`}
              aria-current={i === activeIndex ? "true" : undefined}
            >
              <span className="curated-map-tab__label">{bengali ? m.labelBn : m.labelEn}</span>
              <span className="curated-map-tab__subtitle">{bengali ? m.subtitleBn : m.subtitleEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Map Title + Navigation Arrows ── */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          className="curated-map-arrow"
          aria-label="Previous map"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-display text-lg font-bold text-white">
            {bengali ? activeMap.labelBn : activeMap.labelEn}
          </p>
          <p className="text-xs text-[#f5c85b]">
            {bengali ? activeMap.subtitleBn : activeMap.subtitleEn} · {activeIndex + 1}/{CURATED_MAPS.length}
          </p>
        </div>

        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          className="curated-map-arrow"
          aria-label="Next map"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Map Viewport ── */}
      {!isLoaded && !isFailed && (
        <div className="mt-4 grid min-h-[360px] place-items-center rounded-[1.25rem] border border-dashed border-white/20 bg-white/5 p-6 text-center">
          <div>
            <Search className="mx-auto text-[#f5c85b]" size={28} />
            <p className="font-bengali mt-3 text-xl font-bold text-[#f8edd8]">
              {bengali ? `${activeMap.labelBn} ম্যাপ খুলুন` : `Open ${activeMap.labelEn} map`}
            </p>
            <p className="mt-2 max-w-md text-sm text-[#f8edd8]/80">
              {bengali
                ? "পৃষ্ঠার কাজ দ্রুত রাখতে ম্যাপটি আপনার অনুরোধে লোড হবে।"
                : "The map loads only on request so it does not slow down ordinary browsing."}
            </p>
            <Button
              onClick={loadCurrentMap}
              className="mt-4 rounded-full bg-[#9d2529] font-bold text-[#f5c85b] hover:bg-[#7e1d21]"
            >
              {bengali ? "পুজো ম্যাপ লোড করুন" : "Load this map"}
            </Button>
          </div>
        </div>
      )}

      {isLoaded && !isFailed && (
        <div
          data-lenis-prevent
          className="mt-4 h-[clamp(500px,72svh,760px)] overflow-hidden rounded-[1.25rem] border border-white/20 bg-black/40"
        >
          {/* Render all loaded iframes, only show the active one */}
          {CURATED_MAPS.map(
            (m, i) =>
              loadedSet.has(i) && (
                <iframe
                  key={m.id}
                  title={`Curated map – ${m.labelEn}`}
                  src={m.url}
                  className="h-full w-full border-0"
                  style={{ display: i === activeIndex ? "block" : "none" }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  onError={() => setFailedSet(prev => new Set(prev).add(i))}
                />
              )
          )}
        </div>
      )}

      {isFailed && (
        <div className="mt-4 grid min-h-[360px] place-items-center rounded-[1.25rem] border border-dashed border-white/20 bg-white/5 p-6 text-center">
          <div>
            <p className="font-bengali text-xl font-bold text-[#f8edd8]">
              {bengali ? "এই ম্যাপ এখন পাওয়া যাচ্ছে না" : "This map is currently unavailable"}
            </p>
            <p className="mt-2 text-sm text-[#f8edd8]/80">
              {bengali
                ? "আপনি অন্য ম্যাপ দেখতে পারেন অথবা PujoParikroma ক্যাটালগ ব্রাউজ করতে পারেন।"
                : "You can try another map or browse the PujoParikroma catalogue."}
            </p>
            <Button
              asChild
              className="mt-4 rounded-full bg-[#9d2529] font-bold text-[#f5c85b] hover:bg-[#7e1d21]"
            >
              <Link href="/explore?view=all">{bengali ? "সব পুজো দেখুন" : "Browse all Puja locations"}</Link>
            </Button>
          </div>
        </div>
      )}

      {/* ── Dot Indicators ── */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {CURATED_MAPS.map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => goTo(i)}
            className={`curated-map-dot ${i === activeIndex ? "is-active" : ""}`}
            aria-label={`Go to ${m.labelEn}`}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#f8edd8]/70">
        <span>{bengali ? "ম্যাপ উৎস: Google My Maps curated Durga Puja maps" : "Map source: Google My Maps curated Durga Puja maps"}</span>
        <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/10 text-[#f5c85b] hover:bg-white/20">
          <Link href="/explore?view=all">{bengali ? "সব প্যান্ডেল ব্রাউজ করুন" : "Browse all pandals"}</Link>
        </Button>
      </div>
    </section>
  );
}
