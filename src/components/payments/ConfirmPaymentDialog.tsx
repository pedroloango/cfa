import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Payment } from "@/types/payment";

interface ConfirmPaymentDialogProps {
  open: boolean;
  payment: Payment | null;
  onClose: () => void;
  onConfirm: (data: { value: string; paymentMethod: string; paymentDate: string }) => void;
}

export const ConfirmPaymentDialog = ({ open, payment, onClose, onConfirm }: ConfirmPaymentDialogProps) => {
  const [value, setValue] = useState(payment?.value || "");
  const [paymentMethod, setPaymentMethod] = useState(payment?.paymentMethod || "");
  const [paymentDate, setPaymentDate] = useState(payment?.paymentDate || new Date().toISOString().slice(0, 10));

  // Atualiza os campos quando o pagamento muda
  // (para evitar valores antigos ao abrir para outro pagamento)
  React.useEffect(() => {
    setValue(payment?.value || "");
    setPaymentMethod(payment?.paymentMethod || "");
    setPaymentDate(payment?.paymentDate || new Date().toISOString().slice(0, 10));
  }, [payment]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">Valor</label>
            <Input type="number" value={value} onChange={e => setValue(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Método de Pagamento</label>
            <Input value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="Ex: Dinheiro, PIX, Cartão" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data do Pagamento</label>
            <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onConfirm({ value, paymentMethod, paymentDate })}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 