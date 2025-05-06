import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useFeeSettings, useCreateFeeSetting, useUpdateFeeSetting } from "@/hooks/useFeeSettings";

export interface MonthlyFee {
  id: number;
  category: string;
  value: number;
}

const CATEGORIES = ["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17"];

export function MonthlyFeesSettings() {
  const { data: fees = [], isLoading } = useFeeSettings();
  const createFee = useCreateFeeSetting();
  const updateFee = useUpdateFeeSetting();
  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");
  const { toast } = useToast();

  const handleAddFee = () => {
    if (!category || !value) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const numericValue = parseFloat(value.replace(/[^0-9.,]/g, '').replace(',', '.'));
    
    if (isNaN(numericValue)) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor numérico válido.",
        variant: "destructive",
      });
      return;
    }

    const existing = fees.find(f => f.category === category);
    if (existing) {
      updateFee.mutate({ id: existing.id, category, value: numericValue }, {
        onSuccess: () => toast({ title: "Mensalidade atualizada", description: `O valor da mensalidade para ${category} foi atualizado.` }),
      });
    } else {
      createFee.mutate({ category, value: numericValue }, {
        onSuccess: () => toast({ title: "Mensalidade adicionada", description: `Nova mensalidade para ${category} foi adicionada.` }),
      });
    }
    
    // Reset form
    setCategory("");
    setValue("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Valores das Mensalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="R$ 0,00"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  className="bg-football-green hover:bg-football-dark-green w-full"
                  onClick={handleAddFee}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Categoria</th>
                  <th className="p-2 text-left">Valor</th>
                </tr>
              </thead>
              <tbody>
                {fees.length > 0 ? (
                  fees.map((fee) => (
                    <tr key={fee.id} className="border-t">
                      <td className="p-2">{fee.category}</td>
                      <td className="p-2">{formatCurrency(fee.value)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="p-2 text-center">
                      Nenhum valor de mensalidade cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
