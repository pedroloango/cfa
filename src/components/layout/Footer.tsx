import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-football-dark-green text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">FutbolLeagueBoss</h3>
            <p className="text-football-white/80">
              Sistema completo para gerenciamento de campeonatos de futebol de base.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-football-gold transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-football-gold transition-colors">
                  Cadastro
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-football-gold transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contato</h3>
            <p className="text-football-white/80">
              contato@futbolleagueboss.com
              <br />
              (99) 9999-9999
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-4 text-center text-football-white/60">
          <p>© 2025 FutbolLeagueBoss. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}; 