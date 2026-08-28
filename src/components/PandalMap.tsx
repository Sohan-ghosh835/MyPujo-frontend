import type { PandalRecord } from "@shared/pujaData";
import { useLanguage } from "@/contexts/LanguageContext";
import { findAddressPreviewRecords, hasSourceBackedCoordinate } from "@shared/mapRecordRules";
import { mapSelectionFor } from "@shared/mapViewState";
import { ExternalLink, MapPin, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const openStreetMapUrl = (pandal: PandalRecord | null) => pandal && hasSourceBackedCoordinate(pandal)
  ? `https://www.openstreetmap.org/export/embed.html?bbox=88.33%2C22.45%2C88.43%2C22.65&layer=mapnik&marker=${pandal.latitude}%2C${pandal.longitude}`
  : "https://www.openstreetmap.org/export/embed.html?bbox=88.31%2C22.45%2C88.45%2C22.65&layer=mapnik";

const addressPreviewUrl = (pandal: PandalRecord) => `https://www.google.com/maps?q=${encodeURIComponent(`${pandal.name}, ${pandal.address}`)}&output=embed`;

export function PandalMap({ pandals }: { pandals: PandalRecord[]; routePandals?: PandalRecord[]; onAddToRoute?: (pandal: PandalRecord) => void }) {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const [selected, setSelected] = useState<PandalRecord | null>(null);
  const [addressPreview, setAddressPreview] = useState<PandalRecord | null>(null);
  const [addressSearch, setAddressSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const mappablePandals = useMemo(() => pandals.filter(hasSourceBackedCoordinate), [pandals]);
  const addressCandidates = useMemo(() => findAddressPreviewRecords(pandals, addressSearch), [pandals, addressSearch]);
  const selectRecord = (pandal: PandalRecord) => { const next = mapSelectionFor(pandal); setSelected(next.selected); setAddressPreview(next.addressPreview); };

  useEffect(() => { if (!selected && mappablePandals.length) selectRecord(mappablePandals[0]); }, [mappablePandals, selected]);
  useEffect(() => {
    const previewId = new URLSearchParams(window.location.search).get("preview");
    const previewRecord = previewId ? pandals.find(record => record.id === previewId) : undefined;
    if (previewRecord) selectRecord(previewRecord);
  }, [pandals]);

  const mapTitle = addressPreview ? "Address-preview map" : "Source-backed OpenStreetMap pin";
  const currentMapUrl = addressPreview ? addressPreviewUrl(addressPreview) : openStreetMapUrl(selected);

  return <div className="relative h-[min(690px,calc(100svh-10rem))] min-h-[520px] overflow-hidden rounded-[1.75rem] bg-[#0b0b0f] shadow-[0_24px_70px_rgba(18,10,14,.33)] ring-1 ring-white/10">
    <iframe title={addressPreview ? `Address preview for ${addressPreview.name}` : "Source-backed OpenStreetMap coordinate"} src={currentMapUrl} className="map-ink absolute inset-0 z-10 h-full w-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
    <div className="absolute inset-0 z-[11] bg-[#0a0810]/20 pointer-events-none" />
    <div className="absolute inset-x-3 top-3 z-20 sm:left-5 sm:right-auto sm:w-[360px]"><div className="rounded-2xl border border-white/10 bg-[#17161e]/95 p-2 shadow-2xl backdrop-blur-xl"><div className="flex items-center gap-2"><Search size={16} className="ml-2 shrink-0 text-[#f1bd57]" /><input value={addressSearch} onFocus={() => setPickerOpen(true)} onChange={event => { setAddressSearch(event.target.value); setPickerOpen(true); }} placeholder={bengali ? "প্যান্ডেল বা ঠিকানা খুঁজুন" : "Search a pandal or address"} aria-label={bengali ? "প্যান্ডেল ও ঠিকানা খুঁজুন" : "Search pandals and address previews"} className="h-10 min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-[#aaa6b1]" />{pickerOpen && <button type="button" onClick={() => setPickerOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-[#cbc5cf] hover:bg-white/10" aria-label={bengali ? "ম্যাপ সার্চ বন্ধ করুন" : "Close map search"}><X size={16} /></button>}</div>{pickerOpen && <div className="mt-2 max-h-[250px] overflow-auto border-t border-white/10 pt-2"><p className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#d9b774]">{bengali ? "উৎস-সমর্থিত পিন" : "Source-backed pins"} · {mappablePandals.length}</p>{(addressSearch ? addressCandidates : mappablePandals).slice(0, 12).map(pandal => <button key={pandal.id} onClick={() => { selectRecord(pandal); setPickerOpen(false); }} className="block w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#f4edf0] hover:bg-white/10"><span className="block truncate">{pandal.name}</span><span className="mt-0.5 block truncate text-[10px] font-normal text-[#aaa5ad]">{pandal.address}</span></button>)}</div>}</div></div>
    <div className="absolute left-4 top-[78px] z-20 flex gap-2 sm:left-5"><span className="rounded-full border border-[#dd5f64]/45 bg-[#24171d]/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.1em] text-[#ffd6d8]">{bengali ? "পিন" : "Pins"} <b className="ml-1 text-[#ff8a8f]">{mappablePandals.length}</b></span><span className="rounded-full border border-[#d2a746]/35 bg-[#201d19]/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.1em] text-[#f7dc98]">{bengali ? "ঠিকানা অনুসন্ধান" : "Address lookup"}</span></div>
    {selected && <aside className="absolute bottom-3 left-3 right-3 z-20 max-w-md rounded-2xl border border-white/10 bg-[#1c1b23]/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:left-5"><div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#7d2028] text-[#ffe6b7]"><MapPin size={19} /></div><div className="min-w-0 flex-1"><p className="truncate font-display text-lg font-bold text-white">{selected.name}</p><p className="mt-0.5 truncate text-xs text-[#bcb6c1]">{selected.address}</p></div></div><p className="mt-3 text-[11px] leading-relaxed text-[#d6ced9]">{hasSourceBackedCoordinate(selected) ? (bengali ? `উৎস-সমর্থিত কোঅর্ডিনেট · ${selected.coordinateConfidence ?? "বিশ্বাসযোগ্যতার স্তর অজানা"}।` : `Source-backed coordinate · ${selected.coordinateConfidence ?? "confidence not rated"}.`) : (bengali ? "শুধু ঠিকানা প্রিভিউ — নতুন কোনও কোঅর্ডিনেট দাবি করা হয়নি।" : "Address preview only — no new coordinate is claimed.")}</p>{selected.mapSearchUrl ? <a href={selected.mapSearchUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#982c34] px-3 py-2 text-xs font-extrabold text-white hover:bg-[#ae3943]">{bengali ? "ম্যাপে খুলুন" : "Open in Maps"} <ExternalLink size={12} /></a> : <a href={selected.sources[0]?.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#982c34] px-3 py-2 text-xs font-extrabold text-white hover:bg-[#ae3943]">{bengali ? "উৎস দেখুন" : "View source"} <ExternalLink size={12} /></a>}</aside>}
  </div>;
}
