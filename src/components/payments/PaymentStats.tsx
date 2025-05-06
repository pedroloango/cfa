
import { Payment } from "@/types/payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentStatsProps {
  payments: Payment[];
}

export const PaymentStats = ({ payments }: PaymentStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Mensalidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{payments.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Pagas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-football-green">
            {payments.filter(p => p.status === "Pago").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">
            {payments.filter(p => p.status === "Pendente").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Atrasadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {payments.filter(p => p.status === "Atrasado").length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
