
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Player } from "./types";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";

interface PlayerFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (player: Player) => void;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ 
  open, 
  onClose, 
  onSave 
}) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [number, setNumber] = useState("");
  const [isReserve, setIsReserve] = useState(false);

  const handleSave = () => {
    if (!name || !position || !number) return;

    const player: Player = {
      id: uuidv4(),
      name,
      position,
      number: parseInt(number),
      isReserve
    };

    onSave(player);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setPosition("");
    setNumber("");
    setIsReserve(false);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Cadastrar Jogador</SheetTitle>
          <SheetDescription>
            Adicione um novo jogador à partida
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Posição
            </Label>
            <Select 
              value={position} 
              onValueChange={setPosition}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione uma posição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goleiro">Goleiro</SelectItem>
                <SelectItem value="fixo">Fixo</SelectItem>
                <SelectItem value="alaEsquerda">Ala Esquerda</SelectItem>
                <SelectItem value="alaDireita">Ala Direita</SelectItem>
                <SelectItem value="pivo">Pivô</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="number" className="text-right">
              Número
            </Label>
            <Input
              id="number"
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isReserve" className="text-right">
              Reserva
            </Label>
            <Select 
              value={isReserve ? "true" : "false"} 
              onValueChange={(value) => setIsReserve(value === "true")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Titular ou Reserva" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Titular</SelectItem>
                <SelectItem value="true">Reserva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSave}>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
