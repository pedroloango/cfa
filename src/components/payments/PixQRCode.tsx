import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Payment } from "@/types/payment";

interface PixQRCodeProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export function PixQRCode({ open, onClose, payment }: PixQRCodeProps) {
  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>QR Code PIX</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="bg-white p-4 rounded-md border-2 border-football-green mb-4">
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
              <svg
                width="160"
                height="160"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simplified QR code SVG */}
                <rect width="100" height="100" fill="white" />
                <path
                  d="M10 10H40V40H10V10ZM15 15V35H35V15H15Z"
                  fill="black"
                />
                <rect x="20" y="20" width="10" height="10" fill="black" />
                <path
                  d="M60 10H90V40H60V10ZM65 15V35H85V15H65Z"
                  fill="black"
                />
                <rect x="70" y="20" width="10" height="10" fill="black" />
                <path
                  d="M10 60H40V90H10V60ZM15 65V85H35V65H15Z"
                  fill="black"
                />
                <rect x="20" y="70" width="10" height="10" fill="black" />
                <rect x="50" y="10" width="5" height="5" fill="black" />
                <rect x="50" y="20" width="5" height="5" fill="black" />
                <rect x="50" y="30" width="5" height="5" fill="black" />
                <rect x="50" y="50" width="5" height="5" fill="black" />
                <rect x="60" y="50" width="5" height="5" fill="black" />
                <rect x="70" y="50" width="5" height="5" fill="black" />
                <rect x="80" y="50" width="5" height="5" fill="black" />
                <rect x="50" y="60" width="5" height="5" fill="black" />
                <rect x="50" y="70" width="5" height="5" fill="black" />
                <rect x="60" y="60" width="10" height="10" fill="black" />
                <rect x="80" y="60" width="10" height="10" fill="black" />
                <rect x="60" y="80" width="10" height="10" fill="black" />
                <rect x="80" y="80" width="10" height="10" fill="black" />
              </svg>
            </div>
          </div>
          <div className="text-center mb-2">
            <p className="font-medium">Valor: {payment.value}</p>
            <p className="text-sm text-muted-foreground">Aluno: {payment.student}</p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Escaneie o código QR com o aplicativo do seu banco para efetuar o pagamento via PIX.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
          <Button 
            className="bg-football-green hover:bg-football-dark-green"
            onClick={() => {
              // In a real app, this would copy the PIX key to the clipboard
              alert("Chave PIX copiada para a área de transferência!");
            }}
          >
            Copiar Chave PIX
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
