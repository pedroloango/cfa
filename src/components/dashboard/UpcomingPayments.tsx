
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const upcomingPayments = [
  {
    id: 1,
    student: "Lucas Silva",
    value: "R$ 150,00",
    dueDate: "15/04/2025",
    status: "pendente",
  },
  {
    id: 2,
    student: "Rafael Oliveira",
    value: "R$ 150,00",
    dueDate: "18/04/2025",
    status: "pendente",
  },
  {
    id: 3,
    student: "Gabriel Martins",
    value: "R$ 150,00",
    dueDate: "20/04/2025",
    status: "pendente",
  },
  {
    id: 4,
    student: "Mateus Fernandes",
    value: "R$ 150,00",
    dueDate: "25/04/2025",
    status: "pendente",
  },
];

export function UpcomingPayments() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Próximos Pagamentos</CardTitle>
        <CardDescription>Mensalidades com vencimento próximo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between space-x-4"
            >
              <div>
                <p className="text-sm font-medium leading-none">
                  {payment.student}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vencimento: {payment.dueDate}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">{payment.value}</p>
                <Badge variant="outline" className="text-amber-500 border-amber-500">
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
