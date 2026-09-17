import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { fmt } from "@/lib/site-data";

type Course = Tables<"courses">;
type Module = Tables<"modules">;
type Lesson = Tables<"lessons">;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function CoursesPanel() {
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
      access_days: draft.access_days, is_published: draft.is_published,
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
    error ? toast.error(error.message) : loadCurriculum(draft.id);
  }
  async function saveModule(module: Module) {
    const { error } = await supabase.from("modules").update({ title: module.title, description: module.description, sort_order: module.sort_order }).eq("id", module.id);
    error ? toast.error(error.message) : toast.success("Module saved");
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
    }).eq("id", lesson.id);
    error ? toast.error(error.message) : toast.success("Lesson saved");
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
          {courses.map((course) => (
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
              <Field label="Full description" wide><Textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
              <Field label="Outcome" wide><Textarea rows={2} value={draft.outcome} onChange={(e) => setDraft({ ...draft, outcome: e.target.value })} /></Field>
              <Field label="Who it is for" wide><Textarea rows={2} value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value })} /></Field>
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
                        <Button variant="outline" onClick={() => saveLesson(lesson)}><Save />Save</Button>
                        <Button variant="ghost" size="icon" aria-label="Delete lesson" onClick={() => removeLesson(lesson.id)}><Trash2 /></Button>
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
