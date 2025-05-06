import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

interface RecentActivity {
  id: string;
  type: 'matricula' | 'mensalidade' | 'jogo' | 'treino' | 'avaliacao';
  title: string;
  description: string;
  createdAt: string;
}

interface Event {
  id: string;
  type: 'treino' | 'jogo' | 'avaliacao';
  title: string;
  date: string;
  time: string;
}

export const useRecentActivities = () => {
  return useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      // Buscar matrículas recentes
      const { data: enrollments } = await supabase
        .from('students')
        .select('id, name, category, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Buscar pagamentos recentes
      const { data: payments } = await supabase
        .from('payments')
        .select('id, student:student_id(name), month, year, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Buscar jogos recentes
      const { data: games } = await supabase
        .from('games')
        .select('id, category, opponent, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Formatar atividades recentes
      const activities: RecentActivity[] = [
        ...(enrollments?.map(e => ({
          id: e.id,
          type: 'matricula' as const,
          title: 'Nova matrícula realizada',
          description: `${e.name} - Categoria ${e.category}`,
          createdAt: e.created_at
        })) || []),
        ...(payments?.map(p => ({
          id: p.id,
          type: 'mensalidade' as const,
          title: 'Mensalidade registrada',
          description: `${p.student.name} - ${p.month}/${p.year}`,
          createdAt: p.created_at
        })) || []),
        ...(games?.map(g => ({
          id: g.id,
          type: 'jogo' as const,
          title: 'Jogo agendado',
          description: `${g.category} vs ${g.opponent}`,
          createdAt: g.created_at
        })) || [])
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      // Buscar próximos eventos
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const { data: upcomingGames } = await supabase
        .from('games')
        .select('*')
        .gte('date', today.toISOString())
        .lte('date', nextWeek.toISOString())
        .order('date', { ascending: true });

      const { data: upcomingTrainings } = await supabase
        .from('trainings')
        .select('*')
        .gte('date', today.toISOString())
        .lte('date', nextWeek.toISOString())
        .order('date', { ascending: true });

      const { data: upcomingEvaluations } = await supabase
        .from('evaluations')
        .select('*')
        .gte('date', today.toISOString())
        .lte('date', nextWeek.toISOString())
        .order('date', { ascending: true });

      // Formatar próximos eventos
      const events: Event[] = [
        ...(upcomingTrainings?.map(t => ({
          id: t.id,
          type: 'treino' as const,
          title: `Treino ${t.category}`,
          date: new Date(t.date).toLocaleDateString('pt-BR'),
          time: new Date(t.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        })) || []),
        ...(upcomingGames?.map(g => ({
          id: g.id,
          type: 'jogo' as const,
          title: `Jogo ${g.category}`,
          date: new Date(g.date).toLocaleDateString('pt-BR'),
          time: new Date(g.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        })) || []),
        ...(upcomingEvaluations?.map(e => ({
          id: e.id,
          type: 'avaliacao' as const,
          title: 'Avaliação Física',
          date: new Date(e.date).toLocaleDateString('pt-BR'),
          time: new Date(e.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        })) || [])
      ].sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      }).slice(0, 3);

      return {
        activities,
        events
      };
    }
  });
}; 