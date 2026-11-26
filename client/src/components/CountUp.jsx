import { useEffect, useRef, useState } from 'react';

/** Animates a number from 0 to `value` once it scrolls into view. */
export default function CountUp({ value, duration = 1200 }) {
  const [shown, setShown] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (value == null) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(value);
      return undefined;
    }
    let raf;
    const run = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3)))); // ease-out cubic
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        run();
        io.disconnect();
      }
    });
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return <span ref={ref}>{value == null ? '—' : shown}</span>;
}
