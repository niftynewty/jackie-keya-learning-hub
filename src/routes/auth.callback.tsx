import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "@/components/site/page-meta";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => meta("Signing you in", "Completing your Jackie Keya Learning Hub sign-in."),
  component: Callback,
});

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      navigate({ to: "/auth", replace: true });
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        navigate({ to: "/dashboard", replace: true });
      }
    });

    const timer = setTimeout(finish, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <section className="mx-auto max-w-md px-5 py-24 text-center">
      <p className="text-sm text-muted-foreground">Completing your sign-in…</p>
    </section>
  );
}
