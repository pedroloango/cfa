import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Student } from "@/components/students/StudentForm"; // Assumindo que StudentForm exporta Student
import { Payment, MONTHS } from "@/types/payment";
import { usePaymentTypes, PaymentType } from "@/hooks/usePaymentTypes";
import { DatePicker } from "@/components/ui/date-picker";
import { format as formatDateFn } from 'date-fns';

interface TaxaInscricaoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (paymentsData: Array<Omit<Payment, 'id' | 'student' | 'category' | 'paymentType' | 'status' | 'paymentMethod'> & { studentId: number, paymentTypeId: number, status: Payment['status'] }>) => void;
  studentsList: Student[];
  allPaymentTypes: PaymentType[];
}

const CATEGORIES = ["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17"];

// Função para converter "R$ 180,00" para 180.00
const parseCurrency = (value: string): number => {
  const numericValue = parseFloat(
    value
      .replace("R$", "")
      .replace(/\./g, "") // Remover pontos de milhar, se houver (escapar o ponto para regex)
      .replace(",", ".") // Substituir vírgula decimal por ponto
      .trim()
  );
  return isNaN(numericValue) ? 0 : numericValue;
};

// Função para converter 140.00 para "R$ 140,00"
const formatCurrency = (value: number): string => {
  // Arredondar para duas casas decimais para evitar problemas com números como 139.99999999999997
  const roundedValue = Math.round(value * 100) / 100;
  return `R$ ${roundedValue.toFixed(2).replace(".", ",")}`;
};

// Definir uma interface para o estado do formulário interno
interface InternalFormData {
  description: string;
  value: string;
  dueDate: string; // DD/MM/AAAA
  month: string;
  year: string;
}

