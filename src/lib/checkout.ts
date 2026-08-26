/** Client helper — redirect to Stripe Checkout for a plan. */
export async function startCheckout(plan: string, returnPath?: string): Promise<void> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, returnPath }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Checkout failed");
  }
  if (data.url) {
    window.location.href = data.url;
    return;
  }
  throw new Error("No checkout URL returned");
}
