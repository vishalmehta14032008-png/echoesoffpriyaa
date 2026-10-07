import { MotionConfig } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import AmbientCanvas from "./fx/AmbientCanvas";
import FxCanvas from "./fx/FxCanvas";
import ButterflyGarden from "./components/ButterflyGarden";
import MusicPlayer from "./components/MusicPlayer";
import EasterEgg from "./components/EasterEgg";
import { MusicProvider } from "./music/MusicContext";
import { WorldProvider, useWorld } from "./lib/world";
import Experience from "./pages/Experience";
import Corner from "./pages/Corner";
import NotFound from "./pages/NotFound";

function Shell() {
  const { entered } = useWorld();
  const { pathname } = useLocation();
  const inCorner = pathname.startsWith("/corner");

  return (
    <>
      <div className="sky" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
        <span className="grain" />
      </div>
      <AmbientCanvas level={inCorner ? 0.55 : entered ? 1 : 0.15} />
      {!inCorner && <ButterflyGarden count={entered ? 5 : 2} />}

      <Routes>
        <Route path="/" element={<Experience />} />
        <Route path="/corner" element={<Corner />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <FxCanvas />
      <MusicPlayer placement={inCorner ? "top" : "bottom"} />
      <EasterEgg />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <MusicProvider>
        <WorldProvider>
          <Shell />
        </WorldProvider>
      </MusicProvider>
    </MotionConfig>
  );
}
