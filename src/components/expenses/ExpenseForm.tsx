import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker"; // Assumindo que você tem este componente
import { Expense, ExpenseCategory, ExpenseStatus, PaymentMethod } from "@/types/expense";
import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Schema de validação com Zod
const expenseFormSchema = z.object({
  category_id: z.string().min(1, { message: "Categoria é obrigatória." }),
  description: z.string().min(1, { message: "Descrição é obrigatória." }),
  amount: z.coerce.number().positive({ message: "Valor deve ser positivo." }),
  due_date: z.date({ required_error: "Data de vencimento é obrigatória." }),
  payment_date: z.date().optional().nullable(),
  payment_method: z.string().optional().nullable(),
  status: z.enum(["Pago", "Pendente"], { required_error: "Status é obrigatório." }),
  is_recurring: z.boolean().default(false),
}).refine(data => {
  if (data.status === "Pago") {
    return data.payment_date != null;
  }
  return true;
}, {
  message: "Data de pagamento é obrigatória quando o status é 'Pago'.",
  path: ["payment_date"], 
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (expense: ExpenseFormValues, id?: string) => void;
  initialData?: Expense | null;
  categories: ExpenseCategory[];
  onAddNewCategory: (categoryName: string) => Promise<ExpenseCategory | null>; // Retorna a nova categoria ou null
}

const paymentMethods: Array<PaymentMethod | string> = [
  "Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", 
  "Transferência Bancária", "Boleto", "Outro"
];

export const ExpenseForm = ({ 
  open, 
  onClose, 
  onSave, 
  initialData, 
  categories,
  onAddNewCategory
}: ExpenseFormProps) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category_id: initialData?.category_id || "",
      description: initialData?.description || "",
      amount: initialData?.amount || 0,
      due_date: initialData?.due_date ? new Date(initialData.due_date + 'T00:00:00') : new Date(),
      payment_date: initialData?.payment_date ? new Date(initialData.payment_date + 'T00:00:00') : null,
      payment_method: initialData?.payment_method || "",
      status: initialData?.status || "Pendente",
      is_recurring: initialData?.is_recurring || false,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        due_date: new Date(initialData.due_date + 'T00:00:00'), 
        payment_date: initialData.payment_date ? new Date(initialData.payment_date + 'T00:00:00') : null,
      });
    } else {
      form.reset({
        category_id: "",
        description: "",
        amount: 0,
        due_date: new Date(),
        payment_date: null,
        payment_method: "",
        status: "Pendente",
        is_recurring: false,
      });
    }
  }, [initialData, form]); // form.reset foi removido da dependência para evitar reset desnecessário

  const onSubmit = (data: ExpenseFormValues) => {
    onSave(data, initialData?.id);
    onClose(); 
  };

  const handleAddNewCategoryAttempt = async () => {
    if (!newCategoryName.trim()) return;
    const newCategory = await onAddNewCategory(newCategoryName.trim());
    if (newCategory) {
      form.setValue('category_id', newCategory.id, { shouldValidate: true });
    }
    setNewCategoryName("");
    setIsAddingCategory(false); // Fechar o AlertDialog
  };

  const watchedStatus = form.watch("status");
  const watchedIsRecurring = form.watch("is_recurring"); // Observar o campo is_recurring

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[100vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Despesa" : "Adicionar Nova Despesa"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da despesa abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 py-1 scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-muted">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="expense-form-id">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <AlertDialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="outline" size="icon" onClick={() => setIsAddingCategory(true)}>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Adicionar Nova Categoria</AlertDialogTitle>
                            <AlertDialogDescription>
                              Digite o nome da nova categoria de despesa.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Input 
                            placeholder="Ex: Material Esportivo"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setNewCategoryName("")}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleAddNewCategoryAttempt} disabled={!newCategoryName.trim()}>
                              Adicionar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ex: Aluguel do campo do mês de Julho" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="150,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{watchedIsRecurring && !initialData ? "Data da Primeira Parcela" : "Data de Vencimento"}</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchedStatus === "Pago" && (
                <>
                  <FormField
                    control={form.control}
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Pagamento</FormLabel>
                        <DatePicker 
                          date={field.value} 
                          setDate={field.onChange} 
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pagamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o método" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map(method => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Despesa Recorrente</FormLabel>
                      <DialogDescription>
                        {watchedIsRecurring && !initialData
                          ? "A data selecionada acima será a da primeira parcela. As parcelas seguintes serão geradas no mesmo dia para os meses subsequentes do ano corrente."
                          : "Marque se esta despesa se repetirá nos meses seguintes (dentro do ano corrente)."}
                      </DialogDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!!initialData} // Desabilitar se for edição (initialData existe)
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="expense-form-id">
            {initialData ? "Salvar Alterações" : "Adicionar Despesa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 