import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import MyPuja from "./pages/MyPuja";
import Navigate from "./pages/Navigate";
import CapturePuja from "./pages/CapturePuja";
import NearbyPuja from "./pages/NearbyPuja";
import NotFound from "./pages/NotFound";
import PandalDetail from "./pages/PandalDetail";
import ReportCorrection from "./pages/ReportCorrection";
import Routes from "./pages/Routes";
import SectionPage from "./pages/SectionPage";

function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isNavigationPage = location.startsWith("/navigate");
  const lenisRef = useRef<Lenis | null>(null);
  const prevLocation = useRef(location);

  // Reset scroll position on every route change
  useEffect(() => {
    if (prevLocation.current !== location) {
      prevLocation.current = location;
      // Reset Lenis if active
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
      // Also force native scroll reset
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [location]);

  useEffect(() => {
    // Lenis fights with Leaflet map panning on the navigation page
    if (isNavigationPage) {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isNavigationPage]);

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/explore" component={Explore} />
      <Route path="/map" component={MapPage} />
      <Route path="/routes" component={Routes} />
      <Route path="/my-puja" component={MyPuja} />
      <Route path="/navigate/:id" component={Navigate} />
      <Route path="/nearby-pujo" component={NearbyPuja} />
      <Route path="/capture/:id" component={CapturePuja} />
      <Route path="/report-correction" component={ReportCorrection} />
      <Route path="/pandals/:id" component={PandalDetail} />
      <Route path="/sections/:section" component={SectionPage} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <SmoothScrollProvider>
              <Toaster richColors position="top-right" />
              <Router />
            </SmoothScrollProvider>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
