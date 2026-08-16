const ALLOWED_ORIGINS = [
  "https://pagemagnet.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Lovable preview / project subdomains
  return /^https:\/\/[a-z0-9-]+\.lovable\.app$/i.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/i.test(origin);
};

export const buildCorsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get("origin");
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? (origin as string) : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
};

export const originAllowed = (req: Request): boolean => {
  const origin = req.headers.get("origin");
  // Non-browser calls (no Origin header) are still gated by JWT auth.
  return origin === null || isAllowedOrigin(origin);
};

/** Maps internal errors to safe, generic client messages. */
export const clientErrorMessage = (error: unknown): { message: string; status: number } => {
  const raw = error instanceof Error ? error.message : String(error);
  const lower = raw.toLowerCase();

  if (lower.includes("authorization header") || lower.includes("authentication") || lower.includes("not authenticated")) {
    return { message: "Sessão inválida. Faça login novamente.", status: 401 };
  }
  if (lower.includes("invalid plan")) {
    return { message: "Plano inválido.", status: 400 };
  }
  return {
    message: "Não foi possível processar sua solicitação. Tente novamente mais tarde.",
    status: 500,
  };
};
