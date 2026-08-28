import { ExternalLink, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { PandalRecord } from "@shared/pujaData";
import { useLanguage } from "@/contexts/LanguageContext";

export function StartYourRoute({ pandal }: { pandal: PandalRecord }) {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const eligible = Boolean(pandal);
  return <div id="start-your-route" className="mt-5 rounded-2xl border border-[#e8cda2] bg-[#fff7e8] p-4 shadow-[0_12px_30px_rgba(75,35,22,.08)] sm:p-5">
    <div className="flex gap-3"><div className="rounded-xl bg-[#8c1e21] p-2.5 text-white"><Navigation size={20}/></div><div><p className="eyebrow text-[#a56922]">{bengali ? "ইন-অ্যাপ নেভিগেশন" : "In-app navigation"}</p><h2 className="font-display text-xl font-bold text-[#4a2520]">{bengali ? "এই পুজোর পথে" : "Navigate to this Pujo"}</h2><p className="mt-1 text-sm leading-relaxed text-[#75594c]">{bengali ? "লোকেশন অনুমতি দিলে PujoParikroma-এর ভেতরেই লাইভ অবস্থান, রুট এবং আনুমানিক সময় দেখুন।" : "Allow location to see your live position, route, and estimated time inside PujoParikroma."}</p></div></div>
    <Button asChild className="mt-4 min-h-12 bg-[#8c1e21] px-5 text-white hover:bg-[#73191c]"><Link href={`/navigate/${pandal.id}`}><Navigation size={17}/>{bengali ? "নেভিগেশন শুরু করুন" : "Start navigation"}</Link></Button><p className="mt-3 flex gap-1 text-xs leading-relaxed text-[#896c59]"><ShieldCheck size={13} className="mt-0.5 shrink-0"/>{bengali ? "লোকেশন শুধু আপনার সক্রিয় নেভিগেশন সেশনে ব্যবহৃত হয় এবং সংরক্ষণ করা হয় না। সময় ট্রাফিক-লাইভ নয়।" : "Location is used only during your active navigation session and is not stored. Timing is not traffic-live."}</p>
  </div>;
}
