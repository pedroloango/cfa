
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

export interface Student {
  id: number;
  name: string;
  birthDate?: string;
  rg?: string;
  cpf?: string;
  category: string;
  joinDate: string;
  polo?: string;
  status: string;
  responsibleName?: string;
  responsibleCpf?: string;
  whatsapp?: string;
  address?: string;
  age: number; // hidden, derived from birthDate
  position: string;
  phone: string;
  hasScholarship?: boolean; // New field for scholarship
  scholarshipDiscount?: number; // New field for scholarship percentage
}

interface StudentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  initialData?: Student;
}

const POSITIONS = ["Goleiro", "Fixo", "Ala Esquerdo", "Ala Direito", "Pivo"];
const CATEGORIES = ["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17"];
const STATUS_OPTIONS = ["Ativo", "Inativo"];
const POLOS = ["Estação Por do Sol"];

const emptyStudent: Student = {
  id: 0,
  name: "",
  birthDate: "",
  rg: "",
  cpf: "",
  category: "",
  joinDate: new Date().toLocaleDateString("pt-BR"),
  polo: "",
  status: "Ativo",
  responsibleName: "",
  responsibleCpf: "",
  whatsapp: "",
  address: "",
  age: 0,
  position: "",
  phone: "",
  hasScholarship: false,
  scholarshipDiscount: 0,
};

export function StudentForm({
  open,
  onClose,
  onSave,
  initialData,
}: StudentFormProps) {
  const [student, setStudent] = useState<Student>(emptyStudent);
  const { toast } = useToast();

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (initialData) {
      setStudent(initialData);
    } else {
      setStudent(emptyStudent);
    }
  }, [initialData, open]);

  useEffect(() => {
    if (student.birthDate) {
      const calculatedAge = calculateAge(student.birthDate);
      setStudent(prev => ({
        ...prev,
        age: calculatedAge
      }));
    }
  }, [student.birthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !student.name ||
      !student.birthDate ||
      !student.category ||
      !student.position ||
      !student.status
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate scholarship discount if scholarship is enabled
    if (student.hasScholarship && (student.scholarshipDiscount === undefined || student.scholarshipDiscount < 0 || student.scholarshipDiscount > 100)) {
      toast({
        title: "Desconto inválido",
        description: "O percentual de desconto deve estar entre 0 e 100.",
        variant: "destructive",
      });
      return;
    }
    
    onSave(student);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const birthDate = e.target.value;
    try {
      const date = new Date(birthDate);
      if (!isNaN(date.getTime())) {
        setStudent(prev => ({
          ...prev,
          birthDate: date.toISOString()
        }));
      }
    } catch (error) {
      // ...
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Aluno" : "Novo Aluno"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do aluno nos campos abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Atleta*</Label>
                <Input
                  id="name"
                  name="name"
                  value={student.name}
                  onChange={handleChange}
                  placeholder="Nome do atleta"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nasc.*</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={student.birthDate ? student.birthDate.split('T')[0] : ""}
                  onChange={handleDateChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  name="rg"
                  value={student.rg}
                  onChange={handleChange}
                  placeholder="RG"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={student.cpf}
                  onChange={handleChange}
                  placeholder="CPF"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria*</Label>
                <Select
                  value={student.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Início em</Label>
                <Input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  value={student.joinDate ? (
                    /^\d{2}\/\d{2}\/\d{4}$/.test(student.joinDate)
                      ? new Date(student.joinDate.split("/").reverse().join("-")).toISOString().split("T")[0]
                      : student.joinDate.split("T")[0]
                  ) : ""}
                  onChange={e => setStudent(prev => ({ ...prev, joinDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="polo">Polo</Label>
                <Select
                  value={student.polo}
                  onValueChange={(value) => handleSelectChange("polo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o polo" />
                  </SelectTrigger>
                  <SelectContent>
                    {POLOS.map((polo) => (
                      <SelectItem key={polo} value={polo}>
                        {polo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Situação</Label>
                <Select
                  value={student.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsibleName">Nome do Responsável</Label>
                <Input
                  id="responsibleName"
                  name="responsibleName"
                  value={student.responsibleName}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsibleCpf">CPF do Responsável</Label>
                <Input
                  id="responsibleCpf"
                  name="responsibleCpf"
                  value={student.responsibleCpf}
                  onChange={handleChange}
                  placeholder="CPF do responsável"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={student.address}
                  onChange={handleChange}
                  placeholder="Endereço"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Posição*</Label>
                <Select
                  value={student.position}
                  onValueChange={(value) => handleSelectChange("position", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a posição" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Whatsapp</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={student.phone}
                  onChange={handleChange}
                  placeholder="(xx) xxxxx-xxxx"
                />
              </div>
            </div>
            
            {/* Scholarship section */}
            <div className="border p-4 rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hasScholarship">Bolsista</Label>
                <Switch 
                  id="hasScholarship" 
                  checked={student.hasScholarship || false}
                  onCheckedChange={(checked) => {
                    setStudent(prev => ({
                      ...prev,
                      hasScholarship: checked,
                      scholarshipDiscount: checked ? (prev.scholarshipDiscount || 0) : 0
                    }));
                  }}
                />
              </div>
              
              {student.hasScholarship && (
                <div className="space-y-2">
                  <Label htmlFor="scholarshipDiscount">Percentual de Desconto (%)</Label>
                  <Input
                    id="scholarshipDiscount"
                    name="scholarshipDiscount"
                    type="number"
                    min="0"
                    max="100"
                    value={student.scholarshipDiscount || 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setStudent(prev => ({
                        ...prev,
                        scholarshipDiscount: value
                      }));
                    }}
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-football-green hover:bg-football-dark-green"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
