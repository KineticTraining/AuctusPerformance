
-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '' CHECK (char_length(display_name) <= 80),
  sport text NOT NULL DEFAULT '' CHECK (char_length(sport) <= 60),
  level text NOT NULL DEFAULT '' CHECK (char_length(level) <= 40),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, sport, level)
  VALUES (
    NEW.id,
    left(coalesce(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), ''), 80),
    left(coalesce(NEW.raw_user_meta_data->>'sport', ''), 60),
    left(coalesce(NEW.raw_user_meta_data->>'level', ''), 40)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- VIDEOS
CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  section text NOT NULL,
  sport text NOT NULL DEFAULT 'All sports',
  coach text NOT NULL DEFAULT '',
  duration_label text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'All levels',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read videos" ON public.videos FOR SELECT TO authenticated USING (true);

-- ARTICLES
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  category text NOT NULL,
  author text NOT NULL,
  author_role text NOT NULL DEFAULT '',
  read_minutes int NOT NULL DEFAULT 5,
  featured boolean NOT NULL DEFAULT false,
  published_at date NOT NULL DEFAULT current_date
);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads articles" ON public.articles FOR SELECT TO anon, authenticated USING (true);

-- TECHNIQUES
CREATE TABLE public.techniques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport text NOT NULL,
  name text NOT NULL,
  summary text NOT NULL DEFAULT '',
  key_cues text[] NOT NULL DEFAULT '{}',
  common_faults text[] NOT NULL DEFAULT '{}',
  drills text[] NOT NULL DEFAULT '{}',
  UNIQUE (sport, name)
);
GRANT SELECT ON public.techniques TO authenticated;
GRANT ALL ON public.techniques TO service_role;
ALTER TABLE public.techniques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read techniques" ON public.techniques FOR SELECT TO authenticated USING (true);

