import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { fmt } from "@/lib/site-data";

type Payment = Tables<"payments">;

export function OrdersPanel({ names, courseTitles }: { names: Record<string, string>; courseTitles: Record<string, string> }) {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => { supabase.from("payments").select("*").order("created_at", { ascending: false }).then(({ data }) => setPayments(data ?? [])); }, []);

  async function setStatus(payment: Payment, status: Payment["status"]) {
    const { error } = await supabase.from("payments").update({ status }).eq("id", payment.id);
    if (error) { toast.error(error.message); return; }
    setPayments((list) => list.map((p) => p.id === payment.id ? { ...p, status } : p));
    toast.success("Order updated");
  }

  const total = payments.filter((p) => p.status === "successful").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat label="Orders" value={String(payments.length)} />
        <Stat label="Collected" value={fmt(total)} />
        <Stat label="Awaiting confirmation" value={String(payments.filter((p) => p.status === "pending").length)} />
      </div>
      <p className="mt-6 text-sm text-muted-foreground">Payments are recorded manually or through the simulated checkout. Update a status once you have confirmed the funds.</p>
      <div className="mt-6 overflow-x-auto border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase text-muted-foreground">
            <tr><th className="p-4">Date</th><th className="p-4">Student</th><th className="p-4">Course</th><th className="p-4">Amount</th><th className="p-4">Method</th><th className="p-4">Reference</th><th className="p-4">Status</th></tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-4">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="p-4">{names[p.user_id] ?? "Student"}</td>
                <td className="p-4">{p.course_id ? courseTitles[p.course_id] ?? "Not available" : "Not available"}</td>
                <td className="p-4 font-semibold">{fmt(p.amount)}</td>
                <td className="p-4">{p.provider === "mpesa_direct" ? "M-Pesa (manual)" : "Paystack"}</td>
                <td className="p-4 font-mono text-xs">{p.provider_transaction_id}</td>
                <td className="p-4">
                  <select className="h-9 border border-input bg-background px-2 text-sm capitalize" value={p.status} onChange={(e) => setStatus(p, e.target.value as Payment["status"])}>
                    <option value="pending">pending</option><option value="successful">successful</option><option value="failed">failed</option>
                  </select>
                </td>
              </tr>
            ))}
            {!payments.length && <tr><td className="p-6 text-muted-foreground" colSpan={7}>No orders recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return <div className="border border-border bg-card p-5"><p className="text-xs uppercase tracking-[.16em] text-muted-foreground">{label}</p><p className="mt-3 font-display text-3xl">{value}</p></div>;
}
