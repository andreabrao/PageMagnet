import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const StickyCta = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border px-4 py-3 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Button asChild size="lg" className="w-full gradient-primary hover:opacity-90 shadow-glow gap-2">
        <Link to="/auth">
          Criar minha página grátis
          <ArrowRight className="w-5 h-5" />
        </Link>
      </Button>
      <p className="text-center text-xs text-muted-foreground mt-2">
        Sem cartão de crédito • Pronta em 2 minutos
      </p>
    </div>
  );
};

export default StickyCta;
