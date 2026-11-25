export const DEFAULT_GYM_FALLBACK = "/images/gym-arena-cta.jpg";

export const SITE_MEDIA = {
  heroCourt: {
    src: "/images/gym-hero-athletics.jpg",
    alt: "Strength athlete mid-barbell pull inside a vibrant dusk-lit performance gym with bumper plates and squat racks",
    width: 1408,
    height: 768,
  },
  trainingGym: {
    src: "/images/gym-power-sleds.jpg",
    alt: "Athlete driving a loaded sprint sled past plyometric boxes and battle ropes under vibrant sunset orange gym lighting",
    width: 1280,
    height: 960,
  },
  arenaCta: {
    src: "/images/gym-arena-cta.jpg",
    alt: "Indoor strength racks, kettlebells, plyometric jump boxes, and sprint turf lanes lit in warm amber and twilight indigo",
    width: 1408,
    height: 768,
  },
  authCourt: {
    src: "/images/gym-kettlebell-strength.jpg",
    alt: "Focused athlete chalking hands beside barbell racks, kettlebells, and wooden plyo boxes in twilight amber gym lighting",
    width: 1280,
    height: 960,
  },
  coachLab: {
    src: "/images/gym-coaching-lab.jpg",
    alt: "Performance coach filming an athlete performing explosive kettlebell box jumps on an indoor gym turf floor",
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
    src: "/images/gym-hero-athletics.jpg",
    alt: "Athlete setting grip and neutral back position over a loaded barbell deadlift",
  },
  my0tLDaWyDU: {
    src: "/images/squat.jpg",
    alt: "Lifter executing a controlled barbell back squat in an indoor strength rack",
  },
  oMXHBcI1wJU: {
    src: "/images/gym-coaching-lab.jpg",
    alt: "Explosive athlete executing weighted box jumps in a performance gym",
  },
  "3-4pKUhkzoQ": {
    src: "/images/hamstrings.jpg",
    alt: "Close-up of posterior chain grip preparation for lower-body strength work",
  },
  H3iPiweaQqQ: {
    src: "/images/gym-power-sleds.jpg",
    alt: "Athlete driving low on loaded turf sprint sleds inside an indoor training facility",
  },
  "WNaWD-bxFT0": {
    src: "/images/plyometrics.jpg",
    alt: "Explosive acceleration and vertical power session in the weight room",
  },
  "9ZTRUVLjGzI": {
    src: "/images/agility-footwork.jpg",
    alt: "Quick lateral deceleration and footwork progression on indoor turf",
  },
  ZJBprx7oWAM: {
    src: "/images/warmup-mobility.jpg",
    alt: "Athlete performing a dynamic lower-body stretch prior to strength work",
  },
  jj2AAH6jbHk: {
    src: "/images/hip-mobility.jpg",
    alt: "Controlled seated hip and hamstring mobility sequence on a training mat",
  },
  BoGzAZ_vOyA: {
    src: "/images/foam-roll.jpg",
    alt: "Athlete performing lower-body soft-tissue foam rolling between sets",
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
    src: "/images/gym-kettlebell-strength.jpg",
    alt: "Focused athlete preparing chalked grip near racks and kettlebells before heavy sets",
  },
  HQwMrK54494: {
    src: "/images/hero-court.jpg",
    alt: "Indoor hardwood basketball court under dramatic overhead training lights",
  },
};

const IMAGE_BY_SPORT: Record<string, string> = {
  Basketball: "/images/basketball-skills.jpg",
  "Track & Field": "/images/gym-power-sleds.jpg",
  Soccer: "/images/soccer-passing.jpg",
  Tennis: "/images/tennis-serve.jpg",
  Swimming: "/images/swimming-freestyle.jpg",
  Football: "/images/agility-footwork.jpg",
  Strength: "/images/gym-kettlebell-strength.jpg",
  Running: "/images/gym-power-sleds.jpg",
};

const IMAGE_BY_SECTION: Record<string, string> = {
  "Strength & Power": "/images/gym-hero-athletics.jpg",
  "Speed & Agility": "/images/gym-power-sleds.jpg",
  "Mobility & Recovery": "/images/warmup-mobility.jpg",
  "Sport Skills": "/images/basketball-skills.jpg",
  Mindset: "/images/gym-kettlebell-strength.jpg",
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
