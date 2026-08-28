import { AppShell } from "@/components/AppShell";
import { PandalCard } from "@/components/PandalCard";
import { RoutePlanner } from "@/components/RoutePlanner";
import { DevelopmentPill } from "@/components/StatusPill";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Footprints, MapPin, Sparkles } from "lucide-react";
import { useRoute } from "wouter";

export default function SectionPage() {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const [, params] = useRoute("/sections/:section");
  const section = decodeURIComponent(params?.section ?? "South Kolkata");
  const list = trpc.pandals.list.useQuery({ section: section as "North Kolkata" | "South Kolkata" | "Central Kolkata" | "East Kolkata" | "West Kolkata" | "Salt Lake" | "New Town" });
  const summaries = trpc.pandals.sections.useQuery();
  const summary = summaries.data?.data.find(item => item.section === section);
  const count = summary?.pandalCount ?? 0;
  const rankedCount = list.data?.data.filter(pandal => Boolean(pandal.userRank)).length ?? 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-10 lg:py-14">
        <DevelopmentPill />
        <p className="font-bengali text-xs font-bold uppercase tracking-[0.18em] text-[#f5c85b] mt-5">
          {bengali ? "প্যান্ডেল বিভাগ" : "Pandal section"}
        </p>
        <h1 className="font-bengali mt-2 text-4xl font-bold leading-tight text-[#f8edd8] sm:text-5xl">{section}</h1>
        <p className="mt-4 max-w-2xl font-bengali text-base leading-relaxed text-[#f8edd8]/80">
          {bengali
            ? "এই ক্যাটালগে উৎস-সহ কমিটি পরিচয় এবং সরবরাহ করা ঠিকানা আছে। প্রতিটি ফিল্ডের নির্ভরযোগ্য উৎস না পাওয়া পর্যন্ত বর্তমান মরশুমের ভিড়, জনপ্রিয়তা, হাঁটার ক্লাস্টার ও রুট তথ্য দেখানো হয় না।"
            : "This catalogue lists sourced committee identities and supplied addresses. Current-season crowd, popularity, walking clusters, and route information remain unavailable until each field has an authoritative source."}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-[#f8edd8] shadow-2xl backdrop-blur-xl">
            <MapPin className="text-[#f5c85b]" size={19} />
            <strong className="font-display mt-4 block text-3xl text-[#f5c85b]">{count}</strong>
            <span className="text-xs text-[#f8edd8]/80">{bengali ? "উৎস-সহ কমিটি রেকর্ড" : "sourced committee records"}</span>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-[#f8edd8] shadow-2xl backdrop-blur-xl">
            <Sparkles className="text-[#f5c85b]" size={19} />
            <strong className="font-display mt-4 block text-2xl text-[#f5c85b]">{rankedCount}</strong>
            <span className="text-xs text-[#f8edd8]/80">{bengali ? "সরবরাহ করা র‌্যাঙ্ক-সহ রেকর্ড" : "records with a supplied rank"}</span>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-5 text-[#f8edd8] shadow-2xl backdrop-blur-xl">
            <Footprints className="text-[#f5c85b]" size={19} />
            <strong className="font-display mt-4 block text-2xl text-[#f8edd8]">{bengali ? "ঠিকানা-ভিত্তিক" : "Address-led"}</strong>
            <span className="mt-1 block text-xs text-[#f8edd8]/80">
              {bengali ? "নিজের স্থানীয় ক্লাস্টার গুছোতে ম্যাপ প্রিভিউ ব্যবহার করুন" : "use the map preview to prepare your own local cluster"}
            </span>
          </div>
        </div>
        <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_370px]">
          <div>
            <h2 className="font-bengali text-3xl font-bold text-[#f8edd8]">
              {bengali ? "এই বিভাগে খুঁজুন" : "Explore this section"}
            </h2>
            {count === 0 ? (
              <div className="mt-5 rounded-[1.25rem] border border-dashed border-[#d4bd98] bg-[#fffaf0] p-8 text-sm leading-relaxed text-[#6f6255]">
                {bengali
                  ? "এই বিভাগে এখনও কোনও উৎস-সহ রেকর্ড যোগ হয়নি। PujoParikroma সত্যিকারের কমিটির বদলে প্লেসহোল্ডার দেয় না।"
                  : "No sourced records have been added for this section yet. PujoParikroma does not substitute placeholders for real committees."}
              </div>
            ) : (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {list.data?.data.map(pandal => (
                  <PandalCard key={pandal.id} pandal={pandal} />
                ))}
              </div>
            )}
          </div>
          <aside className="self-start rounded-[1.5rem] bg-[#fffaf0] p-5 ring-1 ring-[#e2cfb0]">
            <p className="font-bengali text-xs font-bold uppercase tracking-[0.18em] text-[#9d2529]">
              {bengali ? "পরিক্রমা বানান" : "Build a parikrama"}
            </p>
            <RoutePlanner compact variant="light" />
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
