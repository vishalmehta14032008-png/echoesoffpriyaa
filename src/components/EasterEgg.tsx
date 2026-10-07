import { useEffect, useState } from "react";
import { content } from "../content";
import { fx } from "../fx/fx";
import { EGG_EVENT } from "../lib/world";
import Butterfly from "./Butterfly";
import Modal from "./Modal";

/**
 * Hidden surprise: tap the little moon in the header five times,
 * or simply type "priya" on a keyboard.
 */
export default function EasterEgg() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => {
      fx.rain(70, ["flower", "heart", "spark"]);
      setOpen(true);
    };
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea")) return;
      typed = (typed + e.key.toLowerCase()).slice(-5);
      if (typed === "priya") show();
    };
    window.addEventListener(EGG_EVENT, show);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(EGG_EVENT, show);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <Modal open={open} onClose={() => setOpen(false)} label="A hidden message">
      <div className="modal-art">
        <span className="moon-big" aria-hidden="true" />
        <Butterfly size={34} tone="lilac" className="modal-bfly" />
      </div>
      <h3 className="modal-title">{content.easterEgg.title}</h3>
      <p className="modal-text">{content.easterEgg.message}</p>
    </Modal>
  );
}
