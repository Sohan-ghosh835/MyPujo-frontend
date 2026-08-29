import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Disc, ExternalLink, X, Play, Pause, Shuffle, Radio, Maximize2, Minimize2, Video, SkipForward, SkipBack, ListMusic } from "lucide-react";

export interface PujoMusicTrack {
  id: string;
  section: "hits" | "og" | "mahalaya";
  title: string;
  bengaliTitle: string;
  artist: string;
  bengaliArtist: string;
  type: "playlist" | "video";
  youtubeId: string;
  thumbnailUrl: string;
  directUrl: string;
  supportsShuffle: boolean;
}

export const PUJO_MUSIC_TRACKS: PujoMusicTrack[] = [
  {
    id: "hits-playlist",
    section: "hits",
    title: "Durga Pujo Hits Playlist",
    bengaliTitle: "দুর্গাপুজো হিটস প্লেলিস্ট",
    artist: "Top Festive Pujor Gaan (Playlist)",
    bengaliArtist: "সেরা ঢাক ও পুজো হিট প্লেলিস্ট",
    type: "playlist",
    youtubeId: "PLJAiFJ6bGyew",
    thumbnailUrl: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=600&q=80",
    directUrl: "https://music.youtube.com/playlist?list=PLJAiFJ6bGyew&si=-DCdPqbt80KSHoW-",
    supportsShuffle: true,
  },
  {
    id: "og-single",
    section: "og",
    title: "Durga Pujo OG (Dugga Elo)",
    bengaliTitle: "দুর্গাপুজো ওজি (দুগ্গা এলো)",
    artist: "Classic Evergreen Pujo Gaan",
    bengaliArtist: "চিরসবুজ মেলোডি ও পুজো সুর",
    type: "video",
    youtubeId: "oyBQywMMi24",
    thumbnailUrl: "https://img.youtube.com/vi/oyBQywMMi24/hqdefault.jpg",
    directUrl: "https://music.youtube.com/watch?v=oyBQywMMi24&si=x0pifg0r0CsNqRXg",
    supportsShuffle: false,
  },
  {
    id: "mahalaya-original",
    section: "mahalaya",
    title: "Mahishasuramardini (Original)",
    bengaliTitle: "মহিষাসুরমর্দিনী (বীরেন্দ্রকৃষ্ণ ভদ্র)",
    artist: "Birendra Krishna Bhadra & Pankaj Mullick",
    bengaliArtist: "বীরেন্দ্রকৃষ্ণ ভদ্র ও পঙ্কজ মল্লিক",
    type: "video",
    youtubeId: "Oxs4vBNkqtM",
    thumbnailUrl: "https://img.youtube.com/vi/Oxs4vBNkqtM/hqdefault.jpg",
    directUrl: "https://music.youtube.com/watch?v=Oxs4vBNkqtM&si=rO8k3_vfsdggGmyl",
    supportsShuffle: false,
  },
  {
    id: "mahalaya-playlist",
    section: "mahalaya",
    title: "Mahalaya Special Playlist",
    bengaliTitle: "মহালয়া বিশেষ প্লেলিস্ট",
    artist: "Mahalaya Songs & Chandi Path",
    bengaliArtist: "মহালয়া ও আগমনী চণ্ডীপাঠ সংকলন",
    type: "playlist",
    youtubeId: "PLORF1mEtpAB8",
    thumbnailUrl: "https://img.youtube.com/vi/Oxs4vBNkqtM/maxresdefault.jpg",
    directUrl: "https://music.youtube.com/playlist?list=PLORF1mEtpAB8&si=fN_ZwGRhtL8MaOZC",
    supportsShuffle: true,
  },
];

interface PujoMusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PujoMusicPlayer({ isOpen, onClose }: PujoMusicPlayerProps) {
  const { language } = useLanguage();
  const bengali = language === "bn";

  const [activeSection, setActiveSection] = useState<"hits" | "og" | "mahalaya">("hits");
  const [activeTrackId, setActiveTrackId] = useState<string>("hits-playlist");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  const activeTrack = PUJO_MUSIC_TRACKS.find(t => t.id === activeTrackId) || PUJO_MUSIC_TRACKS[0];
  const currentSectionTracks = PUJO_MUSIC_TRACKS.filter(t => t.section === activeSection);

