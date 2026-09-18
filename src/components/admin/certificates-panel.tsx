import { useMemo, useState } from "react";
import { Award, BadgeCheck, Download, Eye, Plus, RefreshCw, RotateCcw, ShieldX } from "@/components/ui/icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { useAdminData } from "./data";
import { Stat } from "./orders-panel";
import { CertificateArtwork } from "@/components/certificate/certificate-artwork";
import { certificateTemplates, getCertificateTemplate } from "@/lib/certificate-templates";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";

function newCode() {
  return `JKLH-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function CertificatesPanel({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  const { data, names, courseTitles, percent, reload } = admin;
  const [busy, setBusy] = useState<string | null>(null);

  const eligible = data.enrollments.filter((e) =>
    percent(e.user_id, e.course_id) === 100 && !data.certificates.some((c) => c.user_id === e.user_id && c.course_id === e.course_id));

  async function issue(userId: string, courseId: string) {
    setBusy(`${userId}-${courseId}`);
    const course = data.courses.find((item) => item.id === courseId);
    const { error } = await supabase.from("certificates").insert({
      user_id: userId, course_id: courseId, certificate_number: newCode(),
      recipient_name_formatted: names[userId] ?? "Student",
      template_id: course?.certificate_template ?? "heritage-curve",
    });
    setBusy(null);
    error ? toast.error(error.message) : (toast.success("Certificate issued"), reload());
  }

  async function setStatus(id: string, revoked: boolean) {
    const { error } = await supabase.from("certificates").update({ status: revoked ? "revoked" : "valid", revoked_at: revoked ? new Date().toISOString() : null }).eq("id", id);
    error ? toast.error(error.message) : (toast.success(revoked ? "Certificate revoked" : "Certificate restored"), reload());
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Certificates</h2>
        <IssueCertificateDialog admin={admin} />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Certificates issued" value={String(data.certificates.length)} />
        <Stat label="Ready to issue" value={String(eligible.length)} />
        <Stat label="Active certificates" value={String(data.certificates.filter((c) => c.status !== "revoked").length)} />
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
          <div key={c.id} className="grid gap-5 border border-border bg-card p-5 lg:grid-cols-[260px_1fr_auto] lg:items-center">
            <CertificateArtwork compact recipient={c.recipient_name_formatted} course={courseTitles[c.course_id] ?? "Course"} issuedAt={c.issued_at} code={c.certificate_number} templateId={c.template_id} status={c.status} />
            <div>
              <p className="flex items-center gap-2 font-display text-xl italic"><Award className="size-4 text-primary" />{c.recipient_name_formatted}</p>
              <p className="mt-1 text-sm text-muted-foreground">{courseTitles[c.course_id] ?? "Course"} · {c.certificate_number}</p>
              <p className="mt-1 text-xs capitalize text-muted-foreground">{getCertificateTemplate(c.template_id).name} · {new Date(c.issued_at).toLocaleDateString()} · {c.status}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-40">
              <Button size="sm" variant="outline" onClick={() => downloadCertificatePdf({ recipient: c.recipient_name_formatted, course: courseTitles[c.course_id] ?? "Course", issuedAt: c.issued_at, code: c.certificate_number, templateId: c.template_id })} disabled={c.status === "revoked"}><Download />Download</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(c.id, c.status !== "revoked")}>{c.status === "revoked" ? <><RotateCcw />Restore</> : <><ShieldX />Revoke</>}</Button>
            </div>
          </div>
        ))}
        {!data.certificates.length && <p className="text-sm text-muted-foreground">No certificates issued yet.</p>}
      </div>
    </div>
  );
}

function IssueCertificateDialog({ admin }: { admin: ReturnType<typeof useAdminData> }) {
  const { data, names, reload } = admin;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(newCode());
  const [issuedAt, setIssuedAt] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const selectedCourse = data.courses.find((course) => course.id === courseId);
  const [templateId, setTemplateId] = useState("heritage-curve");

  const students = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.profiles
      .filter((p) => !q || `${p.display_name} ${p.phone ?? ""}`.toLowerCase().includes(q))
      .slice(0, 40);
  }, [data.profiles, query]);

  function selectStudent(id: string) {
    setUserId(id);
    setName(names[id] ?? "Student");
  }

  function reset() {
    setQuery(""); setUserId(""); setCourseId(""); setName(""); setCode(newCode()); setTemplateId("heritage-curve");
    setIssuedAt(new Date().toISOString().slice(0, 10));
  }

  async function save() {
    if (!userId) { toast.error("Choose a student first"); return; }
    if (!courseId) { toast.error("Choose a course"); return; }
    if (!code.trim()) { toast.error("A verification code is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("certificates").insert({
      user_id: userId,
      course_id: courseId,
      certificate_number: code.trim(),
      recipient_name_formatted: name.trim() || names[userId] || "Student",
      issued_at: new Date(`${issuedAt}T09:00:00`).toISOString(),
      template_id: templateId,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Certificate created and added to the student's portal");
    setOpen(false); reset(); reload();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button><Plus />Issue new certificate</Button>
      </DialogTrigger>
       <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Issue a certificate</DialogTitle>
          <DialogDescription>Choose the student and the course they completed. The certificate appears in their portal straight away.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label>Student</Label>
            <Input className="mt-2" placeholder="Search students by name or phone" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="mt-2 max-h-44 overflow-y-auto border border-border">
              {students.map((p) => (
                <button key={p.id} type="button" onClick={() => selectStudent(p.id)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${userId === p.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  <span>{p.display_name || "Student"}</span>
                  <span className="text-xs opacity-70">{p.phone ?? ""}</span>
                </button>
              ))}
              {!students.length && <p className="px-3 py-2 text-sm text-muted-foreground">No students match that search.</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="cert-course">Course completed</Label>
            <select id="cert-course" value={courseId} onChange={(e) => { const id = e.target.value; setCourseId(id); setTemplateId(data.courses.find((c) => c.id === id)?.certificate_template ?? "heritage-curve"); }}
              className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm">
              <option value="">Select a course</option>
              {data.courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="cert-name">Name on the certificate</Label>
            <Input id="cert-name" className="mt-2" placeholder="Full name as it should appear" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cert-code">Verification code</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input id="cert-code" value={code} onChange={(e) => setCode(e.target.value)} />
                <Button type="button" size="icon" variant="outline" onClick={() => setCode(newCode())} aria-label="Generate a new code"><RefreshCw /></Button>
              </div>
            </div>
            <div>
              <Label htmlFor="cert-date">Issue date</Label>
              <Input id="cert-date" className="mt-2" type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Certificate template</Label>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
              {certificateTemplates.map((template) => <button key={template.id} type="button" onClick={() => setTemplateId(template.id)} className={`min-w-36 border p-3 text-left ${templateId === template.id ? "border-primary bg-primary/10" : "border-border"}`}><span className="text-sm font-medium">{template.name}</span><span className="mt-1 block text-xs text-muted-foreground">{template.description}</span></button>)}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground"><Eye className="size-4"/>Live preview</div>
            <CertificateArtwork recipient={name || "Student Name"} course={selectedCourse?.title ?? "Course title"} issuedAt={`${issuedAt}T09:00:00`} code={code || "JKLH-PREVIEW"} templateId={templateId}/>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={saving} onClick={save}><BadgeCheck />{saving ? "Saving…" : "Create certificate"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
