import { useEffect, useMemo, useState } from "react";
import { Share2, Route, Phone, TrainFront, ExternalLink, Copy, Check, ChevronDown, ChevronUp, Eye, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ALL_PANDALS } from "@shared/pujaData";
import { generateSectionTrails, type SectionTrail } from "@shared/pandalHoppingTrails";

// ── Emergency numbers matching reference ──

const EMERGENCY_NUMBERS = [
  { labelEn: "Dial 100 (Police)", labelBn: "ডায়াল ১০০ (পুলিশ)", number: "100" },
  { labelEn: "Fire Service", labelBn: "ফায়ার সার্ভিস", number: "101" },
  { labelEn: "Women Helpline", labelBn: "নারী হেল্পলাইন", number: "1091" },
  { labelEn: "Child Helpline", labelBn: "শিশু হেল্পলাইন", number: "1098" },
  { labelEn: "Cyber Crime", labelBn: "সাইবার ক্রাইম", number: "1930" },
  { labelEn: "Emergency Response Support", labelBn: "জরুরি প্রতিক্রিয়া সেবা", number: "112" },
];

// ── Share helper ──

async function shareApp(bengali: boolean): Promise<"shared" | "copied" | "failed"> {
  const shareData = {
    title: bengali ? "মাইপুজো — কলকাতা দুর্গা পুজো গাইড" : "MyPujo — Kolkata Durga Puja Guide",
    text: bengali
      ? "কলকাতায় দুর্গা পুজো করতে যাচ্ছেন? MyPujo-তে দেখুন — ম্যাপ, গাইড, রুট সব আছে!"
      : "Visiting Durga Puja in Kolkata? Check out MyPujo — maps, guides, routes, and more!",
    url: window.location.origin,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
    return "copied";
  } catch {
    return "failed";
  }
}

