import { AppShell } from "@/components/AppShell";
import { DevelopmentPill } from "@/components/StatusPill";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { getSavedPandalIds, toggleSavedPandal } from "@/lib/pujaList";
import { trpc } from "@/lib/trpc";
import { getDataCompleteness, getVerificationLevel } from "@shared/catalogueMetrics";
import { StartYourRoute } from "@/components/StartYourRoute";
import { Camera, Clock3, ExternalLink, Heart, MapPin, ShieldCheck, Sparkles, TrainFront } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";

export default function PandalDetail() {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const [, params] = useRoute("/pandals/:id");
  const [, setLocation] = useLocation();
  const detail = trpc.pandals.detail.useQuery({ id: params?.id ?? "" });
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    const refresh = () => setSaved(getSavedPandalIds().includes(id));
    refresh();
    window.addEventListener("pujoparikroma:list-updated", refresh);
    return () => window.removeEventListener("pujoparikroma:list-updated", refresh);
  }, [params?.id]);

  if (detail.isLoading) {
    return <AppShell><div className="container py-14"><div className="h-96 animate-pulse rounded-[1.5rem] bg-[#e9dcc7]" /></div></AppShell>;
  }

  const pandal = detail.data?.data;
  if (!pandal) {
    return <AppShell><div className="container py-20 text-center"><h1 className="font-display text-4xl font-bold text-[#4a2420]">{bengali ? "প্যান্ডেল পাওয়া যায়নি" : "Pandal unavailable"}</h1><p className="mt-3 text-sm text-[#765e53]">{bengali ? "এই উৎস-সহ কমিটি রেকর্ডটি খুঁজে পাওয়া যায়নি।" : "This sourced committee record could not be found."}</p><Button asChild className="mt-6 rounded-xl bg-[#8c1e21]"><Link href="/explore">{bengali ? "প্যান্ডেল খোঁজায় ফিরুন" : "Back to explore"}</Link></Button></div></AppShell>;
  }

  const hasCoordinate = pandal.latitude !== 0 && pandal.longitude !== 0;
  const context = pandal.visitorContext;
  const completeness = getDataCompleteness(pandal);
  const verificationLevel = getVerificationLevel(pandal);
  const toggleSave = () => setSaved(toggleSavedPandal(pandal.id).includes(pandal.id));
  const addToParikrama = () => {
    const next = toggleSavedPandal(pandal.id);
    setSaved(next.includes(pandal.id));
    setLocation("/routes");
  };

  return <AppShell><div className="container py-9 sm:py-12">
    <Link href="/explore" className="text-sm font-bold text-[#f5c85b] hover:underline">← {bengali ? "প্যান্ডেল খোঁজায় ফিরুন" : "Back to explore"}</Link>

    <div className="mt-6 overflow-hidden rounded-[1.7rem] bg-[#3a1c1d] text-[#fff8e8] shadow-[0_22px_50px_rgba(53,27,19,.2)] lg:grid lg:grid-cols-[.9fr_1.1fr]">
      {pandal.image ? <div className="relative min-h-[310px] bg-[#2e1718]"><img src={pandal.image.url} alt={pandal.image.alt} referrerPolicy="no-referrer" className="absolute inset-0 z-0 h-full w-full object-cover object-center" /><div className="absolute inset-0 z-10 bg-gradient-to-t from-[#2f1819]/70 via-[#2f1819]/15 to-transparent" /><span className="absolute bottom-5 left-5 z-20 rounded-full bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em]">{bengali ? "ঐতিহাসিক ছবি" : "Historical photo"} · {pandal.image.capturedYear}</span></div> : <div className="flex min-h-[310px] flex-col justify-end bg-[#f0e4d0] p-7 text-[#4a2520]"><MapPin className="text-[#9a2223]" size={24} /><p className="eyebrow mt-5">{bengali ? "ঠিকানা রেকর্ড" : "Address record"}</p><h2 className="font-display mt-2 text-3xl font-bold">{bengali ? "যাচাই করা জনসাধারণের ছবি যুক্ত নেই।" : "No verified public photograph is attached."}</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-[#73584b]">{bengali ? "নিচের সরবরাহ করা ঠিকানা, ম্যাপ প্রিভিউ ও উৎস লিঙ্ক ব্যবহার করুন। PujoParikroma সম্পর্কহীন বা লাইসেন্সবিহীন ছবি বসায় না।" : "Use the supplied address, map preview, and source links below. PujoParikroma does not substitute an unrelated or unlicensed image."}</p></div>}

      <div className="p-6 sm:p-9">
        <div className="flex flex-wrap items-center gap-2"><DevelopmentPill />{pandal.userSuppliedRank && <span className="rounded-full bg-[#f4c66d] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#3a1c1d]">{bengali ? "সরবরাহ করা র‌্যাঙ্ক" : "Supplied rank"} #{pandal.userSuppliedRank}</span>}{pandal.suppliedPriority && <span className="rounded-full border border-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#f5d87f]">{bengali ? "অগ্রাধিকার" : "Priority"} {pandal.suppliedPriority}</span>}</div>
        <p className="eyebrow mt-6 text-[#f2ca74]">{pandal.section} · {pandal.subArea}</p>
        <h1 className="font-display mt-1 text-4xl font-bold">{pandal.name}</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#e7d7c5]">{context?.headline ?? (bengali ? "এই র‌্যাঙ্ক করা ঠিকানা রেকর্ডে সরবরাহ করা লোকেশন ও জনসাধারণের উৎস লিঙ্ক আছে। কেবল উদ্ধৃত গাইড সমর্থন করলে সম্পাদকীয় ভিজিট পরামর্শ দেখানো হয়।" : "This ranked address record includes its supplied location and public source links. Editorial visit guidance is shown only where a cited guide supports it.")}</p>

        {context ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><div><Sparkles className="text-[#f4c66d]" size={17} /><strong className="mt-1 block text-sm">{context.lens}</strong><span className="text-[10px] text-[#d9c4ac]">visit lens</span></div><div><TrainFront className="text-[#f4c66d]" size={17} /><strong className="mt-1 block text-sm">{context.historicAccess?.replace("Guide access: ", "") ?? "See guide"}</strong><span className="text-[10px] text-[#d9c4ac]">guide access</span></div><div><Clock3 className="text-[#f4c66d]" size={17} /><strong className="mt-1 block text-sm">{context.guideWindow?.replace("Guide suggestion: ", "") ?? "See guide"}</strong><span className="text-[10px] text-[#d9c4ac]">historic guidance</span></div><div><MapPin className="text-[#f4c66d]" size={17} /><strong className="mt-1 block text-sm">{hasCoordinate ? "Sourced" : "Address supplied"}</strong><span className="text-[10px] text-[#d9c4ac]">map location</span></div></div> : <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3"><div><MapPin className="text-[#f4c66d]" size={17} /><strong className="mt-1 block text-sm">{hasCoordinate ? "Sourced point" : "Address supplied"}</strong><span className="text-[10px] text-[#d9c4ac]">map location</span></div><div><ShieldCheck className="text-[#f4c66d]" size={17} /><strong className="mt-1 block text-sm">{pandal.sources.length} sources</strong><span className="text-[10px] text-[#d9c4ac]">record links</span></div><div><Sparkles className="text-[#f4c66d]" size={17} /><strong className="mt-1 block text-sm">#{pandal.userRank ?? "—"}</strong><span className="text-[10px] text-[#d9c4ac]">supplied rank</span></div></div>}

        <div className="mt-7 flex flex-wrap gap-3"><Button onClick={addToParikrama} className="rounded-xl bg-[#e6b34f] text-[#3b1b1d] hover:bg-[#f6cf7c]">{bengali ? "আমার পরিক্রমায় যোগ করুন" : "Add to my parikrama"}</Button><Button onClick={toggleSave} variant="outline" className="rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"><Heart size={16} className={saved ? "fill-current text-[#f4b9ae]" : ""} />{saved ? (bengali ? "আমার পুজোয় সংরক্ষিত" : "Saved to My Puja") : (bengali ? "আমার পুজোয় রাখুন" : "Save to My Puja")}</Button><Button asChild variant="outline" className="rounded-xl border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"><Link href={`/capture/${pandal.id}`}><Camera size={16}/>{bengali ? "এই পুজো ক্যাপচার করুন" : "Capture this Pujo"}</Link></Button></div>
      </div>
    </div>

    {context && <section className="mt-7 rounded-[1.35rem] border border-white/20 bg-white/10 p-6 text-[#f8edd8] shadow-2xl backdrop-blur-xl"><p className="font-bengali text-xs font-bold uppercase tracking-[0.18em] text-[#f5c85b]">{bengali ? "ভিজিট গাইড" : "Visit guide"} · {context.lens}</p><h2 className="font-display mt-1 text-2xl font-bold text-[#f8edd8]">{bengali ? "এই স্টপটি কেন কাজে লাগতে পারে" : "What makes this stop useful"}</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#f8edd8]/80">{context.guideTip}</p><div className="mt-4 flex flex-wrap items-center gap-3 text-xs"><a href={context.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[#f5c85b] underline underline-offset-2">{bengali ? "গাইড উৎস পড়ুন" : "Read the guide source"} <ExternalLink size={12} /></a><span className="text-[#f8edd8]/60">{bengali ? "এটি সম্পাদকীয় বা ঐতিহাসিক গাইড তথ্য; ২০২৬-এর সময়, ভিড়, থিম বা প্রবেশের প্রতিশ্রুতি নয়।" : "Editorial or historical guide context, not a promise of 2026 timing, crowds, theme, or access."}</span></div></section>}

    <StartYourRoute pandal={pandal} />

    <div className="mt-7 grid gap-5 lg:grid-cols-4">
      <section className="rounded-[1.35rem] border border-white/20 bg-white/10 p-5 text-[#f8edd8] shadow-2xl backdrop-blur-xl"><MapPin className="text-[#f5c85b]" size={19} /><h2 className="font-display mt-4 text-xl font-bold text-[#f8edd8]">{bengali ? "লোকেশন ও ম্যাপ" : "Location & map"}</h2><p className="mt-2 text-sm text-[#f8edd8]/90">{pandal.address}</p><p className="mt-2 text-xs text-[#f8edd8]/60">{hasCoordinate ? (bengali ? "কোঅর্ডিনেটটি উদ্ধৃত কমিটি পেজের ডিরেকশন লিঙ্ক থেকে এসেছে।" : "Coordinate comes from the cited committee page’s direction link.") : pandal.addressDetails?.confidence === "full" ? (bengali ? "সরবরাহ করা রাস্তা-স্তরের ঠিকানা আছে; প্রিভিউ ম্যাপ কখনও PujoParikroma কোঅর্ডিনেট বানায় না।" : "A supplied street-level address is available; the preview map never creates a PujoParikroma coordinate.") : (bengali ? "শুধু আনুমানিক এলাকা রাখা হয়েছে; আয়োজকদের কাছ থেকে ঠিক প্রবেশপথ জেনে নিন।" : "Only an approximate supplied locality is held; confirm the exact entrance with the organizer.")}</p><div className="mt-3 flex flex-wrap gap-3">{pandal.mapSearchUrl && <a href={pandal.mapSearchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#f5c85b] underline underline-offset-2">{bengali ? "ম্যাপে ঠিকানা খুলুন" : "Open address in Maps"} <ExternalLink size={12} /></a>}<Link href={`/map?preview=${pandal.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#f5c85b] underline underline-offset-2">{bengali ? "PujoParikroma-তে প্রিভিউ" : "Preview in PujoParikroma"} <MapPin size={12} /></Link></div></section>
      <section className="rounded-[1.35rem] border border-white/20 bg-white/10 p-5 text-[#f8edd8] shadow-2xl backdrop-blur-xl"><ShieldCheck className="text-[#f5c85b]" size={19} /><h2 className="font-display mt-4 text-xl font-bold text-[#f8edd8]">{bengali ? "২০২৬ অবস্থা" : "2026 status"}</h2>{pandal.status2026 ? <p className="mt-2 text-sm leading-relaxed text-[#f8edd8]/80">{pandal.status2026}</p> : <p className="mt-2 text-sm leading-relaxed text-[#f8edd8]/80">{bengali ? "এই রেকর্ডের জন্য কোনও ২০২৬ অপারেশনাল আপডেট যাচাই করা হয়নি। মরশুমি উৎস ছাড়া বর্তমান খোলার সময়, কিউ, থিম বা ভিড়ের আন্দাজ এখানে দেখানো হয় না।" : "No 2026 operational update has been verified for this record. Current opening hours, queues, themes, and crowd estimates are not published here without a seasonal source."}</p>}<p className="mt-3 text-xs leading-relaxed text-[#f8edd8]/60">{bengali ? "লাইভ সময়ের বিধিনিষেধের জন্য কলকাতা ট্রাফিক পুলিশের নির্দেশনা ও কমিটির ঘোষণা দেখুন।" : "For live-period restrictions, consult Kolkata Traffic Police guidance and committee announcements."}</p></section>
      <section className="rounded-[1.35rem] border border-white/20 bg-white/10 p-5 text-[#f8edd8] shadow-2xl backdrop-blur-xl"><Sparkles className="text-[#f5c85b]" size={19} /><h2 className="font-display mt-4 text-xl font-bold text-[#f8edd8]">{bengali ? "রেকর্ডের উৎস" : "Record provenance"}</h2><p className="mt-2 text-xs leading-relaxed text-[#f8edd8]/70">{bengali ? "ক্যাননিকাল রেকর্ড" : "Canonical record"}: {pandal.canonicalName}{pandal.aliases?.length ? ` · ${bengali ? "বিকল্প নাম" : "aliases"}: ${pandal.aliases.join(", ")}` : ""}</p><ul className="mt-3 space-y-2 text-xs text-[#f8edd8]/80">{pandal.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="underline decoration-[#f5c85b] underline-offset-2">{source.label}</a></li>)}{pandal.image && <li><a href={pandal.image.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-[#f5c85b] underline-offset-2">{bengali ? "ছবি" : "Photo"}: {pandal.image.author}, {pandal.image.license}, {pandal.image.capturedYear}</a></li>}</ul><Link href={`/report-correction?record=${encodeURIComponent(pandal.id)}`} className="mt-4 inline-block text-xs font-bold text-[#f5c85b] underline underline-offset-2">{bengali ? "ভুল তথ্য জানান" : "Report incorrect information"}</Link></section>
      <section className="rounded-[1.35rem] border border-white/20 bg-white/10 p-5 text-[#f8edd8] shadow-2xl backdrop-blur-xl"><ShieldCheck className="text-[#f5c85b]" size={19} /><h2 className="font-display mt-4 text-xl font-bold text-[#f8edd8]">{bengali ? "ডেটা কভারেজ" : "Data coverage"}</h2><p className="mt-2 text-3xl font-bold text-[#f5c85b]">{completeness}%</p><p className="mt-1 text-xs leading-relaxed text-[#f8edd8]/70">{bengali ? "শুধু ঠিকানা, উৎস, মানচিত্র, ছবি, পরিবহণ, ইতিহাস এবং যাচাই করা ২০২৬ ডেটার উপস্থিতি মাপে — জনপ্রিয়তা বা মান নয়।" : "Measures only the presence of address, sources, map, photo, transport, history, and verified 2026 data — never popularity or quality."}</p><div className="mt-4 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-[#f5c85b]">{bengali ? "যাচাইয়ের স্তর" : "Verification level"}: {verificationLevel}/3 · {verificationLevel === 3 ? (bengali ? "স্বাধীন কর্তৃত্বপূর্ণ" : "independent authoritative") : verificationLevel === 2 ? (bengali ? "একাধিক জনসাধারণের উৎস" : "multiple public sources") : verificationLevel === 1 ? (bengali ? "একটি জনসাধারণের উৎস" : "one public source") : (bengali ? "উৎস নেই" : "no source")}</div></section>
    </div>
  </div></AppShell>;
}
