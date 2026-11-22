import type { Database } from "@/integrations/supabase/types";

type BaseVideoRow = Database["public"]["Tables"]["videos"]["Row"];
type TechniqueRow = Database["public"]["Tables"]["techniques"]["Row"];
type BaseArticleRow = Database["public"]["Tables"]["articles"]["Row"];

export type ArticleSource = {
  label: string;
  url: string;
};

export type VideoSeedRow = BaseVideoRow & {
  age_groups: string[];
  experience_levels: string[];
};

export type ArticleSeedRow = BaseArticleRow & {
  age_groups: string[];
  experience_levels: string[];
  sources: ArticleSource[];
  data_conclusion: string;
};

export {
  SEED_NUTRIENTS,
  SEED_NUTRIENTS as SEED_NUTRITION,
  type NutrientEntry,
  type NutrientEntry as NutritionEntry,
} from "./nutrition-data";

export type NewsletterIssue = {
  id: string;
  issue_number: number;
  title: string;
  published_at: string;
  summary: string;
  highlights: string[];
  coach_note: string;
};

export const SEED_VIDEOS: VideoSeedRow[] = [
  {
    id: "11111111-1111-4111-8111-000000000001",
    youtube_id: "ZaTM37cfiDs",
    title: "Deadlift With Perfect Technique",
    description: "Step-by-step hinge mechanics: setup, bracing, bar path and lockout.",
    section: "Strength & Power",
    sport: "Strength",
    sports: ["Bodybuilding", "Football"],
    coach: "Jeff Nippard",
    duration_label: "12 min",
    level: "Beginner",
    age_groups: ["Young Adult (18–29)", "Adult (30–45)", "Older Adult / Masters (45+)"],
    experience_levels: ["Beginner", "Intermediate"],
    sort_order: 1,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000002",
    youtube_id: "my0tLDaWyDU",
    title: "Squat Correctly, Pain-Free",
    description: "Find your stance, control depth and keep the trunk stacked under load.",
    section: "Strength & Power",
    sport: "Strength",
    sports: ["Bodybuilding", "Basketball", "Soccer", "Football"],
    coach: "Squat University",
    duration_label: "9 min",
    level: "All levels",
    age_groups: [
      "Youth / Teen (Under 18)",
      "Young Adult (18–29)",
      "Adult (30–45)",
      "Older Adult / Masters (45+)",
    ],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sort_order: 2,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000003",
    youtube_id: "oMXHBcI1wJU",
    title: "Top 10 Plyometrics for Athletes",
    description: "Jump, bound and hop progressions that convert strength into explosiveness.",
    section: "Strength & Power",
    sport: "All sports",
    sports: ["Basketball", "Soccer", "Football", "Track & Field"],
    coach: "Garage Strength",
    duration_label: "11 min",
    level: "Intermediate",
    age_groups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    experience_levels: ["Intermediate", "Advanced"],
    sort_order: 3,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000004",
    youtube_id: "3-4pKUhkzoQ",
    title: "Nordic Hamstring Curls",
    description: "The single best exercise for hamstring resilience, regressed for beginners.",
    section: "Strength & Power",
    sport: "All sports",
    sports: ["Soccer", "Football", "Track & Field", "Basketball"],
    coach: "Movement Project PT",
    duration_label: "1 min",
    level: "Beginner",
    age_groups: [
      "Youth / Teen (Under 18)",
      "Young Adult (18–29)",
      "Adult (30–45)",
      "Older Adult / Masters (45+)",
    ],
    experience_levels: ["Beginner", "Intermediate"],
    sort_order: 4,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000005",
    youtube_id: "H3iPiweaQqQ",
    title: "Sprint Drills That Increase Speed",
    description: "Drills that actually transfer to top-end speed and acceleration.",
    section: "Speed & Agility",
    sport: "Track & Field",
    sports: ["Track & Field", "Soccer", "Football"],
    coach: "Lyfestyle Athletics",
    duration_label: "10 min",
    level: "Intermediate",
    age_groups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    experience_levels: ["Intermediate", "Advanced"],
    sort_order: 1,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000006",
    youtube_id: "WNaWD-bxFT0",
    title: "Best vs Worst Sprint Drills",
    description: "What to keep, what to drop, and why mechanics matter more than volume.",
    section: "Speed & Agility",
    sport: "Track & Field",
    sports: ["Track & Field", "Soccer", "Football"],
    coach: "Justjumari",
    duration_label: "8 min",
    level: "All levels",
    age_groups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sort_order: 2,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000007",
    youtube_id: "9ZTRUVLjGzI",
    title: "Agility Ladder: Level 1 Footwork",
    description: "Ten ladder patterns for fast feet, rhythm and change of direction.",
    section: "Speed & Agility",
    sport: "Football",
    sports: ["Football", "Soccer", "Basketball"],
    coach: "I Know Football",
    duration_label: "7 min",
    level: "Beginner",
    age_groups: ["Youth / Teen (Under 18)", "Young Adult (18–29)"],
    experience_levels: ["Beginner"],
    sort_order: 3,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000008",
    youtube_id: "ZJBprx7oWAM",
    title: "Dynamic Warm-up for Athletes",
    description: "A complete pre-session routine to raise temperature and prime movement.",
    section: "Mobility & Recovery",
    sport: "All sports",
    sports: [
      "Basketball",
      "Bodybuilding",
      "Soccer",
      "Football",
      "Tennis",
      "Swimming",
      "Track & Field",
    ],
    coach: "Baylor College of Medicine",
    duration_label: "6 min",
    level: "All levels",
    age_groups: [
      "Youth / Teen (Under 18)",
      "Young Adult (18–29)",
      "Adult (30–45)",
      "Older Adult / Masters (45+)",
    ],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sort_order: 1,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000009",
    youtube_id: "jj2AAH6jbHk",
    title: "12-Minute Hip Mobility",
    description: "Follow-along flow to open the hips for sprinting, squatting and cutting.",
    section: "Mobility & Recovery",
    sport: "All sports",
    sports: [
      "Basketball",
      "Bodybuilding",
      "Soccer",
      "Football",
      "Tennis",
      "Swimming",
      "Track & Field",
    ],
    coach: "Tom Merrick",
    duration_label: "12 min",
    level: "All levels",
    age_groups: ["Young Adult (18–29)", "Adult (30–45)", "Older Adult / Masters (45+)"],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sort_order: 2,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000010",
    youtube_id: "BoGzAZ_vOyA",
    title: "10-Minute Foam Roll Routine",
    description: "Pre or post session soft-tissue work for the lower body.",
    section: "Mobility & Recovery",
    sport: "Running",
    sports: [
      "Basketball",
      "Bodybuilding",
      "Soccer",
      "Football",
      "Tennis",
      "Swimming",
      "Track & Field",
    ],
    coach: "Tom Peto Training",
    duration_label: "10 min",
    level: "All levels",
    age_groups: ["Adult (30–45)", "Older Adult / Masters (45+)"],
    experience_levels: ["Beginner", "Intermediate"],
    sort_order: 3,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000011",
    youtube_id: "E4O2JeAYg5Q",
    title: "The Form Shooting Drill",
    description: "Build a repeatable shot from close range out: elbow, release and follow-through.",
    section: "Sport Skills",
    sport: "Basketball",
    sports: ["Basketball"],
    coach: "CoachUp",
    duration_label: "4 min",
    level: "Beginner",
    age_groups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    experience_levels: ["Beginner", "Intermediate"],
    sort_order: 1,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000012",
    youtube_id: "AQy_c30lNjI",
    title: "How to Swim Freestyle",
    description: "Body position, catch, rotation and breathing for efficient front crawl.",
    section: "Sport Skills",
    sport: "Swimming",
    sports: ["Swimming"],
    coach: "Global Triathlon Network",
    duration_label: "9 min",
    level: "Beginner",
    age_groups: [
      "Youth / Teen (Under 18)",
      "Young Adult (18–29)",
      "Adult (30–45)",
      "Older Adult / Masters (45+)",
    ],
    experience_levels: ["Beginner", "Intermediate"],
    sort_order: 2,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000013",
    youtube_id: "IiRGdagtOKE",
    title: "Tennis Serve Masterclass",
    description: "Grip, toss, trophy position and pronation for a fluid, powerful serve.",
    section: "Sport Skills",
    sport: "Tennis",
    sports: ["Tennis"],
    coach: "Top Tennis Training",
    duration_label: "14 min",
    level: "Advanced",
    age_groups: ["Young Adult (18–29)", "Adult (30–45)", "Older Adult / Masters (45+)"],
    experience_levels: ["Intermediate", "Advanced"],
    sort_order: 3,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000014",
    youtube_id: "9v5eo9vIo2Y",
    title: "Position-Specific Passing for Midfielders",
    description: "Scanning, body shape and first-touch passing patterns.",
    section: "Sport Skills",
    sport: "Soccer",
    sports: ["Soccer"],
    coach: "m777ax",
    duration_label: "3 min",
    level: "Intermediate",
    age_groups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    experience_levels: ["Intermediate", "Advanced"],
    sort_order: 4,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000015",
    youtube_id: "5Ja5gwko9ro",
    title: "Visualization for Peak Performance",
    description: "How elite athletes rehearse skills mentally to perform under pressure.",
    section: "Mindset",
    sport: "All sports",
    sports: [
      "Basketball",
      "Bodybuilding",
      "Soccer",
      "Football",
      "Tennis",
      "Swimming",
      "Track & Field",
    ],
    coach: "Grande Sports",
    duration_label: "6 min",
    level: "All levels",
    age_groups: [
      "Youth / Teen (Under 18)",
      "Young Adult (18–29)",
      "Adult (30–45)",
      "Older Adult / Masters (45+)",
    ],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sort_order: 1,
    created_at: "2026-10-01T12:00:00Z",
  },
  {
    id: "11111111-1111-4111-8111-000000000016",
    youtube_id: "HQwMrK54494",
    title: "Kobe on Visualization",
    description: "Kobe Bryant breaks down how he prepared his mind before games.",
    section: "Mindset",
    sport: "Basketball",
    sports: ["Basketball"],
    coach: "BasketballTutor",
    duration_label: "3 min",
    level: "All levels",
    age_groups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sort_order: 2,
    created_at: "2026-10-01T12:00:00Z",
  },
];

