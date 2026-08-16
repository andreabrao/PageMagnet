import { Magnet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg gradient-primary">
            <Magnet className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">PageMagnet</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Como Funciona
          </a>
          <a href="#beneficios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Benefícios
          </a>
          <a href="#para-quem" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Para Quem
          </a>
          <a href="#precos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Preços
          </a>
        </nav>

        <Button asChild className="gradient-primary hover:opacity-90 transition-opacity shadow-glow">
          <Link to="/auth">Começar Agora</Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;
