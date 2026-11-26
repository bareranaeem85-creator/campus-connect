import NeonGlyphs from './NeonGlyphs/NeonGlyphs';

// Site palette instead of the component's default pinks/cyans: mostly stone blues + cream, a touch of red.
const PALETTE = ['#639CC5', '#9CC9E8', '#F3EFE7', '#3E7FB0', '#EB2F33'];

/**
 * Full-width animated glyph field behind the home hero.
 * Purely decorative: hidden from screen readers and ignores clicks
 * (the effect listens to the mouse on window, so it still reacts).
 */
export default function HeroBackground() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <NeonGlyphs
        colors={PALETTE}
        cellSize={16}
        depth={12}
        tilt={25}
        turn={0}
        perspective={60}
        sway={0.5}
        density={0.1}
        speed={0.15}
        trails={0.25}
        glow={0.75}
        scramble={0.5}
        fade={0.75}
        aberration={0.5}
        brightness={1.6}
        mouseInteraction
        burstOnClick
      />
      {/* Navy fades keep the headline readable and blend the effect into the page */}
      <div className="hero-bg-fade" />
    </div>
  );
}
