export type Course = {
  id: string; slug: string; title: string; category: "fresh_start" | "blended_family";
  short: string; outcome: string; audience: string; price: number; original?: number;
  duration: string; modules: number; lessons: number; tone: string;
};

export const courses: Course[] = [
  { id: "11111111-1111-4111-8111-111111111111", slug: "healing-a-heartbreak", title: "Healing a Heartbreak", category: "fresh_start", short: "A compassionate path through grief, release, and renewal.", outcome: "Feel steadier, understand your emotional patterns, and begin again without rushing your healing.", audience: "Anyone moving through a breakup, separation, divorce, or difficult emotional transition.", price: 4500, original: 5500, duration: "2h 03m", modules: 3, lessons: 4, tone: "Renewal" },
  { id: "22222222-2222-4222-8222-222222222222", slug: "beginning-again", title: "Beginning Again", category: "fresh_start", short: "Rebuild confidence and create a meaningful next chapter.", outcome: "Turn uncertainty into a clear, gentle plan for your next season.", audience: "Anyone starting over after loss, change, relocation, or a major personal turning point.", price: 3800, duration: "1h 35m", modules: 1, lessons: 1, tone: "Fresh start" },
  { id: "33333333-3333-4333-8333-333333333333", slug: "blended-family-harmony", title: "Blended Family Harmony", category: "blended_family", short: "Build trust, clarity, and connection in your blended home.", outcome: "Create a calmer family culture where every member can feel seen and secure.", audience: "Couples, biological parents, step-parents, and caregivers in blended families.", price: 6000, original: 7500, duration: "2h 48m", modules: 3, lessons: 3, tone: "Family harmony" },
  { id: "44444444-4444-4444-8444-444444444444", slug: "step-parenting-with-wisdom", title: "Step-Parenting with Wisdom", category: "blended_family", short: "Lead with warmth while protecting healthy boundaries.", outcome: "Develop a confident, patient step-parenting approach that supports the whole family.", audience: "New and experienced step-parents seeking clarity, connection, and sustainable boundaries.", price: 4200, duration: "1h 50m", modules: 1, lessons: 1, tone: "Boundaries" },
];

export const navigation = [
  ["Courses", "/courses"], ["Blended Families", "/blended-families"], ["New Beginnings", "/new-beginnings"], ["About Jackie", "/about"], ["Resources", "/resources"],
] as const;

export const fmt = (value: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(value).replace("KES", "KSh");
