import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faq = [
  {
    q: "Preciso saber programar ou desenhar?",
    a: "Não. Você responde 3 perguntas e a IA escreve o texto, escolhe o layout e monta a página inteira. Depois é só editar o que quiser no editor visual.",
  },
  {
    q: "Em quanto tempo minha página fica pronta?",
    a: "Em menos de 2 minutos você tem a primeira versão publicável. Ajustes finos levam mais alguns minutos, no seu ritmo.",
  },
  {
    q: "Posso usar meu próprio domínio?",
    a: "Sim. No plano Business você conecta um domínio personalizado e ainda recebe chaves de API para integrar com suas ferramentas.",
  },
  {
    q: "A marca d'água some?",
    a: "Sim. Nos planos Pro e Business a marca d'água é removida e você pode exportar o HTML limpo para hospedar onde quiser.",
  },
  {
    q: "Posso testar antes de pagar?",
    a: "Pode. O plano gratuito permite criar sua primeira página sem cartão de crédito. Você só evolui de plano quando fizer sentido.",
  },
];

const Faq = () => {
  return (
    <section id="faq" className="py-20 md:py-28 hero-gradient">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ainda com dúvidas?
          </h2>
          <p className="text-lg text-muted-foreground">
            As perguntas que quase todo mundo faz antes de criar a primeira página.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faq.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-semibold text-foreground">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-10">
          <Button asChild size="lg" className="gradient-primary hover:opacity-90 transition-opacity shadow-glow px-8">
            <Link to="/auth">Começar agora, é grátis</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Faq;
