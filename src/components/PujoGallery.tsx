import { Button } from "@/components/ui/button";
import { PUJO_GALLERY_FEATURES } from "../../../shared/pujoGallery";
import { ChevronLeft, ChevronRight, ExternalLink, Images } from "lucide-react";
import { useState } from "react";

const FESTIVAL_PAGE_SIZE = 12;

export function PujoGallery({ bengali }: { bengali: boolean }) {
  const [festivalPage, setFestivalPage] = useState(1);

  const festivalPageCount = Math.max(1, Math.ceil(PUJO_GALLERY_FEATURES.length / FESTIVAL_PAGE_SIZE));
  const visibleFestival = PUJO_GALLERY_FEATURES.slice((festivalPage - 1) * FESTIVAL_PAGE_SIZE, festivalPage * FESTIVAL_PAGE_SIZE);

  return (
    <div className="mt-8">
      <section className="rounded-[1.45rem] border border-[#dfcaa3] bg-[#3b1719] p-5 text-[#fff7e5] shadow-[0_18px_40px_rgba(74,28,24,.18)] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-[#f1c66a]">{bengali ? "উৎস-সহ উৎসবের দৃশ্য" : "Source-attributed festival context"}</p>
            <h2 className="font-display mt-1 text-3xl font-bold">{bengali ? "উৎসবের মুহূর্ত" : "Festival moments"}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#f5dfc3]">
              {bengali ? "কলকাতার সেরা দুর্গোৎসবের উৎসব-ছবিগুলির কালেকশন।" : "Curated collection of Kolkata Durga Puja festival-context photographs."}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-[#fff3d4]">
            <Images size={15} />
            {PUJO_GALLERY_FEATURES.length} {bengali ? "টি ছবি" : "photographs"}
          </span>
        </div>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleFestival.map((image, index) => (
          <article key={`festival-context-${index}`} className="overflow-hidden rounded-2xl bg-[#fff9eb] text-[#4a2520] shadow-[0_10px_22px_rgba(0,0,0,.18)]">
            <img src={image.url} alt={image.alt} loading="lazy" decoding="async" className="h-48 w-full object-cover" />
            <div className="p-3">
              <h4 className="font-display text-base font-bold leading-tight line-clamp-2">{image.title}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-[#765e53]">{image.description}</p>
              <a href={image.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#8c1e21] underline underline-offset-2">
                {image.author} · {image.license}
                <ExternalLink size={11} />
              </a>
            </div>
          </article>
        ))}
      </div>

      {PUJO_GALLERY_FEATURES.length > FESTIVAL_PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={() => setFestivalPage(current => Math.max(1, current - 1))} disabled={festivalPage === 1} variant="outline" className="rounded-full border-[#d7bd95] bg-[#fff9eb] text-[#772321]">
            <ChevronLeft size={16} />
            {bengali ? "আগের" : "Previous"}
          </Button>
          <span className="text-xs font-bold text-[#765e53]">
            {bengali ? "পৃষ্ঠা" : "Page"} {festivalPage} / {festivalPageCount}
          </span>
          <Button onClick={() => setFestivalPage(current => Math.min(festivalPageCount, current + 1))} disabled={festivalPage === festivalPageCount} variant="outline" className="rounded-full border-[#d7bd95] bg-[#fff9eb] text-[#772321]">
            {bengali ? "পরের" : "Next"}
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}

