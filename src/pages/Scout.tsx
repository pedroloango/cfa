import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Goal, 
  ShieldAlert, 
  HandPlatter, 
  Shield, 
  X, 
  Clock,
  ArrowLeft,
  UserPlus,
  Flag,
  Calendar,
  RefreshCcw,
  Target,
  Check,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Player, ScoutAction, ScoutActionType, ActionRequiringLocation, Match } from "@/components/scout/types";
import { PlayerForm } from "@/components/scout/PlayerForm";
import { PlayerJersey } from "@/components/scout/PlayerJersey";
import { ActionButtons } from "@/components/scout/ActionButtons";
import { SubstitutionDialog } from "@/components/scout/SubstitutionDialog";
import { CourtAreaButtons } from "@/components/scout/CourtAreaButtons";
import { MatchForm } from "@/components/scout/MatchForm";
import { getStoredPlayers, savePlayers } from "@/components/scout/playerStorage";
import { getStoredMatches, saveMatches, getCurrentMatch, setCurrentMatch, getMatchPlayers, saveMatchPlayers } from "@/components/scout/matchStorage";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStoredStudents } from "@/components/students/studentStorage";
import { FileText } from "lucide-react";

const Scout = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedReserve, setSelectedReserve] = useState<Player | null>(null);
  const [category, setCategory] = useState("Sub-7");
  const [actions, setActions] = useState<ScoutAction[]>([]);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [showSubstitutionDialog, setShowSubstitutionDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ScoutActionType | null>(null);
  const [showCourtAreas, setShowCourtAreas] = useState(false);
  const [currentMatch, setCurrentMatchState] = useState<Match | null>(null);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const categories = ["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15"];

  useEffect(() => {
    if (players.length === 0 && category && !studentsLoaded) {
      const alunos = getStoredStudents();
      
      const mappedAlunos = alunos.filter(
        al => (al.category || "") === category
      );
      const asPlayers: Player[] = mappedAlunos.map((al, i) => ({
        id: String(al.id),
        name: al.name,
        position: al.position || "Atleta",
        number: al.number || (i + 1),
        isReserve: false
      }));
      setPlayers(asPlayers);
      setStudentsLoaded(true);
    }
  }, [players, studentsLoaded, category]);

  useEffect(() => {
    if (currentMatch) {
      const matchPlayerIds = getMatchPlayers();
      if (matchPlayerIds && matchPlayerIds.length > 0) {
        const updatedPlayers = players.map(player => ({
          ...player,
          isReserve: !matchPlayerIds.includes(player.id)
        }));
        setPlayers(updatedPlayers);
      }
    }
  }, [currentMatch, players]);

  const activePlayers = players.filter(p => !p.isReserve);
  const reservePlayers = players.filter(p => p.isReserve);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleAddPlayer = (player: Player) => {
    const updatedPlayers = [...players, player];
    setPlayers(updatedPlayers);
    savePlayers(updatedPlayers);
    
    toast({
      title: "Jogador adicionado",
      description: `${player.name} foi adicionado à lista de jogadores.`,
    });
  };

  const actionRequiresLocation = (type: ScoutActionType): boolean => {
    const locationActions: ActionRequiringLocation[] = ["goal", "desarme", "falta", "chuteGol"];
    return locationActions.includes(type as ActionRequiringLocation);
  };

  const handleAction = (type: ScoutActionType) => {
    if (!selectedPlayer) {
      toast({
        title: "Selecione um jogador",
        description: "Por favor, selecione um jogador antes de registrar uma ação.",
        variant: "destructive",
      });
      return;
    }

    if (actionRequiresLocation(type)) {
      setSelectedAction(type);
      setShowCourtAreas(true);
    } else {
      registerAction(type);
    }
  };

  const handleAreaClick = (areaNumber: number) => {
    if (selectedAction && selectedPlayer) {
      registerAction(selectedAction, areaNumber);
      setSelectedAction(null);
      setShowCourtAreas(false);
    }
  };

  const registerAction = (type: ScoutActionType, areaNumber?: number) => {
    if (!selectedPlayer) return;

    const newAction: ScoutAction = {
      id: Date.now(),
      player: selectedPlayer,
      type,
      timestamp: getCurrentTime(),
      areaNumber
    };

    setActions(prev => [newAction, ...prev]);
    
    toast({
      title: "Ação registrada",
      description: `${getActionName(type)} registrado para o jogador ${selectedPlayer.name}${areaNumber ? ` na área ${areaNumber}` : ""}.`,
    });
  };

  const handlePlayerClick = (player: Player) => {
    if (player.isReserve) {
      setSelectedReserve(player);
      setSelectedPlayer(null);

      const titularesEmCampo = players.filter(p => !p.isReserve).length;

      if (titularesEmCampo < 5) {
        const updatedPlayers = players.map(p => {
          if (p.id === player.id) {
            return { ...p, isReserve: false };
          }
          return p;
        });
        setPlayers(updatedPlayers);
        savePlayers(updatedPlayers);

        toast({
          title: "Jogador entrou em campo",
          description: `${player.name} foi adicionado como titular automaticamente.`,
        });
        setSelectedReserve(null);
        setShowSubstitutionDialog(false);
      } else {
        setShowSubstitutionDialog(true);
      }
    } else {
      setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
      setSelectedReserve(null);
    }
  };

  const handleSubstitution = (activePlayerId: string, reservePlayerId: string) => {
    const updatedPlayers = players.map(player => {
      if (player.id === activePlayerId) {
        return { ...player, isReserve: true };
      }
      if (player.id === reservePlayerId) {
        return { ...player, isReserve: false };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    savePlayers(updatedPlayers);
    setSelectedReserve(null);
    
    toast({
      title: "Substituição realizada",
      description: "A substituição foi realizada com sucesso.",
    });
  };

  const handleMatchSave = (match: Match, selectedPlayers: string[]) => {
    const matches = getStoredMatches();
    const updatedMatches = [...matches, match];
    saveMatches(updatedMatches);
    
    setCurrentMatchState(match);
    setCurrentMatch(match);
    setCategory(match.category);
    
    saveMatchPlayers(selectedPlayers);
    
    const updatedPlayers = players.map(player => ({
      ...player,
      isReserve: !selectedPlayers.includes(player.id)
    }));
    
    setPlayers(updatedPlayers);
    savePlayers(updatedPlayers);
    
    toast({
      title: match.isTraining ? "Treino cadastrado" : "Partida cadastrada",
      description: `${match.isTraining ? "Treino" : "Partida contra " + match.opponent} em ${new Date(match.date).toLocaleDateString()}`,
    });
  };

  const getActionName = (type: ScoutActionType) => {
    switch (type) {
      case "goal": return "Gol";
      case "assistencia": return "Assistência";
      case "desarme": return "Desarme";
      case "golSofrido": return "Gol Sofrido";
      case "falta": return "Falta";
      case "passeCerto": return "Passe Certo";
      case "passeErrado": return "Passe Errado";
      case "chuteGol": return "Chute a Gol";
      default: return "Ação";
    }
  };

  const getActionIcon = (type: ScoutActionType) => {
    switch (type) {
      case "goal": 
        return <Goal className="h-4 w-4 text-green-500" />;
      case "assistencia": 
        return <HandPlatter className="h-4 w-4 text-blue-500" />;
      case "desarme": 
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case "golSofrido": 
        return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case "falta":
        return <Flag className="h-4 w-4 text-yellow-600" />;
      case "passeCerto":
        return <Check className="h-4 w-4 text-green-500" />;
      case "passeErrado":
        return <X className="h-4 w-4 text-red-500" />;
      case "chuteGol":
        return <Target className="h-4 w-4 text-purple-500" />;
      default: 
        return null;
    }
  };

  const deleteAction = (id: number) => {
    setActions(actions.filter(action => action.id !== id));
    toast({
      title: "Ação removida",
      description: "A ação foi removida com sucesso.",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Scout de Jogo</h2>
            <p className="text-muted-foreground">
              Registre as ações dos jogadores durante a partida
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/relatorio-jogos")}
              size={isMobile ? "sm" : "default"}
            >
              <FileText className="mr-2 h-4 w-4" /> {!isMobile && "Relatório de Jogos"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPlayerForm(true)}
              size={isMobile ? "sm" : "default"}
            >
              <UserPlus className="mr-2 h-4 w-4" /> {!isMobile && "Cadastrar Jogador"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowMatchForm(true)}
              size={isMobile ? "sm" : "default"}
            >
              <Calendar className="mr-2 h-4 w-4" /> {!isMobile && "Cadastrar Partida"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/avaliacoes")}
              size={isMobile ? "sm" : "default"}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> {!isMobile && "Voltar para Avaliações"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <CardTitle>
                      {currentMatch ? (
                        <>
                          {currentMatch.isTraining ? "Treino" : `Partida vs ${currentMatch.opponent}`}
                          <span className="text-sm font-normal ml-2">
                            {new Date(currentMatch.date).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        "Categoria"
                      )}
                    </CardTitle>
                  </div>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden bg-blue-600">
              <CardContent className="p-0">
                <div 
                  className="relative w-full bg-cover bg-center flex flex-col sm:flex-row"
                >
                  <div className="block sm:hidden w-full overflow-x-auto whitespace-nowrap p-2">
                    <div className="inline-flex">
                      {activePlayers.length > 0 ? (
                        activePlayers.map(player => (
                          <div className="inline-block" key={player.id}>
                            <PlayerJersey
                              player={player}
                              isSelected={selectedPlayer?.id === player.id}
                              onClick={() => handlePlayerClick(player)}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-white text-center py-4">
                          <p>Cadastre jogadores para iniciar</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="hidden sm:flex w-1/6 p-2 flex-col justify-start max-h-[400px] overflow-hidden">
                    <div className="flex flex-col space-y-2 overflow-y-auto">
                      {activePlayers.length > 0 ? (
                        activePlayers.map(player => (
                          <PlayerJersey
                            key={player.id}
                            player={player}
                            isSelected={selectedPlayer?.id === player.id}
                            onClick={() => handlePlayerClick(player)}
                          />
                        ))
                      ) : (
                        <div className="text-white text-center mt-4">
                          <p>Cadastre jogadores</p>
                          <p>para iniciar</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-5/6 relative">
                    <img 
                      src="/lovable-uploads/bcfb8214-5720-4779-9ab4-400bc57f8239.png" 
                      alt="Quadra de Futsal" 
                      className="w-full h-full object-contain"
                    />
                    <CourtAreaButtons 
                      visible={showCourtAreas} 
                      onAreaClick={handleAreaClick} 
                    />
                  </div>
                </div>

                <div className="bg-blue-700 p-2 sm:p-4">
                  <div className="mb-4">
                    <h3 className="text-white font-bold mb-2">Reservas</h3>
                    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                      {reservePlayers.length > 0 ? (
                        reservePlayers.map(player => (
                          <PlayerJersey
                            key={player.id}
                            player={player}
                            isSelected={selectedReserve?.id === player.id}
                            onClick={() => handlePlayerClick(player)}
                          />
                        ))
                      ) : (
                        <p className="text-white text-sm">Nenhum jogador reserva cadastrado</p>
                      )}
                    </div>
                  </div>

                  <ActionButtons 
                    disabled={!selectedPlayer} 
                    onAction={handleAction}
                    selectedAction={selectedAction} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="order-first md:order-last">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Registro de Ações</CardTitle>
                <CardDescription>
                  Ações registradas durante o jogo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[300px] sm:max-h-[450px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Nº</TableHead>
                        <TableHead>Atleta</TableHead>
                        <TableHead className="w-[90px]">Hora</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead className="w-[50px]">Área</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {actions.length > 0 ? (
                        actions.map((action) => (
                          <TableRow key={action.id}>
                            <TableCell className="font-medium">{action.player.number}</TableCell>
                            <TableCell>{action.player.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{action.timestamp}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getActionIcon(action.type)}
                                <span>{getActionName(action.type)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {action.areaNumber && <span>{action.areaNumber}</span>}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteAction(action.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            Nenhuma ação registrada.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PlayerForm 
        open={showPlayerForm} 
        onClose={() => setShowPlayerForm(false)} 
        onSave={handleAddPlayer} 
      />

      <MatchForm
        open={showMatchForm}
        onClose={() => setShowMatchForm(false)}
        onSave={handleMatchSave}
      />

      <SubstitutionDialog
        open={showSubstitutionDialog}
        onClose={() => {
          setShowSubstitutionDialog(false);
          setSelectedReserve(null);
        }}
        reservePlayer={selectedReserve}
        activePlayers={activePlayers}
        onSubstitute={handleSubstitution}
      />
    </MainLayout>
  );
};

export default Scout;
