import { useEffect } from "react";
import Lenis from "lenis";
import { useLocation } from "wouter";

const interactiveSelector = ".navigation-page, .leaflet-container, [data-lenis-prevent], [data-camera-capture], video, canvas";

export function SmoothScrollManager() {
  const [location] = useLocation();
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      prevent: node => Boolean(node.closest(interactiveSelector)),
    });
    return () => lenis.destroy();
  }, []);
  useEffect(() => {
    if (location.startsWith("/navigate")) return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}
