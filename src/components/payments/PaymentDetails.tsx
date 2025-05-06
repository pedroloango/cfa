
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Payment } from "@/types/payment";
import { Badge } from "@/components/ui/badge";

interface PaymentDetailsProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function PaymentDetails({ open, onClose, payment }: PaymentDetailsProps) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Aluno</p>
              <p className="text-lg font-semibold">{payment.student}</p>
            </div>
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Categoria</p>
              <p>{payment.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="font-semibold">{payment.value}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vencimento</p>
              <p>{payment.dueDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Método</p>
              <p>{payment.paymentMethod}</p>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-1">Histórico</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm bg-muted p-2 rounded">
                <span>{new Date().toLocaleDateString("pt-BR")}</span>
                <span>Registro criado</span>
              </div>
              {payment.status === "Pago" && (
                <div className="flex justify-between items-center text-sm bg-muted p-2 rounded">
                  <span>{new Date().toLocaleDateString("pt-BR")}</span>
                  <span>Pagamento confirmado via {payment.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
