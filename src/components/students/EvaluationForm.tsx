import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Student } from "./StudentForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Evaluation {
  id?: number;
  student?: Student;
  date: Date;
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  notes: string;
}

interface EvaluationFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (evaluation: Evaluation) => void;
  student?: Student;
  initialData?: Evaluation | null;
  studentsList: Student[];
}

export function EvaluationForm({
  open,
  onClose,
  onSave,
  student,
  initialData,
  studentsList,
}: EvaluationFormProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(student);
  const [date, setDate] = useState<Date>(initialData?.date || new Date());
  const [technical, setTechnical] = useState<number>(initialData?.technical || 0);
  const [tactical, setTactical] = useState<number>(initialData?.tactical || 0);
  const [physical, setPhysical] = useState<number>(initialData?.physical || 0);
  const [mental, setMental] = useState<number>(initialData?.mental || 0);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setSelectedStudent(initialData.student);
      setDate(initialData.date);
      setTechnical(initialData.technical);
      setTactical(initialData.tactical);
      setPhysical(initialData.physical);
      setMental(initialData.mental);
      setNotes(initialData.notes);
    } else {
      setSelectedStudent(undefined);
      setDate(new Date());
      setTechnical(0);
      setTactical(0);
      setPhysical(0);
      setMental(0);
      setNotes("");
    }
  }, [initialData]);

  const handleSave = () => {
    if (!selectedStudent) {
      toast({
        title: "Erro",
        description: "Selecione um aluno.",
        variant: "destructive",
      });
      return;
    }

    const evaluation: Evaluation = {
      id: initialData?.id,
      student: selectedStudent,
      date,
      technical,
      tactical,
      physical,
      mental,
      notes,
    };

    onSave(evaluation);
  };

  const filteredStudents = categoryFilter === "all"
    ? studentsList
    : studentsList.filter(s => s.category === categoryFilter);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Avaliação" : "Nova Avaliação"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Atualize os dados da avaliação."
              : "Preencha os dados para criar uma nova avaliação."}
          </DialogDescription>
        </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
              disabled={!!student}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtre por categoria" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {Array.from(new Set(studentsList.map(s => s.category))).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
            <Label>Aluno</Label>
            <Select
              value={selectedStudent?.id.toString()}
              onValueChange={(value) => {
                const student = filteredStudents.find(s => s.id.toString() === value);
                setSelectedStudent(student);
              }}
              disabled={!!student}
            >
              <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                {filteredStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name} - {student.category}
                  </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
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
            
              <div className="space-y-2">
            <Label>Avaliação Técnica</Label>
            <div className="flex items-center gap-4">
                <Slider
                value={[technical]}
                onValueChange={(value) => setTechnical(value[0])}
                  min={0}
                  max={10}
                step={1}
                className="flex-1"
                />
              <span className="w-8 text-center font-medium">{technical}</span>
            </div>
              </div>
              
              <div className="space-y-2">
            <Label>Avaliação Tática</Label>
            <div className="flex items-center gap-4">
                <Slider
                value={[tactical]}
                onValueChange={(value) => setTactical(value[0])}
                  min={0}
                  max={10}
                step={1}
                className="flex-1"
                />
              <span className="w-8 text-center font-medium">{tactical}</span>
            </div>
              </div>
              
              <div className="space-y-2">
            <Label>Avaliação Física</Label>
            <div className="flex items-center gap-4">
                <Slider
                value={[physical]}
                onValueChange={(value) => setPhysical(value[0])}
                  min={0}
                  max={10}
                step={1}
                className="flex-1"
                />
              <span className="w-8 text-center font-medium">{physical}</span>
            </div>
              </div>
              
              <div className="space-y-2">
            <Label>Avaliação Mental</Label>
            <div className="flex items-center gap-4">
                <Slider
                value={[mental]}
                onValueChange={(value) => setMental(value[0])}
                  min={0}
                  max={10}
                step={1}
                className="flex-1"
              />
              <span className="w-8 text-center font-medium">{mental}</span>
            </div>
              </div>
              
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Digite as observações da avaliação..."
            />
            </div>
          </div>
          <DialogFooter>
          <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          <Button onClick={handleSave} disabled={!selectedStudent}>
            Salvar
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
