import { AddressDirectoryRow } from "@/components/AddressDirectoryRow";
import { DevelopmentPill } from "@/components/StatusPill";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { getSavedPandalIds, toggleSavedPandal } from "@/lib/pujaList";
import type { PandalListItem, PandalRecord } from "@shared/pujaData";
import { ArrowUpRight, Clock3, ExternalLink, Heart, MapPin, TrainFront } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export function PandalCard({ pandal, onFavourite }: { pandal: PandalListItem | PandalRecord; onFavourite?: (id: string) => void }) {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const refresh = () => setSaved(getSavedPandalIds().includes(pandal.id));
    refresh();
    window.addEventListener("pujoparikroma:list-updated", refresh);
    return () => window.removeEventListener("pujoparikroma:list-updated", refresh);
  }, [pandal.id]);
  if (!pandal.image) return <AddressDirectoryRow pandal={pandal} />;

  const handleSave = () => {
    const next = toggleSavedPandal(pandal.id);
    setSaved(next.includes(pandal.id));
    onFavourite?.(pandal.id);
  };
  const rankLabel = pandal.userRank ? `${bengali ? "র‌্যাঙ্ক" : "Rank"} #${pandal.userRank}` : pandal.priority ? `${bengali ? "অগ্রাধিকার" : "Priority"} ${pandal.priority}` : (bengali ? "ঠিকানা তালিকাভুক্ত" : "Address listed");
  return <article className="group relative overflow-hidden rounded-[1.35rem] bg-[#fffaf0] p-4 shadow-[0_10px_30px_rgba(80,39,13,.07)] ring-1 ring-[#eadbc4] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(80,39,13,.13)]">
    <div className="relative h-40 overflow-hidden rounded-[1rem] bg-[#2e1718]"><img src={pandal.image.url} alt={pandal.image.alt} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#261315]/80 via-[#261315]/24 to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-white backdrop-blur">{pandal.userRank ? `#${pandal.userRank} · ` : ""}{pandal.section.replace(" Kolkata", "")}</span><button onClick={handleSave} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#8e2222] shadow-sm transition hover:scale-105" aria-label={`${saved ? (bengali ? "সরান" : "Remove") : (bengali ? "সংরক্ষণ করুন" : "Save")} ${pandal.name}`} aria-pressed={saved}><Heart size={15} className={saved ? "fill-current" : ""} /></button><span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#fff0c9]">{bengali ? "ঐতিহাসিক ছবি" : "Historical photo"} · {pandal.image.capturedYear}</span></div>
    <div className="pt-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-[1.15rem] font-bold leading-tight text-[#3c2120]">{pandal.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-[#826a5d]"><MapPin size={13} />{pandal.subArea}</p></div><span className="shrink-0 rounded-full bg-[#f3e1af] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#76501b]">{rankLabel}</span></div>{pandal.visitorContext ? <div className="mt-3 rounded-xl bg-[#f7eddb] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9a6322]">{bengali ? "তালিকায় কেন আছে" : "Why it belongs on your list"}</p><p className="mt-1 text-xs font-semibold leading-relaxed text-[#56342c]">{pandal.visitorContext.headline}</p><p className="mt-2 text-[11px] leading-relaxed text-[#775c4e]">{pandal.visitorContext.guideTip}</p></div> : <div className="mt-3 rounded-xl border border-[#eadbc4] bg-[#fff7e8] p-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#9a6322]">{bengali ? "উৎস-সহ রেকর্ড" : "Source-backed record"}</p><p className="mt-1 text-xs leading-relaxed text-[#56342c]">{bengali ? "ছবি, র‌্যাঙ্ক, এলাকা, ঠিকানার টুল ও উৎস লিঙ্ক নিচে আছে।" : "Photo, rank, locality, address tools, and source links are available below."}</p></div>}<div className="mt-3 flex flex-wrap gap-1.5">{pandal.visitorContext?.lens && <span className="rounded-md bg-[#6f2524] px-2 py-1 text-[10px] font-bold text-[#fff4de]">{pandal.visitorContext.lens}</span>}{pandal.visitorContext?.historicAccess && <span className="inline-flex items-center gap-1 rounded-md bg-[#e8f0e8] px-2 py-1 text-[10px] font-semibold text-[#426557]"><TrainFront size={11} />{pandal.visitorContext.historicAccess.replace("Guide access: ", "")}</span>}{pandal.visitorContext?.guideWindow && <span className="inline-flex items-center gap-1 rounded-md bg-[#f3e7d5] px-2 py-1 text-[10px] font-semibold text-[#785746]"><Clock3 size={11} />{pandal.visitorContext.guideWindow.replace("Guide suggestion: ", "")}</span>}</div><div className="mt-4 flex items-center justify-between gap-3"><DevelopmentPill /><div className="flex items-center gap-2">{pandal.mapSearchUrl && <a href={pandal.mapSearchUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-full border border-[#d7bd95] bg-white px-3 text-[10px] font-bold text-[#772321] hover:bg-[#fff0d8]">{bengali ? "ম্যাপ" : "Map"} <ExternalLink size={11} /></a>}<Button asChild size="sm" className="rounded-full bg-[#7d191c] px-4 text-xs hover:bg-[#5d1014]"><Link href={`/pandals/${pandal.id}`}>{pandal.visitorContext ? (bengali ? "গাইড দেখুন" : "Visit guide") : (bengali ? "রেকর্ড" : "Record")} <ArrowUpRight size={13} /></Link></Button></div></div><a href={pandal.image.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 block text-[10px] text-[#806559] underline decoration-[#c9a775] underline-offset-2">{bengali ? "ছবি" : "Photo"}: {pandal.image.author}, {pandal.image.license} ({pandal.image.capturedYear})</a></div>
  </article>;
}
