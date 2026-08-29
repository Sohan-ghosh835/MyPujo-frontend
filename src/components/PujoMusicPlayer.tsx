import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PUJO_MUSIC_TRACKS, type PujoMusicTrack } from "@shared/durgaPujoMusicData";
import { ExternalLink, X, Radio, Maximize2, Minimize2, ListMusic, Search, SkipForward, SkipBack, Play, Pause, Volume2, Volume1, VolumeX } from "lucide-react";

interface PujoMusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PujoMusicPlayer({ isOpen, onClose }: PujoMusicPlayerProps) {
  const { language } = useLanguage();
  const bengali = language === "bn";

  const [activeSection, setActiveSection] = useState<"hits" | "og" | "mahalaya">("hits");
  const [activeTrackId, setActiveTrackId] = useState<string>("hit-song-1");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  const activeTrack = PUJO_MUSIC_TRACKS.find(t => t.id === activeTrackId) || PUJO_MUSIC_TRACKS[0];
  const [duration, setDuration] = useState<number>(activeTrack.durationSeconds || 210);

  // Lock background website scrolling when modal is open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen, isMinimized]);

  const currentSectionTracks = PUJO_MUSIC_TRACKS.filter(t => {
    if (t.section !== activeSection) return false;
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
  });

  const handleNextTrack = useCallback(() => {
    const currentIndex = currentSectionTracks.findIndex(t => t.id === activeTrackId);
    const nextIndex = (currentIndex + 1) % currentSectionTracks.length;
    if (currentSectionTracks[nextIndex]) {
      setActiveTrackId(currentSectionTracks[nextIndex].id);
      setCurrentTime(0);
      setSeekTime(null);
      setIsPlaying(true);
    }
  }, [currentSectionTracks, activeTrackId]);

  const handlePrevTrack = useCallback(() => {
    const currentIndex = currentSectionTracks.findIndex(t => t.id === activeTrackId);
    const prevIndex = (currentIndex - 1 + currentSectionTracks.length) % currentSectionTracks.length;
    if (currentSectionTracks[prevIndex]) {
      setActiveTrackId(currentSectionTracks[prevIndex].id);
      setCurrentTime(0);
      setSeekTime(null);
      setIsPlaying(true);
    }
  }, [currentSectionTracks, activeTrackId]);

  // Update track duration and reset timeline when track changes
  useEffect(() => {
    setCurrentTime(0);
    setSeekTime(null);
    setIsPlaying(true);
    setDuration(activeTrack.durationSeconds || 240);
  }, [activeTrackId, activeTrack.durationSeconds]);

