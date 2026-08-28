import { AppShell } from "@/components/AppShell";
import { DevelopmentPill } from "@/components/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { IMAGE_SOURCE_LIBRARY, IMAGE_SOURCE_LIBRARY_SUMMARY, type ImageSourceLibraryRecord } from "@shared/generatedImageSourceLibrary";
import { PUBLIC_GALLERY_SUMMARY } from "@shared/publicGallery";
import { ExternalLink, FileSearch, Link2, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

const PAGE_SIZE = 24;
const rightsLabels: Record<ImageSourceLibraryRecord["rightsStatus"], { label: string; className: string }> = {
  licensed_for_reuse: { label: "Licensed for reuse", className: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  restricted_do_not_reproduce: { label: "Restricted · do not reproduce", className: "bg-rose-100 text-rose-800 ring-rose-200" },
  license_unclear: { label: "Licence unclear", className: "bg-amber-100 text-amber-900 ring-amber-200" },
  review_required: { label: "Review required", className: "bg-[#f5e8d5] text-[#74452f] ring-[#e1c79f]" },
};

const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());

export default function ImageSources() {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const initial = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(() => initial.get("q") ?? "");
  const [area, setArea] = useState(() => initial.get("area") ?? "All areas");
  const [rights, setRights] = useState(() => initial.get("rights") ?? "All rights statuses");
  const [match, setMatch] = useState(() => initial.get("match") ?? "All match statuses");
  const [verified, setVerified] = useState(() => initial.get("verified") ?? "All verification states");
  const [year, setYear] = useState(() => initial.get("year") ?? "");
  const [pandalId, setPandalId] = useState(() => initial.get("pandal") ?? "");
  const [page, setPage] = useState(1);
  const areas = useMemo<string[]>(() => {
    const matchedSections = IMAGE_SOURCE_LIBRARY.map(record => record.matchedPandalSection).filter((value): value is NonNullable<typeof value> => value !== null);
    return ["All areas", ...Array.from(new Set(matchedSections)).sort()];
  }, []);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return IMAGE_SOURCE_LIBRARY.filter(record => {
      const searchable = `${record.associatedPandalName ?? ""} ${record.query} ${record.sourceTitle} ${record.originalFilename} ${record.sourceDomain}`.toLowerCase();
      return (!normalizedSearch || searchable.includes(normalizedSearch))
        && (area === "All areas" || record.matchedPandalSection === area)
        && (rights === "All rights statuses" || record.rightsStatus === rights)
        && (match === "All match statuses" || record.matchStatus === match)
        && (verified === "All verification states" || record.verificationStatus === verified)
        && (!pandalId || record.matchedPandalId === pandalId)
        && (!year.trim() || String(record.year ?? "").includes(year.trim()));
    });
  }, [area, match, pandalId, rights, search, verified, year]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [area, match, pandalId, rights, search, verified, year]);
  useEffect(() => { if (page > pageCount) setPage(pageCount); }, [page, pageCount]);
  useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set("q", search);
    if (area !== "All areas") next.set("area", area);
    if (rights !== "All rights statuses") next.set("rights", rights);
    if (match !== "All match statuses") next.set("match", match);
    if (verified !== "All verification states") next.set("verified", verified);
    if (year) next.set("year", year);
    if (pandalId) next.set("pandal", pandalId);
    window.history.replaceState({}, "", `/explore/images${next.size ? `?${next}` : ""}`);
  }, [area, match, pandalId, rights, search, verified, year]);

  const reset = () => { setSearch(""); setArea("All areas"); setRights("All rights statuses"); setMatch("All match statuses"); setVerified("All verification states"); setYear(""); setPandalId(""); };
  const sourceOnlyCount = IMAGE_SOURCE_LIBRARY.filter(record => !record.galleryEligible).length;
  const pendingReviewCount = IMAGE_SOURCE_LIBRARY.filter(record => record.rightsStatus === "review_required").length;
  const unreachableCount = IMAGE_SOURCE_LIBRARY.filter(record => record.sourceStatus === "unreachable").length;

  return <AppShell><div className="container py-10 sm:py-14">
    <div className="max-w-3xl"><DevelopmentPill /><p className="eyebrow mt-5">{bengali ? "উৎস ও গবেষণা" : "Source-linked research"}</p><h1 className="font-display mt-1 text-4xl font-bold text-[#45221e] sm:text-5xl">{bengali ? "পুজোর ছবির উৎস" : "Pujo Image Sources"}</h1><p className="mt-4 text-sm leading-relaxed text-[#765e53]">{bengali ? "PujoParikroma ক্যাটালগের জন্য সংগৃহীত ছবির উৎস দেখুন। এটি লিঙ্কের গবেষণা লাইব্রেরি—লাইসেন্স অস্পষ্ট বা সীমাবদ্ধ ছবি এখানে কপি, থাম্বনেইল বা এমবেড করা হয় না।" : "Explore the image sources collected for the PujoParikroma catalogue. This is a linked research library: licence-unclear and restricted images are never copied, thumbnailed, proxied, or embedded here."}</p></div>

    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl bg-[#3a1c1d] p-4 text-[#fff6e7]"><strong className="font-display text-3xl">{IMAGE_SOURCE_LIBRARY_SUMMARY.inputRows}</strong><span className="mt-1 block text-xs text-[#efd8b9]">supplied rows · {IMAGE_SOURCE_LIBRARY_SUMMARY.uniqueRecords} unique · {IMAGE_SOURCE_LIBRARY_SUMMARY.duplicateInputRowsCollapsed} duplicate references</span></div><div className="rounded-2xl bg-[#fff5df] p-4 ring-1 ring-[#e4c998]"><strong className="font-display text-3xl text-[#603129]">{PUBLIC_GALLERY_SUMMARY.reusablePhotographs}</strong><span className="mt-1 block text-xs text-[#765a48]">approved reusable gallery photographs</span></div><div className="rounded-2xl bg-[#fff5df] p-4 ring-1 ring-[#e4c998]"><strong className="font-display text-3xl text-[#603129]">{pendingReviewCount}</strong><span className="mt-1 block text-xs text-[#765a48]">pending / review required source records</span></div><div className="rounded-2xl bg-[#fff5df] p-4 ring-1 ring-[#e4c998]"><strong className="font-display text-3xl text-[#603129]">{sourceOnlyCount}</strong><span className="mt-1 block text-xs text-[#765a48]">restricted or source-only records · {unreachableCount} unreachable</span></div></div>

    <section className="mt-7 rounded-[1.4rem] bg-[#fffaf0] p-4 shadow-[0_12px_25px_rgba(74,38,22,.06)] ring-1 ring-[#eadac2]"><div className="relative"><Search className="absolute left-3 top-3 text-[#957464]" size={18}/><Input value={search} onChange={event => setSearch(event.target.value)} placeholder={bengali ? "প্যান্ডেল, ফাইলের নাম বা উৎস খুঁজুন" : "Search pandal, filename, or source"} className="h-11 rounded-xl border-[#e2cfae] bg-white pl-10 text-sm"/></div><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Select value={area} onValueChange={setArea}><SelectTrigger className="h-11 rounded-xl border-[#e2cfae] bg-white text-sm"><SelectValue/></SelectTrigger><SelectContent>{areas.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select><Select value={rights} onValueChange={setRights}><SelectTrigger className="h-11 rounded-xl border-[#e2cfae] bg-white text-sm"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="All rights statuses">All rights statuses</SelectItem>{Object.entries(rightsLabels).map(([value, detail]) => <SelectItem key={value} value={value}>{detail.label}</SelectItem>)}</SelectContent></Select><Select value={match} onValueChange={setMatch}><SelectTrigger className="h-11 rounded-xl border-[#e2cfae] bg-white text-sm"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="All match statuses">All match statuses</SelectItem>{["exact_match", "strong_match", "probable_match", "ambiguous", "unmatched"].map(value => <SelectItem key={value} value={value}>{pretty(value)}</SelectItem>)}</SelectContent></Select><Select value={verified} onValueChange={setVerified}><SelectTrigger className="h-11 rounded-xl border-[#e2cfae] bg-white text-sm"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="All verification states">All verification states</SelectItem><SelectItem value="verified">Verified metadata</SelectItem><SelectItem value="metadata_classified">Metadata classified</SelectItem></SelectContent></Select><div className="flex gap-2"><Input value={year} onChange={event => setYear(event.target.value.replace(/[^0-9]/g, "").slice(0, 4))} inputMode="numeric" placeholder="Year" className="h-11 rounded-xl border-[#e2cfae] bg-white text-sm"/><Button onClick={reset} variant="outline" className="h-11 rounded-xl border-[#d6be97] bg-[#fff7e8] text-[#7e2622] hover:bg-[#ffefd2]">Reset</Button></div></div></section>

    <div className="mt-7 flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-[#765e53]">{filtered.length} of {IMAGE_SOURCE_LIBRARY.length} source records · links only for material that is not cleared for reproduction</p><span className="text-xs text-[#94786a]">Page {page} of {pageCount}</span></div>
    {pandalId && <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[#e4ccaa] bg-[#fff4de] px-3 py-2 text-xs text-[#6f4d3d]"><Link2 size={14}/><span>Showing sources matched to this pandal only.</span><Button onClick={() => setPandalId("")} variant="ghost" className="h-auto px-1.5 py-0.5 text-xs font-bold text-[#86211f] hover:bg-transparent hover:underline">Clear pandal filter</Button></div>}
    <div className="mt-4 grid gap-4 lg:grid-cols-2">{visible.map(record => { const rightsDetail = rightsLabels[record.rightsStatus]; return <article key={record.id} className="rounded-[1.25rem] border border-[#ead8bf] bg-[#fffdf7] p-5 shadow-[0_10px_22px_rgba(74,38,22,.05)]"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><p className="eyebrow text-[#9a6322]">{record.sourceDomain}</p><h2 className="font-display mt-1 text-xl font-bold text-[#48251f]">{record.associatedPandalName ?? record.query}</h2></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${rightsDetail.className}`}>{rightsDetail.label}</span></div><dl className="mt-4 grid gap-2 text-xs text-[#765e53] sm:grid-cols-2"><div><dt className="font-bold text-[#4b2a23]">Original file</dt><dd title={record.originalFilename} className="mt-0.5 break-all line-clamp-2">{record.originalFilename}</dd></div><div><dt className="font-bold text-[#4b2a23]">Match status</dt><dd className="mt-0.5">{pretty(record.matchStatus)} · identity {record.identityStatus}</dd></div><div><dt className="font-bold text-[#4b2a23]">Source state</dt><dd className="mt-0.5">{pretty(record.sourceStatus)}{record.sourceStatusCode ? ` · HTTP ${record.sourceStatusCode}` : ""}</dd></div><div><dt className="font-bold text-[#4b2a23]">Metadata</dt><dd className="mt-0.5">{record.imageWidth && record.imageHeight ? `${record.imageWidth} × ${record.imageHeight}` : "Dimensions unavailable"}{record.year ? ` · ${record.year}` : ""}</dd></div></dl><p className="mt-4 line-clamp-2 text-xs text-[#876a5a]">{record.sourceTitle}</p><div className="mt-5 flex flex-wrap gap-2"><Button asChild size="sm" className="rounded-lg bg-[#8d2021] text-white hover:bg-[#6d1518]"><a href={record.sourcePageUrl} target="_blank" rel="noreferrer">Open source <ExternalLink size={13}/></a></Button>{record.matchedPandalId && <Button asChild size="sm" variant="outline" className="rounded-lg border-[#cfb18a] bg-white text-[#7f2620] hover:bg-[#fff0d8]"><Link href={`/pandals/${record.matchedPandalId}`}><Link2 size={13}/>View pandal</Link></Button>}</div></article>; })}</div>
    {!visible.length && <div className="mt-8 rounded-[1.25rem] border border-dashed border-[#d1b893] bg-[#fff8ea] p-10 text-center"><FileSearch className="mx-auto text-[#a12424]" size={26}/><h2 className="font-display mt-3 text-2xl font-bold text-[#5d3328]">No source records found</h2><p className="mt-2 text-sm text-[#80675a]">Try a broader name, source, or rights filter.</p></div>}
    {filtered.length > PAGE_SIZE && <div className="mt-8 flex items-center justify-center gap-3"><Button onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page === 1} variant="outline" className="rounded-full border-[#d7bd95] bg-white text-[#772321]">Previous</Button><span className="text-xs font-bold text-[#765e53]">{page} / {pageCount}</span><Button onClick={() => setPage(current => Math.min(pageCount, current + 1))} disabled={page === pageCount} variant="outline" className="rounded-full border-[#d7bd95] bg-white text-[#772321]">Next</Button></div>}
    <div className="mt-9 rounded-[1.25rem] border border-[#ead8bf] bg-[#f8efd9] p-5 text-xs leading-relaxed text-[#705246]"><ShieldCheck className="mb-2 text-[#8d2021]" size={18}/><strong className="block text-[#4b2a23]">Source-library boundary</strong>Every supplied source record remains discoverable here. Only entries with verified reuse rights, attribution, technical evidence, and identity/context checks can enter a public gallery; all other records remain external links only.</div>
  </div></AppShell>;
}
