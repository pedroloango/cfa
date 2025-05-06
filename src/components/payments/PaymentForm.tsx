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
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Student } from "@/components/students/StudentForm";
import { Payment, MONTHS } from "@/types/payment";
import { usePaymentTypes, PaymentType } from "@/hooks/usePaymentTypes";

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (payment: Payment) => void;
  initialData?: Payment;
  studentsList: Student[];
  /** List of payment type names to show */
  allowedPaymentTypeNames?: string[];
  formTitle?: string;
  defaultPaymentTypeName?: string;
  defaultStatus?: Payment['status'];
}

const PAYMENT_METHODS = ["PIX", "Dinheiro", "Cartão de Crédito", "Transferência"];
const STATUS_OPTIONS = ["Pendente", "Pago", "Atrasado"];
const CATEGORIES = ["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17"];

const emptyPayment: Payment = {
  id: 0,
  studentId: 0,
  student: "",
  description: "",
  paymentTypeId: 1,
  paymentType: "",
  category: "",
  value: "R$ 150,00",
  dueDate: new Date().toLocaleDateString("pt-BR"),
  status: "Pendente",
  paymentMethod: "PIX",
  month: MONTHS[new Date().getMonth()],
  year: new Date().getFullYear().toString(),
};

export function PaymentForm({
  open,
  onClose,
  onSave,
  initialData,
  studentsList,
  formTitle,
  defaultPaymentTypeName,
  allowedPaymentTypeNames,
  defaultStatus,
}: PaymentFormProps) {
  const students = studentsList;
  const { data: types = [] } = usePaymentTypes();
  // Filter to allowed payment types if provided
  const displayedTypes = allowedPaymentTypeNames && allowedPaymentTypeNames.length > 0
    ? types.filter(t => allowedPaymentTypeNames!.includes(t.name))
    : types;
  const [payment, setPayment] = useState<Payment>(emptyPayment);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setPayment(initialData);
      setCategoryFilter(initialData.category);
    } else {
      let base = emptyPayment;
      // default payment type from allowed list or full list
      if (defaultPaymentTypeName && displayedTypes.length) {
        const dt = displayedTypes.find(t => t.name === defaultPaymentTypeName);
        if (dt) {
          base = { ...base, paymentTypeId: dt.id, paymentType: dt.name };
        }
      } else if (displayedTypes.length) {
        base = { ...base, paymentTypeId: displayedTypes[0].id, paymentType: displayedTypes[0].name };
      }
      if (defaultStatus) {
        base = { ...base, status: defaultStatus };
      }
      setPayment(base);
      setCategoryFilter("");
    }
  }, [initialData, open, types, defaultPaymentTypeName, defaultStatus]);

  const filteredStudents = categoryFilter !== "all"
    ? students.filter(s => s.category === categoryFilter)
    : students;

  const handleTypeChange = (typeId: string) => {
    const id = Number(typeId);
    const sel = displayedTypes.find(t => t.id === id);
    if (sel) {
      setPayment(prev => ({ ...prev, paymentTypeId: id, paymentType: sel.name }));
      if (sel.name === 'Matrícula') {
        setPayment(prev => ({ ...prev, status: 'Pago' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment.studentId || !payment.value || !payment.dueDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    onSave(payment);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPayment((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "month") {
      const monthIndex = MONTHS.findIndex(m => m === value);
      if (monthIndex !== -1) {
        const dateParts = payment.dueDate.split('/');
        if (dateParts.length === 3) {
          const day = dateParts[0];
          const year = dateParts[2];
          const newDueDate = `${day}/${(monthIndex + 1).toString().padStart(2, '0')}/${year}`;
          setPayment(prev => ({
            ...prev,
            dueDate: newDueDate
          }));
        }
      }
    }
  };

  const handleStudentChange = (studentId: string) => {
    const id = Number(studentId);
    const selectedStudent = students.find(s => s.id === id);
    if (selectedStudent) {
      setPayment((prev) => ({
        ...prev,
        studentId: id,
        student: selectedStudent.name,
        category: selectedStudent.category,
      }));
      setCategoryFilter(selectedStudent.category);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {formTitle ?? (initialData ? "Editar Pagamento" : "Novo Pagamento")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
                disabled={!!initialData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtre por categoria" />
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
            <div className="space-y-2">
              <Label htmlFor="student">Aluno*</Label>
              <Select
                value={payment.studentId.toString()}
                onValueChange={(value) => handleStudentChange(value)}
                disabled={!!initialData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
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
              <Label htmlFor="description">Descrição*</Label>
              <Input
                id="description"
                name="description"
                value={payment.description}
                onChange={handleChange}
                placeholder="Descrição do pagamento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentType">Tipo de Pagamento*</Label>
              <Select
                value={payment.paymentTypeId.toString()}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {displayedTypes.map((t: PaymentType) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Mês*</Label>
                <Select
                  value={payment.month || ""}
                  onValueChange={(value) => handleSelectChange("month", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Ano*</Label>
                <Input
                  id="year"
                  name="year"
                  value={payment.year || new Date().getFullYear().toString()}
                  onChange={handleChange}
                  placeholder="Ano"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valor*</Label>
                <Input
                  id="value"
                  name="value"
                  value={payment.value}
                  onChange={handleChange}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Vencimento*</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  value={payment.dueDate}
                  onChange={handleChange}
                  placeholder="DD/MM/AAAA"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={payment.status}
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
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                <Select
                  value={payment.paymentMethod}
                  onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
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
