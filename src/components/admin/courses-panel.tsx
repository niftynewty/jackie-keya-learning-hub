import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "@/components/ui/icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { fmt } from "@/lib/site-data";
import { CertificateArtwork } from "@/components/certificate/certificate-artwork";
import { certificateTemplates } from "@/lib/certificate-templates";

type Course = Tables<"courses">;
type Module = Tables<"modules">;
type Lesson = Tables<"lessons">;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function CoursesPanel({ search = "" }: { search?: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  async function loadCourses() {
    const { data } = await supabase.from("courses").select("*").order("created_at");
    setCourses(data ?? []);
    return data ?? [];
  }
  async function loadCurriculum(courseId: string) {
    const { data: mods } = await supabase.from("modules").select("*").eq("course_id", courseId).order("sort_order");
    setModules(mods ?? []);
    const ids = (mods ?? []).map((m) => m.id);
    if (!ids.length) { setLessons([]); return; }
    const { data: les } = await supabase.from("lessons").select("*").in("module_id", ids).order("sort_order");
    setLessons(les ?? []);
  }

  useEffect(() => { loadCourses().then((list) => { if (list[0]) setActiveId(list[0].id); }); }, []);
  useEffect(() => {
    if (!activeId) { setDraft(null); return; }
    const course = courses.find((c) => c.id === activeId) ?? null;
    setDraft(course);
    if (activeId !== "new") loadCurriculum(activeId);
  }, [activeId, courses]);

  async function createCourse() {
    const { data, error } = await supabase.from("courses").insert({
      title: "Untitled course", slug: `untitled-${Date.now().toString(36)}`, short_description: "", description: "",
      outcome: "", audience: "", category: "fresh_start", price_kes: 0, is_published: false,
    }).select().single();
    if (error || !data) { toast.error(error?.message ?? "Could not create course"); return; }
    await loadCourses();
    setActiveId(data.id);
    toast.success("Draft course created");
  }

  async function saveCourse() {
    if (!draft) return;
    const { error } = await supabase.from("courses").update({
      title: draft.title, slug: slugify(draft.slug || draft.title), short_description: draft.short_description,
      description: draft.description, outcome: draft.outcome, audience: draft.audience, category: draft.category,
      price_kes: draft.price_kes, original_price_kes: draft.original_price_kes, duration_minutes: draft.duration_minutes,
      access_days: draft.access_days, is_published: draft.is_published, status: draft.is_published ? "published" : draft.status,
      instructor: draft.instructor, difficulty: draft.difficulty, trailer_url: draft.trailer_url, thumbnail_url: draft.thumbnail_url,
      sale_price_kes: draft.sale_price_kes, sale_starts_at: draft.sale_starts_at, sale_ends_at: draft.sale_ends_at,
      seo_title: draft.seo_title, seo_description: draft.seo_description,
      certificate_template: draft.certificate_template,
    }).eq("id", draft.id);
    if (error) { toast.error(error.message); return; }
    await loadCourses();
    toast.success("Course saved");
  }

  async function removeCourse(id: string) {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    const list = await loadCourses();
    setActiveId(list[0]?.id ?? null);
    toast.success("Course removed");
  }

  async function addModule() {
    if (!draft) return;
    const { error } = await supabase.from("modules").insert({ course_id: draft.id, title: "New module", sort_order: modules.length + 1 });
    if (error) {
      toast.error(error.message);
      return;
    }
    loadCurriculum(draft.id);
  }
  async function saveModule(module: Module) {
    const { error } = await supabase.from("modules").update({ title: module.title, description: module.description, sort_order: module.sort_order, is_published: module.is_published }).eq("id", module.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Module saved");
  }
  async function removeModule(id: string) {
    const { error } = await supabase.from("modules").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (draft) loadCurriculum(draft.id);
  }
  async function addLesson(moduleId: string) {
    const count = lessons.filter((l) => l.module_id === moduleId).length;
    const { error } = await supabase.from("lessons").insert({ module_id: moduleId, title: "New lesson", sort_order: count + 1, duration_seconds: 600 });
    if (error) { toast.error(error.message); return; }
    if (draft) loadCurriculum(draft.id);
  }
  async function saveLesson(lesson: Lesson) {
    const { error } = await supabase.from("lessons").update({
      title: lesson.title, description: lesson.description, duration_seconds: lesson.duration_seconds,
      is_preview: lesson.is_preview, bunny_video_id: lesson.bunny_video_id, sort_order: lesson.sort_order,
      written_content: lesson.written_content, thumbnail_url: lesson.thumbnail_url, resource_label: lesson.resource_label,
      resource_url: lesson.resource_url, is_required: lesson.is_required, access_level: lesson.access_level, completion_rule: lesson.completion_rule,
    }).eq("id", lesson.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Lesson saved");
  }
  async function removeLesson(id: string) {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (draft) loadCurriculum(draft.id);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <Button className="w-full" onClick={createCourse}><Plus />New course</Button>
        <div className="mt-5 space-y-2">
          {courses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase())).map((course) => (
            <button key={course.id} type="button" onClick={() => setActiveId(course.id)}
              className={`w-full border p-4 text-left ${activeId === course.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"}`}>
              <p className="font-medium">{course.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{fmt(course.price_kes)} · {course.is_published ? "Published" : "Draft"}</p>
            </button>
          ))}
          {!courses.length && <p className="text-sm text-muted-foreground">No courses yet.</p>}
        </div>
      </aside>

      {draft ? (
        <div className="space-y-8">
          <section className="border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-display text-2xl">Course details</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} />Published</label>
                <Button onClick={saveCourse}><Save />Save</Button>
                <Button variant="ghost" size="icon" aria-label="Delete course" onClick={() => removeCourse(draft.id)}><Trash2 /></Button>
              </div>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Title"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
              <Field label="Slug"><Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></Field>
              <Field label="Track">
                <select className="h-9 w-full border border-input bg-background px-3 text-sm" value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as Course["category"] })}>
                  <option value="fresh_start">Fresh start</option>
                  <option value="blended_family">Blended family</option>
                </select>
              </Field>
              <Field label="Price (KES)"><Input type="number" value={draft.price_kes} onChange={(e) => setDraft({ ...draft, price_kes: Number(e.target.value) })} /></Field>
              <Field label="Original price (KES)"><Input type="number" value={draft.original_price_kes ?? ""} onChange={(e) => setDraft({ ...draft, original_price_kes: e.target.value ? Number(e.target.value) : null })} /></Field>
              <Field label="Duration (minutes)"><Input type="number" value={draft.duration_minutes} onChange={(e) => setDraft({ ...draft, duration_minutes: Number(e.target.value) })} /></Field>
              <Field label="Access days"><Input type="number" value={draft.access_days} onChange={(e) => setDraft({ ...draft, access_days: Number(e.target.value) })} /></Field>
              <Field label="Short description"><Input value={draft.short_description} onChange={(e) => setDraft({ ...draft, short_description: e.target.value })} /></Field>
              <Field label="Instructor"><Input value={draft.instructor} onChange={(e) => setDraft({ ...draft, instructor: e.target.value })} /></Field>
              <Field label="Difficulty"><select className="h-9 w-full border border-input bg-background px-3 text-sm" value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })}><option value="all_levels">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></Field>
              <Field label="Thumbnail link"><Input value={draft.thumbnail_url ?? ""} onChange={(e) => setDraft({ ...draft, thumbnail_url: e.target.value || null })} /></Field>
              <Field label="Trailer / preview link"><Input value={draft.trailer_url ?? ""} onChange={(e) => setDraft({ ...draft, trailer_url: e.target.value || null })} /></Field>
              <Field label="Sale price (KES)"><Input type="number" value={draft.sale_price_kes ?? ""} onChange={(e) => setDraft({ ...draft, sale_price_kes: e.target.value ? Number(e.target.value) : null })} /></Field>
              <Field label="Sale starts"><Input type="datetime-local" value={draft.sale_starts_at?.slice(0,16) ?? ""} onChange={(e) => setDraft({ ...draft, sale_starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></Field>
              <Field label="Sale ends"><Input type="datetime-local" value={draft.sale_ends_at?.slice(0,16) ?? ""} onChange={(e) => setDraft({ ...draft, sale_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></Field>
              <Field label="Full description" wide><Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
              <Field label="Outcome" wide><Textarea rows={2} value={draft.outcome} onChange={(e) => setDraft({ ...draft, outcome: e.target.value })} /></Field>
              <Field label="Who it is for" wide><Textarea rows={2} value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} /></Field>
              <Field label="SEO title" wide><Input value={draft.seo_title ?? ""} onChange={(e) => setDraft({ ...draft, seo_title: e.target.value || null })} /></Field>
              <Field label="SEO description" wide><Textarea rows={2} value={draft.seo_description ?? ""} onChange={(e) => setDraft({ ...draft, seo_description: e.target.value || null })} /></Field>
            </div>
          </section>

          <section className="border border-border bg-card p-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Certificate design</p>
              <h3 className="mt-2 font-display text-2xl">Choose this course’s award</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">New certificates inherit this design. Certificates already issued keep their original design.</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {certificateTemplates.map((template) => (
                <button key={template.id} type="button" onClick={() => setDraft({ ...draft, certificate_template: template.id })}
                  className={`p-3 text-left transition ${draft.certificate_template === template.id ? "bg-primary/10 ring-2 ring-primary" : "border border-border hover:border-primary/60"}`}>
                  <CertificateArtwork compact recipient="Student Name" course={draft.title || "Course title"} issuedAt={new Date().toISOString()} code="JKLH-PREVIEW" templateId={template.id} />
                  <p className="mt-3 font-medium">{template.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl">Curriculum</h3>
              <Button variant="outline" onClick={addModule}><Plus />Add module</Button>
            </div>
            <div className="mt-6 space-y-6">
              {modules.map((module) => (
                <div key={module.id} className="border border-border p-5">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-56 flex-1"><Label className="text-xs">Module title</Label>
                      <Input className="mt-2" value={module.title} onChange={(e) => setModules(modules.map((m) => m.id === module.id ? { ...m, title: e.target.value } : m))} /></div>
                    <div className="w-24"><Label className="text-xs">Order</Label>
                      <Input className="mt-2" type="number" value={module.sort_order} onChange={(e) => setModules(modules.map((m) => m.id === module.id ? { ...m, sort_order: Number(e.target.value) } : m))} /></div>
                    <label className="flex items-center gap-2 pb-2 text-xs"><Switch checked={module.is_published} onCheckedChange={(v) => setModules(modules.map((m) => m.id === module.id ? { ...m, is_published: v } : m))} />Published</label>
                    <Button variant="outline" onClick={() => saveModule(module)}><Save />Save</Button>
                    <Button variant="ghost" size="icon" aria-label="Delete module" onClick={() => removeModule(module.id)}><Trash2 /></Button>
                  </div>
                  <div className="mt-5 space-y-3">
                    {lessons.filter((l) => l.module_id === module.id).map((lesson) => (
                      <div key={lesson.id} className="flex flex-wrap items-end gap-3 border border-border/70 bg-background p-4">
                        <div className="min-w-52 flex-1"><Label className="text-xs">Lesson</Label>
                          <Input className="mt-2" value={lesson.title} onChange={(e) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, title: e.target.value } : l))} /></div>
                        <div className="w-32"><Label className="text-xs">Seconds</Label>
                          <Input className="mt-2" type="number" value={lesson.duration_seconds} onChange={(e) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, duration_seconds: Number(e.target.value) } : l))} /></div>
                        <div className="w-40"><Label className="text-xs">Video ID</Label>
                          <Input className="mt-2" value={lesson.bunny_video_id ?? ""} onChange={(e) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, bunny_video_id: e.target.value } : l))} /></div>
                        <label className="flex items-center gap-2 pb-2 text-xs"><Switch checked={lesson.is_preview} onCheckedChange={(v) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, is_preview: v } : l))} />Free preview</label>
                        <label className="flex items-center gap-2 pb-2 text-xs"><Switch checked={lesson.is_required} onCheckedChange={(v) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, is_required: v } : l))} />Required</label>
                        <div className="w-32"><Label className="text-xs">Access</Label><select className="mt-2 h-9 w-full border border-input bg-background px-2 text-xs" value={lesson.access_level} onChange={(e) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, access_level: e.target.value } : l))}><option value="free">Free</option><option value="paid">Paid only</option><option value="locked">Locked</option></select></div>
                        <div className="w-40"><Label className="text-xs">Completion</Label><select className="mt-2 h-9 w-full border border-input bg-background px-2 text-xs" value={lesson.completion_rule} onChange={(e) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, completion_rule: e.target.value } : l))}><option value="manual">Mark manually</option><option value="video_complete">Finish video</option><option value="quiz_pass">Pass quiz</option></select></div>
                        <Button variant="outline" onClick={() => saveLesson(lesson)}><Save />Save</Button>
                        <Button variant="ghost" size="icon" aria-label="Delete lesson" onClick={() => removeLesson(lesson.id)}><Trash2 /></Button>
                        <div className="grid w-full gap-3 border-t border-border pt-4 md:grid-cols-2">
                          <Field label="Lesson description"><Textarea rows={2} value={lesson.description ?? ""} onChange={(e) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, description: e.target.value } : l))} /></Field>
                          <Field label="Written content"><Textarea rows={2} value={lesson.written_content ?? ""} onChange={(e) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, written_content: e.target.value } : l))} /></Field>
                          <Field label="Resource name"><Input value={lesson.resource_label ?? ""} onChange={(e) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, resource_label: e.target.value } : l))} /></Field>
                          <Field label="Resource link"><Input value={lesson.resource_url ?? ""} onChange={(e) => setLessons(lessons.map((l) => l.id === lesson.id ? { ...l, resource_url: e.target.value } : l))} /></Field>
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => addLesson(module.id)}><Plus />Add lesson</Button>
                  </div>
                </div>
              ))}
              {!modules.length && <p className="text-sm text-muted-foreground">No modules yet. Add the first one to start building this course.</p>}
            </div>
          </section>
        </div>
      ) : <p className="text-sm text-muted-foreground">Select or create a course to begin.</p>}
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <div className={wide ? "md:col-span-2" : undefined}><Label className="text-xs">{label}</Label><div className="mt-2">{children}</div></div>;
}