  const handleSectionSelect = (section: "hits" | "og" | "mahalaya") => {
    setActiveSection(section);
    const first = PUJO_MUSIC_TRACKS.find(t => t.section === section);
    if (first) {
      setActiveTrackId(first.id);
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    const currentIndex = currentSectionTracks.findIndex(t => t.id === activeTrackId);
    const nextIndex = (currentIndex + 1) % currentSectionTracks.length;
    setActiveTrackId(currentSectionTracks[nextIndex].id);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    const currentIndex = currentSectionTracks.findIndex(t => t.id === activeTrackId);
    const prevIndex = (currentIndex - 1 + currentSectionTracks.length) % currentSectionTracks.length;
    setActiveTrackId(currentSectionTracks[prevIndex].id);
    setIsPlaying(true);
  };

  const getEmbedUrl = (track: PujoMusicTrack) => {
    const autoplay = isPlaying ? "1" : "0";
    const shuffleParam = isShuffled && track.supportsShuffle ? "&shuffle=1" : "";
    if (track.type === "playlist") {
      return `https://www.youtube.com/embed/videoseries?list=${track.youtubeId}&autoplay=${autoplay}&enablejsapi=1${shuffleParam}`;
    }
    return `https://www.youtube.com/embed/${track.youtubeId}?autoplay=${autoplay}&enablejsapi=1`;
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

        {/* Offscreen audio iframe running YouTube stream without being muted by browser display:none rules */}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#f5c85b]/30 bg-[#1e0f0f] shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 bg-[#2a1314] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-[#8c1e21] text-[#f5c85b] shadow-inner">
              <Radio size={18} />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-[#f5c85b]">
                {bengali ? "পুজো প্লেলিস্ট ও মহালয়া" : "Pujo Music Playlist"}
              </h3>
              <p className="text-[11px] text-[#f8edd8]/70">
                {bengali ? "উৎসবের সুর, আগমনী গান ও মহালয়া" : "Festive Pujor Gaan, OG hits & Mahalaya"}
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
        <div className="flex border-b border-white/10 bg-[#160a0a] p-1.5 text-xs font-bold sm:text-sm">
          <button
            onClick={() => handleSectionSelect("hits")}
            className={`flex-1 rounded-xl py-2 transition ${
              activeSection === "hits"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            🔥 {bengali ? "দুর্গাপুজো হিটস" : "Durga Pujo Hits"}
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

        {/* Audio Player Card with YT Album Cover Art */}
        <div className="p-5 space-y-4">
          <div className="flex flex-col items-center text-center">
            {/* YouTube Album Cover Image */}
            <div className="relative group">
              <img
                src={activeTrack.thumbnailUrl}
                alt={activeTrack.title}
                className="h-44 sm:h-52 w-full max-w-[320px] rounded-2xl object-cover border-2 border-[#f5c85b]/40 shadow-2xl transition duration-300 group-hover:scale-[1.02]"
              />
              {isPlaying && (
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-[#f5c85b] backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#f5c85b] animate-ping" />
                  {bengali ? "প্লে হচ্ছে" : "Playing"}
                </div>
              )}
            </div>

            {/* Track Meta */}
            <h4 className="mt-3 font-display text-lg font-bold text-white">
              {bengali ? activeTrack.bengaliTitle : activeTrack.title}
            </h4>
            <p className="mt-0.5 text-xs text-[#f5c85b]">
              {bengali ? activeTrack.bengaliArtist : activeTrack.artist}
            </p>

            {/* Controls Bar */}
            <div className="mt-4 flex items-center gap-3">
              {activeTrack.supportsShuffle && (
                <button
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`grid size-9 place-items-center rounded-full border transition ${
                    isShuffled
                      ? "border-[#f5c85b] bg-[#f5c85b] text-[#241f1a]"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                  title={bengali ? "সাফল অপশন" : "Shuffle"}
                >
                  <Shuffle size={16} />
                </button>
              )}

              <button
                onClick={handlePrevTrack}
                disabled={currentSectionTracks.length <= 1}
                className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
              >
                <SkipBack size={16} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="grid size-12 place-items-center rounded-full bg-[#8c1e21] text-[#f5c85b] shadow-xl transition hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
              </button>

              <button
                onClick={handleNextTrack}
                disabled={currentSectionTracks.length <= 1}
                className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
              >
                <SkipForward size={16} />
              </button>

              {/* Video Toggle Button */}
              <button
                onClick={() => setShowVideo(!showVideo)}
                className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  showVideo
                    ? "border-[#f5c85b] bg-[#f5c85b] text-[#241f1a]"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
                title={bengali ? "ভিডিও মোড টগল করুন" : "Toggle Video Mode"}
              >
                <Video size={14} />
                <span>{showVideo ? (bengali ? "ভিডিও বন্ধ" : "Hide Video") : (bengali ? "ভিডিও দেখুন" : "Video Mode")}</span>
              </button>
            </div>
          </div>

          {/* YouTube Player Container (Visible when showVideo = true, offscreen when false so audio stream plays reliably) */}
          <div className={showVideo ? "relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-xl animate-in zoom-in-95 duration-200 mt-3" : "absolute opacity-0 pointer-events-none -z-50 w-1 h-1 overflow-hidden"}>
            <iframe
              key={`full-${activeTrack.id}-${isPlaying}-${isShuffled}`}
              src={getEmbedUrl(activeTrack)}
              title={activeTrack.title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Section Playlist Queue List */}
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-bold text-[#f5c85b]">
              <span className="flex items-center gap-1.5">
                <ListMusic size={14} />
                {bengali ? "প্লেলিস্ট তালিকা" : "Playlist Queue"}
              </span>
              <a
                href={activeTrack.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-white/80 hover:text-[#f5c85b]"
              >
                <ExternalLink size={12} />
                YouTube Music
              </a>
            </div>

            <div className="mt-2 max-h-36 space-y-1.5 overflow-y-auto pr-1">
              {currentSectionTracks.map(t => {
                const isCurrent = t.id === activeTrackId;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTrackId(t.id);
                      setIsPlaying(true);
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-xl p-2 transition ${
                      isCurrent
                        ? "bg-[#8c1e21] text-[#f5c85b] font-bold"
                        : "bg-white/5 text-white/90 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={t.thumbnailUrl}
                        alt={t.title}
                        className="size-8 rounded-lg object-cover"
                      />
                      <div className="truncate text-xs">
                        <p className="truncate font-semibold">{bengali ? t.bengaliTitle : t.title}</p>
                        <p className="text-[10px] text-white/60">{bengali ? t.bengaliArtist : t.artist}</p>
                      </div>
                    </div>
                    {isCurrent && isPlaying ? (
                      <Disc size={16} className="animate-spin text-[#f5c85b]" />
                    ) : (
                      <Play size={14} className="text-white/60" />
                    )}
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
