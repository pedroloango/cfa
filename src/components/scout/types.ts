
export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  isReserve: boolean;
}

export type ScoutActionType = "goal" | "assistencia" | "desarme" | "golSofrido" | "falta" | "passeCerto" | "passeErrado" | "chuteGol";

export interface ScoutAction {
  id: number;
  player: Player;
  type: ScoutActionType;
  timestamp: string;
  areaNumber?: number; // Área da quadra onde a ação aconteceu
}

export type ActionRequiringLocation = "goal" | "desarme" | "falta" | "chuteGol";

export interface Match {
  id: string;
  date: string;
  opponent?: string;
  isTraining: boolean;
  category: string;
}
