import { useState, useEffect } from "react";
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
import { CalendarIcon, RotateCcw, UserCheck, UserX } from "lucide-react";
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
  const [attendance, setAttendance] = useState<{ [key: number]: boolean | null }>({});
  const { toast } = useToast();

  const categories = Array.from(new Set(students.map(s => s.category))).sort();

  const filteredStudents = students
    .filter(student => !category || student.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    if (category) {
      const initialAttendance: { [key: number]: boolean | null } = {};
      const studentsForCategory = students.filter(s => s.category === category);
      studentsForCategory.forEach(student => {
        initialAttendance[student.id] = null;
      });
      setAttendance(initialAttendance);
    } else {
      setAttendance({});
    }
  }, [category, students]);

  const handleSetAttendance = (studentId: number, status: boolean | null) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
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

    const recordsToSave = filteredStudents
      .filter(student => attendance[student.id] !== null)
      .map(student => ({
        studentId: student.id,
        studentName: student.name,
        present: attendance[student.id] as boolean
      }));

    if (recordsToSave.length === 0) {
      toast({
        title: "Atenção",
        description: "Nenhum aluno com presença ou ausência marcada para salvar.",
        variant: "default",
      });
      return;
    }

    const attendanceRecord: AttendanceRecord = {
      date,
      category,
      records: recordsToSave
    };

    onSave(attendanceRecord);
  };

  const presentCount = Object.values(attendance).filter(status => status === true).length;
  const absentCount = Object.values(attendance).filter(status => status === false).length;
  const notDefinedCount = filteredStudents.length > 0 ? filteredStudents.length - (presentCount + absentCount) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Registrar Presença</DialogTitle>
          <DialogDescription>
            Marque a presença ou ausência dos alunos no treino. Apenas registros marcados serão salvos.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 pl-1 py-4 grid gap-4">
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
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {category && filteredStudents.length > 0 && (
            <div className="space-y-4">
              <div className="border rounded-md">
                <div className="p-4">
                  <h4 className="font-medium mb-2">Alunos - {category} ({filteredStudents.length})</h4>
                  <div className="space-y-2">
                    {filteredStudents.map((student) => {
                      const studentStatus = attendance[student.id];
                      return (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md gap-2"
                        >
                          <span className="flex-1 truncate" title={student.name}>{student.name}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant={studentStatus === true ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleSetAttendance(student.id, true)}
                              className={`px-2 h-8 ${studentStatus === true ? "bg-football-green hover:bg-football-dark-green text-white" : ""}`}
                              title="Marcar como Presente"
                            >
                              <UserCheck className="h-4 w-4 sm:mr-1" /> 
                              <span className="hidden sm:inline">Presente</span>
                            </Button>
                            <Button
                              variant={studentStatus === false ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => handleSetAttendance(student.id, false)}
                              className="px-2 h-8"
                              title="Marcar como Ausente"
                            >
                              <UserX className="h-4 w-4 sm:mr-1" />
                              <span className="hidden sm:inline">Ausente</span>
                            </Button>
                            {studentStatus !== null && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSetAttendance(student.id, null)}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Limpar marcação"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground px-1">
                <span>Presentes: {presentCount}</span>
                <span>Ausentes: {absentCount}</span>
                <span>Não definido: {notDefinedCount}</span>
                <span>Total: {filteredStudents.length}</span>
              </div>
            </div>
          )}
          {category && filteredStudents.length === 0 && (
             <p className="text-sm text-muted-foreground text-center py-4">Nenhum aluno encontrado para esta categoria.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!category || (presentCount === 0 && absentCount === 0)}>
            Salvar Registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 