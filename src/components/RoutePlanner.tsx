import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSavedPandalIds, setSavedPandalIds } from "@/lib/pujaList";
import { trpc } from "@/lib/trpc";
import { generateSmartItinerary, sortShortlist } from "@shared/shortlistRules";
import type { PandalListItem, PandalRecord } from "@shared/pujaData";
import { CheckCircle2, ClipboardCopy, Clock3, Heart, MapPinned, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const preferences = ["Most Famous", "Artistic", "Traditional", "Family Friendly", "Less Crowded", "Hidden Gems"] as const;
const timeOptions = [{ value: "120", label: "2 hours" }, { value: "180", label: "3 hours" }, { value: "240", label: "4 hours" }, { value: "300", label: "5 hours" }, { value: "360", label: "6 hours" }];
type PlannerInput = { startingPoint: string; section: "North Kolkata" | "South Kolkata" | "Central Kolkata" | "East Kolkata" | "West Kolkata" | "Salt Lake" | "New Town" | "All Kolkata"; timeBudgetMinutes: number; transportMode: "Walking" | "Metro + Walking" | "Public Transport" | "Car" | "Bike" | "Mixed"; preferences: (typeof preferences)[number][] };

function shortlistLimit(timeBudgetMinutes: number) {
  return Math.max(2, Math.min(6, Math.round(timeBudgetMinutes / 60)));
}

export function RoutePlanner({ compact = false, variant = "dark" }: { compact?: boolean; variant?: "dark" | "light" }) {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const isLight = variant === "light";
  const [startingPoint, setStartingPoint] = useState("Gariahat");
  const [section, setSection] = useState<PlannerInput["section"]>("South Kolkata");
  const [timeBudget, setTimeBudget] = useState("300");
  const [transport, setTransport] = useState<PlannerInput["transportMode"]>("Metro + Walking");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(["Most Famous", "Artistic"]);
  const [shortlist, setShortlist] = useState<(PandalListItem | PandalRecord)[]>([]);
  const catalog = trpc.pandals.list.useQuery({ section });
  const limit = shortlistLimit(Number(timeBudget));
  const hasRecords = (catalog.data?.data.length ?? 0) > 0;
  const preferenceLabel = (value: string) => bengali ? ({ "Most Famous": "সবচেয়ে পরিচিত", Artistic: "শৈল্পিক", Traditional: "ঐতিহ্যবাহী", "Family Friendly": "পরিবারের জন্য", "Less Crowded": "কম ভিড়", "Hidden Gems": "কম পরিচিত" }[value] ?? value) : value;
  const selectedSummary = useMemo(() => selectedPreferences.length ? selectedPreferences.map(preferenceLabel).join(" · ") : (bengali ? "আপনার র‌্যাঙ্ক করা ঠিকানা" : "Your ranked addresses"), [selectedPreferences, bengali]);
  const togglePreference = (preference: string) => setSelectedPreferences(current => current.includes(preference) ? current.filter(value => value !== preference) : [...current, preference]);
  const buildShortlist = () => {
    const rawList = catalog.data?.data ?? [];
    const finalStops = generateSmartItinerary(rawList, {
      startingPoint,
      section,
      preferences: selectedPreferences,
      limit,
    });
    setShortlist(finalStops);
  };
  const saveShortlist = () => {
    const saved = new Set(getSavedPandalIds());
    shortlist.forEach(record => saved.add(record.id));
    setSavedPandalIds(Array.from(saved));
    toast.success(bengali ? `${shortlist.length}টি স্টপ আমার পুজোয় সংরক্ষিত হয়েছে।` : `${shortlist.length} stop${shortlist.length === 1 ? "" : "s"} saved to Amar Pujo.`);
  };
  const copyShortlist = async () => {
    const text = shortlist.length ? `PujoParikroma · ${bengali ? "শুরুর স্থান" : "starting point"}: ${startingPoint} · ${section}\n${shortlist.map((record, index) => `${index + 1}. ${record.name} — ${record.address}`).join("\n")}` : "";
    if (!text) return;
    try { await navigator.clipboard.writeText(text); toast.success(bengali ? "আপনার পরিক্রমা তালিকা কপি হয়েছে।" : "Your parikrama list has been copied."); } catch { toast.message(text); }
  };

  const sectionLabel = (value: string) => bengali ? ({ "South Kolkata": "দক্ষিণ কলকাতা", "North Kolkata": "উত্তর কলকাতা", "Central Kolkata": "মধ্য কলকাতা", "East Kolkata": "পূর্ব কলকাতা", "West Kolkata": "পশ্চিম কলকাতা", "Salt Lake": "সল্ট লেক", "New Town": "নিউ টাউন", "All Kolkata": "সমস্ত কলকাতা" }[value] ?? value) : value;
  const transportLabel = (value: string) => bengali ? ({ Walking: "হেঁটে", "Metro + Walking": "মেট্রো + হাঁটা", "Public Transport": "গণপরিবহন", Car: "গাড়ি", Bike: "বাইক", Mixed: "মিশ্র" }[value] ?? value) : value;

  const eyebrowClass = isLight ? "text-[#9d2529]" : "text-[#f5c85b]";
  const titleClass = isLight ? "text-[#241f1a]" : "text-[#f8edd8]";
  const badgeClass = isLight ? "border-[#9d2529]/30 bg-[#9d2529]/10 text-[#9d2529]" : "border-[#f5c85b]/40 bg-[#f5c85b]/20 text-[#f5c85b]";
  const subtextClass = isLight ? "text-[#6f6255]" : "text-[#f8edd8]/80";
  const labelClass = isLight ? "text-[#9d2529]" : "text-[#f5c85b]";
  const inputClass = isLight ? "border-[#d7bd95] bg-[#fffaf0] text-[#241f1a] placeholder:text-[#6f6255]/60 focus-visible:ring-[#9d2529]" : "border-white/20 bg-white/10 text-[#f8edd8] placeholder:text-[#f8edd8]/60 focus-visible:ring-[#f5c85b]";
  const selectTriggerClass = isLight ? "border-[#d7bd95] bg-[#fffaf0] text-[#241f1a] hover:bg-[#f4e3c4]" : "border-white/20 bg-[#2b1717]/80 text-[#f8edd8] hover:bg-[#381c1e]";
  const selectIconClass = isLight ? "mr-2 text-[#9d2529]" : "mr-2 text-[#f5c85b]";
  const checkLabelClass = isLight ? "text-[#241f1a]" : "text-[#f8edd8]";
  const checkboxClass = isLight ? "border-[#9d2529]/40 data-[state=checked]:bg-[#9d2529]" : "border-white/30 data-[state=checked]:bg-[#9d2529]";

  return (
    <section className={`${isLight ? "text-[#241f1a]" : "text-[#f8edd8]"} ${compact ? "" : isLight ? "rounded-[1.6rem] border border-[#d7bd95] bg-[#fffaf0] p-5 shadow-xl sm:p-7" : "rounded-[1.6rem] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7"}`} aria-labelledby="planner-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${eyebrowClass}`}>
            {bengali ? "পরিক্রমা প্ল্যানার" : "Parikrama planner"}
          </p>
          <h2 id="planner-title" className={`font-display mt-1 text-2xl font-bold ${titleClass}`}>
            {bengali ? "কাজের পুজো তালিকা বানান।" : "Build a useful Puja shortlist."}
          </h2>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[.13em] ${badgeClass}`}>
          {bengali ? "বিনা খরচে · ঠিকানা-ভিত্তিক" : "No-cost · address-led"}
        </span>
      </div>
      <p className={`mb-5 text-sm leading-relaxed ${subtextClass}`}>
        {bengali
          ? "একটি এলাকা আর আপনার আগ্রহ বেছে নিন। PujoParikroma এমন একটি র‌্যাঙ্ক করা তালিকা বানাবে যা সংরক্ষণ বা কপি করা যায়। এটি রুট, সময়, কিউ বা লাইভ অ্যাক্সেস অনুমান করে না।"
          : "Choose an area and what interests you. PujoParikroma then creates a ranked visit list you can save or copy. It does not invent a travel route, time estimate, queue, or live access condition."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="starting-point" className={`text-xs font-bold ${labelClass}`}>
            {bengali ? "শুরুর স্থান" : "Starting point"}
          </Label>
          <Input
            id="starting-point"
            value={startingPoint}
            onChange={event => setStartingPoint(event.target.value)}
            className={`h-11 rounded-xl text-sm ${inputClass}`}
          />
        </div>
        <div className="space-y-2">
          <Label className={`text-xs font-bold ${labelClass}`}>
            {bengali ? "এলাকা" : "Area"}
          </Label>
          <Select value={section} onValueChange={value => setSection(value as PlannerInput["section"])}>
            <SelectTrigger className={`h-11 rounded-xl text-sm ${selectTriggerClass}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["South Kolkata", "North Kolkata", "Central Kolkata", "East Kolkata", "West Kolkata", "Salt Lake", "New Town", "All Kolkata"].map(option => (
                <SelectItem key={option} value={option}>
                  {sectionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={`text-xs font-bold ${labelClass}`}>
            {bengali ? "আপনার কত সময় আছে?" : "How much time do you have?"}
          </Label>
          <Select value={timeBudget} onValueChange={setTimeBudget}>
            <SelectTrigger className={`h-11 rounded-xl text-sm ${selectTriggerClass}`}>
              <Clock3 size={15} className={selectIconClass} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {bengali ? `${Number(option.value) / 60} ঘণ্টা` : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className={`text-xs font-bold ${labelClass}`}>
            {bengali ? "যাতায়াত" : "Getting around"}
          </Label>
          <Select value={transport} onValueChange={value => setTransport(value as PlannerInput["transportMode"])}>
            <SelectTrigger className={`h-11 rounded-xl text-sm ${selectTriggerClass}`}>
              <MapPinned size={15} className={selectIconClass} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Walking", "Metro + Walking", "Public Transport", "Car", "Bike", "Mixed"].map(option => (
                <SelectItem key={option} value={option}>
                  {transportLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <fieldset className="mt-5">
        <legend className={`text-xs font-bold ${labelClass}`}>
          {bengali ? "কেমন পুজো খুঁজছেন?" : "What kind of Puja are you looking for?"}
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
          {preferences.map(preference => (
            <Label key={preference} className={`flex cursor-pointer items-center gap-2 text-xs font-medium ${checkLabelClass}`}>
              <Checkbox
                checked={selectedPreferences.includes(preference)}
                onCheckedChange={() => togglePreference(preference)}
                className={checkboxClass}
              />
              {preferenceLabel(preference)}
            </Label>
          ))}
        </div>
      </fieldset>
      <Button
        onClick={buildShortlist}
        disabled={catalog.isLoading || !hasRecords}
        className="mt-6 h-12 rounded-xl bg-[#9d2529] px-6 text-sm font-bold tracking-[.04em] text-white hover:bg-[#7e1d21]"
      >
        <Sparkles size={17} />
        {catalog.isLoading ? (bengali ? "ঠিকানা লোড হচ্ছে…" : "Loading your addresses…") : (bengali ? "আমার পরিক্রমা বানান" : "Build my parikrama")}
      </Button>
      {shortlist.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-[#f8edd8] backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#f5c85b]">
                {bengali ? "আপনার তালিকা" : "Your shortlist"} · {shortlist.length} {bengali ? "স্টপ" : "stops"}
              </p>
              <h3 className="font-display mt-1 text-xl font-bold text-[#f8edd8]">
                {sectionLabel(section)} {bengali ? "·" : "for"} {selectedSummary}
              </h3>
              <p className="mt-1 text-xs text-[#f8edd8]/80">
                {bengali
                  ? `${startingPoint || "আপনার বাছা স্থান"} থেকে শুরু; সরবরাহ করা র‌্যাঙ্ক ও উদ্ধৃত গাইড লেন্সে নির্বাচিত। যাতায়াত: ${transportLabel(transport)}।`
                  : `Starting near ${startingPoint || "your chosen point"}; selected by the supplied rank and cited guide lenses. Transport preference: ${transport}.`}
              </p>
            </div>
            <CheckCircle2 className="shrink-0 text-[#f5c85b]" size={22} />
          </div>
          <ol className="mt-4 space-y-2">
            {shortlist.map((record, index) => (
              <li key={record.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2 text-white">
                <div className="min-w-0">
                  <span className="mr-2 text-xs font-bold text-[#f5c85b]">{index + 1}.</span>
                  <span className="font-semibold text-[#f8edd8]">{record.name}</span>
                  <span className="block pl-5 text-[11px] text-[#f8edd8]/70">{record.address}</span>
                </div>
                <Link href={`/pandals/${record.id}`} className="shrink-0 text-[11px] font-bold text-[#f5c85b] underline underline-offset-2">
                  {bengali ? "গাইড" : "Guide"}
                </Link>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={saveShortlist} size="sm" className="rounded-full bg-[#9d2529] text-xs font-bold text-white hover:bg-[#7e1d21]">
              <Heart size={13} />
              {bengali ? "আমার পুজোয় রাখুন" : "Save to Amar Pujo"}
            </Button>
            <Button onClick={copyShortlist} size="sm" variant="outline" className="rounded-full border-white/20 bg-white/10 text-xs font-bold text-[#f5c85b] hover:bg-white/20">
              <ClipboardCopy size={13} />
              {bengali ? "তালিকা কপি করুন" : "Copy list"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
