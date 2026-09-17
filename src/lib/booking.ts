export const sessionTypes = [
  { value: "discovery", label: "Discovery call", minutes: 30, copy: "A gentle first conversation to see what support fits your season." },
  { value: "healing", label: "Healing & fresh start session", minutes: 60, copy: "Focused one-to-one work on grief, release, and rebuilding confidence." },
  { value: "blended_family", label: "Blended family session", minutes: 60, copy: "Practical guidance for step-parents, couples, and co-parenting rhythms." },
  { value: "couple", label: "Couples conversation", minutes: 75, copy: "A guided space for two people to be heard and find a shared way forward." },
] as const;

export type SessionTypeValue = (typeof sessionTypes)[number]["value"];

export const sessionTypeLabel = (value: string) => sessionTypes.find((t) => t.value === value)?.label ?? value;

/** Weekday slots, 09:00 to 16:00 on the hour, in the visitor's local time. */
export function slotsForDay(day: Date): Date[] {
  const weekday = day.getDay();
  if (weekday === 0 || weekday === 6) return [];
  return [9, 10, 11, 12, 14, 15, 16].map((hour) => {
    const slot = new Date(day);
    slot.setHours(hour, 0, 0, 0);
    return slot;
  });
}

export const startOfDay = (day: Date) => { const d = new Date(day); d.setHours(0, 0, 0, 0); return d; };
export const endOfDay = (day: Date) => { const d = new Date(day); d.setHours(23, 59, 59, 999); return d; };
export const timeLabel = (value: Date | string) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
export const dayLabel = (value: Date | string) => new Date(value).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });
export const dateTimeLabel = (value: Date | string) => `${dayLabel(value)}, ${timeLabel(value)}`;
