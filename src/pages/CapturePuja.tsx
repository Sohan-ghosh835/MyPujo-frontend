import { Link, useRoute } from "wouter";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CapturePujo } from "@/components/CapturePujo";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CapturePuja() { const { language } = useLanguage(); const bengali = language === "bn"; const [, params] = useRoute("/capture/:id"); return <AppShell><main className="container py-8 sm:py-12"><Link href={params?.id ? `/pandals/${params.id}` : "/my-puja"} className="inline-flex items-center gap-2 text-sm font-bold text-[#8c1e21]"><ArrowLeft size={16}/>{bengali ? "ফিরুন" : "Back"}</Link><CapturePujo initialPandalId={params?.id} bengali={bengali}/></main></AppShell>; }
