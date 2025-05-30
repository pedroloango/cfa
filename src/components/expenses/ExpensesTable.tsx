import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expense, ExpenseCategory } from "@/types/expense";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExpensesTableProps {
  expenses: Array<Expense & { category?: ExpenseCategory }>; // Inclui a categoria opcionalmente
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  // Adicionar paginação se necessário
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  try {
    // Tenta tratar como YYYY-MM-DD primeiro (do Supabase e DatePicker)
    const date = parseISO(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch (error) {
    // Fallback para caso já esteja no formato DD/MM/YYYY (improvável vindo do form)
    try {
      const [day, month, year] = dateString.split('/');
      if (day && month && year && day.length === 2 && month.length === 2 && year.length === 4) {
        return dateString; 
      }
    } catch (e) { /* não faz nada, continua para o retorno de erro */ }
    console.warn(`Invalid date format for '${dateString}':`, error);
    return 'Data inválida';
  }
};

export const ExpensesTable = ({ expenses, onEdit, onDelete }: ExpensesTableProps) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead className="hidden md:table-cell">Categoria</TableHead>
            <TableHead className="whitespace-nowrap">Valor (R$)</TableHead>
            <TableHead className="whitespace-nowrap">Vencimento</TableHead>
            <TableHead className="hidden lg:table-cell whitespace-nowrap">Data Pagto.</TableHead>
            <TableHead className="hidden lg:table-cell">Método Pagto.</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Recorrente</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell className="hidden md:table-cell">{expense.category?.name || 'N/A'}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(expense.due_date)}</TableCell>
                <TableCell className="hidden lg:table-cell whitespace-nowrap">{formatDate(expense.payment_date)}</TableCell>
                <TableCell className="hidden lg:table-cell">{expense.payment_method || '-'}</TableCell>
                <TableCell>
                  <Badge variant={expense.status === 'Pago' ? 'default' : 'destructive'}>
                    {expense.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{expense.is_recurring ? "Sim" : "Não"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(expense)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Nenhuma despesa encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}; 