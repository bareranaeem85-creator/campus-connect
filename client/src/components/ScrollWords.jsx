import { useEffect, useRef, useState } from 'react';

/**
 * Big statement text whose words "light up" one by one as the section scrolls
 * through the viewport (Eclipse-style). The last `highlightLast` words get the accent colour.
 */
export default function ScrollWords({ text, highlightLast = 0 }) {
  const ref = useRef(null);
  const words = text.split(' ');
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setLit(words.length);
      return undefined;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the block's top reaches 85% of the viewport, 1 when its bottom reaches 45%.
      const progress = (vh * 0.85 - rect.top) / (rect.height + vh * 0.4);
      const next = Math.round(Math.min(1, Math.max(0, progress)) * words.length);
      setLit((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [words.length]);

  return (
    <p className="scroll-words" ref={ref} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`${i < lit ? 'is-lit' : ''} ${i >= words.length - highlightLast ? 'is-accent' : ''}`}
        >
          {w}{' '}
        </span>
      ))}
    </p>
  );
}
