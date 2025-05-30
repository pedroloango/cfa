import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { Expense, ExpenseCategory } from "@/types/expense";
import { supabase } from "@/lib/supabaseClient"; // Será usado para buscar dados reais
import { useToast } from "@/components/ui/use-toast";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"; // Caminho correto
import { format, startOfMonth, endOfMonth, addMonths, getYear, getMonth, getDate, setMonth, setYear, setDate } from "date-fns";
import { ExpenseFilters, ExpenseFilterValues } from "@/components/expenses/ExpenseFilters";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary"; // Importar o Summary

// Dados mockados iniciais (substituir por chamadas à API)
// const mockCategories: ExpenseCategory[] = [
//   { id: "1", name: "Aluguel", user_defined: false },
//   { id: "2", name: "Taxa de Inscrição em Campeonato", user_defined: false },
//   { id: "3", name: "Taxa de Arbitragem", user_defined: false },
//   { id: "4", name: "Pagamento de Salário", user_defined: false },
// ];

// const mockExpenses: Expense[] = [
//   {
//     id: "exp1",
//     category_id: "1",
//     category: mockCategories[0],
//     description: "Aluguel do campo sintético - Mês de Maio",
//     amount: 500,
//     due_date: "2024-05-10",
//     status: "Pago",
//     payment_date: "2024-05-09",
//     payment_method: "Pix",
//     is_recurring: true,
//   },
//   {
//     id: "exp2",
//     category_id: "2",
//     category: mockCategories[1],
//     description: "Inscrição Copa Kids Sub-10",
//     amount: 150,
//     due_date: "2024-06-05",
//     status: "Pendente",
//     is_recurring: false,
//   },
// ];

