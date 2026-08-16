export type PlanTier = "free" | "pro" | "business";

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent?: string;
  requiredPlan: PlanTier;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  requiredPlan: PlanTier;
  /** layout hints used by the preview and the exported HTML */
  align: "center" | "left";
  heroStyle: "solid" | "gradient" | "split" | "aurora";
  radius: string;
  font: string;
  dark?: boolean;
}

export const colorPalettes: ColorPalette[] = [
  { name: "Indigo", primary: "#4F46E5", secondary: "#EEF2FF", accent: "#22D3EE", requiredPlan: "free" },
  { name: "Emerald", primary: "#059669", secondary: "#ECFDF5", accent: "#84CC16", requiredPlan: "free" },
  { name: "Rose", primary: "#E11D48", secondary: "#FFF1F2", accent: "#FB923C", requiredPlan: "pro" },
  { name: "Amber", primary: "#D97706", secondary: "#FFFBEB", accent: "#F43F5E", requiredPlan: "pro" },
  { name: "Midnight", primary: "#0F172A", secondary: "#E2E8F0", accent: "#38BDF8", requiredPlan: "pro" },
  { name: "Neon", primary: "#7C3AED", secondary: "#F5F3FF", accent: "#22D3EE", requiredPlan: "business" },
  { name: "Aurora", primary: "#0EA5E9", secondary: "#ECFEFF", accent: "#A855F7", requiredPlan: "business" },
  { name: "Gold", primary: "#B45309", secondary: "#FEF3C7", accent: "#FACC15", requiredPlan: "business" },
];

