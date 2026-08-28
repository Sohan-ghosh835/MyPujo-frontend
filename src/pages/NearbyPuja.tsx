import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CapturePujo } from "@/components/CapturePujo";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NearbyPuja() { const { language } = useLanguage(); const bengali = language === "bn"; return <AppShell><main className="container py-8 sm:py-12"><Link href="/my-puja" className="inline-flex items-center gap-2 text-sm font-bold text-[#8c1e21]"><ArrowLeft size={16}/>{bengali ? "আমার পুজো" : "Amar Pujo"}</Link><CapturePujo bengali={bengali}/></main></AppShell>; }
