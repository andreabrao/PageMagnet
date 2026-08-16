import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import heroMockup from "@/assets/hero-mockup.png";

const bullets = [
  "Copy de vendas escrita por IA treinada em conversão",
  "Layout profissional pronto para publicar",
  "Exporte o HTML ou use seu domínio próprio",
];

const Hero = () => {
  return (
    <section className="hero-gradient pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Criado com IA em menos de 2 minutos</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Landing pages que vendem.{" "}
              <span className="text-primary">Em minutos, não dias.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6">
              Responda 3 perguntas e receba uma página de vendas completa — texto persuasivo,
              design profissional e CTA pronto para converter.
            </p>

            <ul className="space-y-2 mb-8 max-w-xl mx-auto lg:mx-0 text-left">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="gradient-primary hover:opacity-90 transition-opacity shadow-glow text-lg px-8 py-6 gap-2 w-full sm:w-auto">
                <Link to="/auth">
                  Criar minha página grátis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                <a href="#como-funciona">Ver como funciona</a>
              </Button>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                4,9/5 por +12.400 criadores • Sem cartão de crédito
              </p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute inset-0 gradient-primary opacity-20 blur-3xl rounded-3xl" />
              <img
                src={heroMockup}
                alt="PageMagnet Dashboard - Crie landing pages com IA"
                className="relative w-full rounded-2xl shadow-xl animate-float"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
