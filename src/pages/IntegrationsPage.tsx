import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppNavbar from "@/components/app/AppNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, KeyRound, Crown, Copy, Trash2, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PageRow {
  id: string;
  title: string;
  slug: string;
  custom_domain: string | null;
}

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

const domainRegex = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

const sha256 = async (value: string) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const IntegrationsPage = () => {
  const { user } = useAuth();
  const { canUseCustomDomain, canUseAPI } = usePlanFeatures();
  const { toast } = useToast();

  const [pages, setPages] = useState<PageRow[]>([]);
  const [domains, setDomains] = useState<Record<string, string>>({});
  const [savingDomain, setSavingDomain] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyRow[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: pageData }, { data: keyData }] = await Promise.all([
        supabase
          .from("pages")
          .select("id, title, slug, custom_domain")
          .order("created_at", { ascending: false }),
        supabase
          .from("api_keys")
          .select("id, name, key_prefix, created_at, last_used_at")
          .order("created_at", { ascending: false }),
      ]);
      setPages(pageData ?? []);
      setDomains(
        Object.fromEntries((pageData ?? []).map((p) => [p.id, p.custom_domain ?? ""]))
      );
      setApiKeys(keyData ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const saveDomain = async (pageId: string) => {
    const value = (domains[pageId] ?? "").trim().toLowerCase();
    if (value && !domainRegex.test(value)) {
      toast({
        variant: "destructive",
        title: "Domínio inválido",
        description: "Use o formato meudominio.com.br (sem http:// e sem barras).",
      });
      return;
    }
    setSavingDomain(pageId);
    const { error } = await supabase
      .from("pages")
      .update({ custom_domain: value || null })
      .eq("id", pageId);
    setSavingDomain(null);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o domínio." });
      return;
    }
    toast({
      title: "Domínio salvo",
      description: value
        ? "Aponte um registro CNAME do seu domínio para pages.pagemagnet.app para ativar."
        : "Domínio personalizado removido.",
    });
  };

  const createKey = async () => {
    if (!user) return;
    setCreatingKey(true);
    try {
      const raw = `pm_live_${crypto.randomUUID().replace(/-/g, "")}`;
      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          user_id: user.id,
          name: newKeyName.trim().slice(0, 60) || "Chave de API",
          key_prefix: raw.slice(0, 12),
          key_hash: await sha256(raw),
        })
        .select("id, name, key_prefix, created_at, last_used_at")
        .single();
      if (error) throw error;
      setApiKeys((prev) => [data, ...prev]);
      setRevealedKey(raw);
      setNewKeyName("");
    } catch {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível gerar a chave." });
    } finally {
      setCreatingKey(false);
    }
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover a chave." });
      return;
    }
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    toast({ title: "Chave removida" });
  };

  const copy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copiado!" });
  };

  const UpgradeCard = ({ title, description }: { title: string; description: string }) => (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Link to="/planos">
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
            <Crown className="w-4 h-4" />
            Fazer Upgrade
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="container max-w-3xl px-4 py-8 space-y-8">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Domínio e API</h1>
          <p className="text-muted-foreground text-sm">
            Recursos do plano Business para publicar no seu domínio e integrar com outros sistemas.
          </p>
        </header>

        {/* Custom domain */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <Globe className="w-4 h-4 text-primary" />
            Domínio personalizado
            <Badge variant="secondary" className="text-[10px]">Business</Badge>
          </h2>

          {!canUseCustomDomain ? (
            <UpgradeCard
              title="Domínio personalizado bloqueado"
              description="Publique suas páginas em seudominio.com com o plano Business."
            />
          ) : loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : pages.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Você ainda não salvou nenhuma página.{" "}
                <Link to="/app" className="text-primary hover:underline">Criar página</Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <Card key={page.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{page.title}</CardTitle>
                    <CardDescription>pagemagnet.app/p/{page.slug}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={domains[page.id] ?? ""}
                      onChange={(e) =>
                        setDomains((prev) => ({ ...prev, [page.id]: e.target.value }))
                      }
                      placeholder="minhapagina.com.br"
                    />
                    <Button onClick={() => saveDomain(page.id)} disabled={savingDomain === page.id}>
                      {savingDomain === page.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Salvar"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <p className="text-xs text-muted-foreground">
                Após salvar, crie um registro CNAME no seu provedor de DNS apontando para
                <span className="font-mono"> pages.pagemagnet.app</span>. A propagação pode levar até 24h.
              </p>
            </div>
          )}
        </section>

        {/* API keys */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <KeyRound className="w-4 h-4 text-primary" />
            API de integração
            <Badge variant="secondary" className="text-[10px]">Business</Badge>
          </h2>

          {!canUseAPI ? (
            <UpgradeCard
              title="API de integração bloqueada"
              description="Gere chaves de API e conecte o PageMagnet às suas ferramentas com o plano Business."
            />
          ) : (
            <div className="space-y-3">
              <Card>
                <CardContent className="flex flex-col sm:flex-row gap-2 py-6">
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Nome da chave (ex: Zapier)"
                    maxLength={60}
                  />
                  <Button onClick={createKey} disabled={creatingKey} className="gradient-primary">
                    {creatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : "Gerar chave"}
                  </Button>
                </CardContent>
              </Card>

              {revealedKey && (
                <Card className="border-primary">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Copie sua chave agora — ela não será exibida novamente.
                    </div>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-muted text-xs break-all">
                        {revealedKey}
                      </code>
                      <Button variant="outline" size="icon" onClick={() => copy(revealedKey)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {apiKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium text-sm">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {key.key_prefix}••••••••
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteKey(key.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Use a chave no header das suas requisições:</p>
                <code className="block px-3 py-2 rounded-lg bg-muted break-all">
                  Authorization: Bearer SUA_CHAVE
                </code>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default IntegrationsPage;
