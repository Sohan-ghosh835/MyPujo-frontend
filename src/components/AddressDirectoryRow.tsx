import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PandalListItem, PandalRecord } from "@shared/pujaData";
import { ExternalLink, MapPin, NotebookText } from "lucide-react";
import { Link } from "wouter";

export function AddressDirectoryRow({ pandal }: { pandal: PandalListItem | PandalRecord }) {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const rankLabel = pandal.userRank ? `#${pandal.userRank}` : pandal.priority ? `${bengali ? "অগ্রাধিকার" : "Priority"} ${pandal.priority}` : (bengali ? "তালিকাভুক্ত" : "Listed");
  const address = pandal.address !== "Information unavailable" ? pandal.address : `${pandal.subArea}, ${pandal.section}`;
  return <article className="rounded-[1.15rem] border border-[#eadac2] bg-[#fffaf0] p-4 shadow-[0_8px_22px_rgba(74,38,22,.05)]">
    <div className="flex items-start gap-3"><span className="grid h-10 min-w-10 place-items-center rounded-xl bg-[#f3e1af] text-xs font-extrabold text-[#76501b]">{rankLabel}</span><div className="min-w-0 flex-1"><h3 className="font-display text-lg font-bold leading-tight text-[#3c2120]">{pandal.name}</h3><p className="mt-1 flex items-start gap-1 text-xs leading-relaxed text-[#765e53]"><MapPin className="mt-0.5 shrink-0" size={13} />{address}</p></div></div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#eee0ca] pt-3"><span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#866552]"><NotebookText size={12} />{pandal.sources.length} {bengali ? "টি উৎস · ঠিকানা রেকর্ড" : `source${pandal.sources.length === 1 ? "" : "s"} · address record`}</span><div className="flex gap-2">{pandal.mapSearchUrl && <a href={pandal.mapSearchUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-full border border-[#d7bd95] bg-white px-3 text-[10px] font-bold text-[#772321] hover:bg-[#fff0d8]">{bengali ? "ম্যাপ" : "Map"} <ExternalLink size={11} /></a>}<Button asChild size="sm" className="h-8 rounded-full bg-[#7d191c] px-3 text-[10px] hover:bg-[#5d1014]"><Link href={`/pandals/${pandal.id}`}>{bengali ? "রেকর্ড" : "Record"}</Link></Button></div></div>
  </article>;
}
