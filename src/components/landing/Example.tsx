import { Button } from "@/components/ui/button";
import { ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import examplePage from "@/assets/example-page.png";


const Example = () => {
  return (
    <section className="py-20 md:py-32 hero-gradient">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Image */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary opacity-10 blur-3xl rounded-3xl" />
              <img 
                src={examplePage} 
                alt="Exemplo de landing page criada com PageMagnet" 
                className="relative w-full rounded-2xl shadow-xl border border-border"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="max-w-lg">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Veja um exemplo real
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Esta landing page foi criada em menos de 2 minutos usando o PageMagnet. 
                Textos, layout e design — tudo gerado automaticamente pela nossa IA.
              </p>
              
              {/* Testimonial */}
              <div className="p-6 rounded-xl bg-card border border-border mb-8">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-foreground italic mb-4">
                  "Eu gastava horas criando landing pages. Com o PageMagnet, 
                  faço em minutos e ainda convertem mais!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary" />
                  <div>
                    <p className="font-medium text-foreground">Maria Silva</p>
                    <p className="text-sm text-muted-foreground">Infoprodutora</p>
                  </div>
                </div>
              </div>
              
              <Button asChild size="lg" className="gradient-primary hover:opacity-90 transition-opacity shadow-glow gap-2">
                <Link to="/auth">
                  Criar minha landing page
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Grátis para começar • Sem cartão de crédito
              </p>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Example;
