import { useState, useEffect, useMemo } from "react";
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
import { Revenue } from "@/types/revenue";
import { usePaymentTypes } from "@/hooks/usePaymentTypes";

interface RevenueFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (rev: Revenue) => void;
  initialData?: Revenue;
}

const emptyRevenue: Revenue = {
  id: 0,
  description: "",
  paymentTypeId: 1,
  paymentType: "",
  value: "R$ 0,00",
  revenueDate: new Date().toLocaleDateString("pt-BR"),
};

export function RevenueForm({
  open,
  onClose,
  onSave,
  initialData,
}: RevenueFormProps) {
  const { toast } = useToast();
  const { data: types = [] } = usePaymentTypes();
  const ALLOWED_TYPES = ["Aluguel de quadra", "Patrocínio", "Outros"];
  const displayedTypes = useMemo(
    () => types.filter(t => ALLOWED_TYPES.includes(t.name)),
    [types]
  );
  const [revenue, setRevenue] = useState<Revenue>(emptyRevenue);

  useEffect(() => {
    if (initialData) {
      setRevenue(initialData);
    } else {
      let base = emptyRevenue;
      if (displayedTypes.length) {
        base = { ...base, paymentTypeId: displayedTypes[0].id, paymentType: displayedTypes[0].name };
      }
      setRevenue(base);
    }
  }, [initialData, open, displayedTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRevenue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTypeChange = (typeId: string) => {
    const id = Number(typeId);
    const selected = displayedTypes.find((t) => t.id === id);
    if (selected) {
      setRevenue((prev) => ({
        ...prev,
        paymentTypeId: id,
        paymentType: selected.name,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revenue.description || !revenue.value || !revenue.revenueDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    onSave(revenue);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Receita" : "Nova Receita"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descrição*</Label>
              <Input
                id="description"
                name="description"
                value={revenue.description}
                onChange={handleChange}
                placeholder="Descrição"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentType">Tipo de Receita*</Label>
              <Select
                value={revenue.paymentTypeId.toString()}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {displayedTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor*</Label>
              <Input
                id="value"
                name="value"
                value={revenue.value}
                onChange={handleChange}
                placeholder="R$ 0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenueDate">Data*</Label>
              <Input
                id="revenueDate"
                name="revenueDate"
                value={revenue.revenueDate}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
              />
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