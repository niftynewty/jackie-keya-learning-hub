import { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Notification = Tables<"notifications">;

export function NotificationsPanel({ userId }: { userId: string }) {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, [userId]);

  async function markRead(id: string) {
    const read_at = new Date().toISOString();
    const { error } = await supabase.from("notifications").update({ read_at }).eq("id", id);
    error ? toast.error(error.message) : setItems((list) => list.map((n) => n.id === id ? { ...n, read_at } : n));
  }
  async function markAll() {
    const read_at = new Date().toISOString();
    const { error } = await supabase.from("notifications").update({ read_at }).eq("user_id", userId).is("read_at", null);
    error ? toast.error(error.message) : setItems((list) => list.map((n) => n.read_at ? n : { ...n, read_at }));
  }
  async function remove(id: string) {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    error ? toast.error(error.message) : setItems((list) => list.filter((n) => n.id !== id));
  }

  const unread = items.filter((n) => !n.read_at).length;

  if (!items.length) return (
    <div className="border border-border bg-card p-10 text-center">
      <Bell className="mx-auto size-8 text-primary" />
      <h2 className="mt-5 font-display text-3xl">Nothing new right now</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">Enrolments, certificates, session updates, and notes from Jackie will appear here.</p>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl">Notifications {unread > 0 && <span className="align-middle text-sm text-primary">{unread} new</span>}</h2>
        {unread > 0 && <Button variant="outline" size="sm" onClick={markAll}><Check />Mark all read</Button>}
      </div>
      <div className="mt-6 space-y-3">
        {items.map((n) => (
          <article key={n.id} className={`flex flex-wrap items-start justify-between gap-4 border p-5 ${n.read_at ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">{n.kind}</p>
              <h3 className="mt-2 font-medium">{n.title}</h3>
              {n.body && <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{n.body}</p>}
              <p className="mt-3 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              {!n.read_at && <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}><Check />Read</Button>}
              <Button variant="ghost" size="icon" aria-label="Delete notification" onClick={() => remove(n.id)}><Trash2 /></Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function useUnreadCount(userId: string | null) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!userId) return;
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("read_at", null)
      .then(({ count: total }) => setCount(total ?? 0));
  }, [userId]);
  return count;
}
