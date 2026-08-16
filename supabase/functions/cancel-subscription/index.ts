import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCorsHeaders, originAllowed, clientErrorMessage } from "../_shared/http.ts";

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
};

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!originAllowed(req)) {
    return new Response(JSON.stringify({ error: "Origem não permitida." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 403,
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    let body: { action?: string } = {};
    try {
      body = await req.json();
    } catch (_) {
      body = {};
    }
    const action = body.action === "reactivate" ? "reactivate" : "cancel";

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-04-30.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhuma assinatura encontrada." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhuma assinatura ativa encontrada." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const subscription = subscriptions.data[0];
    const updated = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: action === "cancel",
    });

    logStep("Subscription updated", { id: updated.id, action, cancelAtPeriodEnd: updated.cancel_at_period_end });

    return new Response(
      JSON.stringify({
        success: true,
        cancel_at_period_end: updated.cancel_at_period_end,
        current_period_end: new Date(updated.current_period_end * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : String(error) });
    const safe = clientErrorMessage(error);
    return new Response(JSON.stringify({ error: safe.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: safe.status,
    });
  }
});
