import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PUJO_MUSIC_TRACKS, type PujoMusicTrack } from "@shared/durgaPujoMusicData";
import { Disc, ExternalLink, X, Play, Pause, Shuffle, Radio, Maximize2, Minimize2, SkipForward, SkipBack, ListMusic, Search } from "lucide-react";

interface PujoMusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PujoMusicPlayer({ isOpen, onClose }: PujoMusicPlayerProps) {
  const { language } = useLanguage();
  const bengali = language === "bn";

  const [activeSection, setActiveSection] = useState<"hits" | "og" | "mahalaya">("hits");
  const [activeTrackId, setActiveTrackId] = useState<string>("hit-track-1");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Lock body scroll when full modal is open (PC scroll isolation)
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen, isMinimized]);

  const activeTrack = PUJO_MUSIC_TRACKS.find(t => t.id === activeTrackId) || PUJO_MUSIC_TRACKS[0];

  const allSectionTracks = PUJO_MUSIC_TRACKS.filter(t => t.section === activeSection);
  const filteredSectionTracks = allSectionTracks.filter(t => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
  });

  const handleSectionSelect = (section: "hits" | "og" | "mahalaya") => {
    setActiveSection(section);
    setSearchFilter("");
    const first = PUJO_MUSIC_TRACKS.find(t => t.section === section);
    if (first) setActiveTrackId(first.id);
  };

  const handleNextTrack = () => {
    const idx = allSectionTracks.findIndex(t => t.id === activeTrackId);
    const next = (idx + 1) % allSectionTracks.length;
    setActiveTrackId(allSectionTracks[next].id);
  };

  const handlePrevTrack = () => {
    const idx = allSectionTracks.findIndex(t => t.id === activeTrackId);
    const prev = (idx - 1 + allSectionTracks.length) % allSectionTracks.length;
    setActiveTrackId(allSectionTracks[prev].id);
  };

  /**
   * Build a YouTube embed URL that actually works:
   * - playlist_item → embed/videoseries?list=<ID>&index=<N>  (plays from the real YT playlist)
   * - playlist      → embed/videoseries?list=<ID>
   * - video         → embed/<videoId>
   */
  const getEmbedUrl = (track: PujoMusicTrack): string => {
    if (track.type === "playlist_item" && track.playlistId) {
      // Use the YouTube playlist embed with index= to jump to the right track
      const idx = track.playlistIndex ?? 0;
      return `https://www.youtube.com/embed/videoseries?list=${track.playlistId}&index=${idx}&autoplay=1&enablejsapi=1&rel=0`;
    }
    if (track.type === "playlist" && track.youtubeId) {
      return `https://www.youtube.com/embed/videoseries?list=${track.youtubeId}&autoplay=1&enablejsapi=1&rel=0`;
    }
    if (track.type === "video" && track.youtubeId) {
      return `https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&enablejsapi=1&rel=0`;
    }
    // Absolute fallback: play the hits playlist from the start
    return `https://www.youtube.com/embed/videoseries?list=PLJAiFJ6bGyew&autoplay=1&enablejsapi=1&rel=0`;
  };

  if (!isOpen) return null;

  // ─── Minimized floating mini-player ────────────────────────────────
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 flex items-center gap-3 rounded-2xl border border-[#f5c85b]/40 bg-[#1e0f0f]/95 p-3 shadow-2xl backdrop-blur-2xl text-white sm:bottom-6">
        <div className="relative flex items-center gap-2.5">
          <img
            src={activeTrack.thumbnailUrl}
            alt={activeTrack.title}
            className="size-10 rounded-xl object-cover border border-[#f5c85b]/50 shadow"
          />
          <div className="max-w-[150px] truncate">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#f5c85b]">
              {bengali ? "পুজো গান চালু" : "Now Playing"}
            </p>
            <p className="truncate text-xs font-bold text-white">
              {bengali ? activeTrack.bengaliTitle : activeTrack.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(false)}
            className="grid size-8 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            title={bengali ? "প্লেয়ার বড় করুন" : "Expand Player"}
          >
            <Maximize2 size={15} />
          </button>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            title={bengali ? "বন্ধ করুন" : "Close"}
          >
            <X size={15} />
          </button>
        </div>
        {/* Keep audio alive via a tiny offscreen iframe */}
        <iframe
          key={`mini-${activeTrack.id}`}
          src={getEmbedUrl(activeTrack)}
          title="Audio"
          className="absolute -z-50 h-px w-px opacity-0 pointer-events-none"
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  }

  // ─── Full player modal ─────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
      onWheel={e => e.stopPropagation()}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-[#f5c85b]/30 bg-[#1e0f0f] shadow-2xl text-white">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-white/15 bg-[#2a1314] px-5 py-3.5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-[#8c1e21] text-[#f5c85b] shadow-inner">
              <Radio size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#f5c85b]">
                {bengali ? "পুজো প্লেলিস্ট" : "Pujo Music Playlist"}
              </h3>
              <p className="text-[11px] text-[#f8edd8]/70">
                {bengali ? "১০৬টি হিটস, ওজি ও মহালয়া" : "106 Hits, OG & Mahalaya"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="grid size-8 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              title={bengali ? "ছোট করুন" : "Minimize"}
            ><Minimize2 size={15} /></button>
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              title={bengali ? "বন্ধ করুন" : "Close"}
            ><X size={17} /></button>
          </div>
        </div>

        {/* ── Section tabs ────────────────────────────────────────── */}
        <div className="flex border-b border-white/10 bg-[#160a0a] p-1.5 text-xs font-bold sm:text-sm flex-shrink-0">
          {(["hits", "og", "mahalaya"] as const).map(sec => {
            const labels = {
              hits:     { en: `🔥 Durga Pujo Hits (${PUJO_MUSIC_TRACKS.filter(t => t.section === "hits").length})`, bn: `🔥 দুর্গাপুজো হিটস (${PUJO_MUSIC_TRACKS.filter(t => t.section === "hits").length})` },
              og:       { en: "📻 Durga Pujo OG", bn: "📻 দুর্গাপুজো ওজি" },
              mahalaya: { en: "🌅 Mahalaya",       bn: "🌅 মহালয়া" },
            };
            return (
              <button
                key={sec}
                onClick={() => handleSectionSelect(sec)}
                className={`flex-1 rounded-xl py-2 transition ${
                  activeSection === sec
                    ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                    : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {bengali ? labels[sec].bn : labels[sec].en}
              </button>
            );
          })}
        </div>

        {/* ── Scrollable body ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">

          {/* Now-playing header */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <img
              src={activeTrack.thumbnailUrl}
              alt={activeTrack.title}
              className="size-11 rounded-xl object-cover border border-[#f5c85b]/40 shadow flex-shrink-0"
            />
            <div className="truncate flex-1 text-left">
              <h4 className="font-display text-sm font-bold text-white truncate">
                {bengali ? activeTrack.bengaliTitle : activeTrack.title}
              </h4>
              <p className="text-xs text-[#f5c85b] truncate">
                {bengali ? activeTrack.bengaliArtist : activeTrack.artist}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={handlePrevTrack} disabled={allSectionTracks.length <= 1}
                className="grid size-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition">
                <SkipBack size={14} />
              </button>
              <button onClick={handleNextTrack} disabled={allSectionTracks.length <= 1}
                className="grid size-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition">
                <SkipForward size={14} />
              </button>
              <a href={activeTrack.directUrl} target="_blank" rel="noopener noreferrer"
                className="grid size-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition"
                title="Open on YouTube Music">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* YouTube player — always visible so audio actually plays */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
            <iframe
              key={`yt-${activeTrack.id}-${activeTrack.playlistIndex}`}
              src={getEmbedUrl(activeTrack)}
              title={activeTrack.title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* ── Song list ──────────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
            {/* List header + search */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 text-xs font-bold text-[#f5c85b]">
              <span className="flex items-center gap-1.5">
                <ListMusic size={14} />
                {bengali
                  ? `প্লেলিস্ট (${filteredSectionTracks.length})`
                  : `Playlist (${filteredSectionTracks.length})`}
              </span>
              <div className="relative flex-1 max-w-[200px]">
                <Search className="absolute left-2 top-2 text-white/40" size={12} />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder={bengali ? "গান খুঁজুন..." : "Filter songs..."}
                  className="h-7 w-full rounded-lg border border-white/15 bg-white/10 pl-7 pr-2 text-[11px] text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f5c85b]"
                />
              </div>
            </div>

            {/* Scrollable isolated song list */}
            <div
              className="mt-2 space-y-1 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
              style={{ maxHeight: "min(50vh, 360px)", scrollbarWidth: "thin" }}
              onWheel={e => e.stopPropagation()}
            >
              {filteredSectionTracks.map((t, idx) => {
                const isCurrent = t.id === activeTrackId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTrackId(t.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl p-2 transition ${
                      isCurrent
                        ? "bg-[#8c1e21] text-[#f5c85b] font-bold shadow"
                        : "bg-white/5 text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-6 text-center text-[10px] font-bold text-white/40 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate text-xs">
                        <p className="truncate font-semibold">
                          {bengali ? t.bengaliTitle : t.title}
                        </p>
                        <p className="text-[10px] text-white/50 truncate">
                          {bengali ? t.bengaliArtist : t.artist}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {t.query && (
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(t.query)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="rounded-md bg-white/10 p-1 text-white/60 hover:bg-[#f5c85b] hover:text-[#241f1a] transition"
                          title="Search on YouTube"
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                      {isCurrent ? (
                        <Disc size={15} className="animate-spin text-[#f5c85b]" />
                      ) : (
                        <Play size={13} className="text-white/40" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
