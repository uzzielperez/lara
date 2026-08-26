/** Client helpers — Stripe Checkout and Customer Portal. */
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

export async function openBillingPortal(returnPath?: string): Promise<void> {
  const res = await fetch("/api/stripe/portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnPath }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Could not open billing portal");
  }
  if (data.url) {
    window.location.href = data.url;
    return;
  }
  throw new Error("No portal URL returned");
}
