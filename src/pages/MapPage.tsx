import { AppShell } from "@/components/AppShell";
import { CuratedPujaMap } from "@/components/CuratedPujaMap";
import { PandalMap } from "@/components/PandalMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

const mapSections = ["All sections", "South Kolkata", "North Kolkata", "Central Kolkata", "East Kolkata", "West Kolkata", "Salt Lake", "New Town"];

export default function MapPage() {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const pandals = trpc.pandals.mapList.useQuery();
  const [section, setSection] = useState("All sections");
  const [priority, setPriority] = useState("All priorities");
  const [query, setQuery] = useState("");

  const visiblePandals = useMemo(
    () =>
      (pandals.data?.data ?? []).filter(pandal => {
        const matchesSection = section === "All sections" || pandal.section === section;
        const matchesPriority = priority === "All priorities" || pandal.priority === priority;
        const haystack = `${pandal.name} ${pandal.address} ${pandal.subArea}`.toLowerCase();
        return matchesSection && matchesPriority && haystack.includes(query.trim().toLowerCase());
      }),
    [pandals.data, section, priority, query]
  );

  const mappableCount = visiblePandals.filter(pandal => pandal.latitude !== 0 && pandal.longitude !== 0).length;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-10 lg:py-14">
        {/* Header without solid background wrap */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-bengali text-xs font-bold uppercase tracking-[0.18em] text-[#f5c85b]">
              {bengali ? "পুজোর মানচিত্র" : "address-first map"}
            </p>
            <h1 className="font-bengali mt-2 text-4xl font-bold leading-tight text-[#f8edd8] sm:text-5xl">
              {bengali ? "শান্তভাবে প্যান্ডেল খুঁজুন।" : "A calmer way to find a pandal."}
            </h1>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 grid gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-md lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3 text-[#f5c85b]" size={16} />
            <Input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={bengali ? "প্যান্ডেল খুঁজুন..." : "Search pandals..."}
              aria-label={bengali ? "ক্যাটালগের প্যান্ডেল খুঁজুন" : "Search the catalogue pandals"}
              className="h-10 border-white/20 bg-white/10 pl-9 text-xs text-white placeholder:text-[#f8edd8]/60 focus-visible:ring-[#f5c85b]"
            />
          </div>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="h-10 border-white/20 bg-white/10 text-xs text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mapSections.map(item => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="h-10 border-white/20 bg-white/10 text-xs text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["All priorities", "S", "A", "B", "C"].map(item => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 lg:col-span-4">
            <SlidersHorizontal size={15} className="ml-1 text-[#f5c85b]" />
            <span className="text-xs text-[#f8edd8]/80">
              {visiblePandals.length - mappableCount} {bengali ? "টি ঠিকানা প্রিভিউ খোঁজা যাবে; কোনও ভুয়ো পিন যোগ করা হয়নি।" : "address previews remain searchable without adding false pins."}
            </span>
          </div>
        </div>

        {/* Interactive Map */}
        <PandalMap pandals={visiblePandals} />

        <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-relaxed text-[#f8edd8]/70">
          {bengali
            ? "শুধু উদ্ধৃত উৎস-সমর্থিত কোঅর্ডিনেটের জন্য পিন দেখা যায়। বাকি রেকর্ডে সরবরাহ করা ঠিকানার প্রিভিউ খোলে; PujoParikroma কোনও অবস্থান অনুমান করে না।"
            : "Pins appear only when a coordinate has a cited source. Any other record opens its supplied address as a preview; PujoParikroma does not invent a location."}
        </p>

        {/* Curated Puja Map */}
        <CuratedPujaMap bengali={bengali} />
      </div>
    </AppShell>
  );
}