export function TaxaInscricaoForm({
  open,
  onClose,
  onSave,
  studentsList,
  allPaymentTypes,
}: TaxaInscricaoFormProps) {
  // Inicializar formData com todos os campos esperados
  const [formData, setFormData] = useState<InternalFormData>(() => {
    const today = new Date();
    return {
      description: "",
      value: "R$ 0,00",
      dueDate: formatDateFn(today, "dd/MM/yyyy"),
      month: MONTHS[today.getMonth()],
      year: today.getFullYear().toString(),
    };
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<number | null>(null);
  const [dueDateObject, setDueDateObject] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  // Adicionar console.log para depurar os tipos de pagamento recebidos
  useEffect(() => {
    if (open) {
      console.log("Tipos de Pagamento Recebidos (allPaymentTypes):", allPaymentTypes);
    }
  }, [open, allPaymentTypes]);

  const relevantPaymentTypes = useMemo(() => {
    const lowerCaseNames = ["taxa de inscrição", "taxa de arbitragem"];
    return allPaymentTypes.filter(pt => 
      lowerCaseNames.includes(pt.name.toLowerCase())
    );
  }, [allPaymentTypes]);

  useEffect(() => {
    if (open) {
      const today = new Date();
      setDueDateObject(today);
      setFormData({
        description: "", // Resetar campos manuais
        value: "R$ 0,00", // Resetar campos manuais
        dueDate: formatDateFn(today, "dd/MM/yyyy"),
        month: MONTHS[today.getMonth()],
        year: today.getFullYear().toString(),
      });
      setSelectedStudentIds(new Set());
      setCategoryFilter("all");
      if (relevantPaymentTypes.length > 0) {
        setSelectedPaymentTypeId(relevantPaymentTypes[0].id);
      } else {
        setSelectedPaymentTypeId(null);
      }
    }
  }, [open, relevantPaymentTypes]);

  useEffect(() => {
    if (dueDateObject) {
      setFormData(prev => ({
        ...prev, // Manter description e value
        dueDate: formatDateFn(dueDateObject, "dd/MM/yyyy"),
        month: MONTHS[dueDateObject.getMonth()],
        year: dueDateObject.getFullYear().toString(),
      }));
    } else { // Se a data for undefined, limpar os campos relacionados
      setFormData(prev => ({
        ...prev,
        dueDate: "",
        month: "",
        year: "",
      }));
    }
  }, [dueDateObject]);

  const filteredStudents = useMemo(() => {
    return categoryFilter === "all"
      ? studentsList
      : studentsList.filter(s => s.category === categoryFilter);
  }, [studentsList, categoryFilter]);

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set()); // Desmarcar todos
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id))); // Marcar todos os filtrados
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaymentTypeId) {
      toast({
        title: "Erro de Configuração",
        description: "Selecione um Tipo de Pagamento válido (Taxa de Inscrição ou Taxa de Arbitragem).",
        variant: "destructive",
      });
      return;
    }
    if (selectedStudentIds.size === 0) {
      toast({
        title: "Nenhum aluno selecionado",
        description: "Por favor, selecione pelo menos um aluno.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.description || !formData.value || !formData.dueDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha Descrição, Valor e Vencimento.",
        variant: "destructive",
      });
      return;
    }

    const paymentsToCreate: Array<Omit<Payment, 'id' | 'student' | 'category' | 'paymentType' | 'status' | 'paymentMethod'> & { studentId: number, paymentTypeId: number, status: Payment['status'] }> = [];
    
    const baseValueNumeric = parseCurrency(formData.value);

    selectedStudentIds.forEach(studentId => {
      const student = studentsList.find(s => s.id === studentId);
      let finalValueNumeric = baseValueNumeric;

      if (student && student.hasScholarship && typeof student.scholarshipDiscount === 'number' && student.scholarshipDiscount > 0) {
        finalValueNumeric = baseValueNumeric - student.scholarshipDiscount;
        if (finalValueNumeric < 0) {
          finalValueNumeric = 0; // Não permitir valor negativo
        }
      }

      paymentsToCreate.push({
        studentId,
        description: formData.description,
        paymentTypeId: selectedPaymentTypeId, // Assumindo que selectedPaymentTypeId não será null aqui devido à validação anterior
        value: formatCurrency(finalValueNumeric), // Usar o valor com desconto
        dueDate: formData.dueDate,
        month: formData.month,
        year: formData.year,
        status: "Pendente", 
      });
    });

    onSave(paymentsToCreate);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Apenas description e value são editáveis diretamente por Input
    if (name === 'description' || name === 'value') {
        setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl"> {/* Aumentado para acomodar a lista */}
        <DialogHeader>
          <DialogTitle>Nova Taxa de Inscrição</DialogTitle>
          <DialogDescription>
            Gere taxas de inscrição para os alunos selecionados. O status inicial será "Pendente".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Coluna 1: Detalhes da Taxa */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição*</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ex: Taxa Campeonato XYZ"
                />
              </div>
              <div>
                <Label htmlFor="paymentType">Tipo de Pagamento*</Label>
                <Select
                  value={selectedPaymentTypeId?.toString() || ""}
                  onValueChange={(value) => setSelectedPaymentTypeId(Number(value))}
                >
                  <SelectTrigger id="paymentType-inscricao">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantPaymentTypes.map((pt) => (
                      <SelectItem key={pt.id} value={pt.id.toString()}>
                        {pt.name}
                      </SelectItem>
                    ))}
                    {relevantPaymentTypes.length === 0 && <SelectItem value="disabled" disabled>Nenhum tipo aplicável encontrado</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dueDate-inscricao">Vencimento*</Label>
                <DatePicker date={dueDateObject} setDate={setDueDateObject} placeholder="Selecione o vencimento" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month-inscricao">Mês (Referência)</Label>
                  <Input
                    id="month-inscricao"
                    name="month"
                    value={formData.month}
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="year-inscricao">Ano (Referência)</Label>
                  <Input
                    id="year-inscricao"
                    name="year"
                    type="number"
                    value={formData.year}
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="value">Valor*</Label>
                <Input
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            {/* Coluna 2: Lista de Alunos */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Alunos* ({selectedStudentIds.size} selecionados)</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleSelectAllStudents}>
                  {selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0 ? "Desmarcar Todos" : "Marcar Todos"}
                </Button>
              </div>
              <div>
                <Label htmlFor="category-filter-inscricao">Filtrar por Categoria</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value)}
                >
                  <SelectTrigger id="category-filter-inscricao">
                    <SelectValue placeholder="Filtrar por categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-72 w-full rounded-md border p-4">
                {filteredStudents.length === 0 && <p className="text-sm text-muted-foreground text-center">Nenhum aluno encontrado para esta categoria.</p>}
                {filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudentIds.has(student.id)}
                      onCheckedChange={() => handleStudentSelect(student.id)}
                    />
                    <label
                      htmlFor={`student-${student.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {student.name} ({student.category})
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-football-green hover:bg-football-dark-green">
              Salvar Inscrições
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 