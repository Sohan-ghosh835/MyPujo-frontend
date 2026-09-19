import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function CrowdPill({ crowd }: { crowd: string }) {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const tone = crowd === "Low" ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : crowd === "Moderate" ? "bg-amber-50 text-amber-800 ring-amber-200" : crowd === "High" ? "bg-orange-50 text-orange-800 ring-orange-200" : crowd === "Very high" ? "bg-red-50 text-red-800 ring-red-200" : "bg-stone-100 text-stone-600 ring-stone-200";
  const label = bengali ? ({ Low: "কম", Moderate: "মাঝারি", High: "বেশি", "Very high": "খুব বেশি" }[crowd] ?? crowd) : crowd;
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ring-1", tone)}><span aria-hidden="true">●</span>{label} {bengali ? "ভিড়" : "crowd"}</span>;
}

export function DevelopmentPill({ className }: { className?: string }) {
  return null;
}
