import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, CalendarDays, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { CompetitionGameForm, CompetitionGame } from "@/components/activities/CompetitionGameForm";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useGetCompetitionGames,
  useCreateCompetitionGame,
  useUpdateCompetitionGame,
  useDeleteCompetitionGame
} from "@/hooks/useCompetitionGames";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";

// Helper para formatar a data e hora de forma mais amigável
const formatGameDateTime = (date: Date, time: string) => {
  try {
    const formattedDate = formatDate(date, "P", { locale: ptBR });
    return `${formattedDate} às ${time}`;
  } catch (error) {
    console.error("Error formatting date/time:", error);
    // Fallback se a data ou hora forem inválidas
    const dateStr = date instanceof Date && !isNaN(date.valueOf()) ? date.toLocaleDateString('pt-BR') : 'Data inválida';
    const timeStr = typeof time === 'string' ? time : 'Hora inválida';
    return `${dateStr} às ${timeStr}`;
  }
};

const Atividades = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<CompetitionGame | undefined>(undefined);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<CompetitionGame | undefined>(undefined);

  const { data: games = [], isLoading: isLoadingGames, error: fetchError } = useGetCompetitionGames();
  const createGameMutation = useCreateCompetitionGame();
  const updateGameMutation = useUpdateCompetitionGame();
  const deleteGameMutation = useDeleteCompetitionGame();

  const handleSaveGame = async (gameData: CompetitionGame) => {
    try {
      if (editingGame && editingGame.id) {
        await updateGameMutation.mutateAsync({ ...editingGame, ...gameData });
        toast({ title: "Sucesso!", description: "Jogo atualizado com sucesso." });
      } else {
        await createGameMutation.mutateAsync(gameData);
        toast({ title: "Sucesso!", description: "Novo jogo cadastrado." });
      }
      setIsFormOpen(false);
      setEditingGame(undefined);
    } catch (error) {
      console.error("Detalhes Completos do Erro ao Salvar Jogo:", error);
      let errorMessage = "Ocorreu um erro desconhecido.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      toast({ variant: "destructive", title: "Erro ao salvar jogo", description: errorMessage });
    }
  };

  const handleOpenNewForm = () => {
    setEditingGame(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (game: CompetitionGame) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };
  
  const handleDeleteRequest = (game: CompetitionGame) => {
    setGameToDelete(game);
    setIsConfirmDeleteOpen(true);
  };

  const executeDeleteGame = async () => {
    if (!gameToDelete || !gameToDelete.id) return;
    try {
      await deleteGameMutation.mutateAsync(gameToDelete.id);
      toast({ title: "Sucesso!", description: "Jogo excluído." });
      setGameToDelete(undefined);
    } catch (error) {
      console.error("Erro ao excluir jogo:", error);
      toast({ variant: "destructive", title: "Erro ao excluir", description: (error as Error).message });
    }
  };

  // Ordenar jogos por data (mais recentes primeiro)
  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [games]);

  const isLoading = isLoadingGames || createGameMutation.isPending || updateGameMutation.isPending || deleteGameMutation.isPending;

  return (
    <MainLayout>
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        if (isLoading) return; // Previne fechar enquanto está carregando
        setIsFormOpen(isOpen);
        if (!isOpen) setEditingGame(undefined);
      }}>
        <div className="space-y-6 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Atividades e Competições</h2>
              <p className="text-muted-foreground">
                Gerencie os jogos e outras atividades da escolinha.
              </p>
            </div>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNewForm} className="bg-football-green hover:bg-football-dark-green">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Jogo/Atividade
              </Button>
            </DialogTrigger>
          </div>

          {fetchError && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader><CardTitle className="text-red-700">Erro ao Carregar Jogos</CardTitle></CardHeader>
              <CardContent><p className="text-red-600">{fetchError.message}</p></CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lista de Jogos e Atividades</CardTitle>
              {isLoadingGames && <p className="text-sm text-muted-foreground">Carregando lista...</p>}
            </CardHeader>
            <CardContent>
              {!isLoadingGames && sortedGames.length === 0 && !fetchError && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma atividade ou jogo cadastrado ainda.
                </p>
              )}
              {sortedGames.length > 0 && (
                <div className="space-y-4">
                  {sortedGames.map(game => (
                    <Card key={game.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-start gap-2">
                            <div>
                                <CardTitle className="text-lg mb-1 text-football-dark-green">{game.championshipName}</CardTitle>
                                <CardDescription className="text-sm text-slate-600 dark:text-slate-400">Categoria: {game.category}</CardDescription>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                                <Button variant="outline" size="icon" onClick={() => handleOpenEditForm(game)} disabled={isLoading} aria-label="Editar Jogo">
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => handleDeleteRequest(game)} disabled={isLoading} aria-label="Excluir Jogo">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div className="flex items-center">
                            <CalendarDays className="h-4 w-4 mr-2 text-sky-600" />
                            <span>{formatGameDateTime(game.date, game.time)}</span>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-red-600" />
                            <span>{game.location}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogContent className="sm:max-w-[625px]">
          {isFormOpen && (
            <CompetitionGameForm 
              key={editingGame ? editingGame.id : 'new'} 
              initialData={editingGame}
              onSave={handleSaveGame}
              onCancel={() => {
                if (createGameMutation.isPending || updateGameMutation.isPending) return;
                setIsFormOpen(false);
                setEditingGame(undefined);
              }}
              isLoading={createGameMutation.isPending || updateGameMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onConfirm={executeDeleteGame}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o jogo "${gameToDelete?.championshipName}" da categoria ${gameToDelete?.category}? Esta ação não poderá ser desfeita.`}
        confirmButtonText="Excluir"
        confirmButtonVariant="destructive"
      />
    </MainLayout>
  );
};

export default Atividades; 