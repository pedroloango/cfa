import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, AlertTriangle, CheckCircle } from 'lucide-react'; // Ícones para ilustração

interface PaymentTotalsCardProps {
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
  totalGeral: number;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const PaymentTotalsCard = ({ 
  totalPago,
  totalPendente,
  totalAtrasado,
  totalGeral
}: PaymentTotalsCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resumo Financeiro Geral</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/30">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Total Pago</p>
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
            <p className="text-2xl font-semibold text-green-800 dark:text-green-300">{formatCurrency(totalPago)}</p>
          </div>
          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/30">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Total Pendente</p>
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            </div>
            <p className="text-2xl font-semibold text-amber-800 dark:text-amber-300">{formatCurrency(totalPendente)}</p>
          </div>
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/30">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Total Atrasado</p>
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500" />
            </div>
            <p className="text-2xl font-semibold text-red-800 dark:text-red-300">{formatCurrency(totalAtrasado)}</p>
          </div>
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Valor Total (Previsto)</p>
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </div>
            <p className="text-2xl font-semibold text-blue-800 dark:text-blue-300">{formatCurrency(totalGeral)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 