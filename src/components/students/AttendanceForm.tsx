import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Student } from "./StudentForm";

interface AttendanceFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (attendance: AttendanceRecord) => void;
  students: Student[];
}

export interface AttendanceRecord {
  id?: number;
  date: Date;
  category: string;
  records: {
    id?: number;
    studentId: number;
    studentName: string;
    present: boolean;
  }[];
  details?: {
    id: number;
    attendance_record_id: number;
    student_id: number;
    present: boolean;
    student?: {
      id: number;
      name: string;
      category: string;
    };
  }[];
}

export function AttendanceForm({
  open,
  onClose,
  onSave,
  students,
}: AttendanceFormProps) {
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<{ [key: number]: boolean }>({});
  const { toast } = useToast();

  const categories = Array.from(new Set(students.map(s => s.category))).sort();

  const filteredStudents = students.filter(student => student.category === category);

  const handleToggleAttendance = (studentId: number) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSave = () => {
    if (!category) {
      toast({
        title: "Erro",
        description: "Selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }

    const records = filteredStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      present: attendance[student.id] ?? false
    }));

    const attendanceRecord: AttendanceRecord = {
      date,
      category,
      records
    };

    onSave(attendanceRecord);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = filteredStudents.length - presentCount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar Presença</DialogTitle>
          <DialogDescription>
            Registre a presença dos alunos no treino.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data do Treino</Label>
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
          </div>

          {category && (
            <div className="space-y-4">
              <div className="border rounded-md">
                <div className="p-4">
                  <h4 className="font-medium mb-2">Alunos - {category}</h4>
                  <div className="space-y-2">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md"
                      >
                        <span>{student.name}</span>
                        <Button
                          variant={attendance[student.id] ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleAttendance(student.id)}
                          className={attendance[student.id] ? "bg-football-green hover:bg-football-dark-green" : ""}
                        >
                          {attendance[student.id] ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Presente
                            </>
                          ) : (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Ausente
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Presentes: {presentCount}</span>
                <span>Ausentes: {absentCount}</span>
                <span>Total: {filteredStudents.length}</span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 