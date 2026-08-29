import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PUJO_MUSIC_TRACKS, type PujoMusicTrack } from "@shared/durgaPujoMusicData";
import { Disc, ExternalLink, X, Play, Pause, Shuffle, Radio, Maximize2, Minimize2, Video, SkipForward, SkipBack, ListMusic, Search } from "lucide-react";

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
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  // Prevent background website scrolling on PC & mobile when modal is open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, isMinimized]);

  const activeTrack = PUJO_MUSIC_TRACKS.find(t => t.id === activeTrackId) || PUJO_MUSIC_TRACKS[0];

  const currentSectionTracks = PUJO_MUSIC_TRACKS.filter(t => {
    if (t.section !== activeSection) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
  });

  const handleSectionSelect = (section: "hits" | "og" | "mahalaya") => {
    setActiveSection(section);
    setSearchFilter("");
    const first = PUJO_MUSIC_TRACKS.find(t => t.section === section);
    if (first) {
      setActiveTrackId(first.id);
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    const currentIndex = currentSectionTracks.findIndex(t => t.id === activeTrackId);
    const nextIndex = (currentIndex + 1) % currentSectionTracks.length;
    if (currentSectionTracks[nextIndex]) {
      setActiveTrackId(currentSectionTracks[nextIndex].id);
      setIsPlaying(true);
    }
  };

  const handlePrevTrack = () => {
    const currentIndex = currentSectionTracks.findIndex(t => t.id === activeTrackId);
    const prevIndex = (currentIndex - 1 + currentSectionTracks.length) % currentSectionTracks.length;
    if (currentSectionTracks[prevIndex]) {
      setActiveTrackId(currentSectionTracks[prevIndex].id);
      setIsPlaying(true);
    }
  };

  const getEmbedUrl = (track: PujoMusicTrack) => {
    const autoplay = isPlaying ? "1" : "0";
    const videoId = track.youtubeId && track.youtubeId.length === 11 ? track.youtubeId : "oyBQywMMi24";
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&enablejsapi=1&rel=0`;
  };

  if (!isOpen) return null;

  // Minimized Floating Player
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
              {bengali ? "পুজো গান চালু" : "Pujo Music Playing"}
            </p>
            <p className="truncate text-xs font-bold text-white">
              {bengali ? activeTrack.bengaliTitle : activeTrack.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="grid size-8 place-items-center rounded-lg bg-[#8c1e21] text-[#f5c85b] hover:bg-[#6f1719]"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={() => setIsMinimized(false)}
            className="grid size-8 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            title={bengali ? "প্লেয়ার প্রসারিত করুন" : "Expand Player"}
          >
            <Maximize2 size={15} />
          </button>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
            title={bengali ? "বন্ধ করুন" : "Close Player"}
          >
            <X size={15} />
          </button>
        </div>

        {/* Small background player window so audio keeps playing */}
        <iframe
          key={`min-${activeTrack.id}-${isPlaying}`}
          src={getEmbedUrl(activeTrack)}
          title="Audio Stream"
          className="absolute opacity-0 pointer-events-none -z-50 w-1 h-1 overflow-hidden"
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>
    );
  }

  // Full Player Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-[#f5c85b]/30 bg-[#1e0f0f] shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 bg-[#2a1314] px-5 py-3.5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-[#8c1e21] text-[#f5c85b] shadow-inner">
              <Radio size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#f5c85b]">
                {bengali ? "পুজো প্লেলিস্ট ও মহালয়া" : "Pujo Music Playlist"}
              </h3>
              <p className="text-[11px] text-[#f8edd8]/70">
                {bengali ? "১০৬টি উৎসবের সুর, গান ও মহালয়া" : "106 Festive Pujor Gaan, OG hits & Mahalaya"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="grid size-8 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              title={bengali ? "মিনি প্লেয়ার করুন" : "Minimize player"}
            >
              <Minimize2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="grid size-8 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              title={bengali ? "বন্ধ করুন" : "Close player"}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-white/10 bg-[#160a0a] p-1.5 text-xs font-bold sm:text-sm flex-shrink-0">
          <button
            onClick={() => handleSectionSelect("hits")}
            className={`flex-1 rounded-xl py-2 transition ${
              activeSection === "hits"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            🔥 {bengali ? "দুর্গাপুজো হিটস" : "Durga Pujo Hits"} ({PUJO_MUSIC_TRACKS.filter(t => t.section === "hits").length})
          </button>
          <button
            onClick={() => handleSectionSelect("og")}
            className={`flex-1 rounded-xl py-2 transition ${
              activeSection === "og"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            📻 {bengali ? "দুর্গাপুজো ওজি" : "Durga Pujo OG"}
          </button>
          <button
            onClick={() => handleSectionSelect("mahalaya")}
            className={`flex-1 rounded-xl py-2 transition ${
              activeSection === "mahalaya"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            🌅 {bengali ? "মহালয়া" : "Mahalaya"}
          </button>
        </div>

        {/* Player Body Container */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          
          {/* Active Track Header */}
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3 truncate">
              <img
                src={activeTrack.thumbnailUrl}
                alt={activeTrack.title}
                className="size-11 rounded-xl object-cover border border-[#f5c85b]/40 shadow flex-shrink-0"
              />
              <div className="truncate text-left">
                <h4 className="font-display text-sm font-bold text-white truncate">
                  {bengali ? activeTrack.bengaliTitle : activeTrack.title}
                </h4>
                <p className="text-xs text-[#f5c85b] truncate">
                  {bengali ? activeTrack.bengaliArtist : activeTrack.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={activeTrack.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                <ExternalLink size={13} />
                <span>YouTube Music</span>
              </a>
            </div>
          </div>

          {/* Guaranteed Playable YouTube Video Player Frame */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl">
            <iframe
              key={`player-${activeTrack.id}-${activeTrack.youtubeId}-${isPlaying}`}
              src={getEmbedUrl(activeTrack)}
              title={activeTrack.title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Section Playlist Queue List (Scrollable 106-Song Queue, Isolated Scroll for PC) */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 text-xs font-bold text-[#f5c85b]">
              <span className="flex items-center gap-1.5">
                <ListMusic size={14} />
                {bengali ? `প্লেলিস্ট তালিকা (${currentSectionTracks.length})` : `Playlist Queue (${currentSectionTracks.length})`}
              </span>

              <div className="relative flex-1 max-w-[180px]">
                <Search className="absolute left-2 top-2 text-white/40" size={12} />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder={bengali ? "গান খুঁজুন..." : "Filter song..."}
                  className="h-7 w-full rounded-lg border border-white/15 bg-white/10 pl-7 pr-2 text-[11px] text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#f5c85b]"
                />
              </div>
            </div>

            {/* Dedicated Isolated Scroll Area for PC */}
            <div
              className="mt-2 h-64 sm:h-72 space-y-1.5 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
              style={{ scrollbarWidth: "thin" }}
            >
              {currentSectionTracks.map((t, idx) => {
                const isCurrent = t.id === activeTrackId;
                return (
                  <div
                    key={`${t.id}-${idx}`}
                    onClick={() => {
                      setActiveTrackId(t.id);
                      setIsPlaying(true);
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-xl p-2 transition ${
                      isCurrent
                        ? "bg-[#8c1e21] text-[#f5c85b] font-bold shadow"
                        : "bg-white/5 text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 text-center text-[10px] font-bold text-white/50">{idx + 1}</span>
                      <img
                        src={t.thumbnailUrl}
                        alt={t.title}
                        className="size-8 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="truncate text-xs">
                        <p className="truncate font-semibold">{bengali ? t.bengaliTitle : t.title}</p>
                        <p className="text-[10px] text-white/60 truncate">{bengali ? t.bengaliArtist : t.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <a
                        href={t.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="rounded-md bg-white/10 p-1 text-white/70 hover:bg-[#f5c85b] hover:text-[#241f1a] transition"
                        title="Search on YouTube Music"
                      >
                        <ExternalLink size={12} />
                      </a>
                      {isCurrent && isPlaying ? (
                        <Disc size={16} className="animate-spin text-[#f5c85b]" />
                      ) : (
                        <Play size={14} className="text-white/60" />
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
