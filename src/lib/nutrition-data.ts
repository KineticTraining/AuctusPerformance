import type { AgeGroup, NutritionGroup } from "./sports";

export type NutrientEntry = {
  id: string;
  slug: string;
  name: string;
  group: NutritionGroup;
  subgroup?: string;
  sortOrder: number;
  performanceOneLiner: string;
  summarized: {
    whatItDoes: string;
    threeFoods: string;
    bodyNeeds: string;
    averageAmericanGets: string;
  };
  inDepth: {
    biochemicalFunction: string;
    whereLocatedInFood: string;
  };
  ageGroups: AgeGroup[];
  ageGuidance?: Partial<Record<AgeGroup, string>>;
  updated_at: string;
};

const ALL_AGES: AgeGroup[] = [
  "Youth / Teen (Under 18)",
  "Young Adult (18–29)",
  "Adult (30–45)",
  "Older Adult / Masters (45+)",
];

export type NutrientPriorityTier = "high" | "situational" | "baseline";

export type NutrientPriorityInfo = {
  tier: NutrientPriorityTier;
  tierLabel: string;
  athleticFocus: string;
  gapSignal: string;
  coverageScore: number; // 0-100 visual index comparing typical diet coverage vs target
  priorityWhy: string;
};

export const NUTRIENT_PRIORITIES: Record<string, NutrientPriorityInfo> = {
  carbohydrates: {
    tier: "high",
    tierLabel: "High Priority · Primary Output Fuel",
    athleticFocus: "Glycogen & sprint power",
    gapSignal: "Fiber intake (~16.6 g) lags 25–38 g target",
    coverageScore: 76,
    priorityWhy:
      "Primary fuel for high-intensity bouts and brain focus; intake should scale directly with daily training volume.",
  },
  proteins: {
    tier: "high",
    tierLabel: "High Priority · Tissue Repair",
    athleticFocus: "Muscle remodeling & enzyme synthesis",
    gapSignal: "Distribution across meals matters for repair",
    coverageScore: 86,
    priorityWhy:
      "Supplies essential amino acids to rebuild muscle fibers and connective tissue after mechanical training stress.",
  },
  "lipids-fats": {
    tier: "high",
    tierLabel: "High Priority · Foundational Reserve",
    athleticFocus: "Hormone synthesis & joint membranes",
    gapSignal: "Prioritize unsaturated & omega-3 fat quality",
    coverageScore: 88,
    priorityWhy:
      "Supports endocrine health, cellular membrane integrity, and absorption of fat-soluble vitamins A, D, E, and K.",
  },
  "vitamin-d": {
    tier: "high",
    tierLabel: "High Priority · Widespread Gap",
    athleticFocus: "Bone density & neuromuscular drive",
    gapSignal: "Over 90% under-consume from food alone (~5 mcg vs 15 mcg)",
    coverageScore: 34,
    priorityWhy:
      "Dietary intake averages a third of the RDA; critical for calcium absorption, bone resilience under load, and immune readiness.",
  },
  magnesium: {
    tier: "high",
    tierLabel: "High Priority · Widespread Gap",
    athleticFocus: "Muscle relaxation & ATP reactions",
    gapSignal: "Over half of adults fall short (~300 mg vs 310–420 mg)",
    coverageScore: 72,
    priorityWhy:
      "Required to bind ATP for energy transfer and counterbalance calcium during muscle relaxation and sleep recovery.",
  },
  potassium: {
    tier: "high",
    tierLabel: "High Priority · Widespread Gap",
    athleticFocus: "Electrolyte balance & nerve conduction",
    gapSignal: "Average intake ~2,550 mg vs 2,600–3,400 mg target",
    coverageScore: 74,
    priorityWhy:
      "Primary intracellular electrolyte working against high dietary sodium to support nerve firing, blood pressure, and hydration.",
  },
  "vitamin-e": {
    tier: "high",
    tierLabel: "High Priority · Antioxidant Gap",
    athleticFocus: "Membrane oxidative protection",
    gapSignal: "~80% fall below the 15 mg/day RDA from food",
    coverageScore: 60,
    priorityWhy:
      "Protects lipid cell membranes from oxidative stress generated during high-volume aerobic and resistance sessions.",
  },
  "vitamin-c-ascorbic-acid": {
    tier: "situational",
    tierLabel: "Situational · Collagen & Immune Support",
    athleticFocus: "Tendon/ligament collagen & iron uptake",
    gapSignal: "40–45% of Americans fall short of 75–90 mg RDA",
    coverageScore: 84,
    priorityWhy:
      "Essential cofactor for collagen cross-linking in tendons and ligaments, while doubling non-heme plant iron absorption.",
  },
  "vitamin-a": {
    tier: "situational",
    tierLabel: "Situational · Food-Choice Dependent",
    athleticFocus: "Visual tracking & mucosal immunity",
    gapSignal: "Nearly half fall slightly below 700–900 mcg RAE",
    coverageScore: 78,
    priorityWhy:
      "Easily covered via orange vegetables and leafy greens, yet often missed when colorful produce drops out of weekly meals.",
  },
  calcium: {
    tier: "situational",
    tierLabel: "Situational · Bone Load Dependent",
    athleticFocus: "Skeletal strength & muscle contraction",
    gapSignal: "Women and older adults frequently fall below 1,000–1,200 mg",
    coverageScore: 82,
    priorityWhy:
      "Anchors bone mineral density against jumping and running impact forces while triggering every cross-bridge muscle contraction.",
  },
  iron: {
    tier: "situational",
    tierLabel: "Situational · Endurance & Diet Dependent",
    athleticFocus: "Oxygen transport in blood & muscle",
    gapSignal: "Men usually meet 8 mg; premenopausal women often miss 18 mg",
    coverageScore: 76,
    priorityWhy:
      "Governs hemoglobin and myoglobin oxygen delivery; high-impact foot-strike endurance athletes and menstruating women need closer tracking.",
  },
  "vitamin-b12-cobalamin": {
    tier: "situational",
    tierLabel: "Situational · Diet & Age Dependent",
    athleticFocus: "Red blood cells & nerve myelin",
    gapSignal: "Plant-based diets & adults 50+ face absorption gaps",
    coverageScore: 92,
    priorityWhy:
      "Well covered by animal foods, but critical to monitor if avoiding meat/dairy or as gastric acid declines with age.",
  },
  sodium: {
    tier: "situational",
    tierLabel: "Situational · Sweat-Rate Dependent",
    athleticFocus: "Extracellular fluid & heavy sweat",
    gapSignal: "Typical diet (~3,400 mg) exceeds 2,300 mg chronic limit",
    coverageScore: 98,
    priorityWhy:
      "Average diets already contain excess sodium, though athletes losing heavy sweat in heat benefit from targeted rehydration.",
  },
  zinc: {
    tier: "situational",
    tierLabel: "Situational · Tissue & Immune Demand",
    athleticFocus: "Tissue repair & immune defense",
    gapSignal: "Average ~11 mg meets baseline; plant-heavy diets absorb less",
    coverageScore: 94,
    priorityWhy:
      "Supports over 300 repair and immune enzymes; phytates in unsoaked grains/legumes reduce absorption for plant-only athletes.",
  },
  "vitamin-k": {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "Clotting & osteocalcin bone binding",
    gapSignal: "Average ~120 mcg aligns with 90–120 mcg target",
    coverageScore: 95,
    priorityWhy:
      "Usually met with routine green vegetables; works alongside Vitamin D to bind calcium onto bone matrix.",
  },
  "vitamin-b1-thiamin": {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "Carbohydrate energy conversion",
    gapSignal: "Average ~1.6 mg exceeds 1.1–1.2 mg RDA",
    coverageScore: 96,
    priorityWhy:
      "Crucial coenzyme for converting carbs into ATP; routinely met through whole or enriched grains and legumes.",
  },
  "vitamin-b2-riboflavin": {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "Mitochondrial electron carriers",
    gapSignal: "Average ~2.1 mg exceeds 1.1–1.3 mg RDA",
    coverageScore: 97,
    priorityWhy:
      "Drives FAD/FMN redox reactions across carbs and fats; reliably supplied by dairy, eggs, almonds, and grains.",
  },
  "vitamin-b3-niacin": {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "NAD+/NADP+ energy & DNA repair",
    gapSignal: "Average ~26 mg exceeds 14–16 mg NE RDA",
    coverageScore: 97,
    priorityWhy:
      "Fuels hundreds of dehydrogenase reactions and cellular repair; readily met when eating poultry, fish, peanuts, or enriched grains.",
  },
  "vitamin-b5-pantothenic-acid": {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "Coenzyme A fuel entry",
    gapSignal: "Average 5–6 mg meets 5 mg daily target",
    coverageScore: 94,
    priorityWhy:
      "Forms Coenzyme A at the center of energy metabolism and hormone synthesis; present across nearly all whole foods.",
  },
  "vitamin-b6-pyridoxine": {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "Amino acid & glycogen metabolism",
    gapSignal: "Average ~2.1 mg exceeds 1.3–1.7 mg RDA",
    coverageScore: 96,
    priorityWhy:
      "Key cofactor for protein transamination, glycogen breakdown, and neurotransmitter balance; abundant in fish, chickpeas, and bananas.",
  },
  "vitamin-b7-biotin": {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "Carboxylase energy enzymes",
    gapSignal: "Estimated 35–50 mcg covers 30 mcg target",
    coverageScore: 95,
    priorityWhy:
      "Supports gluconeogenesis and fatty acid synthesis; deficiency is rare when eating cooked eggs, seeds, and fish.",
  },
  "vitamin-b9-folate": {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "DNA synthesis & cell division",
    gapSignal: "Average ~525 mcg DFE covers 400 mcg adult RDA",
    coverageScore: 95,
    priorityWhy:
      "Essential for red blood cell turnover and tissue repair; important to prioritize leafy greens and legumes (higher need in pregnancy).",
  },
  phosphorus: {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "ATP & creatine phosphate backbone",
    gapSignal: "Average ~1,375 mg is nearly double the 700 mg RDA",
    coverageScore: 99,
    priorityWhy:
      "Forms ATP and creatine phosphate alongside bone mineral; virtually always sufficient in balanced diets.",
  },
  chloride: {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "Fluid balance & gastric digestion",
    gapSignal: "Average ~5,200 mg exceeds 2,300 mg AI via dietary salt",
    coverageScore: 99,
    priorityWhy:
      "Partners with sodium for osmotic balance and stomach acid production; rarely deficient outside extreme fluid losses.",
  },
  sulfur: {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "Protein disulfide bonds & cartilage",
    gapSignal: "Average ~950 mg met automatically via adequate protein",
    coverageScore: 96,
    priorityWhy:
      "Delivered naturally whenever daily protein targets are met via sulfur-containing amino acids methionine and cysteine.",
  },
  copper: {
    tier: "baseline",
    tierLabel: "Baseline · Usually Covered",
    athleticFocus: "Iron loading & collagen cross-linking",
    gapSignal: "Average ~1.2 mg covers 0.9 mg RDA",
    coverageScore: 95,
    priorityWhy:
      "Works alongside iron and connective tissue enzymes; reliably covered by nuts, seeds, legumes, and dark chocolate.",
  },
};

