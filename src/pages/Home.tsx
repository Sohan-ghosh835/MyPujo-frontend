import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowRight, CalendarDays, Heart, MapPin, Route, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FestivalCalendar2026 } from "@/components/FestivalCalendar2026";
import { PandalCard } from "@/components/PandalCard";
import { RoutePlanner } from "@/components/RoutePlanner";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";

const neighborhoods = [
  { num: "01", bn: "উত্তর কলকাতা", en: "North Kolkata", detailBn: "পুরনো অলিগলি, বোনাদী বাড়ি ও ঐতিহ্য", detailEn: "Heritage lanes, old houses, and ritual memory", href: "/explore?section=North%20Kolkata", bg: "/northk.jpg" },
  { num: "02", bn: "মধ্য কলকাতা", en: "Central Kolkata", detailBn: "আলোকসজ্জা, ভিড় ও শিকড়ের টান", detailEn: "Old-city spectacle, close-knit routes, and light", href: "/explore?section=Central%20Kolkata", bg: "/centralk.jpg" },
  { num: "03", bn: "দক্ষিণ কলকাতা", en: "South Kolkata", detailBn: "বড় থিম, গভীর রাত ও ক্লাব কালচার", detailEn: "Artistry, club culture, and contemporary making", href: "/explore?section=South%20Kolkata", bg: "/southk.jpg" },
];

