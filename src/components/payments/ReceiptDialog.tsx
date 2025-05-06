import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Payment } from "@/types/payment";
import { FileText, Printer, Save, Share2 } from "lucide-react";
import html2canvas from 'html2canvas';
import { useRef } from 'react';

interface ReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function ReceiptDialog({ open, onClose, payment }: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const handleShareWhatsApp = async () => {
    if (!receiptRef.current) return;

    try {
      // Create canvas from receipt content
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;

        // Create a temporary URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = `recibo-${payment.student}-${new Date().toLocaleDateString('pt-BR')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL
        URL.revokeObjectURL(url);

        // Share via WhatsApp
        const message = `*Recibo de Pagamento - Craque Academy*\n\n` +
          `*Aluno:* ${payment.student}\n` +
          `*Categoria:* ${payment.category}\n` +
          `*Valor:* ${payment.value}\n` +
          `*Data de Vencimento:* ${payment.dueDate}\n` +
          `*Status:* ${payment.status}\n` +
          `*Método de Pagamento:* ${payment.paymentMethod}\n` +
          `*Data do Pagamento:* ${payment.paymentDate || new Date().toLocaleDateString("pt-BR")}\n\n` +
          `Este recibo é válido como comprovante de pagamento.\n` +
          `Craque Academy - Rua do Esporte, 123 - Bairro do Futebol`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
      }, 'image/png');
    } catch (error) {
      console.error('Error generating receipt image:', error);
      alert('Erro ao gerar imagem do recibo. Tente novamente.');
    }
  };

  const handleSaveImage = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `recibo-${payment.student}-${new Date().toLocaleDateString('pt-BR')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error saving receipt image:', error);
      alert('Erro ao salvar imagem do recibo. Tente novamente.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Recibo de Pagamento</DialogTitle>
        </DialogHeader>
        <div ref={receiptRef} className="border rounded-md p-6 bg-white">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold">Craque Academy</h3>
            <p className="text-sm text-muted-foreground">CNPJ: 12.345.678/0001-99</p>
          </div>
          
          <div className="border-t border-b py-4 my-4">
            <h4 className="text-center font-semibold mb-4">RECIBO</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Aluno:</span>
                <span>{payment.student}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Categoria:</span>
                <span>{payment.category}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Valor:</span>
                <span className="font-bold">{payment.value}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Data de Vencimento:</span>
                <span>{payment.dueDate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={payment.status === "Pago" ? "text-green-600 font-semibold" : ""}>
                  {payment.status}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Método de Pagamento:</span>
                <span>{payment.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Data do Pagamento:</span>
                <span>{payment.paymentDate || new Date().toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Este recibo é válido como comprovante de pagamento.</p>
            <p>Craque Academy - Rua do Esporte, 123 - Bairro do Futebol</p>
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveImage}
            >
              <Save className="mr-2 h-4 w-4" /> Salvar Imagem
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                alert("Enviando para impressão...");
              }}
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Share2 className="mr-2 h-4 w-4" /> Compartilhar WhatsApp
            </Button>
          </div>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