export function getNutrientPriority(entry: NutrientEntry): NutrientPriorityInfo {
  const matched = NUTRIENT_PRIORITIES[entry.slug];
  if (matched) return matched;
  return {
    tier: entry.group === "Macronutrients" ? "high" : "situational",
    tierLabel:
      entry.group === "Macronutrients"
        ? "High Priority · Core Fuel"
        : "Situational · Targeted Intake",
    athleticFocus: "Metabolic & structural support",
    gapSignal: `Target: ${entry.summarized.bodyNeeds}`,
    coverageScore: 78,
    priorityWhy: entry.performanceOneLiner,
  };
}

export const SEED_NUTRIENTS: NutrientEntry[] = [
  // [MACRONUTRIENTS]
  {
    id: "nut-carbohydrates",
    slug: "carbohydrates",
    name: "Carbohydrates",
    group: "Macronutrients",
    sortOrder: 1,
    performanceOneLiner:
      "Fuels high-output effort and steady brain focus so you can train harder and delay fatigue.",
    summarized: {
      whatItDoes:
        "Your body’s favorite quick-burning fuel—like putting regular gas in a car so your brain and muscles can move.",
      threeFoods: "Oats, bananas, white rice.",
      bodyNeeds:
        "45–65% of daily calories (about 225–325 g on a 2,000-calorie diet; 25–38 g of that should be fiber).",
      averageAmericanGets: "~240–260 g/day (~45–46% of calories), though only ~16.6 g of fiber.",
    },
    inDepth: {
      biochemicalFunction:
        "Carbohydrates are polyhydroxy aldehydes or ketones hydrolyzed during digestion into monosaccharides (primarily glucose, fructose, and galactose). Glucose is phosphorylated via hexokinase/glucokinase to enter glycolysis in the cytosol, yielding pyruvate, NADH, and ATP. Under aerobic conditions, pyruvate enters the mitochondrial matrix to form acetyl-CoA, fueling the tricarboxylic acid (TCA) cycle and oxidative phosphorylation (30–32 ATP per glucose molecule). Excess glucose is polymerized via glycogenesis into hepatic and skeletal muscle glycogen, or converted via de novo lipogenesis into triglycerides. Indigestible non-starch polysaccharides (fiber) undergo saccharolytic fermentation by colonic microbiota into short-chain fatty acids (butyrate, propionate, acetate) that nourish colonocytes and modulate systemic inflammation.",
      whereLocatedInFood:
        "Concentrated in the endosperm of cereal grains (as amylose and amylopectin starches), plant tubers and roots, the fleshy mesocarp of fruits (as sucrose and fructose), milk (as the disaccharide lactose), and plant cell walls (cellulose, hemicellulose, and pectin).",
    },
    ageGroups: [...ALL_AGES],
    ageGuidance: {
      "Youth / Teen (Under 18)":
        "Supports rapid growth alongside school practices; aim for whole grains and fruit around training.",
      "Older Adult / Masters (45+)":
        "Pair fiber-rich complex carbohydrates with movement blocks to support metabolic flexibility and steady energy.",
    },
    updated_at: "2026-11-22",
  },
  {
    id: "nut-proteins",
    slug: "proteins",
    name: "Proteins",
    group: "Macronutrients",
    sortOrder: 2,
    performanceOneLiner:
      "Supplies the amino acid building blocks needed to repair muscle fibers, adapt to training, and recover between sessions.",
    summarized: {
      whatItDoes:
        "The body's Lego bricks—used to build and repair muscles, skin, hair, and the tiny workers (enzymes) that keep you alive.",
      threeFoods: "Chicken breast, eggs, lentils.",
      bodyNeeds:
        "10–35% of daily calories; minimum RDA is 0.8 g/kg of body weight (~46 g for women, 56 g for men).",
      averageAmericanGets: "~80–95 g/day (~16% of daily calories).",
    },
    inDepth: {
      biochemicalFunction:
        "Proteins are macromolecules composed of L-alpha-amino acids linked by covalent peptide bonds, folded into secondary, tertiary, and quaternary conformations. Denatured by gastric hydrochloric acid and cleaved by endopeptidases (pepsin, trypsin, chymotrypsin) and exopeptidases into di-/tripeptides and free amino acids, they supply the 9 indispensable (essential) amino acids required for ribosomal mRNA translation. Beyond myofibrillar contractile proteins (actin, myosin) and extracellular matrix scaffolding (collagen, elastin), amino acids serve as precursors for peptide hormones (insulin), catecholamines, serotonin, heme, and immunoglobulins, while maintaining oncotic pressure via plasma albumin.",
      whereLocatedInFood:
        "Found within skeletal muscle tissue (myofibrils and sarcoplasm) of livestock, poultry, and fish; avian egg albumen (ovalbumin) and vitellus; mammalian casein micelles and whey; and the protein bodies (aleurone grains) inside the cotyledons of legumes, seeds, and nuts.",
    },
    ageGroups: [...ALL_AGES],
    ageGuidance: {
      "Older Adult / Masters (45+)":
        "Evenly distributing protein across meals helps counter age-related anabolic resistance and preserve lean strength.",
    },
    updated_at: "2026-11-22",
  },
  {
    id: "nut-lipids",
    slug: "lipids-fats",
    name: "Lipids (Fats)",
    group: "Macronutrients",
    sortOrder: 3,
    performanceOneLiner:
      "Provides long-duration energy reserves, supports hormone production, and helps protect joints and tissues under training stress.",
    summarized: {
      whatItDoes:
        "Long-term backup battery, organ padding, brain insulation, and the taxi that carries certain vitamins into your blood.",
      threeFoods: "Olive oil, avocados, salmon.",
      bodyNeeds:
        "20–35% of daily calories (~44–78 g on a 2,000-calorie diet; essential omega-3 ALA: 1.1–1.6 g/day; omega-6 LA: 12–17 g/day).",
      averageAmericanGets: "~80–90 g/day (~35–36% of daily calories).",
    },
    inDepth: {
      biochemicalFunction:
        "Dietary lipids consist predominantly of triacylglycerols (triglycerides), phospholipids, and sterols. Emulsified by amphipathic bile salts and hydrolyzed by pancreatic lipase into monoacylglycerols and free fatty acids, they are packaged into chylomicrons for lymphatic transport. Fatty acids undergo mitochondrial beta-oxidation to generate abundant acetyl-CoA (106 ATP from a single 16-carbon palmitate molecule). Amphipathic phospholipids and cholesterol maintain the fluid-mosaic bilayer of cellular membranes and myelin sheaths; cholesterol serves as the cyclopentanoperhydrophenanthrene backbone for steroidogenesis (cortisol, aldosterone, sex hormones) and bile acids; and polyunsaturated fatty acids (arachidonic acid, EPA, DHA) act as substrates for cyclooxygenase and lipoxygenase pathways to synthesize eicosanoids (prostaglandins, leukotrienes, thromboxanes).",
      whereLocatedInFood:
        "Stored within subcutaneous and intramuscular adipocytes of animals, milk fat globule membranes in dairy, the mesocarp oil bodies of olives and avocados, and the cotyledon oleosomes of oilseeds, nuts, and cereal germ.",
    },
    ageGroups: [...ALL_AGES],
    updated_at: "2026-11-22",
  },

  // [VITAMINS - FAT-SOLUBLE]
  {
    id: "nut-vitamin-a",
    slug: "vitamin-a",
    name: "Vitamin A (Retinoids & Carotenoids)",
    group: "Vitamins",
    subgroup: "Fat-Soluble",
    sortOrder: 4,
    performanceOneLiner:
      "Supports sharp visual tracking and immune resilience so heavy training blocks aren't derailed by illness.",
    summarized: {
      whatItDoes:
        "Lets you see in the dark, keeps your skin smooth, and trains your immune cells to fight germs.",
      threeFoods: "Sweet potatoes, beef liver, spinach.",
      bodyNeeds: "900 mcg RAE (men) / 700 mcg RAE (women).",
      averageAmericanGets:
        "~600–650 mcg RAE/day (nearly half of Americans fall slightly short from food alone).",
    },
    inDepth: {
      biochemicalFunction:
        "Retinol is oxidized to 11-cis-retinal, which covalently binds to opsin in retinal rod photoreceptors to form rhodopsin; photon absorption isomerizes it to all-trans-retinal, initiating the G-protein-coupled phototransduction cascade. Oxidized irreversibly to all-trans-retinoic acid (ATRA), it binds nuclear retinoic acid receptors (RAR/RXR) to regulate gene transcription governing epithelial cell differentiation, mucin secretion, embryogenesis, and mucosal T-cell homing.",
      whereLocatedInFood:
        "Stored as retinyl esters in hepatic stellate cells of animal livers, egg yolks, and dairy fat; present as provitamin A carotenoids (beta-carotene, alpha-carotene) inside chromoplasts and chloroplasts of orange-pigmented roots/fruits and dark leafy greens.",
    },
    ageGroups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-d",
    slug: "vitamin-d",
    name: "Vitamin D (Calciferol)",
    group: "Vitamins",
    subgroup: "Fat-Soluble",
    sortOrder: 5,
    performanceOneLiner:
      "Helps maintain strong bones and neuromuscular/immune function to handle impact loads and hard training.",
    summarized: {
      whatItDoes:
        "Acts like a key that unlocks your gut so calcium can enter your body to build hard bones and keep your immune system calm.",
      threeFoods: "Wild salmon, egg yolks, fortified milk.",
      bodyNeeds: "15 mcg (600 IU); 20 mcg (800 IU) over age 70.",
      averageAmericanGets:
        "~4.5–5.5 mcg/day from food (over 90% of Americans under-consume it via diet alone).",
    },
    inDepth: {
      biochemicalFunction:
        "Cholecalciferol (D3) or ergocalciferol (D2) undergoes hepatic 25-hydroxylation via CYP2R1 to form calcidiol (25(OH)D), followed by parathyroid-hormone-stimulated renal 1-alpha-hydroxylation via CYP27B1 into the secosteroid hormone calcitriol (1,25(OH)2D). Calcitriol binds intracellular Vitamin D Receptors (VDR), heterodimerizing with RXR to upregulate intestinal epithelial calcium-binding proteins (calbindin-D9k) and TRPV6 channels, promoting transcellular Ca2+ and phosphate absorption for bone mineralization while modulating innate antimicrobial peptides (cathelicidin).",
      whereLocatedInFood:
        "Concentrated in the adipose tissue and liver oils of pelagic fatty fish (salmon, mackerel, sardines), avian egg yolks, UV-irradiated fungal cell walls (mushrooms, as D2), and added exogenously to dairy and plant milks.",
    },
    ageGroups: [...ALL_AGES],
    ageGuidance: {
      "Older Adult / Masters (45+)":
        "Cutaneous synthesis declines with age; adults over 70 need 20 mcg (800 IU) daily.",
    },
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-e",
    slug: "vitamin-e",
    name: "Vitamin E (Tocopherols)",
    group: "Vitamins",
    subgroup: "Fat-Soluble",
    sortOrder: 6,
    performanceOneLiner:
      "Protects cell membranes from oxidative stress generated during intense exercise and recovery.",
    summarized: {
      whatItDoes:
        "Bodyguard for your cells—stops rogue molecules (free radicals) from rusting your cell walls.",
      threeFoods: "Sunflower seeds, almonds, spinach.",
      bodyNeeds: "15 mg (alpha-tocopherol).",
      averageAmericanGets:
        "~8–10 mg/day (roughly 80% of Americans get less than the RDA from food).",
    },
    inDepth: {
      biochemicalFunction:
        "Alpha-tocopherol acts as a lipophilic chain-breaking antioxidant embedded within phospholipid bilayers and low-density lipoproteins (LDLs). Its chromanol ring donates a phenolic hydrogen atom to lipid peroxyl radicals (LOO•), halting the autocatalytic propagation of polyunsaturated fatty acid peroxidation; the resulting tocopheroxyl radical is subsequently regenerated by cytosolic ascorbate (Vitamin C). It also inhibits protein kinase C activity and platelet aggregation.",
      whereLocatedInFood:
        "Concentrated in the lipid-rich germ and cotyledons of plant seeds, tree nuts, extracted vegetable oils (wheat germ, sunflower, safflower), and the thylakoid membranes of leafy green vegetables.",
    },
    ageGroups: ["Young Adult (18–29)", "Adult (30–45)", "Older Adult / Masters (45+)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-k",
    slug: "vitamin-k",
    name: "Vitamin K (Phylloquinone & Menaquinones)",
    group: "Vitamins",
    subgroup: "Fat-Soluble",
    sortOrder: 7,
    performanceOneLiner:
      "Supports normal blood clotting and bone mineralization so your skeleton and tissues stay resilient.",
    summarized: {
      whatItDoes:
        "Helps your blood form clots so you don't bleed out from a paper cut, and glues calcium onto your bones.",
      threeFoods: "Kale, broccoli, natto (fermented soybeans).",
      bodyNeeds: "120 mcg (men) / 90 mcg (women).",
      averageAmericanGets: "~115–130 mcg/day.",
    },
    inDepth: {
      biochemicalFunction:
        "Serves as an essential cofactor for the endoplasmic reticulum enzyme gamma-glutamyl carboxylase, which catalyzes the post-translational carboxylation of specific glutamate (Glu) residues into gamma-carboxyglutamate (Gla) residues. These Gla domains chelate Ca2+ ions, inducing conformational changes required for hepatic coagulation factors II (prothrombin), VII, IX, and X, anticoagulant proteins C and S, osteoblast-derived osteocalcin (bone mineralization), and matrix Gla protein (inhibiting vascular calcification).",
      whereLocatedInFood:
        "Phylloquinone (K1) resides in the photosynthetic chloroplasts of dark green leafy vegetables and crucifers; menaquinones (K2) are synthesized by bacteria in fermented foods (natto, aged cheeses) and animal livers.",
    },
    ageGroups: ["Youth / Teen (Under 18)", "Adult (30–45)", "Older Adult / Masters (45+)"],
    updated_at: "2026-11-22",
  },

  // [VITAMINS - WATER-SOLUBLE: B-COMPLEX & C]
  {
    id: "nut-vitamin-b1",
    slug: "vitamin-b1-thiamin",
    name: "Vitamin B1 (Thiamin)",
    group: "Vitamins",
    subgroup: "Water-Soluble: B-Complex & C",
    sortOrder: 8,
    performanceOneLiner:
      "Helps convert carbohydrates into energy and supports nerve signaling for coordinated athletic movement.",
    summarized: {
      whatItDoes: "Turns carbs into usable energy and keeps your nerves firing properly.",
      threeFoods: "Pork chops, black beans, enriched white bread.",
      bodyNeeds: "1.2 mg (men) / 1.1 mg (women).",
      averageAmericanGets: "~1.5–1.8 mg/day.",
    },
    inDepth: {
      biochemicalFunction:
        "Phosphorylated by thiamin diphosphokinase into thiamin pyrophosphate (TPP), an indispensable coenzyme for oxidative decarboxylation complexes—specifically pyruvate dehydrogenase (linking glycolysis to the TCA cycle), alpha-ketoglutarate dehydrogenase, and branched-chain alpha-keto acid dehydrogenase—as well as transketolase in the pentose phosphate pathway (generating ribose-5-phosphate and NADPH).",
      whereLocatedInFood:
        "Found in the bran and germ of whole grains (and restored to refined flour via enrichment), porcine skeletal muscle, legumes, and yeast.",
    },
    ageGroups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-b2",
    slug: "vitamin-b2-riboflavin",
    name: "Vitamin B2 (Riboflavin)",
    group: "Vitamins",
    subgroup: "Water-Soluble: B-Complex & C",
    sortOrder: 9,
    performanceOneLiner:
      "Supports cellular energy production across carbs, fats, and proteins during sustained physical effort.",
    summarized: {
      whatItDoes:
        "Helps break down carbs, fats, and proteins for energy, and keeps your skin and eyes healthy.",
      threeFoods: "Milk, eggs, almonds.",
      bodyNeeds: "1.3 mg (men) / 1.1 mg (women).",
      averageAmericanGets: "~1.9–2.3 mg/day.",
    },
    inDepth: {
      biochemicalFunction:
        "Precursor to the flavin coenzymes flavin mononucleotide (FMN) and flavin adenine dinucleotide (FAD). Because their isoalloxazine rings can accept and donate one or two electrons, flavoproteins serve as critical redox carriers in mitochondrial Complex I (NADH dehydrogenase) and Complex II (succinate dehydrogenase), fatty acyl-CoA dehydrogenase (beta-oxidation), glutathione reductase, and pyridoxine phosphate oxidase.",
      whereLocatedInFood:
        "Dissolved in the aqueous whey fraction of milk, egg whites, organ meats, almonds, and enriched cereal grains.",
    },
    ageGroups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-b3",
    slug: "vitamin-b3-niacin",
    name: "Vitamin B3 (Niacin)",
    group: "Vitamins",
    subgroup: "Water-Soluble: B-Complex & C",
    sortOrder: 10,
    performanceOneLiner:
      "Drives metabolic energy pathways and cellular repair needed to bounce back from hard workouts.",
    summarized: {
      whatItDoes:
        "Powers hundreds of energy-making reactions in your cells and helps repair damaged DNA.",
      threeFoods: "Chicken breast, tuna, peanuts.",
      bodyNeeds: "16 mg NE (men) / 14 mg NE (women).",
      averageAmericanGets: "~24–28 mg NE/day.",
    },
    inDepth: {
      biochemicalFunction:
        "Nicotinic acid and nicotinamide are synthesized into nicotinamide adenine dinucleotide (NAD+) and its phosphorylated form (NADP+). NAD+ functions as a hydride-accepting cosubstrate for catabolic dehydrogenases feeding the electron transport chain, while NADPH supplies reducing equivalents for anabolic fatty acid/steroid synthesis and glutathione regeneration. NAD+ is also consumed as a substrate by PARPs (DNA repair) and sirtuins (epigenetic deacetylation).",
      whereLocatedInFood:
        "Bound within skeletal muscle tissues of poultry, fish, and beef, legumes, peanuts, and enriched grains (plus endogenous hepatic synthesis from tryptophan at a 60:1 ratio).",
    },
    ageGroups: ["Young Adult (18–29)", "Adult (30–45)", "Older Adult / Masters (45+)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-b5",
    slug: "vitamin-b5-pantothenic-acid",
    name: "Vitamin B5 (Pantothenic Acid)",
    group: "Vitamins",
    subgroup: "Water-Soluble: B-Complex & C",
    sortOrder: 11,
    performanceOneLiner:
      "Plays a central role in turning fuel into energy and synthesizing key performance-related compounds like hormones.",
    summarized: {
      whatItDoes: "Helps turn food into fuel and builds hormones and healthy fats.",
      threeFoods: "Shiitake mushrooms, chicken liver, avocados.",
      bodyNeeds: "5 mg/day.",
      averageAmericanGets: "~5–6 mg/day.",
    },
    inDepth: {
      biochemicalFunction:
        "Forms the core structural moiety of Coenzyme A (CoA) and the 4'-phosphopantetheine prosthetic group of acyl carrier protein (ACP). Via its terminal thiol (-SH) group, CoA forms high-energy thioester bonds with acyl groups (e.g., acetyl-CoA, succinyl-CoA), governing entry into the TCA cycle, fatty acid beta-oxidation, ketogenesis, and the acetylation of histones and proteins.",
      whereLocatedInFood:
        'Ubiquitous across nearly all living tissues ("pantos" = everywhere), concentrated in fungal mycelium (mushrooms), animal viscera, egg yolks, and avocados.',
    },
    ageGroups: ["Young Adult (18–29)", "Adult (30–45)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-b6",
    slug: "vitamin-b6-pyridoxine",
    name: "Vitamin B6 (Pyridoxine)",
    group: "Vitamins",
    subgroup: "Water-Soluble: B-Complex & C",
    sortOrder: 12,
    performanceOneLiner:
      "Supports protein metabolism, oxygen-carrying red blood cells, and neurotransmitter balance for focus and mood.",
    summarized: {
      whatItDoes:
        "Helps process protein, builds brain chemicals (like serotonin and dopamine) that control your mood, and makes red blood cells.",
      threeFoods: "Chickpeas, salmon, bananas.",
      bodyNeeds: "1.3 mg (ages 19–50); 1.7 mg (men 51+) / 1.5 mg (women 51+).",
      averageAmericanGets: "~1.9–2.3 mg/day.",
    },
    inDepth: {
      biochemicalFunction:
        "Converted into pyridoxal 5'-phosphate (PLP), an essential coenzyme for over 140 enzymatic reactions, predominantly involving amino acid metabolism via Schiff-base intermediates: transaminases (ALT, AST), decarboxylases (synthesizing serotonin, dopamine, GABA, and histamine), glycogen phosphorylase (glycogenolysis), and delta-aminolevulinate synthase (the rate-limiting step of heme biosynthesis).",
      whereLocatedInFood:
        "Found as pyridoxal/pyridoxamine phosphate in animal muscle tissue and fish, and as pyridoxine glucoside in legumes, starchy tubers, and fruits.",
    },
    ageGroups: [...ALL_AGES],
    ageGuidance: {
      "Older Adult / Masters (45+)":
        "Requirements step up slightly after age 50 (1.7 mg/day for men, 1.5 mg/day for women).",
    },
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-b7",
    slug: "vitamin-b7-biotin",
    name: "Vitamin B7 (Biotin)",
    group: "Vitamins",
    subgroup: "Water-Soluble: B-Complex & C",
    sortOrder: 13,
    performanceOneLiner:
      "Assists key enzymes in breaking down fats, carbs, and proteins into usable energy.",
    summarized: {
      whatItDoes:
        "Helps enzymes break down fats, carbs, and proteins, and supports healthy hair, skin, and nails.",
      threeFoods: "Cooked eggs, salmon, sunflower seeds.",
      bodyNeeds: "30 mcg/day.",
      averageAmericanGets:
        "~35–50 mcg/day (exact national estimates vary due to limited food-database coverage, though deficiency is rare).",
    },
    inDepth: {
      biochemicalFunction:
        "Covalently attached via an amide linkage to a lysine residue of five mammalian carboxylases, acting as a mobile CO2 carrier in ATP-dependent carboxylation reactions: pyruvate carboxylase (gluconeogenesis), acetyl-CoA carboxylase 1 & 2 (fatty acid synthesis/oxidation regulation), propionyl-CoA carboxylase (odd-chain fatty acid/amino acid catabolism), and methylcrotonyl-CoA carboxylase (leucine catabolism).",
      whereLocatedInFood:
        "Bound to proteins (biocytin) in avian egg yolks (heat denaturation of egg white avidin is required for bioavailability), organ meats, fish, and seeds.",
    },
    ageGroups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-b9",
    slug: "vitamin-b9-folate",
    name: "Vitamin B9 (Folate / Folic Acid)",
    group: "Vitamins",
    subgroup: "Water-Soluble: B-Complex & C",
    sortOrder: 14,
    performanceOneLiner:
      "Supports DNA synthesis and healthy cell division needed for tissue growth and recovery.",
    summarized: {
      whatItDoes:
        "Builds DNA and helps cells divide—super critical during pregnancy to prevent birth defects in the baby's spine and brain.",
      threeFoods: "Lentils, spinach, fortified breakfast cereal.",
      bodyNeeds: "400 mcg DFE/day (600 mcg during pregnancy).",
      averageAmericanGets: "~500–550 mcg DFE/day (largely due to mandatory grain fortification).",
    },
    inDepth: {
      biochemicalFunction:
        "Reduced to tetrahydrofolate (THF), which serves as a single-carbon carrier (methyl, methylene, formyl groups) essential for de novo purine (adenine, guanine) and pyrimidine (thymidylate via thymidylate synthase) nucleotide synthesis. Alongside Vitamin B12, 5-methyl-THF donates a methyl group to homocysteine via methionine synthase to regenerate methionine and S-adenosylmethionine (SAM), the universal methyl donor for DNA/histone methylation.",
      whereLocatedInFood:
        "Polyglutamated reduced folates reside in the chloroplasts of leafy greens and the cotyledons of legumes; synthetic oxidized pteroylmonoglutamic acid (folic acid) is fortified into enriched U.S. cereal grains.",
    },
    ageGroups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-b12",
    slug: "vitamin-b12-cobalamin",
    name: "Vitamin B12 (Cobalamin)",
    group: "Vitamins",
    subgroup: "Water-Soluble: B-Complex & C",
    sortOrder: 15,
    performanceOneLiner:
      "Keeps nerve pathways firing efficiently and supports red blood cell formation for stamina and energy.",
    summarized: {
      whatItDoes:
        "Keeps your nerves insulated like rubber coating on a wire, makes red blood cells, and helps build DNA.",
      threeFoods: "Clams, beef, fortified nutritional yeast.",
      bodyNeeds: "2.4 mcg/day.",
      averageAmericanGets:
        "~4.5–5.5 mcg/day (though absorption drops in older adults due to lower stomach acid).",
    },
    inDepth: {
      biochemicalFunction:
        "A cobalt-centered corrinoid ring required for two mammalian enzymes: cytosolic methionine synthase (using methylcobalamin to transfer a methyl group from 5-methyl-THF to homocysteine) and mitochondrial L-methylmalonyl-CoA mutase (using adenosylcobalamin to isomerize methylmalonyl-CoA to succinyl-CoA during odd-chain fatty acid and branched-chain amino acid catabolism). Deficiency traps folate and causes megaloblastic anemia and subacute combined degeneration of dorsal/lateral spinal columns.",
      whereLocatedInFood:
        "Synthesized exclusively by bacteria and archaea; bioaccumulates in the muscle, liver, and dairy of ruminants, bivalve mollusks (clams, oysters), and fish; absent in unfortified plants.",
    },
    ageGroups: ["Young Adult (18–29)", "Adult (30–45)", "Older Adult / Masters (45+)"],
    ageGuidance: {
      "Older Adult / Masters (45+)":
        "Food-bound B12 absorption drops with lower stomach acid; fortified foods or B12 status checks are especially helpful past age 50.",
    },
    updated_at: "2026-11-22",
  },
  {
    id: "nut-vitamin-c",
    slug: "vitamin-c-ascorbic-acid",
    name: "Vitamin C (Ascorbic Acid)",
    group: "Vitamins",
    subgroup: "Water-Soluble: B-Complex & C",
    sortOrder: 16,
    performanceOneLiner:
      "Supports collagen formation for tendons, ligaments, and skin, plus immune health and iron absorption.",
    summarized: {
      whatItDoes:
        "Makes collagen (the glue holding your skin, gums, and blood vessels together), heals wounds, boosts immunity, and helps you absorb iron from plants.",
      threeFoods: "Red bell peppers, oranges, strawberries.",
      bodyNeeds: "90 mg (men) / 75 mg (women).",
      averageAmericanGets: "~75–85 mg/day (roughly 40–45% of Americans fall short of the RDA).",
    },
    inDepth: {
      biochemicalFunction:
        "Functions as an aqueous electron-donating antioxidant and essential cofactor for Fe2+ and alpha-ketoglutarate-dependent dioxygenases. Notably, it maintains iron in its reduced ferrous (Fe2+) state for prolyl and lysyl hydroxylases, enabling cross-linking of procollagen into stable triple-helical collagen fibrils. It also catalyzes carnitine biosynthesis, dopamine beta-hydroxylation (norepinephrine synthesis), and reduces dietary non-heme ferric iron (Fe3+) to absorbable ferrous iron (Fe2+) in the duodenum.",
      whereLocatedInFood:
        "Synthesized from glucose in the cytosol and vacuoles of vascular plants, concentrated in the pericarp of citrus fruits, Capsicum peppers, berries, and cruciferous vegetables.",
    },
    ageGroups: [...ALL_AGES],
    updated_at: "2026-11-22",
  },

  // [MACROMINERALS >= 100 mg/day]
  {
    id: "nut-calcium",
    slug: "calcium",
    name: "Calcium (Ca)",
    group: "Macrominerals",
    subgroup: "≥ 100 mg/day",
    sortOrder: 17,
    performanceOneLiner:
      "Builds bone strength against impact stress and acts as a key trigger for muscle contraction.",
    summarized: {
      whatItDoes:
        'Makes your bones and teeth rock-hard, and acts as the "go" signal that tells your muscles to squeeze and your heart to beat.',
      threeFoods: "Yogurt, fortified tofu, collard greens.",
      bodyNeeds: "1,000 mg/day (1,200 mg for women 51+ and all adults 71+).",
      averageAmericanGets:
        "~950–1,050 mg/day (women and older adults frequently fall below recommendations).",
    },
    inDepth: {
      biochemicalFunction:
        "Roughly 99% is sequestered in the skeleton and teeth as crystalline hydroxyapatite (Ca10(PO4)6(OH)2). The remaining 1% is tightly regulated (8.5–10.5 mg/dL serum) by PTH, calcitriol, and calcitonin to serve as a ubiquitous intracellular second messenger. Influx of Ca2+ via voltage-gated channels triggers synaptic vesicle exocytosis, binds troponin C to expose actin-myosin cross-bridge binding sites in myocytes, and acts as Factor IV in the coagulation cascade.",
      whereLocatedInFood:
        "Complexed with casein micelles and whey in mammalian milk/dairy, precipitated as calcium sulfate in coagulated soy curd (tofu), and localized in the cell walls and vacuoles of low-oxalate Brassica greens.",
    },
    ageGroups: [...ALL_AGES],
    ageGuidance: {
      "Youth / Teen (Under 18)":
        "Peak bone mineral accrual happens in adolescence—pair calcium-rich meals with impact movement.",
      "Older Adult / Masters (45+)":
        "Needs increase to 1,200 mg/day for women 51+ and all adults 71+ to protect bone density.",
    },
    updated_at: "2026-11-22",
  },
  {
    id: "nut-phosphorus",
    slug: "phosphorus",
    name: "Phosphorus (P)",
    group: "Macrominerals",
    subgroup: "≥ 100 mg/day",
    sortOrder: 18,
    performanceOneLiner:
      "Essential for ATP energy transfer, muscle work, and bone structure alongside calcium.",
    summarized: {
      whatItDoes:
        "Teams up with calcium to build bones, forms the backbone of your DNA, and makes the energy currency (ATP) every cell spends.",
      threeFoods: "Chicken, salmon, lentils.",
      bodyNeeds: "700 mg/day.",
      averageAmericanGets: "~1,300–1,450 mg/day (nearly double the RDA).",
    },
    inDepth: {
      biochemicalFunction:
        "Primarily present as inorganic phosphate (PO4^3-); 85% complexes with calcium in bone hydroxyapatite. Intracellularly, high-energy phosphoanhydride bonds in adenosine triphosphate (ATP) and creatine phosphate drive endergonic cellular work; phosphodiester linkages form the sugar-phosphate backbone of DNA and RNA; phospholipids form biological membranes; and reversible protein phosphorylation via kinases/phosphatases regulates enzymatic signaling cascades.",
      whereLocatedInFood:
        "Bound organically to proteins, nucleic acids, and phospholipids in animal meats, fish, and dairy; stored as phytic acid (myo-inositol hexakisphosphate) in plant seeds/grains; and added as highly bioavailable inorganic phosphate salts in processed foods.",
    },
    ageGroups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-magnesium",
    slug: "magnesium",
    name: "Magnesium (Mg)",
    group: "Macrominerals",
    subgroup: "≥ 100 mg/day",
    sortOrder: 19,
    performanceOneLiner:
      "Supports muscle relaxation, steady heart rhythm, and energy reactions after hard physical exertion.",
    summarized: {
      whatItDoes:
        "The body’s relaxation mineral—helps muscles un-squeeze after calcium squeezes them, steadies heart rhythm, and runs over 300 body reactions.",
      threeFoods: "Pumpkin seeds, spinach, black beans.",
      bodyNeeds: "400–420 mg (men) / 310–320 mg (women).",
      averageAmericanGets: "~290–315 mg/day (over half of Americans fall below the EAR/RDA).",
    },
    inDepth: {
      biochemicalFunction:
        "An essential divalent cation cofactor for more than 300 enzymatic systems. All ATP-dependent kinases require magnesium bound as the biologically active Mg-ATP^2- complex to neutralize negative charges on the phosphate chain. It stabilizes ribosomal and nucleic acid conformations, modulates NMDA glutamate receptors and voltage-gated Ca2+ channels in neurons and cardiomyocytes, and serves as a cofactor for Na+/K+-ATPase.",
      whereLocatedInFood:
        "Chelated at the center of the porphyrin ring of chlorophyll molecules in green leafy vegetables, and stored within the bran, germ, and cotyledons of nuts, seeds, legumes, and whole grains.",
    },
    ageGroups: ["Young Adult (18–29)", "Adult (30–45)", "Older Adult / Masters (45+)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-sodium",
    slug: "sodium",
    name: "Sodium (Na)",
    group: "Macrominerals",
    subgroup: "≥ 100 mg/day",
    sortOrder: 20,
    performanceOneLiner:
      "Helps maintain fluid balance, blood volume, and rapid nerve/muscle signals when sweating.",
    summarized: {
      whatItDoes:
        "Holds water in your blood vessels to maintain blood pressure and sparks electrical signals along your nerves and muscles.",
      threeFoods: "Table salt, deli meats, canned soup.",
      bodyNeeds: "1,500 mg/day (AI); chronic disease risk reduction upper limit is 2,300 mg/day.",
      averageAmericanGets: "~3,300–3,500 mg/day (far above the recommended limit).",
    },
    inDepth: {
      biochemicalFunction:
        "The primary extracellular cation (~135–145 mEq/L), governing extracellular fluid osmolality and intravascular volume via the renin-angiotensin-aldosterone system (RAAS). Maintained in a steep transmembrane gradient (10:1 outside-to-inside) by Na+/K+-ATPase, rapid influx of Na+ through voltage-gated channels generates the depolarization phase of action potentials in neurons and myocytes, and drives secondary active cotransport (e.g., SGLT1 glucose uptake).",
      whereLocatedInFood:
        "Occurs in trace intrinsic amounts in fresh meats and vegetables; overwhelmingly introduced exogenously as sodium chloride (NaCl) and sodium preservatives in commercially processed foods, breads, condiments, and restaurant meals.",
    },
    ageGroups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-potassium",
    slug: "potassium",
    name: "Potassium (K)",
    group: "Macrominerals",
    subgroup: "≥ 100 mg/day",
    sortOrder: 21,
    performanceOneLiner:
      "Supports normal muscle contraction, nerve signaling, and fluid balance alongside sodium during training.",
    summarized: {
      whatItDoes:
        "Sodium’s counterweight—relaxes blood vessels to lower blood pressure, keeps your heart beating steadily, and stops muscle cramps.",
      threeFoods: "Baked potatoes, bananas, white beans.",
      bodyNeeds: "3,400 mg (men) / 2,600 mg (women).",
      averageAmericanGets: "~2,500–2,700 mg/day (substantially under-consumed by most adults).",
    },
    inDepth: {
      biochemicalFunction:
        "The predominant intracellular cation (~140–150 mEq/L vs. 3.5–5.0 mEq/L extracellularly), establishing the resting membrane potential (~ -70 to -90 mV) across excitable cell membranes via leak channels and Na+/K+-ATPase. Efflux of K+ mediates action potential repolarization, promotes endothelial nitric oxide release and vascular smooth muscle hyperpolarization (natriuresis and vasodilation), and activates pyruvate kinase in glycolysis.",
      whereLocatedInFood:
        "Concentrated inside the intracellular fluid (cytosol and vacuoles) of unprocessed plant tubers, legumes, fruits, leafy greens, and animal muscle cells.",
    },
    ageGroups: [...ALL_AGES],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-chloride",
    slug: "chloride",
    name: "Chloride (Cl)",
    group: "Macrominerals",
    subgroup: "≥ 100 mg/day",
    sortOrder: 22,
    performanceOneLiner:
      "Works with sodium to balance fluids and supports stomach acid needed to digest nutrients.",
    summarized: {
      whatItDoes:
        "Partners with sodium to balance body fluids and makes the acid in your stomach so you can digest food.",
      threeFoods: "Table salt, seaweed, tomatoes.",
      bodyNeeds: "2,300 mg/day (AI).",
      averageAmericanGets: "~5,000–5,400 mg/day (mirrors sodium chloride intake).",
    },
    inDepth: {
      biochemicalFunction:
        'The principal extracellular anion (~96–106 mEq/L), maintaining electroneutrality alongside Na+ and extracellular osmotic balance. Secreted by gastric parietal cells via apical Cl- channels alongside H+/K+-ATPase to form hydrochloric acid (HCl), facilitates CO2 transport in erythrocytes via the "chloride shift" (Band 3 Cl-/HCO3- exchanger), and mediates inhibitory neurotransmission via GABAA and glycine-gated Cl- channels.',
      whereLocatedInFood:
        "Almost exclusively paired with sodium as NaCl in table salt, sea vegetables, and salted processed foods.",
    },
    ageGroups: ["Young Adult (18–29)", "Adult (30–45)"],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-sulfur",
    slug: "sulfur",
    name: "Sulfur (S)",
    group: "Macrominerals",
    subgroup: "≥ 100 mg/day",
    sortOrder: 23,
    performanceOneLiner:
      "Helps stabilize protein structure and joint cartilage/detoxification pathways under physical stress.",
    summarized: {
      whatItDoes:
        "Gives proteins their 3D shape (which is why hair smells bad when burned), detoxifies chemicals in your liver, and builds joint cartilage.",
      threeFoods: "Eggs, garlic, chicken.",
      bodyNeeds:
        "No standalone RDA (met automatically when eating adequate protein containing methionine and cysteine; ~14 mg/kg/day of sulfur amino acids).",
      averageAmericanGets: "~800–1,100 mg/day (readily met via high protein intake).",
    },
    inDepth: {
      biochemicalFunction:
        "Incorporated primarily via the sulfur-containing amino acids methionine and cysteine. Oxidation of cysteine sulfhydryl (-SH) groups forms covalent disulfide bridges (-S-S-) that stabilize tertiary protein structures (keratin, insulin, immunoglobulins). Supplies the reactive thiol group of glutathione (GSH) for redox defense, forms iron-sulfur (Fe-S) clusters in mitochondrial electron transport complexes, and provides sulfate for glycosaminoglycans (chondroitin sulfate) and Phase II hepatic sulfation.",
      whereLocatedInFood:
        "Integrated into the polypeptide chains of animal proteins, legumes, and nuts, and stored as organosulfur compounds (alliin, glucosinolates) in Allium bulbs (garlic, onions) and Brassica vegetables.",
    },
    ageGroups: ["Adult (30–45)", "Older Adult / Masters (45+)"],
    updated_at: "2026-11-22",
  },

  // [MICROMINERALS / TRACE MINERALS < 100 mg/day]
  {
    id: "nut-iron",
    slug: "iron",
    name: "Iron (Fe)",
    group: "Trace Minerals",
    subgroup: "< 100 mg/day",
    sortOrder: 24,
    performanceOneLiner:
      "Carries oxygen in red blood cells and muscle tissue to sustain endurance and prevent early fatigue.",
    summarized: {
      whatItDoes:
        "Acts like a magnet on red blood cells that grabs oxygen from your lungs and delivers it to your muscles and brain so you don't feel exhausted.",
      threeFoods: "Beef, lentils, spinach.",
      bodyNeeds: "8 mg (men and women 51+) / 18 mg (women 19–50).",
      averageAmericanGets:
        "~14–16 mg/day (men easily meet needs; premenopausal women frequently fall short).",
    },
    inDepth: {
      biochemicalFunction:
        "Utilizes reversible oxidation states (Fe2+ <-> Fe3+) to coordinate oxygen and transfer electrons. Bound within porphyrin rings as heme, it forms the oxygen-binding prosthetic group of hemoglobin (erythrocytes), myoglobin (myocytes), and mitochondrial cytochromes (a, b, c) and cytochrome P450 enzymes. Non-heme iron forms Fe-S clusters in Complex I–III and aconitase, and is stored intracellularly in ferritin cages regulated by hepatic hepcidin.",
      whereLocatedInFood:
        "Heme iron (highly bioavailable, 15–35% absorption) is bound within myoglobin and hemoglobin of vertebrate meats and seafood; non-heme ferric iron (2–20% absorption) is stored in plant phytoferritin inside legumes, seeds, dark leafy greens, and fortified grains.",
    },
    ageGroups: ["Youth / Teen (Under 18)", "Young Adult (18–29)", "Adult (30–45)"],
    ageGuidance: {
      "Youth / Teen (Under 18)":
        "Supports expanding blood volume during growth spurts and endurance training.",
      "Young Adult (18–29)":
        "Premenopausal women need 18 mg/day; pair plant iron with Vitamin C to boost uptake.",
    },
    updated_at: "2026-11-22",
  },
  {
    id: "nut-zinc",
    slug: "zinc",
    name: "Zinc (Zn)",
    group: "Trace Minerals",
    subgroup: "< 100 mg/day",
    sortOrder: 25,
    performanceOneLiner:
      "Supports immune defense, tissue healing, and protein/DNA synthesis after demanding training.",
    summarized: {
      whatItDoes:
        "Your immune system’s repairman—heals cuts, fights off colds, lets you taste and smell food, and helps build DNA.",
      threeFoods: "Oysters, beef, pumpkin seeds.",
      bodyNeeds: "11 mg (men) / 8 mg (women).",
      averageAmericanGets: "~10.5–12 mg/day.",
    },
    inDepth: {
      biochemicalFunction:
        'A redox-inert divalent Lewis acid essential for the catalytic, structural, and regulatory function of over 300 metalloenzymes (carbonic anhydrase, alcohol dehydrogenase, alkaline phosphatase, matrix metalloproteinases) and Cu/Zn-superoxide dismutase. Structurally, it coordinates cysteine and histidine residues to form "zinc finger" motifs that stabilize transcription factors binding to DNA, while regulating thymulin secretion and T-lymphocyte maturation.',
      whereLocatedInFood:
        "Concentrated in the muscle tissues of red meat, poultry, and bivalve mollusks (oysters accumulate exceptionally high levels), and complexed with phytates in seeds, nuts, and legumes.",
    },
    ageGroups: [...ALL_AGES],
    updated_at: "2026-11-22",
  },
  {
    id: "nut-copper",
    slug: "copper",
    name: "Copper (Cu)",
    group: "Trace Minerals",
    subgroup: "< 100 mg/day",
    sortOrder: 26,
    performanceOneLiner:
      "Supports cellular energy production, iron utilization, and connective tissue/blood vessel strength.",
    summarized: {
      whatItDoes:
        "Helps your body use iron properly, makes energy, builds strong blood vessels and skin, and keeps nerves working.",
      threeFoods: "Beef liver, cashews, dark chocolate.",
      bodyNeeds: "0.9 mg (900 mcg)/day.",
      averageAmericanGets: "~1.1–1.3 mg/day.",
    },
    inDepth: {
      biochemicalFunction:
        "Cycles between cuprous (Cu+) and cupric (Cu2+) states in cuproenzymes: cytochrome c oxidase (Complex IV, reducing O2 to H2O in mitochondrial respiration), superoxide dismutase, lysyl oxidase (cross-linking collagen and elastin), and ferroxidases such as ceruloplasmin (oxidizing Fe2+ to Fe3+ for transferrin loading).",
      whereLocatedInFood:
        "Concentrated in organ meats (especially liver), shellfish, nuts, seeds, legumes, whole grains, and dark chocolate.",
    },
    ageGroups: ["Young Adult (18–29)", "Adult (30–45)", "Older Adult / Masters (45+)"],
    updated_at: "2026-11-22",
  },
];
