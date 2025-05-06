import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Check } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-extrabold text-football-dark-green leading-tight">
                Sistema de Gerenciamento de Campeonatos de Futebol de Base
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">
                Plataforma completa para escolas de futebol organizarem campeonatos, 
                gerenciarem equipes e acompanharem resultados.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button className="text-lg bg-football-green hover:bg-football-dark-green">
                    Cadastre sua Escolinha
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="text-lg border-football-green text-football-green hover:bg-football-green hover:text-white">
                    Acessar o Sistema
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 stadium-pattern rounded-xl overflow-hidden shadow-xl">
              <div className="aspect-video relative flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm py-8 px-12 rounded-lg text-center">
                  <span className="text-7xl">⚽</span>
                  <h2 className="text-2xl font-bold text-football-dark-green mt-4">FutBoss</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-football-dark-green">
            Principais Funcionalidades
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="football-card p-6">
              <div className="bg-football-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center text-football-green mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Organizador de Campeonatos</h3>
              <p className="text-gray-600">
                Crie e gerencie campeonatos para diferentes categorias com facilidade.
              </p>
            </div>
            <div className="football-card p-6">
              <div className="bg-football-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center text-football-green mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Gestão de Equipes</h3>
              <p className="text-gray-600">
                Cadastre suas equipes e inscreva-as nos campeonatos disponíveis.
              </p>
            </div>
            <div className="football-card p-6">
              <div className="bg-football-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center text-football-green mb-4">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Controle de Jogos</h3>
              <p className="text-gray-600">
                Acompanhe resultados, classificações e estatísticas em tempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-football-dark-green">
            Como Funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="text-6xl font-extrabold text-football-green/20 absolute -top-6 left-0">
                01
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold mb-2">Cadastro da Escolinha</h3>
                <p className="text-gray-600">
                  Registre sua escolinha de futebol com CNPJ e dados do responsável.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="text-6xl font-extrabold text-football-green/20 absolute -top-6 left-0">
                02
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold mb-2">Criação de Campeonatos</h3>
                <p className="text-gray-600">
                  Crie campeonatos com categorias específicas e defina regras.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="text-6xl font-extrabold text-football-green/20 absolute -top-6 left-0">
                03
              </div>
              <div className="pt-8">
                <h3 className="text-xl font-bold mb-2">Gestão Completa</h3>
                <p className="text-gray-600">
                  Gerencie equipes, jogos, resultados e acompanhe estatísticas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-football-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para organizar seu campeonato?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Cadastre sua escolinha gratuitamente e comece a gerenciar seus campeonatos de forma eficiente.
          </p>
          <Link to="/register">
            <Button className="text-lg bg-football-gold text-black hover:bg-amber-400">
              Cadastre-se Agora
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Landing; 