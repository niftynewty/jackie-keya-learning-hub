import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/** Profile photo with private-bucket upload and signed preview URL. */
export function ProfileAvatar({ userId, path, name, onChange }: { userId: string; path: string | null; name: string; onChange: (path: string | null) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!path) return setUrl(null);
    supabase.storage.from("avatars").createSignedUrl(path, 3600).then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path]);

  async function upload(file: File) {
    setBusy(true);
    const key = `${userId}/avatar-${Date.now()}.${file.name.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("avatars").upload(key, file, { upsert: true });
    if (error) { setBusy(false); return toast.error(error.message); }
    const saved = await supabase.from("profiles").update({ avatar_url: key }).eq("id", userId);
    setBusy(false);
    if (saved.error) return toast.error(saved.error.message);
    if (path) await supabase.storage.from("avatars").remove([path]);
    onChange(key);
    toast.success("Profile photo updated");
  }

  async function remove() {
    if (!path) return;
    setBusy(true);
    await supabase.storage.from("avatars").remove([path]);
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    setBusy(false);
    if (error) return toast.error(error.message);
    onChange(null);
    toast.success("Photo removed");
  }

  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "J";

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div className="grid size-24 place-items-center overflow-hidden rounded-full border border-primary/30 bg-secondary/40 font-display text-3xl text-primary">
          {url ? <img src={url} alt={`${name} profile photo`} className="size-full object-cover" /> : initials}
        </div>
        {busy && <span className="absolute inset-0 grid place-items-center rounded-full bg-background/70"><Loader2 className="size-5 animate-spin text-primary" /></span>}
      </div>
      <div className="space-y-2">
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ""; }} />
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}><Camera />{path ? "Change photo" : "Add photo"}</Button>
        {path && <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={busy}><Trash2 />Remove</Button>}
        <p className="max-w-xs text-xs text-muted-foreground">A square image under 5MB works best. Only you and Jackie&apos;s team can see it.</p>
      </div>
    </div>
  );
}