-- SUBMISSIONS
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  video_url text NOT NULL CHECK (char_length(video_url) BETWEEN 8 AND 500),
  technique_id uuid REFERENCES public.techniques(id) ON DELETE SET NULL,
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 2000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','analyzing','complete','failed')),
  analysis jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  analyzed_at timestamptz
);
CREATE INDEX submissions_user_created_idx ON public.submissions (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own submissions select" ON public.submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own submissions insert" ON public.submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own submissions update" ON public.submissions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own submissions delete" ON public.submissions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- SEED: VIDEOS
INSERT INTO public.videos (youtube_id, title, description, section, sport, coach, duration_label, level, sort_order) VALUES
('ZaTM37cfiDs','Deadlift With Perfect Technique','Step-by-step hinge mechanics: setup, bracing, bar path and lockout.','Strength & Power','Strength','Jeff Nippard','12 min','Beginner',1),
('my0tLDaWyDU','Squat Correctly, Pain-Free','Find your stance, control depth and keep the trunk stacked under load.','Strength & Power','Strength','Squat University','9 min','All levels',2),
('oMXHBcI1wJU','Top 10 Plyometrics for Athletes','Jump, bound and hop progressions that convert strength into explosiveness.','Strength & Power','All sports','Garage Strength','11 min','Intermediate',3),
('3-4pKUhkzoQ','Nordic Hamstring Curls','The single best exercise for hamstring resilience, regressed for beginners.','Strength & Power','All sports','Movement Project PT','1 min','Beginner',4),
('H3iPiweaQqQ','Sprint Drills That Increase Speed','Drills that actually transfer to top-end speed and acceleration.','Speed & Agility','Track & Field','Lyfestyle Athletics','10 min','Intermediate',1),
('WNaWD-bxFT0','Best vs Worst Sprint Drills','What to keep, what to drop, and why mechanics matter more than volume.','Speed & Agility','Track & Field','Justjumari','8 min','All levels',2),
('9ZTRUVLjGzI','Agility Ladder: Level 1 Footwork','Ten ladder patterns for fast feet, rhythm and change of direction.','Speed & Agility','Football','I Know Football','7 min','Beginner',3),
('ZJBprx7oWAM','Dynamic Warm-up for Athletes','A complete pre-session routine to raise temperature and prime movement.','Mobility & Recovery','All sports','Baylor College of Medicine','6 min','All levels',1),
('jj2AAH6jbHk','12-Minute Hip Mobility','Follow-along flow to open the hips for sprinting, squatting and cutting.','Mobility & Recovery','All sports','Tom Merrick','12 min','All levels',2),
('BoGzAZ_vOyA','10-Minute Foam Roll Routine','Pre or post session soft-tissue work for the lower body.','Mobility & Recovery','Running','Tom Peto Training','10 min','All levels',3),
('E4O2JeAYg5Q','The Form Shooting Drill','Build a repeatable shot from close range out: elbow, release and follow-through.','Sport Skills','Basketball','CoachUp','4 min','Beginner',1),
('AQy_c30lNjI','How to Swim Freestyle','Body position, catch, rotation and breathing for efficient front crawl.','Sport Skills','Swimming','Global Triathlon Network','9 min','Beginner',2),
('IiRGdagtOKE','Tennis Serve Masterclass','Grip, toss, trophy position and pronation for a fluid, powerful serve.','Sport Skills','Tennis','Top Tennis Training','14 min','Beginner',3),
('9v5eo9vIo2Y','Position-Specific Passing for Midfielders','Scanning, body shape and first-touch passing patterns.','Sport Skills','Soccer','m777ax','3 min','Intermediate',4),
('5Ja5gwko9ro','Visualization for Peak Performance','How elite athletes rehearse skills mentally to perform under pressure.','Mindset','All sports','Grande Sports','6 min','All levels',1),
('HQwMrK54494','Kobe on Visualization','Kobe Bryant breaks down how he prepared his mind before games.','Mindset','Basketball','BasketballTutor','3 min','All levels',2);

-- SEED: TECHNIQUES
INSERT INTO public.techniques (sport, name, summary, key_cues, common_faults, drills) VALUES
('Track & Field','Sprint acceleration','First 10–20 m: projecting the body forward with powerful, piston-like leg action.',
 ARRAY['45° forward body lean from ankles, not waist','Straight line from head through hip to drive ankle','Powerful triple extension on each push','Shin angle matches torso angle on ground contact','Aggressive arm drive, hands cheek-to-hip','Gradual rise to upright over 20–30 m'],
 ARRAY['Popping upright in first 3 steps','Bending at the waist instead of leaning','Overstriding with foot landing ahead of hips','Short, choppy arm swing','Heel striking'],
 ARRAY['Wall drives (A-march into switches)','Resisted sled sprints 10–20 m','Falling starts','Half-kneeling starts']),
('Track & Field','Max-velocity sprinting','Upright running at top speed: front-side mechanics and stiff, short ground contacts.',
 ARRAY['Tall posture, slight forward lean','Knee drives to hip height (front-side mechanics)','Foot strikes under the hip, mid/forefoot','Dorsiflexed ankle before contact','Relaxed face and shoulders','Arms swing 90° at elbow, front to back'],
 ARRAY['Excessive back-side kick (heel to butt, slow recovery)','Sitting back / anterior pelvic collapse','Arms crossing midline','Tension in jaw and shoulders','Reaching with the foot'],
 ARRAY['A-skips and B-skips','Straight-leg bounds','Flying 20s','Wicket runs']),
('Basketball','Jump shot','Repeatable shooting motion from feet through release.',
 ARRAY['Feet shoulder width, toes to rim','Ball on fingerpads, elbow under ball','Shooting pocket at waist, one-motion lift','Release at top of jump','Snap wrist, fingers to rim (goose neck)','Balanced landing on the takeoff spot'],
 ARRAY['Elbow flaring out','Thumbing with guide hand','Flat arc','Drifting forward or sideways on landing','Shooting on the way down'],
 ARRAY['Form shooting close to rim','One-hand shooting','Catch-and-shoot off two-foot hop','Free-throw routine']),
('Basketball','Defensive slide','Lateral movement to stay in front of a ball handler.',
 ARRAY['Wide stance, hips low, chest up','Weight on balls of feet','Lead with the foot in direction of travel','Push off trail leg, never cross feet','Active hands, eyes on the hips of the attacker'],
 ARRAY['Standing up tall','Crossing feet','Reaching and lunging for the ball','Hopping instead of pushing'],
 ARRAY['Zig-zag slides','Mirror drill','Band lateral walks']),
('Soccer','Instep drive (shooting)','Striking with the laces for power and accuracy.',
 ARRAY['Approach at slight angle','Plant foot beside ball, toes to target','Eyes on the ball at contact','Ankle locked, toes pointed down','Strike through the middle/top of the ball','Land on the striking foot'],
 ARRAY['Leaning back (ball skies)','Plant foot too far from ball','Floppy ankle','Toe-poking','Stopping follow-through'],
 ARRAY['Wall strikes with laces','Shooting from passes on the move','Weak-foot volume work']),
('Soccer','Short passing (inside foot)','Accurate, weighted passing with the inside of the foot.',
 ARRAY['Scan before receiving','Open body shape on receiving','Plant foot pointing to target','Ankle locked, foot at 90°','Strike through the ball center','Follow through toward target'],
 ARRAY['Heavy first touch','Closed body shape','Passing with toe','Weight of pass too soft or hard'],
 ARRAY['Rondos','Two-touch passing gates','Wall passing combinations']),
('Tennis','Serve','Kinetic chain from legs through racket to produce speed and spin.',
 ARRAY['Continental grip','Consistent toss slightly in front and to the right (right-hander)','Trophy position with knees bent','Leg drive up into the ball','Racket drop behind back','Contact at full extension with pronation'],
 ARRAY['Inconsistent toss','Eastern forehand grip (pancake serve)','No leg drive','Arm-only swing','Contact too low'],
 ARRAY['Toss-and-catch drill','Kneeling serves','Throwing a ball overhand','Shadow serves with pause at trophy']),
('Tennis','Forehand groundstroke','Modern topspin forehand built from rotation.',
 ARRAY['Early unit turn','Semi-western grip','Racket drop below ball','Contact out in front','Rotate hips then shoulders','Windshield-wiper finish over shoulder'],
 ARRAY['Late preparation','Arming the ball','Contact beside or behind body','Abbreviated follow-through'],
 ARRAY['Drop-feed forehands','Cross-court rally targets','Shadow swings with medicine ball rotation']),
('Swimming','Freestyle stroke','Efficient front crawl with long body line and strong catch.',
 ARRAY['Head neutral, eyes down','Hips high near surface','Hand entry in line with shoulder','High-elbow catch','Body rotation 30–45° each side','Exhale continuously underwater','Steady flutter kick from hips'],
 ARRAY['Lifting head to breathe','Crossing over the midline on entry','Dropped elbow on catch','Sinking hips and legs','Kicking from the knees'],
 ARRAY['Catch-up drill','Single-arm freestyle','Side kick with rotation','Fingertip drag']),
('Strength','Back squat','Loaded squat to depth with neutral spine.',
 ARRAY['Brace before descent (360° breath)','Bar over mid-foot throughout','Knees track over toes','Hips and knees break together','Depth: hip crease at or below knee','Drive up chest and hips together'],
 ARRAY['Knee valgus (caving in)','Heels lifting','Butt wink at bottom','Good-morning out of the hole','Losing brace'],
 ARRAY['Goblet squat','Tempo squats 3-1-1','Pause squats','Box squats']),
('Strength','Deadlift','Hip hinge lifting the bar from floor to lockout.',
 ARRAY['Bar over mid-foot, shins near bar','Lats engaged (protect armpits)','Neutral spine, chest proud','Push the floor away','Bar stays in contact with legs','Lockout with glutes, not lower back'],
 ARRAY['Rounding the lower back','Hips shooting up first','Bar drifting forward','Jerking the bar off floor','Hyperextending at lockout'],
 ARRAY['Romanian deadlift','Block pulls','Kettlebell hinge','Paused deadlift below knee']),
('All sports','Countermovement jump','Vertical jump using a rapid dip and triple extension.',
 ARRAY['Fast, shallow countermovement','Arms swing back then drive up','Full triple extension (hips, knees, ankles)','Knees aligned over toes','Soft, quiet landing in athletic stance'],
 ARRAY['Too deep or slow dip','Knee valgus on takeoff or landing','No arm swing','Stiff, loud landing'],
 ARRAY['Box jumps','Pogo hops','Depth drops','Broad jumps']);

-- SEED: ARTICLES
INSERT INTO public.articles (slug, title, excerpt, body, category, author, author_role, read_minutes, featured, published_at) VALUES
('sleep-the-performance-drug','Sleep: The Legal Performance Drug','Extending sleep improved sprint times and shooting accuracy in collegiate athletes. Here is what the research says and how to apply it.',
$b$Few interventions in sport science produce effects as large — or as cheap — as sleep. In a landmark Stanford study, collegiate basketball players who extended their sleep to roughly ten hours in bed per night improved sprint times and free-throw and three-point accuracy by around nine percent.

## Why sleep matters for athletes

Deep (slow-wave) sleep is when growth hormone release peaks, supporting tissue repair. REM sleep is closely tied to motor learning: the skill you practiced in the afternoon is consolidated overnight.

Sleep restriction, on the other hand, raises perceived exertion, lowers time to exhaustion, and impairs reaction time and decision making — the exact qualities that decide close games.

## Practical guidelines

- Aim for 8–10 hours in bed during heavy training blocks.
- Keep a consistent wake time, even on weekends.
- Keep the room cool (around 18 °C), dark and quiet.
- Cut caffeine roughly 8 hours before bed.
- Use short naps (20–30 minutes) before 3 pm to top up after early sessions or travel.

## The bottom line

Treat sleep as part of the training plan, not what is left over after it. Track it the way you track your lifts.$b$,
'Recovery','Dr. Maya Okafor','Sports Physiologist',6,true,'2026-10-28'),
('rate-of-force-development','Rate of Force Development: Why Speed of Strength Wins','Maximum strength matters, but most sport actions last under 250 ms. Learn how to train how fast you can apply force.',
$b$Most decisive actions in sport — a sprint step, a jump, a cut — happen in 100 to 250 milliseconds. Peak force takes longer than that to develop. What separates athletes is often not how much force they can make, but how quickly.

## What is RFD?

Rate of force development (RFD) is the slope of the force–time curve: how fast force rises after you start a contraction. It depends on neural drive, motor unit recruitment and tendon stiffness.

## How to train it

- Build a base of maximal strength first; stronger athletes have more force to express quickly.
- Use ballistic exercises where you accelerate through the end range: jump squats, medicine ball throws, Olympic lift derivatives.
- Add plyometrics that emphasize short ground contacts, like pogo hops and depth jumps.
- Lift with maximal intent. Even with heavy loads, try to move the bar as fast as possible.

## Programming tip

Place explosive work early in the session when you are fresh, and keep reps low (3–5) with full rest. Speed is a quality you train, not a conditioning effect.$b$,
'Strength & Power','Coach Daniel Reyes','Strength & Conditioning Coach',7,false,'2026-10-14'),
('hamstring-injury-prevention','The Nordic Curl and Hamstring Injury Prevention','Eccentric hamstring training has been shown to cut hamstring injuries roughly in half. Here is a simple protocol.',
$b$Hamstring strains are the most common non-contact injury in sprint-based sports. The good news: they are among the most preventable.

## The evidence

Meta-analyses of programs that include the Nordic hamstring exercise report roughly a 50 percent reduction in hamstring injury rates. The exercise builds eccentric strength and appears to lengthen muscle fascicles — both protective factors.

## A simple protocol

- Weeks 1–2: 2 sets of 5 reps, once per week.
- Weeks 3–4: 2 sets of 6 reps, twice per week.
- Weeks 5–10: 3 sets of 6–8 reps, twice per week.
- In season: 1–2 sets once per week to maintain.

Control the lowering for as long as possible, then catch yourself with your hands and push back up.

## Don't forget sprinting

High-speed running itself is protective. Regular exposure to near-maximal sprinting prepares the hamstrings for the demands of competition.$b$,
'Injury Prevention','Dr. Maya Okafor','Sports Physiologist',5,false,'2026-09-30'),
('fueling-for-training','Fueling the Session: Carbohydrate Timing for Athletes','Carbohydrate availability drives high-intensity performance. A practical guide to what to eat before, during and after.',
$b$Glycogen is the main fuel for high-intensity work. When stores run low, power output and decision making suffer.

## Before training

Eat a carbohydrate-focused meal 2–4 hours before key sessions (1–4 g per kg body mass). If you train early, a smaller snack 30–60 minutes before — a banana or toast with honey — helps.

## During training

For sessions longer than about 60–75 minutes, take in 30–60 g of carbohydrate per hour through sports drinks, gels or chews.

## After training

Combine carbohydrate with 0.3 g per kg of protein within a couple of hours to support glycogen restoration and muscle repair. When sessions are close together, prioritize faster refueling.

## Periodize it

Match intake to the demands of the day. Heavy, high-intensity days need more carbohydrate than light technical days.$b$,
'Nutrition','Priya Shah, RD','Performance Dietitian',6,false,'2026-09-12'),
('mental-rehearsal','Mental Rehearsal: Training the Brain to Perform','Imagery activates many of the same motor pathways as physical practice. How to build a visualization routine that works.',
$b$Elite athletes from sprinters to free-throw shooters use structured imagery. Brain imaging shows that vividly imagining a movement activates overlapping motor regions to actually performing it.

## The PETTLEP model

Effective imagery is Physical, Environmental, Task-specific, Timed in real time, Learned, Emotional and from the right Perspective. In short: make it as close to the real thing as possible.

## Build a routine

- Start with 5 minutes a day, eyes closed, in a calm place.
- Rehearse a single skill in real time, from your own eyes.
- Add sensory detail: the sound of the crowd, the feel of the ball.
- Include successful responses to pressure and mistakes.
- Rehearse right before competition as part of your warm-up.

Imagery is a skill. Like any skill, it improves with deliberate practice.$b$,
'Psychology','Dr. Lena Brooks','Sport Psychologist',5,false,'2026-08-25'),
('training-load-acwr','Managing Training Load Without Overthinking It','Spikes in training load raise injury risk. A practical way to track load using session RPE.',
$b$Injury risk rises when training load jumps quickly beyond what an athlete is prepared for. The goal is not low load — it is well-progressed load.

## Session RPE

After every session, rate its difficulty from 0 to 10, then multiply by duration in minutes. A 60-minute session at RPE 7 equals 420 arbitrary units. Sum these for a weekly load.

## Progress sensibly

- Avoid increasing weekly load more than about 10–20 percent at a time.
- Plan a lighter week every 3–5 weeks.
- After time off, rebuild gradually rather than returning to full volume.

## Context matters

Numbers are a guide, not a verdict. Combine load tracking with how the athlete feels: sleep, soreness, mood and motivation are early warning signs.$b$,
'Training Science','Coach Daniel Reyes','Strength & Conditioning Coach',6,false,'2026-08-09');
