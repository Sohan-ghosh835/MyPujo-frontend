import { useMusic } from "@/contexts/MusicContext";
import { PujoMusicPlayer } from "@/components/PujoMusicPlayer";

export function GlobalPujoMusicPlayer() {
  const { isMusicPlayerOpen, closeMusicPlayer } = useMusic();
  return <PujoMusicPlayer isOpen={isMusicPlayerOpen} onClose={closeMusicPlayer} />;
}
