import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Calendar, TrendingUp } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

const Index = () => {
  const { user } = useContext(UserContext);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-football-dark-green">
            Bem-vindo, {user?.name.split(' ')[0]}!
          </h1>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-football-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150</div>
              <p className="text-xs text-gray-500">+5% em relação ao mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensalidades Pagas</CardTitle>
              <CreditCard className="h-4 w-4 text-football-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 15.000</div>
              <p className="text-xs text-gray-500">85% do total previsto</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos Jogos</CardTitle>
              <Calendar className="h-4 w-4 text-football-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-gray-500">Nos próximos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-football-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12%</div>
              <p className="text-xs text-gray-500">Comparado ao último trimestre</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Nova matrícula realizada</p>
                    <p className="text-sm text-gray-500">João Silva - Categoria Sub-15</p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">Há 2 horas</div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Mensalidade registrada</p>
                    <p className="text-sm text-gray-500">Maria Santos - Maio/2024</p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">Há 3 horas</div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Jogo agendado</p>
                    <p className="text-sm text-gray-500">Sub-17 vs Clube Atlético</p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">Há 5 horas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Treino Sub-13</p>
                    <p className="text-sm text-gray-500">Hoje, 15:00</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Jogo Sub-17</p>
                    <p className="text-sm text-gray-500">Amanhã, 10:00</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">Avaliação Física</p>
                    <p className="text-sm text-gray-500">23/05, 14:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