export const SEED_TECHNIQUES: TechniqueRow[] = [
  {
    id: "22222222-2222-4222-8222-000000000001",
    sport: "Track & Field",
    name: "Sprint acceleration",
    summary: "First 10–20 m: projecting the body forward with powerful, piston-like leg action.",
    key_cues: [
      "45° forward body lean from ankles, not waist",
      "Straight line from head through hip to drive ankle",
      "Powerful triple extension on each push",
      "Shin angle matches torso angle on ground contact",
      "Aggressive arm drive, hands cheek-to-hip",
      "Gradual rise to upright over 20–30 m",
    ],
    common_faults: [
      "Popping upright in first 3 steps",
      "Bending at the waist instead of leaning",
      "Overstriding with foot landing ahead of hips",
      "Short, choppy arm swing",
      "Heel striking",
    ],
    drills: [
      "Wall drives (A-march into switches)",
      "Resisted sled sprints 10–20 m",
      "Falling starts",
      "Half-kneeling starts",
    ],
  },
  {
    id: "22222222-2222-4222-8222-000000000002",
    sport: "Track & Field",
    name: "Max-velocity sprinting",
    summary: "Upright running at top speed: front-side mechanics and stiff, short ground contacts.",
    key_cues: [
      "Tall posture, slight forward lean",
      "Knee drives to hip height (front-side mechanics)",
      "Foot strikes under the hip, mid/forefoot",
      "Dorsiflexed ankle before contact",
      "Relaxed face and shoulders",
      "Arms swing 90° at elbow, front to back",
    ],
    common_faults: [
      "Excessive back-side kick (heel to butt, slow recovery)",
      "Sitting back / anterior pelvic collapse",
      "Arms crossing midline",
      "Tension in jaw and shoulders",
      "Reaching with the foot",
    ],
    drills: ["A-skips and B-skips", "Straight-leg bounds", "Flying 20s", "Wicket runs"],
  },
  {
    id: "22222222-2222-4222-8222-000000000003",
    sport: "Basketball",
    name: "Jump shot",
    summary: "Repeatable shooting motion from feet through release.",
    key_cues: [
      "Feet shoulder width, toes to rim",
      "Ball on fingerpads, elbow under ball",
      "Shooting pocket at waist, one-motion lift",
      "Release at top of jump",
      "Snap wrist, fingers to rim (goose neck)",
      "Balanced landing on the takeoff spot",
    ],
    common_faults: [
      "Elbow flaring out",
      "Thumbing with guide hand",
      "Flat arc",
      "Drifting forward or sideways on landing",
      "Shooting on the way down",
    ],
    drills: [
      "Form shooting close to rim",
      "One-hand shooting",
      "Catch-and-shoot off two-foot hop",
      "Free-throw routine",
    ],
  },
  {
    id: "22222222-2222-4222-8222-000000000004",
    sport: "Basketball",
    name: "Defensive slide",
    summary: "Lateral movement to stay in front of a ball handler.",
    key_cues: [
      "Wide stance, hips low, chest up",
      "Weight on balls of feet",
      "Lead with the foot in direction of travel",
      "Push off trail leg, never cross feet",
      "Active hands, eyes on the hips of the attacker",
    ],
    common_faults: [
      "Standing up tall",
      "Crossing feet",
      "Reaching and lunging for the ball",
      "Hopping instead of pushing",
    ],
    drills: ["Zig-zag slides", "Mirror drill", "Band lateral walks"],
  },
  {
    id: "22222222-2222-4222-8222-000000000005",
    sport: "Soccer",
    name: "Instep drive (shooting)",
    summary: "Striking with the laces for power and accuracy.",
    key_cues: [
      "Approach at slight angle",
      "Plant foot beside ball, toes to target",
      "Eyes on the ball at contact",
      "Ankle locked, toes pointed down",
      "Strike through the middle/top of the ball",
      "Land on the striking foot",
    ],
    common_faults: [
      "Leaning back (ball skies)",
      "Plant foot too far from ball",
      "Floppy ankle",
      "Toe-poking",
      "Stopping follow-through",
    ],
    drills: [
      "Wall strikes with laces",
      "Shooting from passes on the move",
      "Weak-foot volume work",
    ],
  },
  {
    id: "22222222-2222-4222-8222-000000000006",
    sport: "Soccer",
    name: "Short passing (inside foot)",
    summary: "Accurate, weighted passing with the inside of the foot.",
    key_cues: [
      "Scan before receiving",
      "Open body shape on receiving",
      "Plant foot pointing to target",
      "Ankle locked, foot at 90°",
      "Strike through the ball center",
      "Follow through toward target",
    ],
    common_faults: [
      "Heavy first touch",
      "Closed body shape",
      "Passing with toe",
      "Weight of pass too soft or hard",
    ],
    drills: ["Rondos", "Two-touch passing gates", "Wall passing combinations"],
  },
  {
    id: "22222222-2222-4222-8222-000000000007",
    sport: "Tennis",
    name: "Serve",
    summary: "Kinetic chain from legs through racket to produce speed and spin.",
    key_cues: [
      "Continental grip",
      "Consistent toss slightly in front and to the right (right-hander)",
      "Trophy position with knees bent",
      "Leg drive up into the ball",
      "Racket drop behind back",
      "Contact at full extension with pronation",
    ],
    common_faults: [
      "Inconsistent toss",
      "Eastern forehand grip (pancake serve)",
      "No leg drive",
      "Arm-only swing",
      "Contact too low",
    ],
    drills: [
      "Toss-and-catch drill",
      "Kneeling serves",
      "Throwing a ball overhand",
      "Shadow serves with pause at trophy",
    ],
  },
  {
    id: "22222222-2222-4222-8222-000000000008",
    sport: "Tennis",
    name: "Forehand groundstroke",
    summary: "Modern topspin forehand built from rotation.",
    key_cues: [
      "Early unit turn",
      "Semi-western grip",
      "Racket drop below ball",
      "Contact out in front",
      "Rotate hips then shoulders",
      "Windshield-wiper finish over shoulder",
    ],
    common_faults: [
      "Late preparation",
      "Arming the ball",
      "Contact beside or behind body",
      "Abbreviated follow-through",
    ],
    drills: [
      "Drop-feed forehands",
      "Cross-court rally targets",
      "Shadow swings with medicine ball rotation",
    ],
  },
  {
    id: "22222222-2222-4222-8222-000000000009",
    sport: "Swimming",
    name: "Freestyle stroke",
    summary: "Efficient front crawl with long body line and strong catch.",
    key_cues: [
      "Head neutral, eyes down",
      "Hips high near surface",
      "Hand entry in line with shoulder",
      "High-elbow catch",
      "Body rotation 30–45° each side",
      "Exhale continuously underwater",
      "Steady flutter kick from hips",
    ],
    common_faults: [
      "Lifting head to breathe",
      "Crossing over the midline on entry",
      "Dropped elbow on catch",
      "Sinking hips and legs",
      "Kicking from the knees",
    ],
    drills: ["Catch-up drill", "Single-arm freestyle", "Side kick with rotation", "Fingertip drag"],
  },
  {
    id: "22222222-2222-4222-8222-000000000010",
    sport: "Strength",
    name: "Back squat",
    summary: "Loaded squat to depth with neutral spine.",
    key_cues: [
      "Brace before descent (360° breath)",
      "Bar over mid-foot throughout",
      "Knees track over toes",
      "Hips and knees break together",
      "Depth: hip crease at or below knee",
      "Drive up chest and hips together",
    ],
    common_faults: [
      "Knee valgus (caving in)",
      "Heels lifting",
      "Butt wink at bottom",
      "Good-morning out of the hole",
      "Losing brace",
    ],
    drills: ["Goblet squat", "Tempo squats 3-1-1", "Pause squats", "Box squats"],
  },
  {
    id: "22222222-2222-4222-8222-000000000011",
    sport: "Strength",
    name: "Deadlift",
    summary: "Hip hinge lifting the bar from floor to lockout.",
    key_cues: [
      "Bar over mid-foot, shins near bar",
      "Lats engaged (protect armpits)",
      "Neutral spine, chest proud",
      "Push the floor away",
      "Bar stays in contact with legs",
      "Lockout with glutes, not lower back",
    ],
    common_faults: [
      "Rounding the lower back",
      "Hips shooting up first",
      "Bar drifting forward",
      "Jerking the bar off floor",
      "Hyperextending at lockout",
    ],
    drills: ["Romanian deadlift", "Block pulls", "Kettlebell hinge", "Paused deadlift below knee"],
  },
  {
    id: "22222222-2222-4222-8222-000000000012",
    sport: "All sports",
    name: "Countermovement jump",
    summary: "Vertical jump using a rapid dip and triple extension.",
    key_cues: [
      "Fast, shallow countermovement",
      "Arms swing back then drive up",
      "Full triple extension (hips, knees, ankles)",
      "Knees aligned over toes",
      "Soft, quiet landing in athletic stance",
    ],
    common_faults: [
      "Too deep or slow dip",
      "Knee valgus on takeoff or landing",
      "No arm swing",
      "Stiff, loud landing",
    ],
    drills: ["Box jumps", "Pogo hops", "Depth drops", "Broad jumps"],
  },
];

