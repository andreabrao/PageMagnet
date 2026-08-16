import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const guarantees = [
  "Grátis para começar",
  "Sem cartão de crédito",
  "Cancele quando quiser",
];

const FinalCta = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl gradient-primary px-6 py-14 md:px-16 md:py-20 text-center shadow-glow">
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-primary-foreground/10 blur-3xl" />

          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
              Sua próxima página de vendas está a 3 perguntas de distância
            </h2>
            <p className="text-lg text-primary-foreground/85 mb-8">
              Pare de perder vendas com páginas improvisadas. Crie hoje uma página feita para converter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 gap-2 font-semibold">
                <Link to="/auth">
                  Criar minha página grátis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a href="#precos">Ver planos</a>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {guarantees.map((g) => (
                <li key={g} className="flex items-center gap-2 text-sm text-primary-foreground/90">
                  <Check className="w-4 h-4" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
