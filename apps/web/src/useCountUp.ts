import { useEffect, useRef, useState } from "react";

const DURATION_MS = 700;

function prefersMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    typeof window.requestAnimationFrame === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Counts a number up from its previous value to `target` with an ease-out
 * curve. Shows the target at once when the person asked for reduced motion
 * (or the browser cannot animate), so the figure is never wrong for long.
 */
export function useCountUp(target: number): number {
  const [shown, setShown] = useState(() => (prefersMotion() ? 0 : target));
  const from = useRef(shown);

  useEffect(() => {
    if (!prefersMotion()) {
      setShown(target);
      return;
    }
    const start = performance.now();
    const begin = from.current;
    let frame = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      const value = begin + (target - begin) * eased;
      setShown(progress < 1 ? value : target);
      if (progress < 1) frame = requestAnimationFrame(step);
      else from.current = target;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}
