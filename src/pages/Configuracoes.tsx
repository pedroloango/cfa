
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/settings/UserManagement";
import { MonthlyFeesSettings } from "@/components/settings/MonthlyFeesSettings";

const Configuracoes = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações do sistema
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Gerencie os usuários e suas permissões de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mensalidades</CardTitle>
              <CardDescription>
                Configure os valores das mensalidades por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MonthlyFeesSettings />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Configuracoes;
