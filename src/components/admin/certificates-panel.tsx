import { useState } from "react";
import { Award, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { useAdminData } from "./data";
import { Stat } from "./orders-panel";

export function CertificatesPanel({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  const { data, names, courseTitles, percent, reload } = admin;
  const [busy, setBusy] = useState<string | null>(null);

  const eligible = data.enrollments.filter((e) =>
    percent(e.user_id, e.course_id) === 100 && !data.certificates.some((c) => c.user_id === e.user_id && c.course_id === e.course_id));

  async function issue(userId: string, courseId: string) {
    setBusy(`${userId}-${courseId}`);
    const number = `JKLH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { error } = await supabase.from("certificates").insert({
      user_id: userId, course_id: courseId, certificate_number: number,
      recipient_name_formatted: names[userId] ?? "Student",
    });
    setBusy(null);
    error ? toast.error(error.message) : (toast.success("Certificate issued"), reload());
  }

  async function attachPdf(id: string, pdf_url: string) {
    const { error } = await supabase.from("certificates").update({ pdf_url: pdf_url || null }).eq("id", id);
    error ? toast.error(error.message) : (toast.success("Certificate link saved"), reload());
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat label="Certificates issued" value={String(data.certificates.length)} />
        <Stat label="Ready to issue" value={String(eligible.length)} />
        <Stat label="With a download file" value={String(data.certificates.filter((c) => c.pdf_url).length)} />
      </div>

      <h3 className="mt-10 font-display text-2xl">Ready to issue</h3>
      <div className="mt-4 space-y-3">
        {eligible.map((e) => (
          <div key={e.id} className="flex flex-wrap items-center justify-between gap-4 border border-border bg-card p-5">
            <p className="text-sm"><span className="font-medium">{names[e.user_id] ?? "Student"}</span> completed {courseTitles[e.course_id] ?? "a course"}.</p>
            <Button size="sm" disabled={busy === `${e.user_id}-${e.course_id}`} onClick={() => issue(e.user_id, e.course_id)}><BadgeCheck />Issue certificate</Button>
          </div>
        ))}
        {!eligible.length && <p className="text-sm text-muted-foreground">No completions are waiting for a certificate right now.</p>}
      </div>

      <h3 className="mt-10 font-display text-2xl">Issued certificates</h3>
      <div className="mt-4 space-y-3">
        {data.certificates.map((c) => (
          <div key={c.id} className="flex flex-wrap items-end justify-between gap-4 border border-border bg-card p-5">
            <div>
              <p className="flex items-center gap-2 font-display text-xl italic"><Award className="size-4 text-primary" />{c.recipient_name_formatted}</p>
              <p className="mt-1 text-sm text-muted-foreground">{courseTitles[c.course_id] ?? "Course"} · {c.certificate_number} · {new Date(c.issued_at).toLocaleDateString()}</p>
            </div>
            <PdfField id={c.id} value={c.pdf_url ?? ""} onSave={attachPdf} />
          </div>
        ))}
        {!data.certificates.length && <p className="text-sm text-muted-foreground">No certificates issued yet.</p>}
      </div>
    </div>
  );
}

function PdfField({ id, value, onSave }: { id: string; value: string; onSave: (id: string, url: string) => void }) {
  const [url, setUrl] = useState(value);
  return (
    <div className="flex items-end gap-2">
      <Input className="w-64" placeholder="Certificate PDF link" value={url} onChange={(e) => setUrl(e.target.value)} />
      <Button size="sm" variant="outline" onClick={() => onSave(id, url)}>Save link</Button>
    </div>
  );
}
