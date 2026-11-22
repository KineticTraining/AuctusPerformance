export const SITE_MEDIA = {
  heroCourt: {
    src: "/images/dusk-silhouette-runner.jpg",
    alt: "Runner silhouetted against an amber and twilight dusk horizon during evening conditioning",
    width: 1280,
    height: 772,
  },
  trainingGym: {
    src: "/images/dusk-track-sunset.jpg",
    alt: "Outdoor athletics track illuminated by warm sunset light at golden hour",
    width: 1280,
    height: 852,
  },
  arenaCta: {
    src: "/images/dusk-track-golden.jpg",
    alt: "Running lanes glowing under burnt orange and twilight sunset skies",
    width: 1280,
    height: 852,
  },
  authCourt: {
    src: "/images/dusk-lone-runner.jpg",
    alt: "Distance athlete training solo along a dusk skyline at sunset",
    width: 1280,
    height: 857,
  },
  coachLab: {
    src: "/images/dusk-sprinter-stride.jpg",
    alt: "Sprinter driving forward mid-stride during outdoor speed coaching at dusk",
    width: 1280,
    height: 960,
  },
  nutritionBowl: {
    src: "/images/nutrition-bowl.jpg",
    alt: "Balanced performance nutrition meal bowl with lean protein, grains, and vegetables",
    width: 1280,
    height: 720,
  },
  nutritionGreens: {
    src: "/images/nutrition-greens.jpg",
    alt: "Fresh leafy greens and nutrient-dense micronutrients prepared for athlete recovery",
    width: 1280,
    height: 853,
  },
} as const;

const VIDEO_IMAGE_BY_YOUTUBE_ID: Record<string, { src: string; alt: string }> = {
  ZaTM37cfiDs: {
    src: "/images/deadlift.jpg",
    alt: "Athlete setting grip and neutral back position over a loaded barbell deadlift",
  },
  my0tLDaWyDU: {
    src: "/images/squat.jpg",
    alt: "Lifter executing a controlled barbell back squat in an indoor strength rack",
  },
  oMXHBcI1wJU: {
    src: "/images/plyometrics.jpg",
    alt: "Explosive strength athlete driving vertically during a gym power session",
  },
  "3-4pKUhkzoQ": {
    src: "/images/hamstrings.jpg",
    alt: "Close-up of posterior chain grip preparation for lower-body strength work",
  },
  H3iPiweaQqQ: {
    src: "/images/sprint-blocks.jpg",
    alt: "Track athlete accelerating cleanly out of instrumented starting blocks",
  },
  "WNaWD-bxFT0": {
    src: "/images/dusk-sprinter-stride.jpg",
    alt: "Sprinter driving at top velocity outdoors during golden hour",
  },
  "9ZTRUVLjGzI": {
    src: "/images/dusk-track-sunset.jpg",
    alt: "Speed blocks aligned on an outdoor sprint track at sunset",
  },
  ZJBprx7oWAM: {
    src: "/images/warmup-mobility.jpg",
    alt: "Athlete performing a dynamic lower-body stretch prior to speed work",
  },
  jj2AAH6jbHk: {
    src: "/images/hip-mobility.jpg",
    alt: "Controlled seated hip and hamstring mobility sequence on a training mat",
  },
  BoGzAZ_vOyA: {
    src: "/images/foam-roll.jpg",
    alt: "Athlete performing lower-body soft-tissue foam rolling between sessions",
  },
  E4O2JeAYg5Q: {
    src: "/images/basketball-skills.jpg",
    alt: "Indoor basketball hoop framed for close-range shooting mechanics practice",
  },
  AQy_c30lNjI: {
    src: "/images/swimming-freestyle.jpg",
    alt: "Swimmer executing a streamlined freestyle stroke in an indoor lap pool",
  },
  IiRGdagtOKE: {
    src: "/images/tennis-serve.jpg",
    alt: "Tennis player extending at trophy position for an overhead serve on court",
  },
  "9v5eo9vIo2Y": {
    src: "/images/soccer-passing.jpg",
    alt: "Soccer midfielder planting and striking a clean inside-foot pass on turf",
  },
  "5Ja5gwko9ro": {
    src: "/images/dusk-lone-runner.jpg",
    alt: "Focused runner holding race pace under a quiet dusk horizon",
  },
  HQwMrK54494: {
    src: "/images/hero-court.jpg",
    alt: "Indoor hardwood basketball court under dramatic overhead training lights",
  },
};

const IMAGE_BY_SPORT: Record<string, string> = {
  Basketball: "/images/basketball-skills.jpg",
  "Track & Field": "/images/dusk-track-sunset.jpg",
  Soccer: "/images/soccer-passing.jpg",
  Tennis: "/images/tennis-serve.jpg",
  Swimming: "/images/swimming-freestyle.jpg",
  Football: "/images/agility-footwork.jpg",
  Strength: "/images/squat.jpg",
  Running: "/images/dusk-silhouette-runner.jpg",
};

const IMAGE_BY_SECTION: Record<string, string> = {
  "Strength & Power": "/images/deadlift.jpg",
  "Speed & Agility": "/images/sprint-blocks.jpg",
  "Mobility & Recovery": "/images/warmup-mobility.jpg",
  "Sport Skills": "/images/basketball-skills.jpg",
  Mindset: "/images/dusk-lone-runner.jpg",
};

export function getVideoThumbnail(input: {
  youtubeId: string;
  sport: string;
  section: string;
  title: string;
  coach: string;
}): { src: string; alt: string } {
  const mapped = VIDEO_IMAGE_BY_YOUTUBE_ID[input.youtubeId];
  if (mapped) {
    return {
      src: mapped.src,
      alt: `${input.title} — ${mapped.alt}`,
    };
  }
  const src =
    IMAGE_BY_SPORT[input.sport] ?? IMAGE_BY_SECTION[input.section] ?? SITE_MEDIA.trainingGym.src;
  return {
    src,
    alt: `${input.title} (${input.sport}) coached by ${input.coach}`,
  };
}
