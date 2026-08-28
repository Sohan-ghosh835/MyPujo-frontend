import { Button } from "@/components/ui/button";
import type { PublicGalleryAsset } from "@shared/publicGallery";
import { ExternalLink, MapPin } from "lucide-react";
import { Link } from "wouter";

export type PhotoHighlightAsset = PublicGalleryAsset;

export function PhotoHighlightCard({ asset, bengali }: { asset: PhotoHighlightAsset; bengali: boolean }) {
  const { pandal, image, imageIndex, totalForPandal } = asset;
  const periodLabel =
    image.imagePeriod === "current"
      ? (bengali ? "বর্তমান ছবি" : "Current photo")
      : image.imagePeriod === "unknown"
      ? (bengali ? "ছবির সময় অজানা" : "Photo year unavailable")
      : (bengali ? "ঐতিহাসিক ছবি" : "Historical photo");
  const rankLabel = pandal.userRank
    ? `#${pandal.userRank}`
    : pandal.priority
    ? `${bengali ? "অগ্রাধিকার" : "Priority"} ${pandal.priority}`
    : (bengali ? "উৎস-সহ" : "Sourced");

  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-white/20 bg-white/10 p-4 text-[#f8edd8] shadow-2xl backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-white/35 hover:shadow-2xl">
      <div className="relative h-52 overflow-hidden rounded-[1rem] bg-[#1a0c0c]">
        <img
          src={image.url}
          alt={image.alt}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1a0c0c]/90 via-[#1a0c0c]/40 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#f5c85b] backdrop-blur-md">
          {rankLabel} · {pandal.section.replace(" Kolkata", "")}
        </span>
        <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#f8edd8]/90">
          {periodLabel}{image.capturedYear ? ` · ${image.capturedYear}` : ""}
        </span>
        {totalForPandal > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-[#f5c85b] px-2.5 py-1 text-[10px] font-bold text-[#241f1a]">
            {imageIndex + 1}/{totalForPandal}
          </span>
        )}
      </div>
      <div className="pt-4">
        <h2 className="font-display text-[1.16rem] font-bold leading-tight text-[#f8edd8]">{pandal.name}</h2>
        <p className="mt-1 flex items-center gap-1 text-xs text-[#f8edd8]/75">
          <MapPin size={13} className="text-[#f5c85b]" />
          {pandal.subArea}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[#f8edd8]/70">
          <strong className="text-[#f5c85b]">{bengali ? "ছবি" : "Photo"}:</strong> {image.author} · {image.license}
          {image.capturedYear ? ` (${image.capturedYear})` : ""}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm" className="rounded-full bg-[#9d2529] px-4 text-xs font-bold text-white hover:bg-[#7e1d21]">
            <Link href={`/pandals/${pandal.id}`}>{bengali ? "প্যান্ডেল দেখুন" : "View pandal"}</Link>
          </Button>
          <a
            href={image.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 text-[10px] font-bold text-[#f5c85b] backdrop-blur-sm transition hover:bg-white/20"
          >
            {bengali ? "মূল উৎস" : "View source"}
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </article>
  );
}
