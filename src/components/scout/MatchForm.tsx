
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Match } from "./types";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { ptBR } from "date-fns/locale";
import { getStoredPlayers } from "./playerStorage";
import { getStoredStudents } from "@/components/students/studentStorage";
import { cn } from "@/lib/utils";

interface MatchFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (match: Match, selectedPlayers: string[]) => void;
}

export const MatchForm: React.FC<MatchFormProps> = ({ 
  open, 
  onClose, 
  onSave 
}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [opponent, setOpponent] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [category, setCategory] = useState("Sub-7");
  const [availablePlayers, setAvailablePlayers] = useState<{ id: string; name: string; position: string; number: number }[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  // Updated categories to match Alunos categories
  const categories = ["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15"];

  useEffect(() => {
    const students = getStoredStudents();
    
    setAvailablePlayers(
      students
        .filter(student => {
          // Match by exact category
          return (student.category || "") === category;
        })
        .map(({ id, name, position, number }) => ({
          id: typeof id === "number" ? String(id) : id,
          name,
          position: position || "Atleta",
          number: number || 0, // Use 0 as a default if number is undefined
        }))
    );
  }, [category]);

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSave = () => {
    // Update players array to mark first 5 as starters and rest as reserves
    const playersWithRoles = selectedPlayers.map((playerId, index) => {
      const player = availablePlayers.find(p => p.id === playerId);
      if (!player) return null;
      
      return {
        ...player,
        isReserve: index >= 5 // First 5 are starters, rest are reserves
      };
    }).filter((p): p is NonNullable<typeof p> => p !== null);

    const match: Match = {
      id: uuidv4(),
      date: format(date, "yyyy-MM-dd"),
      opponent: isTraining ? undefined : opponent,
      isTraining,
      category
    };

    onSave(match, selectedPlayers);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto w-full md:max-w-md">
        <SheetHeader>
          <SheetTitle>Cadastrar Partida</SheetTitle>
          <SheetDescription>
            Adicione uma nova partida ou treino
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Data
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isTraining" className="text-right">
              Tipo
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Checkbox 
                id="isTraining" 
                checked={isTraining} 
                onCheckedChange={() => setIsTraining(!isTraining)} 
              />
              <label htmlFor="isTraining" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Treino (sem adversário)
              </label>
            </div>
          </div>
          
          {!isTraining && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="opponent" className="text-right">
                Adversário
              </Label>
              <Input
                id="opponent"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoria
            </Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione uma categoria" />
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
          
          <div className="mt-4">
            <Label className="mb-2 block">Selecione os jogadores:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto border rounded-md p-2">
              {availablePlayers.length > 0 ? (
                availablePlayers.map(player => (
                  <div key={player.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`player-${player.id}`}
                      checked={selectedPlayers.includes(player.id)}
                      onCheckedChange={() => handlePlayerToggle(player.id)}
                    />
                    <label 
                      htmlFor={`player-${player.id}`} 
                      className="text-sm font-medium"
                    >
                      {player.number ? `${player.number} - ` : ''}{player.name} ({player.position})
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum jogador encontrado para a categoria selecionada.</p>
              )}
            </div>
          </div>
        </div>
        
        <SheetFooter>
          <Button onClick={handleSave}>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
