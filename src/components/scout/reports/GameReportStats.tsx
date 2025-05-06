
import { Match, ScoutAction } from "@/components/scout/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getStoredStudents } from "@/components/students/studentStorage";

interface GameReportStatsProps {
  matches: Match[];
  selectedMatch: string | null;
  selectedCategory: string | null;
  selectedPlayer: string | null;
  selectedAction: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const actionLabels: Record<string, string> = {
  goal: "Gols",
  assistencia: "Assistências",
  desarme: "Desarmes",
  golSofrido: "Gols Sofridos",
  falta: "Faltas",
  passeCerto: "Passes Certos",
  passeErrado: "Passes Errados",
  chuteGol: "Chutes a Gol"
};

export const GameReportStats = ({
  matches,
  selectedMatch,
  selectedCategory,
  selectedPlayer,
  selectedAction
}: GameReportStatsProps) => {
  const students = getStoredStudents();

  const getActionStats = () => {
    let filteredMatches = matches;
    
    if (selectedMatch) {
      filteredMatches = matches.filter(m => m.id === selectedMatch);
    }

    if (selectedCategory) {
      filteredMatches = filteredMatches.filter(m => m.category === selectedCategory);
    }

    const stats: Record<string, number> = {};
    
    Object.keys(actionLabels).forEach(action => {
      stats[action] = 0;
    });

    // Count actions
    filteredMatches.forEach(match => {
      // You would need to implement a way to get actions for a match
      // This is just a placeholder for the statistics
      // Replace this with your actual match actions data structure
      const actions: ScoutAction[] = []; // Get actions for this match
      
      actions.forEach(action => {
        if (
          (!selectedPlayer || action.player.id === selectedPlayer) &&
          (!selectedAction || action.type === selectedAction)
        ) {
          stats[action.type]++;
        }
      });
    });

    return Object.entries(stats).map(([key, value]) => ({
      name: actionLabels[key],
      value
    }));
  };

  const actionStats = getActionStats();

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0D9F4F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proporção de Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {actionStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
