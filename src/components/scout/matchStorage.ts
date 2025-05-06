
import { Match } from "./types";
import { getLocalData, saveLocalData } from "@/utils/localStorage";

const MATCHES_STORAGE_KEY = "scout_matches";
const CURRENT_MATCH_KEY = "current_match";
const MATCH_PLAYERS_KEY = "match_players";

export const getStoredMatches = (): Match[] => {
  return getLocalData<Match[]>(MATCHES_STORAGE_KEY, []);
};

export const saveMatches = (matches: Match[]): void => {
  saveLocalData(MATCHES_STORAGE_KEY, matches);
};

export const getCurrentMatch = (): Match | null => {
  return getLocalData<Match | null>(CURRENT_MATCH_KEY, null);
};

export const setCurrentMatch = (match: Match | null): void => {
  saveLocalData(CURRENT_MATCH_KEY, match);
};

export const getMatchPlayers = (): string[] => {
  return getLocalData<string[]>(MATCH_PLAYERS_KEY, []);
};

export const saveMatchPlayers = (playerIds: string[]): void => {
  saveLocalData(MATCH_PLAYERS_KEY, playerIds);
};

// Clear match players when not needed
export const clearMatchPlayers = (): void => {
  saveLocalData(MATCH_PLAYERS_KEY, []);
};