export const pageTemplates: PageTemplate[] = [
  {
    id: "classic",
    name: "Clássico",
    description: "Hero centralizado, direto ao ponto.",
    requiredPlan: "free",
    align: "center",
    heroStyle: "solid",
    radius: "12px",
    font: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  {
    id: "bold",
    name: "Impacto",
    description: "Títulos grandes, gradientes e CTA em destaque.",
    requiredPlan: "pro",
    align: "center",
    heroStyle: "gradient",
    radius: "999px",
    font: "Georgia, 'Times New Roman', serif",
  },
  {
    id: "split",
    name: "Split Pro",
    description: "Texto à esquerda, prova social em cards à direita.",
    requiredPlan: "pro",
    align: "left",
    heroStyle: "split",
    radius: "14px",
    font: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  {
    id: "premium",
    name: "Premium Dark",
    description: "Escuro sofisticado com glass e brilho para high-ticket.",
    requiredPlan: "business",
    align: "center",
    heroStyle: "aurora",
    radius: "18px",
    font: "'Trebuchet MS', system-ui, sans-serif",
    dark: true,
  },
  {
    id: "editorial",
    name: "Editorial Business",
    description: "Layout revista, tipografia grande e seções generosas.",
    requiredPlan: "business",
    align: "left",
    heroStyle: "gradient",
    radius: "4px",
    font: "Georgia, 'Iowan Old Style', serif",
  },
];

export const getTemplate = (id: string): PageTemplate =>
  pageTemplates.find((t) => t.id === id) ?? pageTemplates[0];

export const getPalette = (name: string): ColorPalette =>
  colorPalettes.find((p) => p.name === name) ?? colorPalettes[0];

const PLAN_RANK: Record<PlanTier, number> = { free: 0, pro: 1, business: 2 };

export const planAllows = (current: PlanTier, required: PlanTier) =>
  PLAN_RANK[current] >= PLAN_RANK[required];

const escapeHtml = (value: string) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export interface Benefit {
  title: string;
  description: string;
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PageContent {
  headline: string;
  subheadline: string;
  cta: string;
  product: string;
  badge?: string;
  benefits: Benefit[];
  testimonials?: Testimonial[];
  faq?: FaqItem[];
  guarantee?: string;
  urgency?: string;
}

export const defaultBenefits: Benefit[] = [
  { title: "Resultados comprovados", description: "Método já validado por milhares de alunos." },
  { title: "Suporte dedicado", description: "Acompanhamento próximo do começo ao fim." },
  { title: "Garantia de 30 dias", description: "Se não gostar, devolvemos o valor integral." },
];

export const buildPageHtml = (
  content: PageContent,
  templateId: string,
  paletteName: string,
  options: { watermark?: boolean; tier?: PlanTier } = {}
): string => {
  const { watermark = true, tier = "free" } = options;
  const t = getTemplate(templateId);
  const p = getPalette(paletteName);
  const accent = p.accent ?? p.primary;
  const dark = !!t.dark;
  const rich = tier !== "free";

  const bg = dark ? "#080B18" : "#ffffff";
  const surface = dark ? "rgba(255,255,255,.05)" : "#F8FAFC";
  const border = dark ? "rgba(255,255,255,.12)" : "#E5E7EB";
  const text = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#9AA5B8" : "#4B5563";

  const heroBg =
    t.heroStyle === "aurora"
      ? `radial-gradient(1200px 600px at 15% -10%, ${p.primary}55, transparent 60%), radial-gradient(900px 500px at 90% 10%, ${accent}44, transparent 60%), ${bg}`
      : t.heroStyle === "gradient"
      ? `linear-gradient(135deg, ${p.primary}1f, ${p.secondary} 55%, ${accent}22)`
      : t.heroStyle === "split"
      ? `linear-gradient(120deg, ${p.secondary} 0%, #ffffff 65%)`
      : p.secondary;

  const e = escapeHtml;
  const benefits = content.benefits?.length ? content.benefits : defaultBenefits;
  const testimonials = rich ? content.testimonials ?? [] : (content.testimonials ?? []).slice(0, 1);
  const faq = rich ? content.faq ?? [] : (content.faq ?? []).slice(0, 2);

  const richCss = rich
    ? `
  .headline-grad{background:linear-gradient(100deg,${p.primary},${accent});-webkit-background-clip:text;background-clip:text;color:transparent}
  .card{transition:transform .25s ease, box-shadow .25s ease}
  .card:hover{transform:translateY(-4px);box-shadow:0 18px 40px ${dark ? "rgba(0,0,0,.45)" : "rgba(15,23,42,.12)"}}
  .cta{box-shadow:0 12px 30px ${p.primary}55}
  .cta:hover{transform:translateY(-2px)}
  .reveal{opacity:0;transform:translateY(18px);animation:rise .7s ease forwards}
  @keyframes rise{to{opacity:1;transform:none}}
  .sticky-cta{position:fixed;left:0;right:0;bottom:0;display:flex;gap:12px;align-items:center;justify-content:center;padding:12px;background:${dark ? "rgba(8,11,24,.9)" : "rgba(255,255,255,.92)"};backdrop-filter:blur(10px);border-top:1px solid ${border};z-index:20}
  .sticky-cta .cta{padding:12px 22px;font-size:16px}
  body{padding-bottom:76px}
  @media(max-width:640px){.sticky-cta span{display:none}}
`
    : "";

  const stats = rich
    ? `<div class="stats reveal" style="animation-delay:.25s">
      ${[
        ["+12.400", "alunos ativos"],
        ["4,9/5", "avaliação média"],
        ["30 dias", "de garantia"],
      ]
        .map(([n, l]) => `<div><strong>${n}</strong><span>${l}</span></div>`)
        .join("")}
    </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${e(content.headline).slice(0, 60)}</title>
<meta name="description" content="${e(content.subheadline).slice(0, 155)}" />
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${t.font};background:${bg};color:${text};line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{max-width:${t.id === "editorial" ? "1080px" : "980px"};margin:0 auto;padding:0 24px}
  .hero{background:${heroBg};padding:${rich ? "104px 0 96px" : "80px 0"};text-align:${t.align};position:relative;overflow:hidden}
  .badge{display:inline-block;padding:8px 16px;border-radius:999px;background:${dark ? "rgba(255,255,255,.08)" : `${p.primary}18`};color:${dark ? "#fff" : p.primary};font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-bottom:22px;border:1px solid ${dark ? "rgba(255,255,255,.16)" : `${p.primary}30`}}
  h1{font-size:clamp(34px,5.4vw,${rich ? "62px" : "52px"});line-height:1.05;letter-spacing:-.02em;margin-bottom:18px}
  .sub{font-size:clamp(17px,2vw,21px);color:${muted};margin-bottom:32px;max-width:660px;${t.align === "center" ? "margin-left:auto;margin-right:auto;" : ""}}
  .cta{display:inline-block;padding:17px 34px;border-radius:${t.radius};background:linear-gradient(120deg,${p.primary},${rich ? accent : p.primary});color:#fff;text-decoration:none;font-weight:800;font-size:18px;transition:.2s}
  .cta:hover{opacity:.94}
  .micro{display:block;margin-top:12px;font-size:13px;color:${muted}}
  section{padding:${rich ? "88px 0" : "64px 0"}}
  h2{font-size:clamp(26px,3.4vw,38px);letter-spacing:-.01em;margin-bottom:12px;text-align:${t.align === "left" ? "left" : "center"}}
  .lead{color:${muted};margin-bottom:36px;text-align:${t.align === "left" ? "left" : "center"}}
  .grid{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
  .card{padding:24px;border-radius:${t.radius};background:${surface};border:1px solid ${border}}
  .card h3{font-size:18px;margin-bottom:6px}
  .card p{color:${muted};font-size:15px}
  .tick{display:inline-flex;width:34px;height:34px;align-items:center;justify-content:center;border-radius:10px;background:${p.primary}1f;color:${p.primary};font-weight:800;margin-bottom:12px}
  .stats{display:flex;flex-wrap:wrap;gap:28px;justify-content:${t.align === "left" ? "flex-start" : "center"};margin-top:38px}
  .stats div{display:flex;flex-direction:column}
  .stats strong{font-size:26px}
  .stats span{font-size:13px;color:${muted};text-transform:uppercase;letter-spacing:.06em}
  .quote{font-style:italic;font-size:16px;margin-bottom:14px}
  .who{font-size:14px;color:${muted}}
  details{border:1px solid ${border};border-radius:${t.radius};padding:16px 18px;background:${surface};margin-bottom:12px}
  summary{cursor:pointer;font-weight:700}
  details p{margin-top:10px;color:${muted}}
  .guarantee{border:2px dashed ${p.primary}66;border-radius:${t.radius};padding:26px;text-align:center;background:${dark ? "rgba(255,255,255,.03)" : `${p.secondary}`}}
  .final{background:linear-gradient(120deg,${p.primary},${rich ? accent : p.primary});color:#fff;text-align:center}
  .final h2{color:#fff}
  .final .cta{background:#fff;color:${p.primary};box-shadow:none}
  .mark{padding:18px;text-align:center;font-size:13px;color:${muted};background:${dark ? "#080B18" : "#F3F4F6"}}
  ${richCss}
</style>
</head>
<body>
  <header class="hero"><div class="wrap">
    <span class="badge${rich ? " reveal" : ""}">${e(content.badge || "Oferta especial")}</span>
    <h1${rich ? ' class="reveal" style="animation-delay:.05s"' : ""}><span class="${rich ? "headline-grad" : ""}">${e(content.headline)}</span></h1>
    <p class="sub${rich ? " reveal" : ""}"${rich ? ' style="animation-delay:.12s"' : ""}>${e(content.subheadline)}</p>
    <a class="cta${rich ? " reveal" : ""}" href="#oferta"${rich ? ' style="animation-delay:.18s"' : ""}>${e(content.cta)} →</a>
    ${content.urgency ? `<span class="micro">${e(content.urgency)}</span>` : ""}
    ${stats}
  </div></header>

  <section><div class="wrap">
    <h2>Por que ${e(content.product)} funciona</h2>
    <p class="lead">Tudo o que você recebe para alcançar o resultado prometido.</p>
    <div class="grid">
      ${benefits
        .map(
          (b) => `<div class="card">
        <span class="tick">✓</span>
        <h3>${e(b.title)}</h3>
        <p>${e(b.description)}</p>
      </div>`
        )
        .join("\n      ")}
    </div>
  </div></section>

  ${
    testimonials.length
      ? `<section style="background:${dark ? "rgba(255,255,255,.03)" : p.secondary}"><div class="wrap">
    <h2>Quem já passou por isso</h2>
    <p class="lead">Histórias reais de quem aplicou o método.</p>
    <div class="grid">
      ${testimonials
        .map(
          (tm) => `<div class="card">
        <p class="quote">“${e(tm.quote)}”</p>
        <p class="who"><strong>${e(tm.name)}</strong> · ${e(tm.role)}</p>
      </div>`
        )
        .join("\n      ")}
    </div>
  </div></section>`
      : ""
  }

  ${
    content.guarantee
      ? `<section><div class="wrap"><div class="guarantee">
      <h3 style="font-size:20px;margin-bottom:8px">Risco zero para você</h3>
      <p style="color:${muted}">${e(content.guarantee)}</p>
    </div></div></section>`
      : ""
  }

  ${
    faq.length
      ? `<section><div class="wrap">
    <h2>Perguntas frequentes</h2>
    <p class="lead">As dúvidas mais comuns antes de começar.</p>
    ${faq
      .map(
        (f) => `<details><summary>${e(f.question)}</summary><p>${e(f.answer)}</p></details>`
      )
      .join("\n    ")}
  </div></section>`
      : ""
  }

  <section class="final" id="oferta"><div class="wrap">
    <h2>${e(content.headline).slice(0, 70)}</h2>
    <p style="opacity:.9;margin:0 auto 26px;max-width:560px">${e(content.subheadline)}</p>
    <a class="cta" href="#">${e(content.cta)} →</a>
  </div></section>
  ${
    rich
      ? `<div class="sticky-cta"><span>${e(content.urgency || content.product)}</span><a class="cta" href="#oferta">${e(content.cta)}</a></div>`
      : ""
  }
  ${watermark ? '<div class="mark">Criado com PageMagnet</div>' : ""}
</body>
</html>`;
};
