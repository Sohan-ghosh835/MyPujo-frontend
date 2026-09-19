import { createContext, useContext, useState, type ReactNode } from "react";

interface MusicContextType {
  isMusicPlayerOpen: boolean;
  setIsMusicPlayerOpen: (open: boolean) => void;
  openMusicPlayer: () => void;
  closeMusicPlayer: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);

  const openMusicPlayer = () => setIsMusicPlayerOpen(true);
  const closeMusicPlayer = () => setIsMusicPlayerOpen(false);

  return (
    <MusicContext.Provider value={{ isMusicPlayerOpen, setIsMusicPlayerOpen, openMusicPlayer, closeMusicPlayer }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
