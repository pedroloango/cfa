
import React, { useState } from "react";
import { Player } from "./types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayerJersey } from "./PlayerJersey";

interface SubstitutionDialogProps {
  open: boolean;
  onClose: () => void;
  reservePlayer: Player | null;
  activePlayers: Player[];
  onSubstitute: (activePlayerId: string, reservePlayerId: string) => void;
}

export const SubstitutionDialog: React.FC<SubstitutionDialogProps> = ({
  open,
  onClose,
  reservePlayer,
  activePlayers,
  onSubstitute,
}) => {
  const [selectedActivePlayer, setSelectedActivePlayer] = useState<string>("");

  const handleSubstitute = () => {
    if (reservePlayer && selectedActivePlayer) {
      onSubstitute(selectedActivePlayer, reservePlayer.id);
      onClose();
      setSelectedActivePlayer("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Substituição</DialogTitle>
          <DialogDescription>
            {reservePlayer 
              ? `Substituir jogador em campo pelo reserva ${reservePlayer.name} (${reservePlayer.number})` 
              : "Selecione um jogador reserva"}
          </DialogDescription>
        </DialogHeader>
        {reservePlayer && (
          <div className="py-4">
            <h3 className="mb-2 text-sm font-semibold">Selecione o jogador para substituir:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
              {activePlayers.map(player => (
                <div key={player.id} onClick={() => setSelectedActivePlayer(player.id)}>
                  <PlayerJersey
                    player={player}
                    isSelected={selectedActivePlayer === player.id}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubstitute} disabled={!selectedActivePlayer}>Substituir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
