import { Magnet } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
              <Magnet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary-foreground">PageMagnet</span>
          </div>
          
          {/* Links */}
          <nav className="flex items-center gap-8">
            <a href="#sobre" className="text-sm text-muted hover:text-primary-foreground transition-colors">
              Sobre
            </a>
            <a href="#termos" className="text-sm text-muted hover:text-primary-foreground transition-colors">
              Termos
            </a>
            <a href="#contato" className="text-sm text-muted hover:text-primary-foreground transition-colors">
              Contato
            </a>
          </nav>
          
          {/* Copyright */}
          <p className="text-sm text-muted">
            © 2025 PageMagnet. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
