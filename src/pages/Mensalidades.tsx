import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Plus } from "lucide-react";
import { useDbPayments } from "@/hooks/useDbPayments";
import { supabase } from '@/lib/supabaseClient';
import { useStudents } from '@/hooks/useStudents';
import { PaymentStats } from "@/components/payments/PaymentStats";
import { PaymentFilters } from "@/components/payments/PaymentFilters";
import { PaymentsTable } from "@/components/payments/PaymentsTable";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { PixQRCode } from "@/components/payments/PixQRCode";
import { ReceiptDialog } from "@/components/payments/ReceiptDialog";
import { PaymentDetails } from "@/components/payments/PaymentDetails";
import { Payment } from "@/types/payment";
import { toast } from "@/components/ui/use-toast";

const Mensalidades = () => {
  const {
    data: payments = [],
    isLoading: isPaymentsLoading,
    createPayment,
    updatePayment,
    deletePayment,
    refetch: refetchPayments,
  } = useDbPayments();

  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = useMemo(() => Array.from(new Set(payments.map(p => p.category))), [payments]);

  useEffect(() => {
    let result = [...payments];
    if (searchTerm) result = result.filter(p => p.student.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter) result = result.filter(p => p.status === statusFilter);
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter);
    if (monthFilter) result = result.filter(p => p.month === monthFilter);
    setFilteredPayments(result);
  }, [payments, searchTerm, statusFilter, categoryFilter, monthFilter]);

  const handleGenerateAllPayments = async () => {
    await supabase.rpc('generate_payments_for_active_students', { p_year: new Date().getFullYear() });
    await refetchPayments();
  };

  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isPixQRCodeOpen, setIsPixQRCodeOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { data: students = [] } = useStudents();

  const handleConfirmPayment = async (payment: Payment) => {
    try {
      const updatedPayment = {
        ...payment,
        status: "Pago" as const,
        paymentDate: new Date().toLocaleDateString("pt-BR")
      };

      await updatePayment.mutateAsync(updatedPayment);
      
      setSelectedPayment(updatedPayment);
      setIsReceiptDialogOpen(true);
      
      toast({
        title: "Pagamento confirmado",
        description: `O pagamento de ${payment.student} foi confirmado com sucesso.`,
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Não foi possível confirmar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Mensalidades</h2>
            <p className="text-muted-foreground">
              Gerencie os pagamentos e mensalidades
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex items-center"
              onClick={handleGenerateAllPayments}
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Gerar Mensalidades
            </Button>
            <Button 
              className="bg-football-green hover:bg-football-dark-green"
              onClick={() => {
                setSelectedPayment(null);
                setIsPaymentFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Outros Pagamentos
            </Button>
          </div>
        </div>

        <PaymentStats payments={filteredPayments.length > 0 || searchTerm || statusFilter || monthFilter || categoryFilter ? filteredPayments : payments} />

        <PaymentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          monthFilter={monthFilter}
          onMonthFilterChange={setMonthFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("");
            setMonthFilter("");
            setCategoryFilter("");
          }}
          categories={categories}
        />

        <PaymentsTable
          payments={filteredPayments}
          onConfirmPayment={handleConfirmPayment}
          onGeneratePix={(payment) => {
            setSelectedPayment(payment);
            setIsPixQRCodeOpen(true);
          }}
          onViewReceipt={(payment) => {
            setSelectedPayment(payment);
            setIsReceiptDialogOpen(true);
          }}
          onViewDetails={(payment) => {
            setSelectedPayment(payment);
            setIsPaymentDetailsOpen(true);
          }}
        />
      </div>

      <PaymentForm
        open={isPaymentFormOpen}
        onClose={() => setIsPaymentFormOpen(false)}
        onSave={(payment) => {
          const { id, ...data } = payment;
          if (selectedPayment) {
            updatePayment.mutate(payment, {
              onSuccess: () => {
                setSelectedPayment(payment);
                setIsReceiptDialogOpen(true);
                setIsPaymentFormOpen(false);
              },
            });
          } else {
            createPayment.mutate(data as Omit<Payment, 'id'>, {
              onSuccess: () => {
                setSelectedPayment(payment);
                setIsReceiptDialogOpen(true);
                setIsPaymentFormOpen(false);
              },
            });
          }
        }}
        initialData={selectedPayment || undefined}
        studentsList={students}
        formTitle="Outros Pagamentos"
        allowedPaymentTypeNames={["Uniforme", "Matrícula", "Taxa de inscrição"]}
        defaultStatus="Pago"
      />

      <PixQRCode
        open={isPixQRCodeOpen}
        onClose={() => setIsPixQRCodeOpen(false)}
        payment={selectedPayment}
      />

      <ReceiptDialog
        open={isReceiptDialogOpen}
        onClose={() => setIsReceiptDialogOpen(false)}
        payment={selectedPayment}
      />

      <PaymentDetails
        open={isPaymentDetailsOpen}
        onClose={() => setIsPaymentDetailsOpen(false)}
        payment={selectedPayment}
      />
    </MainLayout>
  );
};

export default Mensalidades;