export const SEED_ARTICLES: ArticleSeedRow[] = [
  {
    id: "33333333-3333-4333-8333-000000000001",
    slug: "sleep-the-performance-drug",
    title: "Sleep: The Legal Performance Drug",
    excerpt:
      "Extending sleep improved sprint times and shooting accuracy by 9% in collegiate athletes. Here is what the circadian data says and how to operationalize it.",
    body: `Few interventions in sport science produce effects as large — or as repeatable — as sleep extension. In the landmark Stanford Sleep Extension trial led by Cheri Mah, collegiate basketball players who expanded time in bed to 10 hours over 5–7 weeks cut 282-foot sprint times by 0.7 seconds and improved free-throw and three-point shooting accuracy by nine percent.

## Why sleep matters for neuromuscular output

Slow-wave (deep) sleep anchors pituitary growth hormone pulsatility and tendon collagen remodeling, while REM sleep consolidates complex motor sequences rehearsed earlier that afternoon. When total sleep falls below 7 hours for three consecutive nights, glycogen resynthesis slows and reaction-time variability spikes during late-game fatigue.

## Evening light, dusk training, and temperature drop

Core body temperature reaches its daily peak in late afternoon and early evening — explaining why explosive jump height and sprint velocity often peak between 16:00 and 19:00. Protecting the post-training down-regulation window with dim lighting and an 18 °C bedroom preserves slow-wave sleep latency even after evening competition.

## Practical guidelines

- Protect an 8.5–9.5 hour sleep opportunity during high-density training weeks.
- Anchor your wake time within a 30-minute window all seven days.
- Keep bedroom ambient temperature between 17–19 °C and cut caffeine 8 hours prior to bedtime.
- Deploy a 20–25 minute early-afternoon nap before 15:00 after morning lift sessions or travel.`,
    category: "Recovery",
    author: "Dr. Maya Okafor",
    author_role: "Lead Sports Physiologist",
    read_minutes: 6,
    featured: true,
    published_at: "2026-11-12",
    sports: [
      "Basketball",
      "Bodybuilding",
      "Soccer",
      "Football",
      "Tennis",
      "Swimming",
      "Track & Field",
    ],
    age_groups: [
      "Youth / Teen (Under 18)",
      "Young Adult (18–29)",
      "Adult (30–45)",
      "Older Adult / Masters (45+)",
    ],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sources: [
      {
        label: "Mah et al., Sleep (2011) — Collegiate Basketball Sleep Extension",
        url: "https://pubmed.ncbi.nlm.nih.gov/21731144/",
      },
      {
        label: "Walsh et al., BJSM (2021) — Sleep and Athlete Consensus Statement",
        url: "https://pubmed.ncbi.nlm.nih.gov/33144349/",
      },
    ],
    data_conclusion:
      "Consistent 9-hour sleep opportunities produce larger shot-accuracy (+9%) and sprint-latency gains than any legal ergogenic supplement. Audit bedtime consistency before adding high-CNS plyometric volume.",
  },
  {
    id: "33333333-3333-4333-8333-000000000002",
    slug: "rate-of-force-development",
    title: "Rate of Force Development: Why Speed of Strength Wins",
    excerpt:
      "Maximum strength matters, but decisive sport contacts occur under 200 ms. Learn how force-plate telemetry shapes velocity-based training.",
    body: `Most decisive actions in sport — a sprint touchdown (~90–110 ms), a countermovement block (~180 ms), or a cut off the outside foot (~210 ms) — unfold faster than maximal voluntary force can reach its ceiling. Peak force takes roughly 300–400 milliseconds; competition rewards how steeply force rises in the first 100 milliseconds.

## What RFD measures on the force plate

Rate of force development (RFD) captures the initial slope of the force–time curve. Early-phase RFD (0–100 ms) is driven by motor-unit discharge rate and doublets, whereas late-phase RFD (100–250 ms) reflects maximal strength capacity and musculo-tendinous stiffness.

## How to program it across training ages

- Establish clean hinge and squat mechanics alongside a baseline relative strength ratio (1.5x–1.75x bodyweight back squat for field athletes).
- Pair heavy strength sets (3–5 reps at high intent) with unloaded ballistic contrast exercises like hurdle hops or medicine-ball chest passes.
- Cap plyometric ground contacts at 30–50 crisp touches per session early in a block; stop sets immediately if contact sound turns dull or slow.
- Rest 2.5–3 minutes between power clusters so neural velocity never degrades into aerobic fatigue.`,
    category: "Strength & Power",
    author: "Coach Daniel Reyes",
    author_role: "Strength & Conditioning Coach",
    read_minutes: 7,
    featured: false,
    published_at: "2026-11-04",
    sports: ["Bodybuilding", "Basketball", "Soccer", "Football", "Track & Field"],
    age_groups: ["Young Adult (18–29)", "Adult (30–45)"],
    experience_levels: ["Intermediate", "Advanced"],
    sources: [
      {
        label: "Maffiuletti et al., Eur J Appl Physiol (2016) — RFD Assessment",
        url: "https://pubmed.ncbi.nlm.nih.gov/26941023/",
      },
      {
        label: "Suchomel et al., Sports Med (2018) — Strength Characteristics in Athletes",
        url: "https://pubmed.ncbi.nlm.nih.gov/29368183/",
      },
    ],
    data_conclusion:
      "Force-plate benchmarks confirm that heavy squats paired with low-rep ballistic intent lift 0–150 ms impulse twice as effectively as moderate-load hypertrophy fatigue sets. Prioritize fresh speed before conditioning.",
  },
  {
    id: "33333333-3333-4333-8333-000000000003",
    slug: "hamstring-injury-prevention",
    title: "The Nordic Curl and Hamstring Injury Prevention",
    excerpt:
      "Eccentric biceps femoris loading cuts non-contact hamstring strain rates roughly in half while lengthening muscle fascicles.",
    body: `Acute hamstring strains remain the single largest time-loss injury across sprint-dependent field and court sports. Nearly 80% of those strains occur during the late swing phase of high-speed running when the biceps femoris rapidly lengthens under extreme deceleration torque.

## What randomized trials show

Across pooled FIFA 11+ and Nordic Hamstring Exercise (NHE) trials involving more than 8,000 athletes, adding progressive eccentric knee-flexion work reduced overall hamstring incidence by approximately 51% — with compliance over 70% pushing risk reduction even higher.

## Minimalist weekly dosing

- Weeks 1–2: 2 sets of 4–5 slow 4-second lowers once per week (use band assistance if needed).
- Weeks 3–4: 2 sets of 6 reps twice weekly after speed or field sessions.
- Weeks 5–8: 3 sets of 6–8 reps twice weekly; control descent past 45 degrees before catching.
- In-season maintenance: 1 set of 5–6 reps once weekly avoids soreness while retaining fascicle length gains.

## Pair eccentric work with real sprint exposure

Nordic curls alone do not replicate top-end hip-extension angular velocity. One short dose of 2–3 flying 20-meter sprints at 90–95% velocity each week acts as the primary vaccine for sprint tissue.`,
    category: "Injury Prevention",
    author: "Dr. Maya Okafor",
    author_role: "Lead Sports Physiologist",
    read_minutes: 5,
    featured: false,
    published_at: "2026-10-27",
    sports: ["Soccer", "Football", "Track & Field", "Basketball"],
    age_groups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    experience_levels: ["Beginner", "Intermediate"],
    sources: [
      {
        label: "van Dyk et al., BJSM (2019) — Nordic Exercise Meta-Analysis",
        url: "https://pubmed.ncbi.nlm.nih.gov/30808663/",
      },
      {
        label: "Timmins et al., MSSE (2016) — Biceps Femoris Fascicle Length",
        url: "https://pubmed.ncbi.nlm.nih.gov/26540261/",
      },
    ],
    data_conclusion:
      "Two low-volume eccentric sets per week (10–16 total reps) maintain protective fascicle length without inducing mid-week soreness, cutting non-contact sprint hamstring tears by half.",
  },
  {
    id: "33333333-3333-4333-8333-000000000004",
    slug: "fueling-for-training",
    title: "Fueling the Session: Carbohydrate Timing & Electrolyte Math",
    excerpt:
      "Carbohydrate availability governs late-quarter decision speed and repeated-sprint output. Here is how to scale grams per kilogram by session demand.",
    body: `Glycogen depletion does not just slow peak watts — it degrades cognitive accuracy, shot selection, and reactive deceleration long before athletes feel total muscular exhaustion. Periodizing carbohydrate around training intensity delivers sustained intensity without unnecessary GI distress.

## Pre-session fueling window (2–4 hours out)

Target 1–3 g/kg of easily digested carbohydrate paired with 0.3 g/kg lean protein before heavy field or court blocks. Inside 45 minutes prior to start, shift to simple liquid or fruit sources (25–40 g carb, minimal fat or fiber).

## Intra-session intake for 75+ minute blocks

When sessions exceed 75 minutes or involve tournament doubleheaders, delivering 30–60 g/hour via isotonic drink or chews preserves blood glucose and reduces central perceived exertion.

## Post-training recovery & evening glycogen replenishment

- Pair 0.35 g/kg high-leucine protein with 1.0 g/kg carbohydrate within 90 minutes when training twice in 24 hours.
- Replace 125–150% of fluid sweat loss alongside 700–1,000 mg sodium per liter for heavy sweaters.
- Masters and 30–45 athletes benefit from prioritizing 35–40 g protein per feeding to overcome anabolic resistance.`,
    category: "Nutrition",
    author: "Priya Shah, RD",
    author_role: "Performance Dietitian",
    read_minutes: 6,
    featured: false,
    published_at: "2026-10-19",
    sports: [
      "Basketball",
      "Bodybuilding",
      "Soccer",
      "Football",
      "Tennis",
      "Swimming",
      "Track & Field",
    ],
    age_groups: [
      "Youth / Teen (Under 18)",
      "Young Adult (18–29)",
      "Adult (30–45)",
      "Older Adult / Masters (45+)",
    ],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sources: [
      {
        label: "Thomas et al., MSSE / ACSM (2016) — Nutrition & Athletic Performance",
        url: "https://pubmed.ncbi.nlm.nih.gov/26891166/",
      },
      {
        label: "Kerksick et al., JISSN (2017) — Nutrient Timing Position Stand",
        url: "https://pubmed.ncbi.nlm.nih.gov/28919842/",
      },
    ],
    data_conclusion:
      "Matching daily carbohydrate intake to session intensity (3 g/kg on mobility days vs 6–7 g/kg on tournament days) eliminates fourth-quarter cognitive fade while supporting lean body composition.",
  },
  {
    id: "33333333-3333-4333-8333-000000000005",
    slug: "mental-rehearsal",
    title: "Mental Rehearsal: Training the Brain to Perform Under Fatigue",
    excerpt:
      "Structured PETTLEP imagery recruits pre-motor cortical networks even between physical reps — sharpening execution when heart rate climbs.",
    body: `Elite sprinters, tennis servers, and clutch free-throw shooters share one invisible habit: crisp pre-execution motor rehearsal. Functional MRI studies demonstrate that vivid first-person imagery excites overlapping premotor and cerebellar circuits used during live execution.

## Applying the PETTLEP framework

Holmes & Collins modeled seven variables that separate day-dreaming from athletic transfer: Physical posture, Environment cues, Task accuracy, Timing in real-time, Learning updates, Emotion regulation, and First-person Perspective.

## Building a 5-minute evening protocol

- Rehearse wearing your training shoes or holding your racket/ball when possible to anchor sensory feedback.
- Run every sequence at real competitive tempo — never slow-motion unless diagnosing a single joint fault.
- Script your breathing reset after a missed shot or false start so recovery takes 3 seconds instead of 3 possessions.`,
    category: "Psychology",
    author: "Dr. Lena Brooks",
    author_role: "Sport Psychologist",
    read_minutes: 5,
    featured: false,
    published_at: "2026-10-08",
    sports: [
      "Basketball",
      "Bodybuilding",
      "Soccer",
      "Football",
      "Tennis",
      "Swimming",
      "Track & Field",
    ],
    age_groups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sources: [
      {
        label: "Holmes & Collins, J Appl Sport Psychol (2001) — PETTLEP Imagery Model",
        url: "https://pubmed.ncbi.nlm.nih.gov/11757229/",
      },
    ],
    data_conclusion:
      "Combining 5 minutes of real-time first-person PETTLEP rehearsal immediately after film study improves skill retention across week-long gaps without adding joint impact stress.",
  },
  {
    id: "33333333-3333-4333-8333-000000000006",
    slug: "training-load-acwr",
    title: "Managing Training Load & Tendon Capacity for Masters & Multi-Sport Athletes",
    excerpt:
      "Acute-to-chronic workload spikes precede soft-tissue setbacks. Learn how session-RPE keeps weekly progression sustainable past age 30 and 45.",
    body: `Most overuse tendonitis flares — Achilles, patellar, and rotator cuff — trace back to sudden week-to-week spikes in high-speed distance or jumping volume rather than absolute fitness level. Adult and Masters athletes retain massive strength and speed potential when connective tissue receives 48 hours of remodeling between high-strain exposures.

## Calculating Session-RPE cleanly

Multiply session duration in minutes by your subjective 1–10 difficulty rating (RPE). A focused 45-minute speed and strength block at RPE 7 logs 315 load units. Keeping weekly load increases within 10–15% over your 4-week rolling baseline protects tendons while building aerobic and anaerobic ceiling.

## High-low spacing across the week

- Alternate high-CNS speed/strength days (Monday, Wednesday, Friday) with low-impact mobility, zone-2 cycling, or pool flush sessions on Tuesday and Thursday.
- Schedule a planned 30% volume deload every fourth week — especially for Athletes 30–45 and Masters 45+.
- Pair load logs with morning vertical jump or resting grip/HRV check-ins to catch systemic fatigue early.`,
    category: "Training Science",
    author: "Coach Daniel Reyes",
    author_role: "Strength & Conditioning Coach",
    read_minutes: 6,
    featured: false,
    published_at: "2026-09-24",
    sports: [
      "Basketball",
      "Bodybuilding",
      "Soccer",
      "Football",
      "Tennis",
      "Swimming",
      "Track & Field",
    ],
    age_groups: ["Adult (30–45)", "Older Adult / Masters (45+)"],
    experience_levels: ["Beginner", "Intermediate", "Advanced"],
    sources: [
      {
        label: "Gabbett, BJSM (2016) — The Training-Injury Prevention Paradox",
        url: "https://pubmed.ncbi.nlm.nih.gov/26758673/",
      },
    ],
    data_conclusion:
      "Capping week-over-week sRPE load jumps at <=12% and spacing high-output sprint sessions by 48 hours reduces overuse flare-ups and supports consistent seasonal availability for Adult and Masters competitors.",
  },
];

