
import React from "react";
import { Player } from "./types";
import { cn } from "@/lib/utils";
import { Shirt } from "lucide-react";

interface PlayerJerseyProps {
  player: Player;
  isSelected: boolean;
  onClick: () => void;
}

export const PlayerJersey: React.FC<PlayerJerseyProps> = ({ 
  player, 
  isSelected, 
  onClick 
}) => {
  // Ajuste: titulares menores, reservas do mesmo tamanho de antes
  const isTitular = !player.isReserve;

  return (
    <div className="flex flex-col items-center mb-4">
      <button
        onClick={onClick}
        className={cn(
          // Altura reduzida em 30% para titulares
          isTitular
            ? "w-12 h-14 flex flex-col items-center justify-center text-white rounded-md relative transition-all"
            : "w-16 h-20 flex flex-col items-center justify-center text-white rounded-md relative transition-all",
          isSelected
            ? "bg-yellow-500 text-black border-2 border-yellow-600"
            : "bg-blue-600 hover:bg-blue-500 border-2 border-white"
        )}
      >
        <Shirt className={isTitular ? "w-6 h-6 mb-1" : "w-8 h-8 mb-1"} />
        <div className="text-sm font-bold">{player.number}</div>
      </button>
      <span className="text-xs mt-1 text-white font-medium text-center">{player.name}</span>
    </div>
  );
};
