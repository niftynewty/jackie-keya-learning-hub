import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUnreadCount(userId: string | null) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null)
      .then(({ count: total }) => setCount(total ?? 0));
  }, [userId]);
  return count;
}
