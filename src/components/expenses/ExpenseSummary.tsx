import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, ExpenseStatus } from "@/types/expense";
import { TrendingDown, TrendingUp, CircleDollarSign, ListChecks } from "lucide-react"; // Adicionado ListChecks

interface ExpenseSummaryProps {
  expenses: Array<Expense & { category?: any }>; // Usa a lista de despesas já filtrada
}

const calculateTotals = (expenses: Array<Expense & { category?: any }>) => {
  let totalPaid = 0;
  let totalPending = 0;
  let totalOverall = 0;

  expenses.forEach(expense => {
    totalOverall += expense.amount;
    if (expense.status === 'Pago') {
      totalPaid += expense.amount;
    } else if (expense.status === 'Pendente') {
      totalPending += expense.amount;
    }
  });

  return { totalPaid, totalPending, totalOverall };
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const ExpenseSummary = ({ expenses }: ExpenseSummaryProps) => {
  const { totalPaid, totalPending, totalOverall } = calculateTotals(expenses);

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Pagas</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
          {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas Pendentes</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
          {/* <p className="text-xs text-muted-foreground">+180.1% from last month</p> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Despesas (Período)</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalOverall)}</div>
          {/* <p className="text-xs text-muted-foreground">+19% from last month</p> */}
        </CardContent>
      </Card>
    </div>
  );
}; 