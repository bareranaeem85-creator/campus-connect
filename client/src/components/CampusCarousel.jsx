import CircularCarousel from './CircularCarousel/CircularCarousel';

// Photos live in client/public/media (resized to 900px for fast loading).
const PHOTOS = [
  { src: '/media/teamwork.jpg', alt: 'Students planning a project together around a table', title: 'Teamwork', subtitle: 'Projects' },
  { src: '/media/seminar.jpg', alt: 'An auditorium full of students at a talk', title: 'Seminars', subtitle: 'Talks' },
  { src: '/media/library.jpg', alt: 'A student walking between library shelves', title: 'Library', subtitle: 'Study' },
  { src: '/media/game-day.jpg', alt: 'Students cheering together at a game', title: 'Game day', subtitle: 'Community' },
  { src: '/media/campus-walk.jpg', alt: 'Students walking across campus, seen from above', title: 'Campus', subtitle: 'Everyday' },
];

// The cylinder is designed for ~10 cards, so the 5 photos go around the ring twice.
const RING = [...PHOTOS, ...PHOTOS];

/** 3D rotating photo carousel for the landing page (decorative). */
export default function CampusCarousel() {
  return (
    <div className="campus-carousel">
      <CircularCarousel
        items={RING}
        preset="cylinder"
        intro="rise"
        cardWidth={220}
        aspectRatio={1}
        speed={14}
        fadeColor="#03203d"
        captions
      />
    </div>
  );
}
