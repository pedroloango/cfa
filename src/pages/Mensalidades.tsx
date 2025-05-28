import { useState, useEffect, useMemo, useCallback } from "react";
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
import { ConfirmPaymentDialog } from "@/components/payments/ConfirmPaymentDialog";
import { TaxaInscricaoForm } from "@/components/payments/TaxaInscricaoForm";
import { usePaymentTypes } from "@/hooks/usePaymentTypes";
import { PaymentTotalsCard } from "@/components/payments/PaymentTotalsCard";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remover "R$", espaços, e trocar vírgula por ponto para o parseFloat
  const numericValue = parseFloat(
    value.replace(/R\$\s?/, "").replace(/\./g, "").replace(",", ".")
  );
  return isNaN(numericValue) ? 0 : numericValue;
};

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
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("");
  const [descriptionFilter, setDescriptionFilter] = useState("");

  const categories = useMemo(() => Array.from(new Set(payments.map(p => p.category))), [payments]);
  const paymentTypes = useMemo(() => Array.from(new Set(payments.map(p => p.paymentType))), [payments]);

  useEffect(() => {
    let result = [...payments];
    if (searchTerm) result = result.filter(p => p.student.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter) result = result.filter(p => p.status === statusFilter);
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter);
    if (monthFilter) result = result.filter(p => p.month === monthFilter);
    if (paymentTypeFilter) result = result.filter(p => p.paymentType === paymentTypeFilter);
    if (descriptionFilter) result = result.filter(p => typeof p.description === 'string' && p.description.toLowerCase().includes(descriptionFilter.toLowerCase()));
    setFilteredPayments(result);
  }, [payments, searchTerm, statusFilter, categoryFilter, monthFilter, paymentTypeFilter, descriptionFilter]);

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
  const { data: allPaymentTypes = [] } = usePaymentTypes();

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingConfirmPayment, setPendingConfirmPayment] = useState<Payment | null>(null);
  const [isTaxaInscricaoFormOpen, setIsTaxaInscricaoFormOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const handleOpenConfirmDialog = (payment: Payment) => {
    setPendingConfirmPayment(payment);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmPayment = async ({ value, paymentMethod, paymentDate }: { value: string; paymentMethod: string; paymentDate: string }) => {
    if (!pendingConfirmPayment) return;
    try {
      const updatedPayment = {
        ...pendingConfirmPayment,
        status: "Pago" as const,
        value,
        paymentMethod,
        paymentDate,
        paymentType: "Mensalidade"
      };
      await updatePayment.mutateAsync(updatedPayment);
      setSelectedPayment(updatedPayment);
      setIsReceiptDialogOpen(true);
      toast({
        title: "Pagamento confirmado",
        description: `O pagamento de ${updatedPayment.student} foi confirmado com sucesso.`,
      });
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Não foi possível confirmar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsConfirmDialogOpen(false);
      setPendingConfirmPayment(null);
    }
  };

  const handleSaveTaxaInscricao = async (paymentsData: Array<Omit<Payment, 'id' | 'student' | 'category' | 'paymentType' | 'status' | 'paymentMethod'> & { studentId: number, paymentTypeId: number, status: Payment['status'] }>) => {
    try {
      for (const incomingData of paymentsData) {
        const student = students.find(s => s.id === incomingData.studentId);
        const paymentType = allPaymentTypes.find(pt => pt.id === incomingData.paymentTypeId);

        if (!student || !paymentType) {
          console.error("Aluno ou Tipo de Pagamento não encontrado para os IDs fornecidos", incomingData);
          toast({
            title: "Erro de Dados",
            description: "Não foi possível encontrar o aluno ou o tipo de pagamento. A taxa não foi gerada.",
            variant: "destructive",
          });
          continue; // Pular este pagamento e tentar o próximo
        }

        const newPaymentPayload: Omit<Payment, 'id'> = {
          studentId: incomingData.studentId,
          student: student.name,
          category: student.category,
          description: incomingData.description,
          paymentTypeId: incomingData.paymentTypeId,
          paymentType: paymentType.name,
          value: incomingData.value,
          dueDate: incomingData.dueDate,
          month: incomingData.month,
          year: incomingData.year,
          status: incomingData.status, // Já é "Pendente"
          paymentMethod: "", // Deixar vazio ou definir um default se necessário
          // paymentDate será preenchido quando for pago
        };

        await createPayment.mutateAsync(newPaymentPayload);
      }
      toast({
        title: "Taxas de Inscrição Geradas",
        description: `${paymentsData.length} taxa(s) de inscrição foram geradas com sucesso com status "Pendente".`,
      });
      refetchPayments();
    } catch (error) {
      console.error('Error creating taxa de inscricao:', error);
      toast({
        title: "Erro ao gerar Taxas de Inscrição",
        description: "Não foi possível gerar as taxas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRevertPaymentStatus = async (payment: Payment) => {
    try {
      const revertedPayment = {
        ...payment,
        status: "Pendente" as const,
        paymentMethod: "", // Limpar método de pagamento
        paymentDate: undefined, // Limpar data de pagamento
      };
      // @ts-ignore TODO: Ajustar tipo se o backend não aceitar undefined para paymentDate, pode precisar ser null ou omitido.
      await updatePayment.mutateAsync(revertedPayment);
      toast({
        title: "Pagamento Revertido",
        description: `O status do pagamento de ${payment.student} foi revertido para "Pendente".`,
      });
      refetchPayments(); // Atualizar a lista
    } catch (error) {
      console.error('Error reverting payment status:', error);
      toast({
        title: "Erro ao reverter status",
        description: "Não foi possível reverter o status do pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDeleteDialog = (payment: Payment) => {
    setPaymentToDelete(payment);
    setIsConfirmDeleteDialogOpen(true);
  };

  const executeDeletePayment = async () => {
    if (!paymentToDelete) return;
    try {
      await deletePayment.mutateAsync(paymentToDelete.id);
      toast({
        title: "Pagamento Excluído",
        description: `O pagamento de ${paymentToDelete.student} (ID: ${paymentToDelete.id}) foi excluído com sucesso.`,
      });
      refetchPayments(); // Atualizar a lista
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Erro ao Excluir Pagamento",
        description: "Não foi possível excluir o pagamento. Tente novamente.",
        variant: "destructive",
      });
    }
    // Limpar após a tentativa, mesmo se falhar, para não tentar excluir de novo ao reabrir o diálogo por engano
    setPaymentToDelete(null); 
  };

  // Envolver onClearFilters com useCallback
  const onClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setMonthFilter("");
    setCategoryFilter("");
    setPaymentTypeFilter("");
    setDescriptionFilter("");
  }, []); // As dependências são as funções set, que são estáveis

  // Lógica para atualizar status para "Atrasado" (Opção A - Frontend)
  const paymentsWithOverdueStatus = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return payments.map(p => {
      if (p.status === "Pendente") {
        let dueDateCalibrada: Date | null = null;
        if (p.dueDate.includes('-')) { 
          const dateParts = p.dueDate.split('-');
          if (dateParts.length === 3) {
            const year = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; 
            const day = parseInt(dateParts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
              dueDateCalibrada = new Date(year, month, day);
              dueDateCalibrada.setHours(0, 0, 0, 0);
            }
          }
        } else if (p.dueDate.includes('/')) { 
          const dateParts = p.dueDate.split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; 
            const year = parseInt(dateParts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
              dueDateCalibrada = new Date(year, month, day);
              dueDateCalibrada.setHours(0, 0, 0, 0); 
            }
          }
        } else {
          console.warn(`Formato de data não reconhecido para payment ID ${p.id}: ${p.dueDate}`);
        }
        
        if (dueDateCalibrada && dueDateCalibrada < today) {
          return { ...p, status: "Atrasado" as const };
        }
      }
      return p;
    });
  }, [payments]);

  // useEffect de filtragem agora usa paymentsWithOverdueStatus
  useEffect(() => {
    let result = [...paymentsWithOverdueStatus]; 
    if (searchTerm) result = result.filter(p => p.student.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter) result = result.filter(p => p.status === statusFilter);
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter);
    if (monthFilter) result = result.filter(p => p.month === monthFilter);
    if (paymentTypeFilter) result = result.filter(p => p.paymentType === paymentTypeFilter);
    if (descriptionFilter) result = result.filter(p => typeof p.description === 'string' && p.description.toLowerCase().includes(descriptionFilter.toLowerCase()));
    
    setFilteredPayments(result);
  }, [paymentsWithOverdueStatus, searchTerm, statusFilter, categoryFilter, monthFilter, paymentTypeFilter, descriptionFilter]);
  
  // paymentTotals deve usar filteredPayments para refletir os filtros
   const paymentTotals = useMemo(() => {
    let pago = 0;
    let pendente = 0;
    let atrasado = 0;
    let geral = 0;

    filteredPayments.forEach(payment => { // Usar filteredPayments
      const value = parseCurrency(payment.value);
      geral += value; // O total geral ainda pode ser de todos os filtrados
      if (payment.status === "Pago") {
        pago += value;
      } else if (payment.status === "Pendente") {
        pendente += value;
      } else if (payment.status === "Atrasado") {
        atrasado += value;
      }
    });
    return { pago, pendente, atrasado, geral };
  }, [filteredPayments]); // Depender de filteredPayments

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
              variant="outline"
              onClick={() => {
                setSelectedPayment(null);
                setIsTaxaInscricaoFormOpen(true);
              }}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Taxa de Inscrições
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

        <PaymentTotalsCard 
          totalPago={paymentTotals.pago}
          totalPendente={paymentTotals.pendente}
          totalAtrasado={paymentTotals.atrasado}
          totalGeral={paymentTotals.geral}
        />

        <PaymentStats payments={filteredPayments} />

        <PaymentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          monthFilter={monthFilter}
          onMonthFilterChange={setMonthFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          paymentTypeFilter={paymentTypeFilter}
          onPaymentTypeFilterChange={setPaymentTypeFilter}
          onClearFilters={onClearFilters}
          categories={categories}
          paymentTypes={paymentTypes}
          descriptionFilter={descriptionFilter}
          onDescriptionFilterChange={setDescriptionFilter}
        />

        <PaymentsTable
          payments={filteredPayments}
          onConfirmPayment={handleOpenConfirmDialog}
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
          onRevertPayment={handleRevertPaymentStatus}
          onDeletePayment={handleOpenDeleteDialog}
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

      <TaxaInscricaoForm
        open={isTaxaInscricaoFormOpen}
        onClose={() => setIsTaxaInscricaoFormOpen(false)}
        onSave={handleSaveTaxaInscricao}
        studentsList={students}
        allPaymentTypes={allPaymentTypes}
      />

      <ConfirmPaymentDialog
        open={isConfirmDialogOpen}
        payment={pendingConfirmPayment}
        onClose={() => {
          setIsConfirmDialogOpen(false);
          setPendingConfirmPayment(null);
        }}
        onConfirm={handleConfirmPayment}
      />

      <ConfirmActionDialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        onConfirm={executeDeletePayment}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir este pagamento? Esta ação não poderá ser desfeita. Aluno: ${paymentToDelete?.student}, Descrição: ${paymentToDelete?.description}, Valor: ${paymentToDelete?.value}`}
        confirmButtonText="Excluir"
        confirmButtonVariant="destructive"
      />
    </MainLayout>
  );
};

export default Mensalidades;
