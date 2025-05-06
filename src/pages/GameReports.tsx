
import { MainLayout } from "@/components/layout/MainLayout";
import { GameReportStats } from "@/components/scout/reports/GameReportStats";
import { GameReportFilters } from "@/components/scout/reports/GameReportFilters";
import { useState } from "react";
import { Match } from "@/components/scout/types";
import { getStoredMatches, getMatchPlayers } from "@/components/scout/matchStorage";

const GameReports = () => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const matches = getStoredMatches();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatório de Jogos</h2>
          <p className="text-muted-foreground">
            Análise estatística dos jogos e desempenho dos jogadores
          </p>
        </div>

        <GameReportFilters
          matches={matches}
          selectedMatch={selectedMatch}
          selectedCategory={selectedCategory}
          selectedPlayer={selectedPlayer}
          selectedAction={selectedAction}
          onMatchChange={setSelectedMatch}
          onCategoryChange={setSelectedCategory}
          onPlayerChange={setSelectedPlayer}
          onActionChange={setSelectedAction}
        />

        <GameReportStats
          matches={matches}
          selectedMatch={selectedMatch}
          selectedCategory={selectedCategory}
          selectedPlayer={selectedPlayer}
          selectedAction={selectedAction}
        />
      </div>
    </MainLayout>
  );
};

export default GameReports;
