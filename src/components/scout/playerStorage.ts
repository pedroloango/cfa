
import { Player } from "./types";
import { getLocalData, saveLocalData } from "@/utils/localStorage";

const PLAYERS_STORAGE_KEY = "scout_players";

export const getStoredPlayers = (): Player[] => {
  return getLocalData<Player[]>(PLAYERS_STORAGE_KEY, []);
};

export const savePlayers = (players: Player[]): void => {
  saveLocalData(PLAYERS_STORAGE_KEY, players);
};
