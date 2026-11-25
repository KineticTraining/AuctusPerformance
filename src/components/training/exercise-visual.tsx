import { useId } from "react";

import { AthleticImage } from "@/components/site/athletic-image";
import type { ExerciseCategory } from "@/lib/training";

interface FormDiagramSpec {
  patternLabel: string;
  cue: string;
  /** Reference apparatus, floor, bench, or bar line */
  referencePath: string;
  /** Start posture figure (dashed skeleton) */
  startPath: string;
  startJoints: Array<[number, number]>;
  /** Finish / peak posture figure (solid articulated skeleton) */
  finishPath: string;
  finishHead: [number, number];
  finishJoints: Array<[number, number]>;
  /** Movement trajectory or alignment guide path */
  trajectoryPath: string;
  /** Target muscle highlight coordinates [cx, cy, rx, ry] */
  muscleFocus: [number, number, number, number];
  muscleLabel: string;
}

const DIAGRAM_SPECS: Record<ExerciseCategory, FormDiagramSpec> = {
  "Lower Body: Squat & Knee-Dominant": {
    patternLabel: "Knee-Dominant",
    cue: "Hips sit between heels; knees track toes under vertical bar axis.",
    referencePath: "M24 134 H216 M122 20 V134",
    startPath: "M108 32 L108 72 L114 102 L112 132",
    startJoints: [
      [108, 72],
      [114, 102],
    ],
    finishPath: "M116 56 L104 94 L144 96 L128 132 M100 62 H132",
    finishHead: [122, 42],
    finishJoints: [
      [116, 56],
      [104, 94],
      [144, 96],
      [128, 132],
    ],
    trajectoryPath: "M122 48 V92",
    muscleFocus: [122, 95, 20, 12],
    muscleLabel: "Quads & Glutes",
  },
  "Lower Body: Hinge & Posterior Chain": {
    patternLabel: "Hip Hinge",
    cue: "Push hips horizontally back with flat spine and shins nearly vertical.",
    referencePath: "M24 134 H216 M140 24 V134",
    startPath: "M132 30 L132 74 L134 104 L134 132",
    startJoints: [
      [132, 74],
      [134, 104],
    ],
    finishPath: "M156 58 L100 76 L124 104 L126 132 M156 58 L142 104",
    finishHead: [170, 50],
    finishJoints: [
      [156, 58],
      [100, 76],
      [124, 104],
      [142, 104],
    ],
    trajectoryPath: "M130 74 H96 M142 106 V68",
    muscleFocus: [108, 90, 18, 16],
    muscleLabel: "Glutes & Hamstrings",
  },
  "Upper Body: Horizontal Push": {
    patternLabel: "Horizontal Push",
    cue: "Anchor shoulder blades to bench; tuck elbows ~45 degrees to lower chest.",
    referencePath: "M34 114 H206 M70 114 V136 M170 114 V136",
    startPath: "M82 102 L114 102 L124 88 L112 72",
    startJoints: [
      [114, 102],
      [124, 88],
      [112, 72],
    ],
    finishPath: "M74 104 L126 104 L162 104 L172 132 M116 104 L116 40 M96 40 H136",
    finishHead: [60, 100],
    finishJoints: [
      [116, 104],
      [116, 72],
      [116, 40],
    ],
    trajectoryPath: "M116 74 V42",
    muscleFocus: [116, 94, 18, 12],
    muscleLabel: "Pecs & Triceps",
  },
  "Upper Body: Vertical Push": {
    patternLabel: "Vertical Push",
    cue: "Ribs stacked over hips; press weight straight over mid-foot and crown.",
    referencePath: "M24 134 H216 M120 18 V134",
    startPath: "M120 68 L98 76 L108 58",
    startJoints: [
      [98, 76],
      [108, 58],
    ],
    finishPath: "M120 48 V92 L114 132 M120 92 L126 132 M120 52 L114 22 M100 22 H140",
    finishHead: [120, 36],
    finishJoints: [
      [120, 52],
      [120, 92],
      [114, 22],
    ],
    trajectoryPath: "M108 56 L116 24",
    muscleFocus: [120, 52, 18, 11],
    muscleLabel: "Delts & Triceps",
  },
  "Upper Body: Vertical Pull": {
    patternLabel: "Vertical Pull",
    cue: "Depress shoulder blades first, then drive elbows smoothly down to ribs.",
    referencePath: "M48 24 H192",
    startPath: "M96 24 L112 66 L112 104 L112 132 M144 24 L128 66",
    startJoints: [
      [96, 24],
      [144, 24],
      [112, 66],
    ],
    finishPath: "M94 24 L88 48 L108 52 H132 L152 48 L146 24 M120 52 V96 L116 128 M120 96 L124 128",
    finishHead: [120, 36],
    finishJoints: [
      [88, 48],
      [108, 52],
      [132, 52],
      [152, 48],
    ],
    trajectoryPath: "M120 82 V50",
    muscleFocus: [120, 62, 22, 13],
    muscleLabel: "Lats & Upper Back",
  },
  "Upper Body: Horizontal Pull": {
    patternLabel: "Horizontal Pull",
    cue: "Brace torso angled clean; sweep elbows toward hips without torso heave.",
    referencePath: "M24 134 H216 M64 102 H176",
    startPath: "M154 62 L154 106",
    startJoints: [[154, 106]],
    finishPath: "M154 58 L98 76 L116 106 L114 132 M98 76 L132 104 L132 132 M152 62 L134 78 L116 66",
    finishHead: [168, 48],
    finishJoints: [
      [152, 62],
      [134, 78],
      [116, 66],
      [98, 76],
    ],
    trajectoryPath: "M152 104 L134 78",
    muscleFocus: [132, 64, 20, 12],
    muscleLabel: "Rhomboids & Lats",
  },
  "Isolation: Arms (Biceps, Triceps, Forearms)": {
    patternLabel: "Arm Hinge",
    cue: "Pin upper arm steady at side; move strictly through clean elbow arc.",
    referencePath: "M42 134 H198 M112 42 V134",
    startPath: "M112 78 L116 112",
    startJoints: [
      [112, 78],
      [116, 112],
    ],
    finishPath: "M112 48 V94 L108 132 M112 94 L118 132 M112 52 L112 80 L148 56",
    finishHead: [112, 34],
    finishJoints: [
      [112, 52],
      [112, 80],
      [148, 56],
    ],
    trajectoryPath: "M120 110 C142 102, 152 82, 148 60",
    muscleFocus: [122, 72, 14, 15],
    muscleLabel: "Biceps / Triceps",
  },
  "Core & Rotational Stability": {
    patternLabel: "Anti-Rotation",
    cue: "Stack ribcage over pelvis; resist trunk twist or low-back sag throughout.",
    referencePath: "M24 118 H216 M48 84 H192",
    startPath: "M58 84 H168",
    startJoints: [[112, 84]],
    finishPath: "M64 118 L64 82 L120 82 L176 86 L186 118 M64 82 L82 118",
    finishHead: [52, 74],
    finishJoints: [
      [64, 82],
      [120, 82],
      [176, 86],
      [64, 118],
    ],
    trajectoryPath: "M120 58 C134 62, 134 102, 120 106",
    muscleFocus: [120, 82, 24, 11],
    muscleLabel: "Core & Obliques",
  },
  "Olympic Weightlifting & Power": {
    patternLabel: "Triple Extension",
    cue: "Keep bar close past knees, then drive hips, knees, and ankles vertically.",
    referencePath: "M24 134 H216 M124 18 V134",
    startPath: "M142 74 L98 92 L118 110 L114 132 M142 74 L132 108",
    startJoints: [
      [142, 74],
      [98, 92],
      [132, 108],
    ],
    finishPath: "M122 38 L120 82 L122 110 L126 132 M122 44 L104 28 M122 44 L140 28 M96 24 H148",
    finishHead: [122, 26],
    finishJoints: [
      [122, 44],
      [120, 82],
      [122, 110],
    ],
    trajectoryPath: "M130 108 C134 84, 120 68, 124 28",
    muscleFocus: [120, 80, 18, 22],
    muscleLabel: "Hips, Quads & Traps",
  },
  "Plyometrics (Upper & Lower)": {
    patternLabel: "Elastic Rebound",
    cue: "Rebound off stiff forefoot with quick ground contact and quiet soft catch.",
    referencePath: "M24 134 H150 M150 134 V92 H214 V134",
    startPath: "M64 78 L52 104 L74 114 L68 132",
    startJoints: [
      [52, 104],
      [74, 114],
    ],
    finishPath: "M180 42 L166 72 L188 76 L180 92 M180 48 L196 36",
    finishHead: [182, 28],
    finishJoints: [
      [180, 48],
      [166, 72],
      [188, 76],
      [180, 92],
    ],
    trajectoryPath: "M72 78 C98 22, 146 22, 174 44",
    muscleFocus: [176, 78, 18, 14],
    muscleLabel: "Calves, Quads & Hips",
  },
  "Speed, Agility, Quickness (SAQ) & Conditioning": {
    patternLabel: "Projection Drive",
    cue: "Project forward on a crisp 45-degree shin angle; drive arms piston-fast.",
    referencePath: "M24 134 H216 M64 134 L152 46",
    startPath: "M72 96 L46 114 L32 132",
    startJoints: [
      [72, 96],
      [46, 114],
    ],
    finishPath: "M132 58 L98 92 L72 132 M98 92 L144 98 L124 124 M132 62 L156 50 M132 62 L106 68",
    finishHead: [144, 44],
    finishJoints: [
      [132, 62],
      [98, 92],
      [144, 98],
      [72, 132],
    ],
    trajectoryPath: "M76 94 L138 56",
    muscleFocus: [106, 94, 22, 14],
    muscleLabel: "Glutes, Calves & Core",
  },
  "Mobility, Prehab & Gymnastics Holds": {
    patternLabel: "Controlled Range",
    cue: "Move slowly into end-range tension while breathing steady and bracing.",
    referencePath: "M24 134 H216 M120 34 V134",
    startPath: "M120 56 L120 94 L94 132 M120 94 L146 132",
    startJoints: [[120, 94]],
    finishPath: "M144 64 L112 96 L80 132 M112 96 L152 104 L164 132 M144 64 L164 32",
    finishHead: [148, 50],
    finishJoints: [
      [144, 64],
      [112, 96],
      [152, 104],
      [164, 32],
    ],
    trajectoryPath: "M122 52 C136 42, 152 38, 162 34",
    muscleFocus: [144, 64, 20, 14],
    muscleLabel: "Shoulders, Hips & Spine",
  },
};