function Countdown3001({ bengali }: { bengali: boolean }) {
  const target = new Date("2026-10-17T00:00:00+05:30").getTime();
  const [left, setLeft] = useState(() => target - Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setLeft(target - Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const days = Math.max(0, Math.floor(left / 86400000));
  const hours = Math.max(0, Math.floor((left / 3600000) % 24));
  const minutes = Math.max(0, Math.floor((left / 60000) % 60));
  const seconds = Math.max(0, Math.floor((left / 1000) % 60));

  const items = [
    [days, bengali ? "দিন" : "Days"],
    [hours, bengali ? "ঘণ্টা" : "Hours"],
    [minutes, bengali ? "মিনিট" : "Mins"],
    [seconds, bengali ? "সেকেন্ড" : "Secs"],
  ] as const;

  return (
    <div className="countdown-glow flex items-end gap-4 font-display text-[#f8edd8]">
      {items.map(([value, label], index) => (
        <div key={label} className="flex items-end gap-4">
          <div className="text-center">
            <div className="countdown-digit text-3xl font-light tracking-wider leading-none sm:text-5xl" style={{ textShadow: '0 0 20px rgba(245,200,91,.4), 0 0 60px rgba(245,200,91,.15)' }}>{String(value).padStart(2, "0")}</div>
            <div className="mt-2 font-bengali text-[11px] text-[#f8edd8]/75">{label}</div>
          </div>
          {index < items.length - 1 && <span className="countdown-separator mb-3" />}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const bengali = language === "bn";
  const pandals = trpc.pandals.list.useQuery({});
  const featured = pandals.data?.data.filter(pandal => Boolean(pandal.image)).slice(0, 3) ?? [];
  const heroRef = useRef<HTMLElement>(null);

  // Scroll-triggered fade-in animation observer
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in-up');
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }),
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [pandals.data]);

  // Parallax effect for hero background image
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const img = hero.querySelector('.hero-parallax-bg') as HTMLElement | null;
    if (!img) return;
    const handler = () => {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
      img.style.transform = `translateY(${progress * 40}px) scale(1.05)`;
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <AppShell variant="transparent">
      {/* Hero Section - Aligned to Left */}
      <section ref={heroRef} id="top" className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#241313] text-white sm:min-h-[95vh] lg:min-h-screen">
        <img src="/durga-puja-hero.png" alt="Durga idol glowing inside a Kolkata Puja pandal" className="hero-parallax-bg absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#241313]/95 via-[#241313]/70 to-transparent" />
        <div className="hero-particles" aria-hidden="true" />
        <div className="hero-particle-field" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#241313]/80 to-transparent" />
        <div className="relative w-full px-6 py-36 sm:px-10 sm:py-44 lg:px-16 lg:py-52 xl:px-20">
          <div className="max-w-4xl text-left">
            <p className="mb-6 flex items-center justify-start gap-2.5 font-bengali text-base font-bold text-[#f5c85b]">
              <span className="text-[#f5c85b]">—</span> শারদীয়া ১৪ ৩৩ · কলকাতা
            </p>
            <h1 className={`${bengali ? "font-bengali" : "font-display"} text-left text-5xl font-bold leading-[1.1] tracking-[-.04em] sm:text-7xl lg:text-[5.25rem] xl:text-[6rem]`}>
              {bengali ? <>মা আসছেন।<br /><span className="text-[#f5c85b]">শহর জেগে উঠুক।</span></> : <>Maa is coming.<br /><span className="text-[#f5c85b]">Let the city wake up.</span></>}
            </h1>
            <p className="mt-8 max-w-2xl font-bengali text-left text-xl leading-relaxed text-white/85">
              {bengali ? "প্যান্ডেল, পথ আর পাড়ার গল্পে কলকাতার দুর্গাপুজোকে আবিষ্কার করুন। নিজের মতো করে, একটু ধীরে।" : "Discover Kolkata’s Durga Puja through pandals, routes, and neighbourhood stories—at your own pace."}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-start gap-5">
              <Link href="/explore" className="inline-flex items-center gap-2.5 rounded-full bg-[#f5c85b] px-8 py-4 text-base font-extrabold text-[#241f1a] shadow-xl transition hover:scale-105 hover:bg-[#ffe09a]">
                {bengali ? "পুজো পরিক্রমা" : "Start exploring"} <ArrowRight size={18} />
              </Link>
              <a href="#countdown" className="inline-flex items-center gap-2.5 rounded-full border border-white/40 bg-white/10 px-8 py-4 text-base font-bold backdrop-blur-md transition hover:bg-white/20">
                <CalendarDays size={18} /> Countdown
              </a>
            </div>
          </div>
        </div>
        <div className="hero-shimmer-line" aria-hidden="true" />
        <a href="#neighborhoods" className="absolute bottom-10 right-8 hidden items-center gap-2 text-xs font-bold tracking-[.22em] text-white/70 transition hover:text-[#f5c85b] lg:flex">
          <ArrowDown size={14} /> SCROLL TO EXPLORE
        </a>
      </section>

      {/* Countdown Banner (Grander Height & Typography) */}
      <section id="countdown" className="fade-in-up relative overflow-hidden bg-gradient-to-br from-[#9d2529] via-[#8a1f23] to-[#6e181b] px-5 py-16 text-white sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bengali text-base font-bold text-[#f5c85b]">{bengali ? "পুজো আসতে আর" : "Time remaining until Durga Puja"}</p>
            <h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{bengali ? "শহর দিন গুনছে।" : "The city is counting down."}</h2>
          </div>
          <Countdown3001 bengali={bengali} />
          <span className="hidden size-3 rounded-full bg-[#f5c85b] sm:block" />
        </div>
      </section>

      {/* Neighborhoods Section */}
      <section id="neighborhoods" className="bg-[#f7efdf] px-5 py-20 lg:px-10 lg:py-28 text-[#241f1a]">
        <div className="mx-auto max-w-7xl">
          <div className="fade-in-up flex flex-col justify-between gap-6 border-b border-[#241f1a]/15 pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="font-bengali text-sm font-bold text-[#9d2529]">{bengali ? "পাড়ায় পাড়ায়" : "Neighborhoods"}</p>
              <h2 className="mt-2 font-bengali text-4xl font-bold tracking-tight sm:text-5xl">{bengali ? "নিজের কলকাতা বেছে নিন।" : "Choose your Kolkata."}</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[#6f6255]">{bengali ? "তিন রকমের মেজাজ, এক শহর। যেখানে ঢাকের আওয়াজ সবচেয়ে কাছে, সেখান থেকেই শুরু করুন।" : "Three moods. One unforgettable city. Start where the drums sound loudest."}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {neighborhoods.map(item => (
              <Link href={item.href} key={item.num} className="neighborhood-card fade-in-up group relative min-h-[22rem] overflow-hidden rounded-3xl border border-white/20 p-7 text-white shadow-xl transition hover:border-[#f5c85b]/60" data-delay={item.num}>
                <img src={item.bg} alt={item.en} className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b0d0e]/95 via-[#1b0d0e]/60 to-[#1b0d0e]/25" />
                <div className="relative z-10 flex h-full min-h-[17rem] flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#f5c85b] tracking-wider">{item.num} / 03</span>
                    <div className="grid size-11 place-items-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur transition group-hover:border-[#f5c85b] group-hover:bg-[#9d2529] group-hover:text-white">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  <div>
                    <p className="font-bengali text-2xl font-bold text-white drop-shadow">{bengali ? item.bn : item.en}</p>
                    <p className="mt-1 font-display text-lg font-bold text-[#f5c85b] drop-shadow">{bengali ? item.en : item.bn}</p>
                    <p className="mt-3 max-w-[240px] text-sm text-white/85 leading-relaxed">{bengali ? item.detailBn : item.detailEn}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="map" className="fade-in-up bg-[#241313] px-5 py-20 text-[#f8edd8] lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
          <div>
            <p className="font-bengali text-sm font-bold text-[#f5c85b]">{bengali ? "পুজোর মানচিত্র" : "Puja Map"}</p>
            <h2 className="mt-3 font-bengali text-4xl font-bold leading-tight sm:text-5xl">{bengali ? <>গল্পের<br />এক শহর।</> : <>A city of<br />stories.</>}</h2>
            <p className="mt-6 max-w-sm font-bengali leading-relaxed text-[#f8edd8]/70">{bengali ? "পুরনো বাড়ি, নতুন ভাবনা, দূরে ঢাকের আওয়াজ। এক পাড়া থেকে আরেক পাড়ায় আলোর পথ ধরে চলুন।" : "Old houses, new ideas, dhaak in the distance. Follow the glow from one neighbourhood to the next."}</p>
            <Link href="/map" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f5c85b] px-5 py-3 text-sm font-bold text-[#241f1a] transition hover:bg-[#ffe09a]">
              {bengali ? "মানচিত্র দেখুন" : "Explore the map"} <MapPin size={16} />
            </Link>
          </div>
          <Link href="/map" className="map-card-glow group relative min-h-80 overflow-hidden rounded-3xl border border-white/15 bg-[#381c1e] p-8 transition hover:border-[#f5c85b]/60">
            <img src="/n-c-s.jpg" alt="North Central South Durga Puja map route" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#241313]/90 via-[#241313]/40 to-transparent" />
            <div className="relative flex min-h-64 flex-col justify-between">
              <div className="flex justify-between">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs backdrop-blur">Kolkata, West Bengal</span>
                <Sparkles className="text-[#f5c85b]" size={22} />
              </div>
              <div>
                <p className="font-display text-3xl">North → Central → South</p>
                <p className="mt-2 text-sm text-white/60">{bengali ? "আলোর পথ ধরুন। নিজের পুজো খুঁজে নিন।" : "Follow the lights. Find your puja."}</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Route Planner Section */}
      <section id="planner" className="bg-[#f7efdf] px-5 py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.68fr_1.32fr] lg:items-start">
          <div>
            <p className="font-bengali text-2xl font-bold text-[#9d2529]">{bengali ? "এই পুজো আপনার।" : "This Puja is Yours."}</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6f6255]">{bengali ? "নিজের পছন্দের প্যান্ডেল বেছে নিন, একটি বাস্তবসম্মত তালিকা বানান, আর নিজের ছন্দে বেরিয়ে পড়ুন।" : "Save the pandals that matter to you, build a useful shortlist, and set out at your own pace."}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[#9d2529] px-5 text-white hover:bg-[#7e1d21]">
                <Link href="/my-puja"><Heart size={16} />{bengali ? "আমার পুজো" : "My Puja"}</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-[#9d2529]/35 text-[#9d2529] hover:bg-[#f4e3c4]">
                <Link href="/routes"><Route size={16} />{bengali ? "পরিক্রমা সাজান" : "Plan a route"}</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-[#241313] p-5 shadow-[0_18px_46px_rgba(36,31,26,.25)] text-[#f8edd8] sm:p-7">
            <RoutePlanner compact variant="dark" />
          </div>
        </div>
      </section>

      {/* Calendar 2026 Section */}
      <section id="calendar">
        <FestivalCalendar2026 bengali={bengali} />
      </section>

      {/* Featured Pandals Showcase Section */}
      <section className="fade-in-up bg-[#f7efdf] px-5 py-20 lg:px-10 text-[#241f1a]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="font-bengali text-sm font-bold text-[#9d2529]">{bengali ? "বেছে নেওয়া প্যান্ডেল" : "Curated Pandals"}</p>
              <h2 className="mt-2 font-bengali text-3xl font-bold text-[#241f1a] sm:text-4xl">{bengali ? "পথের কিছু শুরু এখানেই।" : "Begin with a few memorable stops."}</h2>
            </div>
            <Link href="/explore" className="inline-flex items-center gap-1 text-sm font-bold text-[#9d2529] hover:underline">
              {bengali ? "সব প্যান্ডেল দেখুন" : "Explore every pandal"} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pandals.isLoading
              ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-[430px] animate-pulse rounded-[1.35rem] bg-[#e9d9bd]" />)
              : featured.map(pandal => <PandalCard key={pandal.id} pandal={pandal} />)}
          </div>
        </div>
      </section>

    </AppShell>
  );
}
