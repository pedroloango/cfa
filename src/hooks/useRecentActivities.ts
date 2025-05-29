import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { CompetitionGame } from '@/components/activities/CompetitionGameForm';

interface RecentActivity {
  id: string;
  type: 'matricula' | 'mensalidade' | 'jogo' | 'treino' | 'avaliacao';
  title: string;
  description: string;
  createdAt: string;
}

interface Event {
  id: string;
  type: 'jogo';
  title: string;
  date: string;
  time: string;
  category?: string;
  location?: string;
}

// Interface para os dados brutos da tabela competition_games como eles vêm do Supabase
interface RawCompetitionGame {
  id: string;
  championship_name: string;
  category: string;
  game_date: string;
  game_time: string;
  location: string;
}

const formatDate = (dateString: string | Date): string => {
  const dateObj = new Date(dateString + 'T00:00:00');
  return dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatTime = (timeString: string): string => {
  if (timeString && timeString.includes(':')) {
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return timeString;
};

export const useRecentActivities = () => {
  return useQuery({
    queryKey: ['recent-activities-and-upcoming-events'],
    queryFn: async () => {
      const { data: enrollments } = await supabase
        .from('students')
        .select('id, name, category, created_at')
        .limit(3);

      console.log("Dashboard/Atividades - Enrollments recebidos:", enrollments);

      const { data: payments } = await supabase
        .from('payments')
        .select('id, student_id(name), description, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

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
          title: p.description ? 'Pagamento Registrado' : 'Mensalidade registrada',
          description: p.description || `${(p.student_id as any)?.name || 'Aluno não identificado'}`,
          createdAt: p.created_at
        })) || [])
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fifteenDaysLater = new Date(today);
      fifteenDaysLater.setDate(today.getDate() + 15);

      console.log("Dashboard/Eventos - Data Início Filtro:", today.toISOString().split('T')[0]);
      console.log("Dashboard/Eventos - Data Fim Filtro:", fifteenDaysLater.toISOString().split('T')[0]);

      const { data: upcomingCompetitionGames, error: gamesError } = await supabase
        .from('competition_games')
        .select('id, championship_name, category, game_date, game_time, location')
        .gte('game_date', today.toISOString().split('T')[0])
        .lte('game_date', fifteenDaysLater.toISOString().split('T')[0])
        .order('game_date', { ascending: true })
        .order('game_time', { ascending: true });

      if (gamesError) {
        console.error('Erro ao buscar competition_games:', gamesError);
      }
      
      console.log("Dashboard/Eventos - Jogos Brutos Recebidos:", upcomingCompetitionGames);
      console.log("Dashboard/Eventos - Erro na Busca:", gamesError);
      
      const events: Event[] = (upcomingCompetitionGames as RawCompetitionGame[] || []).map(game => ({
        id: game.id!,
        type: 'jogo' as const,
        title: game.championship_name,
        date: formatDate(game.game_date),
        time: formatTime(game.game_time),
        category: game.category,
        location: game.location,
      })).slice(0, 5);

      console.log("Dashboard/Eventos - Eventos Formatados:", events);

      return {
        activities,
        events
      };
    }
  });
}; 