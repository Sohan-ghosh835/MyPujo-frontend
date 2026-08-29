import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Music, Disc, ExternalLink, X, Play, Pause, Shuffle, Radio, ChevronDown, Maximize2, Minimize2 } from "lucide-react";

export interface PujoMusicTrack {
  id: string;
  section: "hits" | "og" | "mahalaya";
  title: string;
  bengaliTitle: string;
  artist: string;
  bengaliArtist: string;
  type: "playlist" | "video";
  youtubeId: string;
  directUrl: string;
  supportsShuffle: boolean;
}

export const PUJO_MUSIC_TRACKS: PujoMusicTrack[] = [
  {
    id: "hits-playlist",
    section: "hits",
    title: "Durga Pujo Hits 2026",
    bengaliTitle: "দুর্গাপুজো হিটস ২০২৬",
    artist: "Top Festive Pujor Gaan Playlist",
    bengaliArtist: "সেরা ঢাক ও পুজো হিট গান",
    type: "playlist",
    youtubeId: "PLJAiFJ6bGyew",
    directUrl: "https://music.youtube.com/playlist?list=PLJAiFJ6bGyew&si=wK5E1TZsBmii-CwJ",
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
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  const activeTrack = PUJO_MUSIC_TRACKS.find(t => t.id === activeTrackId) || PUJO_MUSIC_TRACKS[0];

  const handleSectionSelect = (section: "hits" | "og" | "mahalaya") => {
    setActiveSection(section);
    const firstInSection = PUJO_MUSIC_TRACKS.find(t => t.section === section);
    if (firstInSection) {
      setActiveTrackId(firstInSection.id);
    }
  };

  const currentSectionTracks = PUJO_MUSIC_TRACKS.filter(t => t.section === activeSection);

  const getEmbedUrl = (track: PujoMusicTrack) => {
    const shuffleParam = isShuffled && track.supportsShuffle ? "&shuffle=1" : "";
    if (track.type === "playlist") {
      return `https://www.youtube.com/embed/videoseries?list=${track.youtubeId}&autoplay=1&enablejsapi=1${shuffleParam}`;
    }
    return `https://www.youtube.com/embed/${track.youtubeId}?autoplay=1&enablejsapi=1`;
  };

  if (!isOpen) return null;

  // Minimized Floating Player
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 flex items-center gap-3 rounded-2xl border border-[#f5c85b]/40 bg-[#1e0f0f]/95 p-3 shadow-2xl backdrop-blur-2xl text-white sm:bottom-6">
        <div className="relative flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-[#8c1e21] text-[#f5c85b] animate-pulse">
            <Disc size={18} className="animate-spin" style={{ animationDuration: "6s" }} />
          </div>
          <div className="max-w-[160px] truncate">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#f5c85b]">
              {bengali ? "পুজো মিউজিক চালু" : "Pujo Music Playing"}
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
      </div>
    );
  }

  // Full Modal Player
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#f5c85b]/30 bg-[#1e0f0f] shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/15 bg-[#2a1314] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#8c1e21] text-[#f5c85b] shadow-inner">
              <Radio size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#f5c85b]">
                {bengali ? "পুজো প্লেলিস্ট ও মহালয়া" : "Pujo Music Playlist"}
              </h3>
              <p className="text-xs text-[#f8edd8]/70">
                {bengali ? "উৎসবের সুর, আগমনী গান ও মহালয়া মহিষাসুরমর্দিনী" : "Festive Pujor Gaan, OG hits & Mahalaya Mahishasuramardini"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="grid size-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              title={bengali ? "মিনি প্লেয়ার করুন" : "Minimize player"}
            >
              <Minimize2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="grid size-9 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              title={bengali ? "বন্ধ করুন" : "Close player"}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Section Selection Tabs */}
        <div className="flex border-b border-white/10 bg-[#160a0a] p-2 text-xs font-bold sm:text-sm">
          <button
            onClick={() => handleSectionSelect("hits")}
            className={`flex-1 rounded-xl py-2.5 transition ${
              activeSection === "hits"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            🔥 {bengali ? "দুর্গাপুজো হিটস" : "Durga Pujo Hits"}
          </button>
          <button
            onClick={() => handleSectionSelect("og")}
            className={`flex-1 rounded-xl py-2.5 transition ${
              activeSection === "og"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            📻 {bengali ? "দুর্গাপুজো ওজি" : "Durga Pujo OG"}
          </button>
          <button
            onClick={() => handleSectionSelect("mahalaya")}
            className={`flex-1 rounded-xl py-2.5 transition ${
              activeSection === "mahalaya"
                ? "bg-[#8c1e21] text-[#f5c85b] shadow-md"
                : "text-[#f8edd8]/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            🌅 {bengali ? "মহালয়া" : "Mahalaya"}
          </button>
        </div>

        {/* Sub-track Selector if multiple in section */}
        {currentSectionTracks.length > 1 && (
          <div className="flex items-center gap-2 border-b border-white/10 bg-[#241213] px-6 py-2 text-xs">
            <span className="font-semibold text-[#f8edd8]/60">{bengali ? "ট্র্যাক নির্বাচন:" : "Select Track:"}</span>
            {currentSectionTracks.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTrackId(t.id)}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  activeTrackId === t.id
                    ? "bg-[#f5c85b] text-[#241f1a]"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {bengali ? t.bengaliTitle : t.title}
              </button>
            ))}
          </div>
        )}

        {/* Player Display Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <Disc size={28} className="text-[#f5c85b] animate-spin" style={{ animationDuration: "8s" }} />
              <div>
                <h4 className="font-display text-base font-bold text-white">
                  {bengali ? activeTrack.bengaliTitle : activeTrack.title}
                </h4>
                <p className="text-xs text-[#f5c85b]">
                  {bengali ? activeTrack.bengaliArtist : activeTrack.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeTrack.supportsShuffle && (
                <button
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    isShuffled
                      ? "border-[#f5c85b] bg-[#f5c85b] text-[#241f1a]"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                  title={bengali ? "সাফল বোতাম" : "Shuffle Playlist"}
                >
                  <Shuffle size={14} />
                  <span>{bengali ? "সাফল" : "Shuffle"}</span>
                </button>
              )}

              <a
                href={activeTrack.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                <ExternalLink size={14} />
                <span>YouTube Music</span>
              </a>
            </div>
          </div>

          {/* Embedded iFrame YouTube Player */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-black shadow-xl">
            <iframe
              src={getEmbedUrl(activeTrack)}
              title={activeTrack.title}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