  // Smooth timeline timer with clean track end auto-advance
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentTime(prev => {
        if (prev + 1 >= duration) {
          // Track finished -> auto advance smoothly
          setTimeout(() => handleNextTrack(), 0);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, duration, handleNextTrack]);

  const handleSectionSelect = (section: "hits" | "og" | "mahalaya") => {
    setActiveSection(section);
    setSearchFilter("");
    const first = PUJO_MUSIC_TRACKS.find(t => t.section === section);
    if (first) {
      setActiveTrackId(first.id);
      setCurrentTime(0);
      setSeekTime(null);
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    setSeekTime(newTime);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) setVolume(100);
    } else {
      setIsMuted(true);
    }
  };

  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = Math.floor(secs % 60);
    if (hours > 0) {
      return `${hours}:${mins < 10 ? "0" : ""}${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
    }
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  // Embed URL with active volume & mute parameter
  const getEmbedUrl = (track: PujoMusicTrack) => {
    const autoplay = isPlaying ? "1" : "0";
    const muteParam = isMuted || volume === 0 ? "&mute=1" : "&mute=0";
    const videoId = track.youtubeId || "xlElO06nQy8";
    const startParam = seekTime !== null ? `&start=${seekTime}` : "";
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}&enablejsapi=1&rel=0${muteParam}${startParam}`;
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

        {/* Offscreen Continuous Audio Stream Player */}
        <iframe
          key={`min-${activeTrack.id}-${isPlaying}-${isMuted}-${volume}`}
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200"
      onWheel={e => e.stopPropagation()}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border border-[#f5c85b]/30 bg-[#1e0f0f] shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 bg-[#2a1314] px-5 py-3.5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-[#8c1e21] text-[#f5c85b] shadow-inner">
              <Radio size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#f5c85b]">
                {bengali ? "পুজো গান প্লেয়ার" : "Pujo Audio Player"}
              </h3>
              <p className="text-[11px] text-[#f8edd8]/70">
                {bengali ? "৬০টি সেরা পুজো গান ও আগমনী সুর" : "60 Festive Pujor Gaan & Mahalaya"}
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

        {/* Section Tabs (Without Emojis) */}
        <div className="flex border-b border-white/10 bg-[#160a0a] p-1.5 text-xs font-bold sm:text-sm flex-shrink-0">
          <button
            onClick={() => handleSectionSelect("hits")}
            className={`flex-1 rounded-xl py-2 transition ${
              activeSection === "hits"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {bengali ? "দুর্গাপুজো হিটস" : "Durga Pujo Hits"} ({PUJO_MUSIC_TRACKS.filter(t => t.section === "hits").length})
          </button>
          <button
            onClick={() => handleSectionSelect("og")}
            className={`flex-1 rounded-xl py-2 transition ${
              activeSection === "og"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {bengali ? "দুর্গাপুজো ওজি" : "Durga Pujo OG"}
          </button>
          <button
            onClick={() => handleSectionSelect("mahalaya")}
            className={`flex-1 rounded-xl py-2 transition ${
              activeSection === "mahalaya"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {bengali ? "মহালয়া" : "Mahalaya"}
          </button>
        </div>

        {/* Player Body Container */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 overscroll-contain">
          
          {/* Pure Audio Card UI */}
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#f5c85b]/30 bg-gradient-to-b from-[#2e1214] to-[#1a0b0c] p-6 text-center shadow-2xl">
            
            {/* Album Cover Art */}
            <div className="relative group mb-4">
              <img
                src={activeTrack.thumbnailUrl}
                alt={activeTrack.title}
                className="h-44 w-44 sm:h-52 sm:w-52 rounded-2xl object-cover border-2 border-[#f5c85b]/50 shadow-2xl transition duration-300 group-hover:scale-105"
              />
              {isPlaying && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-[#f5c85b] backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#f5c85b] animate-ping" />
                  {bengali ? "প্লে হচ্ছে" : "Playing"}
                </div>
              )}
            </div>

            {/* Song Meta */}
            <h4 className="font-display text-lg font-bold text-white px-2 truncate max-w-full">
              {bengali ? activeTrack.bengaliTitle : activeTrack.title}
            </h4>
            <p className="mt-1 text-xs text-[#f5c85b] font-medium px-2 truncate max-w-full">
              {bengali ? activeTrack.bengaliArtist : activeTrack.artist}
            </p>

            {/* Custom Interactive Timeline Slider Bar */}
            <div className="w-full mt-5 px-2 space-y-1.5">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={e => handleSeek(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-[#f5c85b]"
              />
              <div className="flex justify-between text-[11px] font-semibold text-white/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Audio Playback Control Bar */}
            <div className="mt-4 flex items-center justify-center gap-4 relative">
              <button
                onClick={handlePrevTrack}
                disabled={currentSectionTracks.length <= 1}
                className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
                title="Previous Track"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="grid size-14 place-items-center rounded-full bg-[#8c1e21] text-[#f5c85b] shadow-2xl transition hover:scale-105 active:scale-95"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
              </button>

              <button
                onClick={handleNextTrack}
                disabled={currentSectionTracks.length <= 1}
                className="grid size-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
                title="Next Track"
              >
                <SkipForward size={18} />
              </button>

              {/* Working Interactive Volume & Mute Button */}
              <div className="relative">
                <button
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className={`grid size-10 place-items-center rounded-full border transition ${
                    isMuted || volume === 0
                      ? "border-red-500 bg-red-500/20 text-red-400"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                  title={isMuted ? "Unmute" : `Volume (${volume}%)`}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={18} />
                  ) : volume < 50 ? (
                    <Volume1 size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                </button>

                {/* Hover/Click Volume Slider Popup */}
                {showVolumeSlider && (
                  <div
                    onMouseLeave={() => setShowVolumeSlider(false)}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-xl border border-white/20 bg-black/90 px-3 py-2 shadow-2xl backdrop-blur animate-in fade-in zoom-in-95 duration-150 z-20"
                  >
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setVolume(val);
                        if (val > 0 && isMuted) setIsMuted(false);
                      }}
                      className="h-1.5 w-20 cursor-pointer appearance-none rounded-lg bg-white/30 accent-[#f5c85b]"
                    />
                    <span className="text-[10px] font-bold text-[#f5c85b] w-6 text-right">
                      {isMuted ? "0%" : `${volume}%`}
                    </span>
                  </div>
                )}
              </div>

              <a
                href={activeTrack.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                title="Watch on YouTube"
              >
                <ExternalLink size={14} />
                <span>YouTube</span>
              </a>
            </div>
          </div>

          {/* Offscreen Audio Stream Engine */}
          <iframe
            key={`audio-engine-${activeTrack.id}-${isPlaying}-${isMuted}-${volume}-${seekTime}`}
            src={getEmbedUrl(activeTrack)}
            title="Audio Stream Engine"
            className="absolute opacity-0 pointer-events-none -z-50 w-1 h-1 overflow-hidden"
            allow="autoplay; encrypted-media; picture-in-picture"
          />

          {/* Section Playlist Queue List (Scrollable 60-Song Queue, Isolated Scroll for PC) */}
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
              className="mt-2 space-y-1 overflow-y-auto overscroll-contain pr-1 touch-pan-y"
              style={{ maxHeight: "min(45vh, 320px)", scrollbarWidth: "thin" }}
              onWheel={e => e.stopPropagation()}
            >
              {currentSectionTracks.map((t, idx) => {
                const isCurrent = t.id === activeTrackId;
                const formatTrackDuration = (secs?: number) => {
                  if (!secs) return "3:30";
                  const mins = Math.floor(secs / 60);
                  const remaining = Math.floor(secs % 60);
                  return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
                };

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
                      <span className="text-[10px] font-semibold text-white/40">
                        {formatTrackDuration(t.durationSeconds)}
                      </span>
                      <a
                        href={t.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="rounded-md bg-white/10 p-1 text-white/70 hover:bg-[#f5c85b] hover:text-[#241f1a] transition flex items-center gap-1 text-[10px]"
                        title="Watch on YouTube"
                      >
                        <ExternalLink size={12} />
                      </a>
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
