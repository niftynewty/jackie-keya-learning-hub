import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function Field({ label, hint, children }: { label: string; hint?: string | undefined; children: ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">{label}</Label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({ label, hint, value, onChange, type = "text" }: { label: string; hint?: string | undefined; value: string; onChange: (v: string) => void; type?: string }) {
  return <Field label={label} hint={hint}><Input type={type} value={value} onChange={(e) => onChange(e.target.value)} /></Field>;
}

export function AreaField({ label, hint, value, onChange, rows = 4 }: { label: string; hint?: string | undefined; value: string; onChange: (v: string) => void; rows?: number }) {
  return <Field label={label} hint={hint}><Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /></Field>;
}

export function ChoiceField({ label, hint, value, options, onChange, allowEmpty = true }: { label: string; hint?: string | undefined; value: string; options: ReadonlyArray<string | readonly [string, string]>; onChange: (v: string) => void; allowEmpty?: boolean }) {
  const pairs = options.map((option) => (typeof option === "string" ? [option, option] as const : option));
  return (
    <Field label={label} hint={hint}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-primary">
        {allowEmpty && <option value="">Not specified</option>}
        {pairs.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
      </select>
    </Field>
  );
}

export function ChipField({ label, hint, values, options, onChange }: { label: string; hint?: string | undefined; values: string[]; options: readonly string[]; onChange: (v: string[]) => void }) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button key={option} type="button" onClick={() => onChange(active ? values.filter((v) => v !== option) : [...values, option])}
              className={cn("flex items-center gap-1.5 border px-3 py-1.5 text-xs", active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-foreground")}>
              {option}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

export function ToggleRow({ label, copy, checked, onChange }: { label: string; copy: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-4 last:border-0">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">{copy}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SectionCard({ title, copy, children, actions }: { title: string; copy?: string | undefined; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="border border-border bg-card p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">{title}</h2>
          {copy && <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{copy}</p>}
        </div>
        {actions}
      </div>
      <div className="mt-7">{children}</div>
    </section>
  );
}
