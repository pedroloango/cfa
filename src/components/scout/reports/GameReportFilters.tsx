
import { Match } from "@/components/scout/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getStoredStudents } from "@/components/students/studentStorage";

interface GameReportFiltersProps {
  matches: Match[];
  selectedMatch: string | null;
  selectedCategory: string | null;
  selectedPlayer: string | null;
  selectedAction: string | null;
  onMatchChange: (value: string | null) => void;
  onCategoryChange: (value: string | null) => void;
  onPlayerChange: (value: string | null) => void;
  onActionChange: (value: string | null) => void;
}

const actions = [
  { value: "goal", label: "Gols" },
  { value: "assistencia", label: "Assistências" },
  { value: "desarme", label: "Desarmes" },
  { value: "golSofrido", label: "Gols Sofridos" },
  { value: "falta", label: "Faltas" },
  { value: "passeCerto", label: "Passes Certos" },
  { value: "passeErrado", label: "Passes Errados" },
  { value: "chuteGol", label: "Chutes a Gol" },
];

export const GameReportFilters = ({
  matches,
  selectedMatch,
  selectedCategory,
  selectedPlayer,
  selectedAction,
  onMatchChange,
  onCategoryChange,
  onPlayerChange,
  onActionChange,
}: GameReportFiltersProps) => {
  const students = getStoredStudents();
  const categories = Array.from(new Set(students.map(s => s.category))).sort();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Partida</Label>
            <Select
              value={selectedMatch || "all_matches"}
              onValueChange={value => onMatchChange(value === "all_matches" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma partida" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_matches">Todas as partidas</SelectItem>
                {matches.map(match => (
                  <SelectItem key={match.id} value={match.id}>
                    {match.isTraining ? "Treino" : `vs ${match.opponent}`} - {new Date(match.date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={selectedCategory || "all_categories"}
              onValueChange={value => onCategoryChange(value === "all_categories" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_categories">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Jogador</Label>
            <Select
              value={selectedPlayer || "all_players"}
              onValueChange={value => onPlayerChange(value === "all_players" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um jogador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_players">Todos os jogadores</SelectItem>
                {students
                  .filter(s => !selectedCategory || s.category === selectedCategory)
                  .map(student => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ação</Label>
            <Select
              value={selectedAction || "all_actions"}
              onValueChange={value => onActionChange(value === "all_actions" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_actions">Todas as ações</SelectItem>
                {actions.map(action => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