export const SEED_NEWSLETTERS: NewsletterIssue[] = [
  {
    id: "nl-014",
    issue_number: 14,
    title: "Dusk Dispatch #14: Protecting Sprint Elasticity During Busy Schedules",
    published_at: "2026-11-15",
    summary:
      "How two 25-minute micro-doses of flying 20s and Nordic eccentrics preserve peak top-end velocity without draining legs before competition.",
    highlights: [
      "Micro-dosing 2x20m flying sprints at 92% preserves fascicle compliance mid-season.",
      "Pair pre-session 35 g simple carb with 300 mg sodium for sharp 6 PM practices.",
      "Athletes hitting 8.5+ hours sleep logged 11% lower session-RPE at identical external loads.",
    ],
    coach_note:
      "Across 140 Dusk Kinetic autumn video reviews, 68% of athletes showing late-game stride drop also skipped post-practice carbohydrate timing. Fuel recovery before adding extra conditioning.",
  },
  {
    id: "nl-013",
    issue_number: 13,
    title: "Dusk Dispatch #13: Force-Plate vs Film Cues for Jumpers & Shooters",
    published_at: "2026-11-01",
    summary:
      "Bridging lab vertical impulse numbers with simple side-angle smartphone camera checks anyone can film on a court.",
    highlights: [
      "Quick countermovement depth under 95° knee flexion transfers better to defensive closes than deep slow dips.",
      "Keep shooting elbow stacked under the ball prior to hip upward extension.",
      "Two-foot jump stops reduce knee valgus torque compared to hurried off-balance drifts.",
    ],
    coach_note:
      "Filming 5 reps at the end of a practice fatigue block tells a truer story than filming warm-up shots. Submit fatigued reps in your weekly video review.",
  },
  {
    id: "nl-012",
    issue_number: 12,
    title: "Dusk Dispatch #12: Fueling the 8-Week Performance Cohort",
    published_at: "2026-10-18",
    summary:
      "Lessons from Cohort 4: why matching high-carb days exclusively to high-output training blocks drove body composition and speed gains simultaneously.",
    highlights: [
      "Cohort athletes averaged +1.8 in vertical jump and -0.14s in 20m split across 8 weeks.",
      "Protein distribution at breakfast was the single easiest nutritional lever athletes fixed.",
      "Electrolyte pre-loading cut late-practice calf cramping reports by 80%.",
    ],
    coach_note:
      "Consistency beats extreme dieting every time. Start with our Free Nutrition Library checklist, then step into the 6–8 Week Health & Performance Program when you want weekly accountability.",
  },
];
