
import { Payment } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, MoreVertical, QrCode, FileText, Info } from "lucide-react";

interface PaymentsTableProps {
  payments: Payment[];
  onConfirmPayment: (payment: Payment) => void;
  onGeneratePix: (payment: Payment) => void;
  onViewReceipt: (payment: Payment) => void;
  onViewDetails: (payment: Payment) => void;
}

export const PaymentsTable = ({
  payments,
  onConfirmPayment,
  onGeneratePix,
  onViewReceipt,
  onViewDetails,
}: PaymentsTableProps) => {
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Mês</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Método</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {payment.student
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{payment.student}</span>
                  </div>
                </TableCell>
                <TableCell>{payment.category}</TableCell>
                <TableCell>{payment.month}</TableCell>
                <TableCell>{payment.value}</TableCell>
                <TableCell>{payment.dueDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === "Pago" 
                        ? "default" 
                        : payment.status === "Atrasado" 
                          ? "destructive" 
                          : "outline"
                    }
                    className={
                      payment.status === "Pago"
                        ? "bg-football-green hover:bg-football-dark-green"
                        : payment.status === "Pendente"
                          ? "text-amber-500 border-amber-500"
                          : ""
                    }
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {payment.status !== "Pago" && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onConfirmPayment(payment)}
                        title="Confirmar Pagamento"
                      >
                        <Check className="h-4 w-4 text-football-green" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onGeneratePix(payment)}>
                          <QrCode className="mr-2 h-4 w-4" /> Gerar PIX
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewReceipt(payment)}>
                          <FileText className="mr-2 h-4 w-4" /> Recibo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onViewDetails(payment)}>
                          <Info className="mr-2 h-4 w-4" /> Detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                Nenhum pagamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
