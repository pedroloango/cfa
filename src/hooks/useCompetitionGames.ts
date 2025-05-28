import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient'; 
import type { CompetitionGame } from '@/components/activities/CompetitionGameForm'; // Reutilizar a interface

// Interface para os dados do banco (snake_case)
interface CompetitionGameDbRow {
  id: string;
  created_at: string;
  championship_name: string;
  category: string;
  game_date: string; // YYYY-MM-DD
  game_time: string; // HH:MM:SS ou HH:MM
  location: string;
  user_id?: string;
}

// Helper para converter data JS para formato YYYY-MM-DD
const formatDateForDb = (date: Date | string | undefined | null): string | null => {
  if (!date) return null;
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  if (typeof date === 'string') {
    // Tenta converter se for dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [day, month, year] = date.split('/');
      return `${year}-${month}-${day}`;
    }
    return date.split('T')[0]; // Assume YYYY-MM-DD ou ISO
  }
  return null;
};

// Mapear de CompetitionGame (camelCase) para o formato do DB (snake_case)
const mapGameToDb = (game: Partial<CompetitionGame>): Partial<CompetitionGameDbRow> => {
  const dbRow: Partial<CompetitionGameDbRow> = {};
  if (game.championshipName !== undefined) dbRow.championship_name = game.championshipName;
  if (game.category !== undefined) dbRow.category = game.category;
  if (game.date !== undefined) dbRow.game_date = formatDateForDb(game.date);
  if (game.time !== undefined) dbRow.game_time = game.time; // Supabase time type aceita HH:MM
  if (game.location !== undefined) dbRow.location = game.location;
  // user_id pode ser adicionado aqui se gerenciado pelo front-end
  // if (game.userId) dbRow.user_id = game.userId;
  return dbRow;
};

// Mapear do formato do DB (snake_case) para CompetitionGame (camelCase)
const mapDbToGame = (dbRow: CompetitionGameDbRow): CompetitionGame => ({
  id: dbRow.id,
  championshipName: dbRow.championship_name,
  category: dbRow.category,
  date: new Date(dbRow.game_date + 'T' + dbRow.game_time), // Combinar data e hora para objeto Date
  time: dbRow.game_time.substring(0, 5), // Pegar HH:MM
  location: dbRow.location,
  // userId: dbRow.user_id, (se aplicável)
});

const GAMES_QUERY_KEY = 'competitionGames';

// Hook para buscar todos os jogos
export const useGetCompetitionGames = () =>
  useQuery<CompetitionGame[], Error>({
    queryKey: [GAMES_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_games')
        .select('*')
        .order('game_date', { ascending: false })
        .order('game_time', { ascending: false });

      if (error) throw error;
      return data ? data.map(mapDbToGame) : [];
    },
  });

// Hook para criar um novo jogo
export const useCreateCompetitionGame = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CompetitionGame, 
    Error,           
    Omit<CompetitionGame, 'id'> 
  >({
    mutationFn: async (newGameData) => {
      // Verificar status do usuário ANTES de tentar a inserção
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('User status in createGame mutation:', user); // Log do usuário
      if (userError) {
        console.error('Error getting user in createGame mutation:', userError);
        throw new Error('Erro na sessão do usuário: ' + userError.message);
      }
      if (!user) {
        console.error('Nenhum usuário autenticado encontrado ao tentar criar jogo.');
        throw new Error('Usuário não autenticado. Faça login para criar um jogo.');
      }

      const dbPayload = mapGameToDb(newGameData);
      // user_id será adicionado ao payload, pois o usuário está confirmado como autenticado
      (dbPayload as CompetitionGameDbRow).user_id = user.id;
      
      console.log("Payload para inserção do jogo:", dbPayload); // Log do payload

      const { data, error: insertError } = await supabase
        .from('competition_games')
        .insert([dbPayload])
        .select()
        .single();

      if (insertError) {
        console.error("Erro Supabase ao inserir jogo:", insertError); // Log do erro de inserção
        throw insertError; // Re-throw para ser pego pelo catch do handleSaveGame
      }
      if (!data) throw new Error('Falha ao criar jogo, nenhum dado retornado.');
      return mapDbToGame(data as CompetitionGameDbRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_QUERY_KEY] });
    },
    onError: (error) => {
      // Log adicional no onError da mutação, se necessário
      console.error("Erro na mutação useCreateCompetitionGame:", error);
    }
  });
};

// Hook para atualizar um jogo existente
export const useUpdateCompetitionGame = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CompetitionGame, 
    Error, 
    CompetitionGame // Input é o jogo completo com ID
  >({
    mutationFn: async (gameToUpdate) => {
      if (!gameToUpdate.id) throw new Error('Game ID is required for update.');
      const dbPayload = mapGameToDb(gameToUpdate);
      const { data, error } = await supabase
        .from('competition_games')
        .update(dbPayload)
        .eq('id', gameToUpdate.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update game, no data returned.');
      return mapDbToGame(data as CompetitionGameDbRow);
    },
    onSuccess: (updatedGame) => {
      queryClient.invalidateQueries({ queryKey: [GAMES_QUERY_KEY] });
      // Opcionalmente, atualizar o cache diretamente se a lista for grande
      // queryClient.setQueryData([GAMES_QUERY_KEY], (oldData?: CompetitionGame[]) => 
      //   oldData ? oldData.map(g => g.id === updatedGame.id ? updatedGame : g) : []
      // );
    },
  });
};

// Hook para deletar um jogo
export const useDeleteCompetitionGame = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({ // Input é o ID do jogo
    mutationFn: async (gameId) => {
      const { error } = await supabase
        .from('competition_games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAMES_QUERY_KEY] });
    },
  });
}; 