const Despesas = () => {
  const { toast } = useToast();
  const [allExpenses, setAllExpenses] = useState<Array<Expense & { category?: ExpenseCategory }>>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Array<Expense & { category?: ExpenseCategory }>>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ExpenseFilterValues>(() => {
    return {};
  });

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [expenseToDeleteId, setExpenseToDeleteId] = useState<string | null>(null);

  // Log para verificar estabilidade da referência de toast
  const toastRef = useRef<typeof toast | null>(null);
  if (toastRef.current === null) {
    toastRef.current = toast;
  } else if (toastRef.current !== toast) {
    toastRef.current = toast;
  } else {
    // console.log('Despesas: Referência de toast estável.');
  }

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsSummaryLoading(true);
    try {
      const { data: fetchedCategories, error: categoriesError } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name', { ascending: true });

      if (categoriesError) {
        setCategories([]);
      } else {
        setCategories(fetchedCategories || []);
      }

      let query = supabase
        .from('expenses')
        .select('*, category:expense_categories(id, name, user_defined)');

      if (activeFilters?.categoryId) {
        query = query.eq('category_id', activeFilters.categoryId);
      }
      if (activeFilters?.status && activeFilters.status !== 'all') {
        query = query.eq('status', activeFilters.status);
      }
      if (activeFilters?.year && activeFilters?.month) {
        const startDate = format(startOfMonth(new Date(activeFilters.year, activeFilters.month - 1)), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(new Date(activeFilters.year, activeFilters.month - 1)), 'yyyy-MM-dd');
        query = query.gte('due_date', startDate).lte('due_date', endDate);
      } else if (activeFilters?.year) {
        const startDate = `${activeFilters.year}-01-01`;
        const endDate = `${activeFilters.year}-12-31`;
        query = query.gte('due_date', startDate).lte('due_date', endDate);
      }
      if (activeFilters?.searchTerm) {
        query = query.ilike('description', `%${activeFilters.searchTerm}%`);
      }
      
      query = query.order('due_date', { ascending: false });

      const { data: fetchedExpenses, error: expensesError } = await query;
      
      if (expensesError) {
        setAllExpenses([]);
        setFilteredExpenses([]);
      } else {
          setAllExpenses(fetchedExpenses || []);
          setFilteredExpenses(fetchedExpenses || []);
      }
    } catch (error: any) {
      setCategories([]);
      setAllExpenses([]);
      setFilteredExpenses([]);
    } finally {
      setIsLoading(false);
      setIsSummaryLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = useCallback((filters: ExpenseFilterValues) => {
    setActiveFilters(filters);
  }, [setActiveFilters]);

  const handleOpenForm = (expense?: Expense) => {
    setSelectedExpense(expense || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedExpense(null);
    setIsFormOpen(false);
  };

  const handleSaveExpense = async (formData: any, id?: string) => {
    const firstInstallmentDueDate = formData.due_date; // Objeto Date do formulário para a primeira parcela

    const dataToSave = { // Dados para a primeira/principal parcela
      category_id: formData.category_id,
      description: formData.description,
      amount: formData.amount,
      due_date: format(firstInstallmentDueDate, "yyyy-MM-dd"),
      status: formData.status,
      is_recurring: formData.is_recurring,
      payment_date: formData.payment_date ? format(formData.payment_date, "yyyy-MM-dd") : null,
      payment_method: formData.payment_method || null,
    };

    try {
      setIsLoading(true);
      let error = null;
      let newExpenseId = id;

      if (id) { // Editando uma despesa existente
        const { error: updateError } = await supabase
          .from('expenses')
          .update(dataToSave) // Atualiza apenas esta instância
          .eq('id', id);
        error = updateError;
      } else { // Criando uma nova despesa
        const { data: insertedData, error: insertError } = await supabase
          .from('expenses')
          .insert([dataToSave])
          .select()
          .single();
        error = insertError;
        if (insertedData) {
          newExpenseId = insertedData.id;
        }
      }

      if (error) throw error;

      // Lógica de recorrência para NOVAS despesas marcadas como recorrentes
      if (!id && formData.is_recurring && newExpenseId) {
        const recurringExpensesToInsert = [];
        const referenceYear = getYear(firstInstallmentDueDate);
        const referenceMonth = getMonth(firstInstallmentDueDate); // 0-11, mês da primeira parcela
        const referenceDay = getDate(firstInstallmentDueDate); // dia da primeira parcela

        // Começa do mês SEGUINTE ao da primeira parcela até Dezembro do ano de referência
        for (let monthOffset = 1; (referenceMonth + monthOffset) <= 11; monthOffset++) {
          const nextInstallmentMonth = referenceMonth + monthOffset;
          // Construir a data para a parcela recorrente
          // Usar setMonth e setDate para tentar manter o dia, date-fns ajustará se o dia não existir (ex: dia 31 em mês de 30 dias)
          let installmentDueDate = new Date(referenceYear, nextInstallmentMonth, referenceDay);
          
          // date-fns pode mudar o mês se o dia não existir (ex: 31 de Abril vira 1 de Maio).
          // Precisamos garantir que estamos no mês correto (nextInstallmentMonth).
          if (getMonth(installmentDueDate) !== nextInstallmentMonth) {
            // Se o mês mudou, significa que o dia original não existe. Ajustar para o último dia do mês desejado.
            installmentDueDate = endOfMonth(new Date(referenceYear, nextInstallmentMonth, 1));
          }

          recurringExpensesToInsert.push({
            category_id: formData.category_id,
            description: `${formData.description} (Parcela Recorrente)`,
            amount: formData.amount,
            due_date: format(installmentDueDate, "yyyy-MM-dd"),
            status: "Pendente",
            is_recurring: false,
            payment_date: null,
            payment_method: null,
          });
        }

        if (recurringExpensesToInsert.length > 0) {
          const { error: recurringError } = await supabase
            .from('expenses')
            .insert(recurringExpensesToInsert);
          if (recurringError) {
            console.error("Erro ao inserir despesas recorrentes:", recurringError);
            toast({
              title: "Erro nas Parcelas Recorrentes",
              description: recurringError.message || "Não foi possível gerar todas as parcelas recorrentes.",
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: `Despesa ${id ? 'atualizada' : 'adicionada'} com sucesso!`,
        description: dataToSave.description,
      });
      setActiveFilters(prevFilters => ({ ...prevFilters }));
      handleCloseForm();
    } catch (error: any) {
      console.error("Erro ao salvar despesa:", error);
      toast({
        title: "Erro ao salvar despesa",
        description: error.message || "Não foi possível salvar a despesa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrompt = (expenseId: string) => {
    setExpenseToDeleteId(expenseId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDeleteId) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseToDeleteId);

      if (error) throw error;

      toast({
        title: "Despesa excluída com sucesso!",
        variant: "destructive", 
      });
      setActiveFilters(prevFilters => ({ ...prevFilters }));
    } catch (error: any) {
      console.error("Erro ao excluir despesa:", error);
      toast({
        title: "Erro ao excluir despesa",
        description: error.message || "Não foi possível excluir a despesa.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsConfirmDeleteDialogOpen(false);
      setExpenseToDeleteId(null);
    }
  };

  const handleAddNewCategory = async (categoryName: string): Promise<ExpenseCategory | null> => {
    if (!categoryName.trim()) {
      toast({
        title: "Nome da Categoria Inválido",
        description: "O nome da categoria não pode estar vazio.",
        variant: "destructive",
      });
      return null;
    }
    
    const existingCategory = categories.find(cat => cat.name.toLowerCase() === categoryName.trim().toLowerCase());
    if (existingCategory) {
      toast({
        title: "Aviso: Categoria já existe",
        description: `A categoria "${existingCategory.name}" já está cadastrada.`,
        variant: "default",
      });
      return existingCategory;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert({ name: categoryName.trim(), user_defined: true })
        .select()
        .single(); 

      if (error) throw error;

      if (data) {
        toast({
          title: "Categoria Adicionada!",
          description: `A categoria "${data.name}" foi adicionada com sucesso.`,
        });
        setActiveFilters(prevFilters => ({ ...prevFilters }));
        return data as ExpenseCategory;
      }
      return null;
    } catch (error: any) {
      console.error("Erro ao adicionar nova categoria:", error);
      toast({
        title: "Erro ao adicionar categoria",
        description: error.message || "Não foi possível adicionar a nova categoria.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestão de Despesas</h2>
            <p className="text-muted-foreground">
              Controle e gerencie todas as despesas da escola.
            </p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa
          </Button>
        </div>

        <ExpenseFilters 
          categories={categories} 
          onFilterChange={handleFilterChange} 
          initialFilters={activeFilters}
        />

        {isSummaryLoading ? (
           <div className="flex justify-center items-center h-24">
             <p>Calculando resumo...</p>
           </div>
        ) : (
          <ExpenseSummary expenses={filteredExpenses} />
        )}

        {isLoading ? ( // Apenas a tabela/conteúdo das despesas fica sob este isLoading
          <div className="flex justify-center items-center h-32">
            <p>Carregando dados das despesas...</p>
          </div>
        ) : filteredExpenses.length > 0 ? (
          <ExpensesTable 
            expenses={filteredExpenses}
            onEdit={handleOpenForm}
            onDelete={handleDeletePrompt}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
             {!isLoading && "Nenhuma despesa encontrada para os filtros aplicados."}
          </div>
        )}

        <ExpenseForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveExpense}
          initialData={selectedExpense}
          categories={categories}
          onAddNewCategory={handleAddNewCategory}
        />

        <ConfirmActionDialog
          open={isConfirmDeleteDialogOpen}
          onOpenChange={setIsConfirmDeleteDialogOpen}
          onConfirm={handleDeleteExpense}
          title="Confirmar Exclusão"
          description="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
          confirmButtonVariant="destructive"
        />

      </div>
    </MainLayout>
  );
};

export default Despesas; 