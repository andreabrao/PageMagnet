import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildCorsHeaders, clientErrorMessage, originAllowed } from "../_shared/http.ts";

const MODEL = "google/gemini-2.5-flash";

interface Briefing {
  product: string;
  audience: string;
  transformation: string;
}

const sanitize = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

Deno.serve(async (req) => {
  const cors = buildCorsHeaders(req);

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    if (!originAllowed(req)) throw new Error("not authenticated");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("authorization header missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error("not authenticated");

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    const plan: "free" | "pro" | "business" = (profile?.plan as never) ?? "free";
    const advanced = plan !== "free";

    const body = await req.json().catch(() => ({}));
    const briefing: Briefing = {
      product: sanitize(body?.product, 200),
      audience: sanitize(body?.audience, 200),
      transformation: sanitize(body?.transformation, 500),
    };
    const tone = sanitize(body?.tone, 40) || "persuasivo e profissional";

    if (!briefing.product || !briefing.audience || !briefing.transformation) {
      return new Response(JSON.stringify({ error: "Briefing incompleto." }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("missing ai key");

    const schema = {
      type: "object",
      properties: {
        headline: { type: "string" },
        subheadline: { type: "string" },
        cta: { type: "string" },
        badge: { type: "string" },
        benefits: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
            },
            required: ["title", "description"],
            additionalProperties: false,
          },
        },
        testimonials: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" },
              quote: { type: "string" },
            },
            required: ["name", "role", "quote"],
            additionalProperties: false,
          },
        },
        faq: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              answer: { type: "string" },
            },
            required: ["question", "answer"],
            additionalProperties: false,
          },
        },
        guarantee: { type: "string" },
        urgency: { type: "string" },
      },
      required: ["headline", "subheadline", "cta", "badge", "benefits", "testimonials", "faq", "guarantee", "urgency"],
      additionalProperties: false,
    };

    const prompt = `Você é um copywriter sênior de resposta direta (nível agência premium) escrevendo em português do Brasil.

BRIEFING
- Produto/oferta: ${briefing.product}
- Público-alvo: ${briefing.audience}
- Transformação prometida: ${briefing.transformation}
- Tom: ${tone}

REGRAS
- Headline: máximo 12 palavras, específica, focada no resultado, sem clichê ("mude de vida", "revolucionário").
- Subheadline: 1 frase (máx 25 palavras) explicando o mecanismo e para quem é.
- CTA: 2 a 5 palavras, na primeira pessoa ("Quero...", "Começar...").
- Badge: 2 a 5 palavras de destaque (ex.: "Turma de Janeiro").
- ${advanced ? "6" : "3"} benefícios com título curto (máx 5 palavras) e descrição de 1 frase orientada a resultado.
- ${advanced ? "3 depoimentos realistas e específicos (com métrica), 5 perguntas frequentes que quebram objeções reais" : "1 depoimento e 2 perguntas frequentes"}.
- Garantia: 1 frase concreta. Urgência: 1 frase honesta, sem falsa escassez.
- Nunca invente dados legais, médicos ou financeiros verificáveis.
Responda apenas via a ferramenta.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        tools: [
          {
            type: "function",
            function: { name: "gerar_copy", description: "Retorna a copy da landing page", parameters: schema },
          },
        ],
        tool_choice: { type: "function", function: { name: "gerar_copy" } },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de gerações atingido. Tente novamente em instantes." }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
        status: 402,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) throw new Error(`ai gateway error ${aiRes.status}`);

    const aiJson = await aiRes.json();
    const args = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("ai returned no content");

    const parsed = JSON.parse(args);

    return new Response(JSON.stringify({ ...parsed, plan }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-copy error:", error);
    const { message, status } = clientErrorMessage(error);
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
