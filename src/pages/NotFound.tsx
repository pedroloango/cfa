
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="text-football-green text-7xl font-bold mb-4">404</div>
        <h1 className="text-4xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          Desculpe, a página que você está procurando não existe.
        </p>
        <Link to="/">
          <Button
            className="bg-football-green hover:bg-football-dark-green"
          >
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
