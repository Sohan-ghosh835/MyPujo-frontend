import { useLanguage } from "@/contexts/LanguageContext";
import { getMahalayaCountdown } from "@shared/pujaCalendar";
import { CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

export function PujaCountdown() {
  const { language } = useLanguage();
  const [remaining, setRemaining] = useState(getMahalayaCountdown);
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getMahalayaCountdown()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const bengali = language === "bn";
  return <div className="mt-8 max-w-xl rounded-2xl border border-[#f7d68b]/30 bg-[#130e13]/62 p-3 shadow-[0_18px_40px_rgba(10,4,6,.22)] backdrop-blur-md sm:p-4">
    <div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#f2c86a]"><CalendarDays size={14} />{bengali ? "মহালয়ার অপেক্ষা" : "Countdown to Mahalaya"}</p><span className="rounded-full bg-[#f3cc73]/15 px-2 py-1 text-[10px] font-bold text-[#ffe7ad]">10 Oct 2026</span></div>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {[[remaining.days, bengali ? "দিন" : "Days"], [remaining.hours, bengali ? "ঘণ্টা" : "Hours"], [remaining.minutes, bengali ? "মিনিট" : "Minutes"]].map(([value, label]) => <div key={String(label)} className="rounded-xl bg-white/[.08] px-2 py-2 text-center"><strong className="block font-display text-2xl leading-none text-[#fff1cf] sm:text-3xl">{String(value).padStart(2, "0")}</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.13em] text-[#e6cfaa]">{label}</span></div>)}
    </div>
  </div>;
}
