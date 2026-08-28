import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Compass, Download, Heart, Map, Route, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState, type ReactNode } from "react";

const links = [
  { href: "/", label: "Home", bengaliLabel: "হোম", icon: Compass },
  { href: "/explore", label: "Explore", bengaliLabel: "খুঁজুন", icon: Sparkles },
  { href: "/map", label: "Map", bengaliLabel: "মানচিত্র", icon: Map },
  { href: "/routes", label: "Parikrama", bengaliLabel: "পরিক্রমা", icon: Route },
  { href: "/my-puja", label: "Amar Pujo", bengaliLabel: "আমার পুজো", icon: Heart },
];

type AppShellProps = { children: ReactNode; variant?: "default" | "transparent" };

export function AppShell({ children, variant = "default" }: AppShellProps) {
  const [location] = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const bengali = language === "bn";
  const isTransparent = variant === "transparent";

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        bengali
          ? "আপনার ব্রাউজার মেনু ➔ 'হোম স্ক্রিনে যোগ করুন' (Add to Home Screen) বা 'অ্যাপ ইনস্টল করুন' নির্বাচন করুন।"
          : "Tap your browser menu ➔ 'Add to Home Screen' or 'Install App' to add PujoParikroma to your device."
      );
    }
  };

  return (
    <div className={cn("site-shell min-h-screen text-[#f8edd8]", isTransparent && "site-shell--transparent")}>
      {!isTransparent && <div className="site-shell__wash" aria-hidden="true" />}

      {/* Unified Header */}
      <header
        className={cn(
          "z-40 w-full border-b border-white/10 text-white backdrop-blur-2xl",
          isTransparent
            ? "fixed inset-x-0 top-0 bg-[#241313]/80 backdrop-blur-xl"
            : "sticky top-0 border-white/20 bg-[#241313]/95"
        )}
      >
        <div className={cn(
          "mx-auto flex items-center justify-between",
          isTransparent ? "h-20 w-full px-6 sm:px-10 lg:px-16 xl:px-20" : "max-w-7xl px-5 py-5 lg:px-10"
        )}>
          <Link href="/" className="flex items-center gap-3">
            <img src="/dm.jpg" alt="PujoParikroma logo" className="size-10 rounded-full border border-[#f5c85b]/70 object-cover shadow-md" />
            <span className="font-display text-xl font-bold tracking-tight">PujoParikroma</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 text-sm font-semibold lg:flex" aria-label="Main navigation">
            {links.map((link) => {
              const active = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 transition hover:bg-white/10 hover:text-[#f5c85b]",
                    active ? "bg-[#9d2529] font-bold text-[#f5c85b] shadow-md" : "text-[#f8edd8]/90"
                  )}
                >
                  {bengali ? link.bengaliLabel : link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#f5c85b]/70 bg-[#9d2529] px-3 py-1 text-xs font-bold text-[#f5c85b] shadow-md transition hover:bg-[#b02a2f] hover:scale-105"
              title={bengali ? "হোম স্ক্রিনে অ্যাপ ইনস্টল করুন" : "Install App to Home Screen"}
            >
              <Download size={13} />
              <span>{bengali ? "অ্যাপ ইনস্টল" : "Install App"}</span>
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              className="rounded-full border border-[#f5c85b]/50 bg-[#f5c85b]/20 px-3.5 py-1 text-xs font-bold text-[#f5c85b] backdrop-blur transition hover:bg-[#f5c85b] hover:text-[#241f1a]"
            >
              {bengali ? "EN / English" : "বাংলা / BN"}
            </button>

            <span className="hidden font-bengali text-xs text-white/75 sm:inline">কলকাতা · ১৪ ৩৩</span>

            <Link
              href="/my-puja"
              className="grid size-10 place-items-center rounded-full bg-[#f5c85b] text-[#241f1a] shadow-md transition hover:scale-105"
              aria-label="Saved pujas"
            >
              <Heart size={16} />
            </Link>
          </div>
        </div>
      </header>

      <main className="site-main">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[#241f1a]/15 bg-[#f7efdf] px-5 pb-24 pt-6 lg:px-10 lg:pb-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/dm.jpg" alt="PujoParikroma icon" className="size-7 rounded-full object-cover shadow-sm" />
            <p className="font-bengali text-sm font-bold text-[#9d2529]">
              {bengali ? "এই পুজো আপনার।" : "This Puja is Yours."}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs text-[#6f6255]">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#9d2529] px-3 py-1.5 font-bold text-[#f5c85b] transition hover:bg-[#7e1d21]"
            >
              <Download size={13} />
              {bengali ? "অ্যাপ পান" : "Install App"}
            </button>
            <span className="hidden sm:inline">{bengali ? "কলকাতার জন্য, ভালোবাসায় তৈরি" : "Made for Kolkata, with love"}</span>
            <a href="https://github.com/Sohan-ghosh835" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[#241f1a]/20 px-3 py-1.5 font-semibold text-[#241f1a] transition hover:bg-[#241f1a]/10">
              <svg viewBox="0 0 16 16" fill="currentColor" className="size-4"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Nav Bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/20 bg-[#241313]/95 px-3 pb-[max(.7rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex max-w-md items-center justify-between">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            const mobileLabel = bengali ? link.bengaliLabel : link.label === "Parikrama" ? "Plan" : link.label;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex min-w-12 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold transition-colors",
                  active ? "text-[#f5c85b]" : "text-[#f8edd8]/60 hover:text-[#f8edd8]"
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                <span>{mobileLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
