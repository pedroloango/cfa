import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, Gift, CalendarDays, MapPin } from "lucide-react";
import { useDbDashboard } from "@/hooks/useDbDashboard";
import { useRecentActivities } from "@/hooks/useRecentActivities";
import { useStudents } from "@/hooks/useStudents";
import { useMemo } from "react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { data: dashboardData, isLoading: isDashboardLoading } = useDbDashboard();
  const { data: activitiesData, isLoading: isActivitiesLoading } = useRecentActivities();
  const { data: studentsData, isLoading: isStudentsLoading } = useStudents();

  const upcomingBirthdays = useMemo(() => {
    if (!studentsData) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = [];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const targetDay = targetDate.getDate();
      const targetMonth = targetDate.getMonth() + 1;

      studentsData.forEach(student => {
        if (student.birthDate && student.status === 'Ativo') {
          const [birthYear, birthMonth, birthDay] = student.birthDate.split('-').map(Number);
          if (birthDay === targetDay && birthMonth === targetMonth) {
            if (!upcoming.find(s => s.id === student.id)) {
              upcoming.push(student);
            }
          }
        }
      });
    }
    return upcoming.sort((a, b) => {
      const [_aYear, aMonth, aDay] = a.birthDate.split('-').map(Number);
      const [_bYear, bMonth, bDay] = b.birthDate.split('-').map(Number);
      if (aMonth !== bMonth) return aMonth - bMonth;
      return aDay - bDay;
    });
  }, [studentsData]);

  if (isDashboardLoading || isActivitiesLoading || isStudentsLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="text-center">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  const { stats } = dashboardData || {
    stats: { total: 0, paying: 0, scholars: 0, totalPaid: 0 },
  };

  const { activities, events } = activitiesData || {
    activities: [],
    events: []
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-football-dark-green">
            Bem-vindo, PEDRO!
          </h1>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                +5% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensalidades Pagas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                85% do total previsto
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aniversariantes</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBirthdays.length}</div>
              <p className="text-xs text-muted-foreground">
                Nos próximos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12%</div>
              <p className="text-xs text-muted-foreground">
                Comparado ao último trimestre
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhuma atividade recente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Aniversariantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBirthdays.map(student => (
                  <div key={student.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(student.birthDate + 'T00:00:00Z').toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          timeZone: 'UTC'
                        })}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {student.category}
                    </div>
                  </div>
                ))}
                {upcomingBirthdays.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhum aniversário nos próximos 7 dias
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-md shadow-sm">
                    <p className="font-semibold text-football-dark-green">{event.title}</p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{event.date} às {event.time}</span>
                      </div>
                      {event.category && (
                        <p className="text-xs"><span className="font-medium">Categoria:</span> {event.category}</p>
                      )}
                      {event.location && (
                        <div className="flex items-center text-xs">
                          <MapPin className="h-3 w-3 mr-1.5 text-gray-500 flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum evento nos próximos 15 dias.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard; 