export function AmarPujoQuickTools() {
  const { language } = useLanguage();
  const bengali = language === "bn";

  const [shareState, setShareState] = useState<"idle" | "shared" | "copied" | "failed">("idle");
  const [showAllEmergency, setShowAllEmergency] = useState(false);
  const [isMetroModalOpen, setIsMetroModalOpen] = useState(false);

  // Prevent background scroll when Metro Map Modal is open
  useEffect(() => {
    if (isMetroModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMetroModalOpen]);

  const trails = useMemo(() => generateSectionTrails(ALL_PANDALS), []);

  const handleShare = async () => {
    const result = await shareApp(bengali);
    setShareState(result);
    if (result !== "failed") setTimeout(() => setShareState("idle"), 3000);
  };

  return (
    <section className="space-y-5">
      {/* Section Header */}
      <div>
        <p className="eyebrow">{bengali ? "দ্রুত সরঞ্জাম" : "Quick tools"}</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-[#f8edd8]">
          {bengali ? "আমার পুজো সহায়ক" : "Amar Pujo Toolkit"}
        </h2>
      </div>

      {/* ── 1. Share ── */}
      <div className="rounded-[1.25rem] border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#9d2529]/30">
            <Share2 className="text-[#f5c85b]" size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#f8edd8]">
              {bengali ? "বন্ধুদের সাথে শেয়ার করুন" : "Share with friends"}
            </h3>
            <p className="text-xs text-[#f8edd8]/60">
              {bengali ? "মেসেজ বা সোশ্যাল মিডিয়ায় পাঠান" : "Send via message or social media"}
            </p>
          </div>
          <Button
            onClick={handleShare}
            className="rounded-full bg-[#9d2529] px-4 py-2 text-xs font-bold text-[#f5c85b] hover:bg-[#7e1d21]"
          >
            {shareState === "shared" ? (
              <><Check size={13} className="mr-1" />{bengali ? "শেয়ার হয়েছে" : "Shared!"}</>
            ) : shareState === "copied" ? (
              <><Copy size={13} className="mr-1" />{bengali ? "কপি হয়েছে" : "Copied!"}</>
            ) : (
              <><Share2 size={13} className="mr-1" />{bengali ? "শেয়ার" : "Share"}</>
            )}
          </Button>
        </div>
      </div>

      {/* ── 2. Pandal-Hopping Routes ── */}
      {trails.length > 0 && (
        <div className="rounded-[1.25rem] border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5c85b]/15">
              <Route className="text-[#f5c85b]" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f8edd8]">
                {bengali ? "প্যান্ডেল হপিং রুট" : "Pandal-Hopping Routes"}
              </h3>
              <p className="text-xs text-[#f8edd8]/60">
                {bengali ? "এলাকাভিত্তিক Google Maps রুট" : "Per-section Google Maps routes"}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {trails.map((trail) => {
              const routeTitle = bengali
                ? `${trail.sectionBn}${trail.distanceText ? ` (${trail.distanceText})` : ""}`
                : `${trail.section}${trail.distanceText ? ` (${trail.distanceText})` : ""}`;
              return (
                <a
                  key={trail.section}
                  href={trail.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 transition hover:border-[#f5c85b]/40 hover:bg-white/10"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-sm font-bold text-[#f8edd8]">
                      {routeTitle} &rarr;
                    </p>
                    <p className="truncate text-[10px] text-[#f8edd8]/50 mt-0.5">
                      {trail.pandalCount} {bengali ? "টি প্যান্ডেল" : "pandals"} · {trail.pandalNames.slice(0, 2).join(", ")}
                      {trail.pandalNames.length > 2 && "…"}
                    </p>
                  </div>
                  <ExternalLink size={14} className="flex-shrink-0 text-[#f5c85b] opacity-60 transition group-hover:opacity-100" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Emergency Helpline ── */}
      <div className="rounded-[1.25rem] border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/15">
            <Phone className="text-red-400" size={18} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#f8edd8]">
              {bengali ? "জরুরি হেল্পলাইন নম্বর" : "Emergency Helpline Numbers"}
            </h3>
            <p className="text-xs text-[#f8edd8]/60">
              {bengali ? "এক ট্যাপে কল করুন" : "Tap to call"}
            </p>
          </div>
          <button
            onClick={() => setShowAllEmergency(!showAllEmergency)}
            className="rounded-full border border-white/15 p-1.5 text-[#f8edd8]/60 transition hover:bg-white/10"
          >
            {showAllEmergency ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        <div className="mt-3 grid gap-2">
          {(showAllEmergency ? EMERGENCY_NUMBERS : EMERGENCY_NUMBERS.slice(0, 6)).map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
            >
              <span className="text-sm font-medium text-[#f8edd8]">
                {bengali ? item.labelBn : item.labelEn}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                {item.number}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ── 4. Kolkata Metro Map & Info ── */}
      <div className="rounded-[1.25rem] border border-[#7c3aed]/25 bg-[#7c3aed]/8 p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-[#7c3aed]/20">
              <TrainFront className="text-[#a78bfa]" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f8edd8]">
                {bengali ? "কলকাতা মেট্রো ম্যাপ ও তথ্য" : "Kolkata Metro Map & Info"}
              </h3>
              <p className="text-xs text-[#f8edd8]/60">
                {bengali ? "অফিসিয়াল রুট ম্যাপ ও অ্যাপ লিঙ্ক — Metro Railway, Kolkata" : "View official route maps & transit app links — Metro Railway, Kolkata"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              onClick={() => setIsMetroModalOpen(true)}
              className="rounded-full border border-[#f5c85b]/40 bg-[#f5c85b] px-4 py-2 text-xs font-extrabold text-[#241f1a] shadow-md transition hover:bg-[#ffe396] hover:scale-102"
            >
              <Eye size={14} className="mr-1.5" />
              {bengali ? "ম্যাপ দেখুন" : "View Map"}
            </Button>

            <a
              href="https://play.google.com/store/apps/details?id=org.cris.kmmts&pli=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/30 bg-[#7c3aed]/20 px-3.5 py-1.5 text-xs font-bold text-[#a78bfa] transition hover:bg-[#7c3aed]/30 hover:text-white"
            >
              <span>{bengali ? "মেট্রো অফিশিয়াল অ্যাপ" : "Metro Official App"}</span>
              <ExternalLink size={12} />
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=com.whereismytrain.android"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/30 bg-[#7c3aed]/20 px-3.5 py-1.5 text-xs font-bold text-[#a78bfa] transition hover:bg-[#7c3aed]/30 hover:text-white"
            >
              <span>{bengali ? "হয়ার ইজ মাই ট্রেন" : "Where Is My Train"}</span>
              <ExternalLink size={12} />
            </a>

            <a
              href="https://mtp.indianrailways.gov.in/view_section.jsp?lang=0&id=0,1,304,366,554"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#f8edd8]/70 transition hover:bg-white/10 hover:text-[#f8edd8]"
            >
              <span>{bengali ? "অফিসিয়াল সাইট" : "Official Site"}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* ── Metro Map Viewer Modal ── */}
      {isMetroModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsMetroModalOpen(false)}
        >
          <div
            className="relative max-h-[92vh] max-w-4xl w-full flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#1c0a0c] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 text-[#f5c85b]">
                <TrainFront size={18} />
                <h3 className="font-bold text-sm text-[#f8edd8]">
                  {bengali ? "কলকাতা মেট্রো রুট ম্যাপ" : "Kolkata Metro Route Map"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMetroModalOpen(false)}
                className="rounded-full bg-white/10 p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-3 flex-1 overflow-auto rounded-xl bg-black/50 p-2 pujo-scrollbar touch-pan-x touch-pan-y overscroll-contain">
              <img
                src="/mapmetro.png"
                alt="Kolkata Metro Map"
                className="w-full h-auto min-w-[320px] object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