function FormDiagramSvg({
  category,
  primaryMuscles,
}: {
  category: ExerciseCategory;
  primaryMuscles: string[];
}) {
  const uid = useId().replace(/:/g, "");
  const gradId = `form-traj-${uid}`;
  const haloId = `form-halo-${uid}`;
  const arrowId = `form-arrow-${uid}`;
  const spec = DIAGRAM_SPECS[category];
  const [mx, my, mrx, mry] = spec.muscleFocus;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/85 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-brand-amber">
          Form Diagram
        </span>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
          {spec.patternLabel}
        </span>
      </div>

      <svg
        viewBox="0 0 240 152"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`${spec.patternLabel} start to finish form diagram`}
        className="my-2 h-36 w-full text-foreground"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1="36"
            y1="130"
            x2="196"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="var(--brand-amber)" />
            <stop offset="60%" stopColor="var(--brand-orange)" />
            <stop offset="100%" stopColor="var(--brand-indigo)" />
          </linearGradient>
          <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--brand-amber)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--brand-orange)" stopOpacity="0" />
          </radialGradient>
          <marker
            id={arrowId}
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path
              d="M1 1.5 L6.5 4 L1 6.5"
              stroke="var(--brand-amber)"
              strokeWidth="1.5"
              fill="none"
            />
          </marker>
        </defs>

        {/* Ground / surface & alignment axes */}
        <path
          d={spec.referencePath}
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeDasharray="3 4"
          strokeWidth="1.2"
        />

        {/* Target muscle focus glow */}
        <ellipse cx={mx} cy={my} rx={mrx} ry={mry} fill={`url(#${haloId})`} />
        <ellipse
          cx={mx}
          cy={my}
          rx={mrx * 0.65}
          ry={mry * 0.65}
          stroke="var(--brand-amber)"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Start posture (dashed skeleton) */}
        <path
          d={spec.startPath}
          stroke="currentColor"
          strokeOpacity="0.42"
          strokeWidth="1.8"
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {spec.startJoints.map(([sx, sy], idx) => (
          <circle
            key={`start-${idx}`}
            cx={sx}
            cy={sy}
            r="2.6"
            fill="var(--background)"
            stroke="currentColor"
            strokeOpacity="0.48"
            strokeWidth="1.2"
          />
        ))}

        {/* Finish / peak posture (solid articulated figure) */}
        <circle
          cx={spec.finishHead[0]}
          cy={spec.finishHead[1]}
          r="6.2"
          stroke="currentColor"
          strokeOpacity="0.92"
          strokeWidth="2.1"
          fill="var(--surface)"
        />
        <path
          d={spec.finishPath}
          stroke="currentColor"
          strokeOpacity="0.95"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {spec.finishJoints.map(([fx, fy], idx) => (
          <circle
            key={`finish-${idx}`}
            cx={fx}
            cy={fy}
            r="3"
            fill={idx === 0 ? "var(--brand-amber)" : "var(--foreground)"}
          />
        ))}

        {/* Movement path cue arrow */}
        <path
          d={spec.trajectoryPath}
          stroke={`url(#${gradId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          markerEnd={`url(#${arrowId})`}
        />
      </svg>

      {/* Concise Start / Peak / Focus Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-[0.68rem] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 border-t border-dashed border-foreground/55" />
            Start
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-3 border-t-2 border-foreground" />
            Peak
          </span>
          <span className="inline-flex items-center gap-1 text-brand-amber">
            <span className="size-1.5 rounded-full bg-brand-amber" />
            {primaryMuscles[0] ?? spec.muscleLabel}
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs font-light leading-snug text-muted-foreground">{spec.cue}</p>
    </div>
  );
}

export function ExerciseVisual({
  name,
  category,
  image,
  primaryMuscles = [],
}: {
  name: string;
  category: ExerciseCategory;
  image: string;
  primaryMuscles?: string[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <AthleticImage
          src={image}
          alt={`${name} — ${category} gym demonstration context`}
          width={800}
          height={520}
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] h-full w-full object-cover"
        />
      </div>
      <FormDiagramSvg category={category} primaryMuscles={primaryMuscles} />
    </div>
  );
}
