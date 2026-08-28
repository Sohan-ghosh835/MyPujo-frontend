import { AppShell } from "@/components/AppShell";
import { AddressDirectoryRow } from "@/components/AddressDirectoryRow";
import { PhotoHighlightCard } from "@/components/PhotoHighlightCard";
import { PujoGallery } from "@/components/PujoGallery";
import { DevelopmentPill } from "@/components/StatusPill";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { buildPublicGalleryAssets, PUBLIC_GALLERY_SUMMARY, type PublicGalleryAsset } from "@shared/publicGallery";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 24;
const guideLenses = ["All guide lenses", "Heritage", "Artistry", "Lightscape", "Community", "Grand scale"] as const;
const sections = ["All Kolkata", "South Kolkata", "North Kolkata", "Central Kolkata", "East Kolkata", "West Kolkata", "Salt Lake", "New Town"] as const;
const priorities = ["All supplied priorities", "S", "A", "B", "C"] as const;
type ExploreView = "all" | "photo" | "gallery";

export default function Explore() {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const initialFilters = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(() => initialFilters.get("q") ?? "");
  const [section, setSection] = useState(() => initialFilters.get("section") ?? "All Kolkata");
  const [crowd, setCrowd] = useState("Any crowd");
  const [lens, setLens] = useState(() => guideLenses.includes(initialFilters.get("lens") as typeof guideLenses[number]) ? initialFilters.get("lens")! : "All guide lenses");
  const [priority, setPriority] = useState(() => initialFilters.get("priority") ?? "All supplied priorities");
  const [sourceFilter, setSourceFilter] = useState(() => initialFilters.get("source") ?? "All sources");
  const [sourceZone, setSourceZone] = useState(() => initialFilters.get("sourceZone") ?? "All source zones");
  const [sourceFeatured, setSourceFeatured] = useState(() => initialFilters.get("featured") ?? "Any source feature");
  const [locationStatus, setLocationStatus] = useState(() => initialFilters.get("location") ?? "All location states");
  const [view, setView] = useState<ExploreView>(() => {
    const requestedView = initialFilters.get("view");
    return requestedView === "all" || requestedView === "gallery" ? requestedView : "photo";
  });
  const [page, setPage] = useState(() => Math.max(1, Number.parseInt(initialFilters.get("page") ?? "1", 10) || 1));
  const isPhotoView = view === "photo";
  const isGalleryView = view === "gallery";

  const pandals = trpc.pandals.list.useQuery({
    query,
    section: section as "North Kolkata" | "South Kolkata" | "Central Kolkata" | "East Kolkata" | "West Kolkata" | "Salt Lake" | "New Town" | "All Kolkata",
    crowd: crowd === "Any crowd" ? undefined : crowd,
    tag: lens === "All guide lenses" ? undefined : lens,
    priority: priority === "All supplied priorities" ? undefined : priority as "S" | "A" | "B" | "C",
    source: sourceFilter === "KolkataKhoj" ? "kolkatakhoj" : undefined,
    sourceZone: sourceZone === "All source zones" ? undefined : sourceZone as "North" | "Central" | "South" | "Salt Lake",
    sourceFeatured: sourceFeatured === "Featured by source" ? true : sourceFeatured === "Not source featured" ? false : undefined,
    hasImage: isPhotoView ? true : undefined,
    locationStatus: locationStatus === "All location states" ? undefined : locationStatus as "verified-coordinate" | "address-available" | "approximate-locality",
  }, { enabled: !isGalleryView });
  const records = isGalleryView ? [] : (pandals.data?.data ?? []);
  const photoAssets = useMemo<PublicGalleryAsset[]>(() => buildPublicGalleryAssets(records), [records]);
  const listingCount = isPhotoView ? photoAssets.length : records.length;
  const pageCount = Math.max(1, Math.ceil(listingCount / PAGE_SIZE));
  const visibleRecords = useMemo(() => records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [records, page]);
  const visiblePhotoAssets = useMemo(() => photoAssets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [photoAssets, page]);

  useEffect(() => { if (!pandals.isLoading && page > pageCount) setPage(pageCount); }, [pandals.isLoading, page, pageCount]);
  useEffect(() => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (section !== "All Kolkata") next.set("section", section);
    if (lens !== "All guide lenses") next.set("lens", lens);
    if (priority !== "All supplied priorities") next.set("priority", priority);
    if (sourceFilter === "KolkataKhoj") next.set("source", "kolkatakhoj");
    if (sourceZone !== "All source zones") next.set("sourceZone", sourceZone);
    if (sourceFeatured === "Featured by source") next.set("featured", "yes");
    if (sourceFeatured === "Not source featured") next.set("featured", "no");
    if (locationStatus !== "All location states") next.set("location", locationStatus);
    if (view !== "photo") next.set("view", view);
    if (page > 1) next.set("page", String(page));
    window.history.replaceState({}, "", `/explore${next.size ? `?${next}` : ""}`);
  }, [query, section, lens, priority, sourceFilter, sourceZone, sourceFeatured, locationStatus, view, page]);

  const sectionLabel = (item: string) => bengali ? ({ "All Kolkata": "সমস্ত কলকাতা", "South Kolkata": "দক্ষিণ কলকাতা", "North Kolkata": "উত্তর কলকাতা", "Central Kolkata": "মধ্য কলকাতা", "East Kolkata": "পূর্ব কলকাতা", "West Kolkata": "পশ্চিম কলকাতা", "Salt Lake": "সল্ট লেক", "New Town": "নিউ টাউন" }[item] ?? item) : item;
  const lensLabel = (item: string) => bengali ? ({ "All guide lenses": "সব গাইড লেন্স", Heritage: "ঐতিহ্য", Artistry: "শিল্প", Lightscape: "আলোর সাজ", Community: "সম্প্রদায়", "Grand scale": "বৃহৎ আয়োজন" }[item] ?? item) : item;
  const crowdLabel = (item: string) => bengali ? ({ "Any crowd": "সব ভিড়", Low: "কম", Moderate: "মাঝারি", High: "বেশি", "Very high": "খুব বেশি" }[item] ?? item) : item;
  const clearFilters = () => { setQuery(""); setSection("All Kolkata"); setCrowd("Any crowd"); setLens("All guide lenses"); setPriority("All supplied priorities"); setSourceFilter("All sources"); setSourceZone("All source zones"); setSourceFeatured("Any source feature"); setLocationStatus("All location states"); setView("photo"); };
  const peerButtonClass = (active: boolean) => `rounded-full font-bold transition-all ${active ? "bg-[#9d2529] text-[#f5c85b] shadow-md" : "border border-[#f5c85b]/40 bg-white/10 text-[#f8edd8] hover:bg-white/20"}`;

  return <AppShell><div className="mx-auto max-w-7xl px-5 py-10 lg:px-10 lg:py-14">
    <div className="max-w-2xl"><DevelopmentPill /><p className="font-bengali text-xs font-bold uppercase tracking-[0.18em] text-[#f5c85b] mt-5">{bengali ? "পুজোর খোঁজ" : "Explore the season"}</p><h1 className="font-bengali mt-2 text-4xl font-bold leading-tight text-[#f8edd8] sm:text-5xl">{bengali ? "রাতের জন্য ঠিক প্যান্ডেল খুঁজুন।" : "Find a pandal that fits the night."}</h1><p className="mt-4 font-bengali text-base leading-relaxed text-[#f8edd8]/80">{bengali ? "নাম, নথিভুক্ত বিকল্প নাম, এলাকা, রাস্তা ও পিনকোড দিয়ে খুঁজুন। ফটো হাইলাইটে শুধু অধিকার-পরিষ্কার ছবি রাখা হয়; সরবরাহ করা অগ্রাধিকার ভবিষ্যতের যাচাই থেকে আলাদা।" : "Search names, documented aliases, localities, roads, and pincodes. Photo Highlights contains only real, rights-cleared committee photography; supplied priority is kept separate from any future verification."}</p></div>
    <div className="mt-6 flex flex-wrap gap-2" aria-label={bengali ? "এক্সপ্লোর বিভাগ" : "Explore sections"}>
      <Button onClick={() => setView("all")} aria-pressed={view === "all"} className={peerButtonClass(view === "all")}>{bengali ? "সব রেকর্ড" : "All records"}</Button>
      <Button onClick={() => setView("photo")} aria-pressed={isPhotoView} className={peerButtonClass(isPhotoView)}>{bengali ? "ফটো হাইলাইট" : "Photo Highlights"}</Button>
      <Button onClick={() => setView("gallery")} aria-pressed={isGalleryView} className={peerButtonClass(isGalleryView)}>{bengali ? "পুজো গ্যালারি" : "Pujo Gallery"}</Button>
    </div>

    {isGalleryView ? <PujoGallery bengali={bengali}/> : <>
      <div className="mt-4 grid gap-3.5 rounded-[1.5rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl lg:grid-cols-3">
        <div className="relative lg:col-span-2"><Search className="absolute left-3.5 top-3.5 text-[#f5c85b]" size={18}/><Input value={query} onChange={event => setQuery(event.target.value)} placeholder={bengali ? "নাম, বিকল্প নাম, এলাকা, রাস্তা বা পিনকোড খুঁজুন" : "Search name, alias, locality, road, or pincode"} className="h-11 rounded-xl border-white/20 bg-white/10 pl-11 text-sm text-[#f8edd8] placeholder:text-[#f8edd8]/60 focus-visible:ring-[#f5c85b]"/></div>
        <Select value={section} onValueChange={setSection}><SelectTrigger className="h-11 rounded-xl border-white/20 bg-[#2b1717]/80 text-sm text-[#f8edd8] hover:bg-[#381c1e]"><SelectValue/></SelectTrigger><SelectContent>{sections.map(item => <SelectItem key={item} value={item}>{sectionLabel(item)}</SelectItem>)}</SelectContent></Select>
        <Select value={priority} onValueChange={setPriority}><SelectTrigger className="h-11 rounded-xl border-white/20 bg-[#2b1717]/80 text-sm text-[#f8edd8] hover:bg-[#381c1e]"><SelectValue/></SelectTrigger><SelectContent>{priorities.map(item => <SelectItem key={item} value={item}>{item === "All supplied priorities" ? (bengali ? "সব সরবরাহ করা অগ্রাধিকার" : item) : (bengali ? `সরবরাহ অগ্রাধিকার ${item}` : `Supplied priority ${item}`)}</SelectItem>)}</SelectContent></Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}><SelectTrigger className="h-11 rounded-xl border-white/20 bg-[#2b1717]/80 text-sm text-[#f8edd8] hover:bg-[#381c1e]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="All sources">{bengali ? "সব উৎস" : "All sources"}</SelectItem><SelectItem value="KolkataKhoj">KolkataKhoj 2026</SelectItem></SelectContent></Select>
        <Select value={sourceZone} onValueChange={setSourceZone}><SelectTrigger className="h-11 rounded-xl border-white/20 bg-[#2b1717]/80 text-sm text-[#f8edd8] hover:bg-[#381c1e]"><SelectValue/></SelectTrigger><SelectContent>{["All source zones", "North", "Central", "South", "Salt Lake"].map(item => <SelectItem key={item} value={item}>{item === "All source zones" ? (bengali ? "সব উৎস অঞ্চল" : item) : item}</SelectItem>)}</SelectContent></Select>
        <Select value={sourceFeatured} onValueChange={setSourceFeatured}><SelectTrigger className="h-11 rounded-xl border-white/20 bg-[#2b1717]/80 text-sm text-[#f8edd8] hover:bg-[#381c1e]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Any source feature">{bengali ? "যে কোনও উৎস ফিচার" : "Any source feature"}</SelectItem><SelectItem value="Featured by source">{bengali ? "উৎসে ফিচার্ড" : "Featured by source"}</SelectItem><SelectItem value="Not source featured">{bengali ? "উৎসে ফিচার্ড নয়" : "Not source featured"}</SelectItem></SelectContent></Select>
        <Select value={locationStatus} onValueChange={setLocationStatus}><SelectTrigger className="h-11 rounded-xl border-white/20 bg-[#2b1717]/80 text-sm text-[#f8edd8] hover:bg-[#381c1e]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="All location states">{bengali ? "সব লোকেশন অবস্থা" : "All location states"}</SelectItem><SelectItem value="verified-coordinate">{bengali ? "লোকেশন যাচাই করা" : "Location verified"}</SelectItem><SelectItem value="address-available">{bengali ? "ঠিকানা আছে" : "Address available"}</SelectItem><SelectItem value="approximate-locality">{bengali ? "আনুমানিক এলাকা" : "Approximate locality"}</SelectItem></SelectContent></Select>
        <Select value={lens} onValueChange={setLens}><SelectTrigger className="h-11 rounded-xl border-white/20 bg-[#2b1717]/80 text-sm text-[#f8edd8] hover:bg-[#381c1e]"><SelectValue/></SelectTrigger><SelectContent>{guideLenses.map(item => <SelectItem key={item} value={item}>{lensLabel(item)}</SelectItem>)}</SelectContent></Select>
        <Select value={crowd} onValueChange={setCrowd}><SelectTrigger className="h-11 rounded-xl border-white/20 bg-[#2b1717]/80 text-sm text-[#f8edd8] hover:bg-[#381c1e]"><SelectValue/></SelectTrigger><SelectContent>{["Any crowd", "Low", "Moderate", "High", "Very high"].map(item => <SelectItem key={item} value={item}>{crowdLabel(item)}</SelectItem>)}</SelectContent></Select>
        <Button onClick={clearFilters} variant="outline" className="h-11 rounded-xl border-white/25 bg-white/10 font-bold text-[#f5c85b] hover:bg-white/20 hover:text-[#f5c85b]"><SlidersHorizontal size={16}/>{bengali ? "রিসেট" : "Reset"}</Button>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-medium text-[#f8edd8]/80">{pandals.isLoading ? (bengali ? "অনুমোদিত অ্যাসেট লোড হচ্ছে…" : "Loading approved image assets…") : <>{listingCount} {isPhotoView ? (bengali ? "টি স্বতন্ত্র ছবি হাইলাইট" : "independent photo highlights") : (bengali ? "টি র‌্যাঙ্ক করা ঠিকানা রেকর্ড" : "ranked address records")} · {records.filter(record => record.mapSearchUrl).length} {bengali ? "টি ঠিকানা হ্যান্ড-অফ" : "address hand-offs"}{priority !== "All supplied priorities" ? ` · ${bengali ? "সরবরাহ অগ্রাধিকার" : "supplied priority"} ${priority}` : ""}</>}</p><span className="text-xs text-[#f5c85b]">{bengali ? "পৃষ্ঠা" : "Page"} {page} {bengali ? "/" : "of"} {pageCount}</span></div>
      <div className={`mt-5 grid gap-4 ${isPhotoView ? "sm:grid-cols-2 lg:grid-cols-3" : "lg:grid-cols-2"}`}>{pandals.isLoading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[180px] animate-pulse rounded-[1.35rem] bg-[#ebdfcc]"/>) : isPhotoView ? visiblePhotoAssets.map(asset => <PhotoHighlightCard key={`${asset.image.sourceUrl}|${asset.image.url}`} asset={asset} bengali={bengali}/>) : visibleRecords.map(pandal => <AddressDirectoryRow key={pandal.id} pandal={pandal}/>)}</div>
      {!pandals.isLoading && listingCount > PAGE_SIZE && <div className="mt-8 flex items-center justify-center gap-3"><Button onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1} variant="outline" className="rounded-full border-[#d7bd95] bg-white text-[#772321]"><ChevronLeft size={16}/>{bengali ? "আগের" : "Previous"}</Button><span className="text-xs font-bold text-[#765e53]">{page} / {pageCount}</span><Button onClick={() => setPage(current => Math.min(pageCount, current + 1))} disabled={page === pageCount} variant="outline" className="rounded-full border-[#d7bd95] bg-white text-[#772321]">{bengali ? "পরের" : "Next"}<ChevronRight size={16}/></Button></div>}
      {!pandals.isLoading && !listingCount && <div className="mt-10 rounded-[1.25rem] border border-dashed border-[#d1b893] bg-[#fff8ea] p-10 text-center"><h2 className="font-display text-2xl font-bold text-[#5d3328]">{bengali ? "কোনও প্যান্ডেল পাওয়া যায়নি" : "No pandals found"}</h2><p className="mt-2 text-sm text-[#80675a]">{bengali ? "আরও বিস্তৃতভাবে খুঁজুন, এলাকা বদলান বা সব রেকর্ডে ফিরুন।" : "Try expanding your search, changing the section, or returning to all records."}</p></div>}
    </>}
  </div></AppShell>;
}
