import { useState, useEffect } from "react";
import { Payment, MONTHS } from "@/types/payment";
import { getLocalData, saveLocalData } from "@/utils/localStorage";
import { getStoredStudents, StudentDB } from "@/components/students/studentStorage";
import { useToast } from "@/components/ui/use-toast";

interface MonthlyFee {
  id: number;
  category: string;
  value: number;
}

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { toast } = useToast();

  const getMonthlyFeeForCategory = (category: string): number => {
    const fees = getLocalData<MonthlyFee[]>("monthlyFees", []);
    const fee = fees.find(f => f.category === category);
    return fee ? fee.value : 150; // Default to 150 if not found
  };

  const calculatePaymentValue = (student: StudentDB): number => {
    const baseFee = getMonthlyFeeForCategory(student.category);
    const hasScholarship = student.hasScholarship || false;
    const discountPercentage = student.scholarshipDiscount || 0;
    
    if (hasScholarship && discountPercentage > 0) {
      return baseFee * (1 - (discountPercentage / 100));
    }
    
    return baseFee;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const shouldGenerateYearlyPayments = (existingPayments: Payment[]) => {
    const currentYear = new Date().getFullYear();
    const hasCurrentYearPayments = existingPayments.some(payment => {
      const paymentDate = payment.dueDate.split('/');
      return paymentDate.length === 3 && parseInt(paymentDate[2]) === currentYear;
    });
    
    return !hasCurrentYearPayments;
  };

  const generateYearlyPayments = (students: StudentDB[]) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    let allPayments: Payment[] = getLocalData<Payment[]>("payments", []);
    
    const existingIds = allPayments.map(p => Number(p.id));
    let newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    
    students.forEach(student => {
      // Determine start month based on student's join date
      let startMonth = 0; // Default to January
      let joinDate = new Date();
      
      if (student.joinDate) {
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(student.joinDate)) {
          // Parse DD/MM/YYYY format
          const parts = student.joinDate.split('/');
          joinDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else if (/^\d{4}-\d{2}-\d{2}/.test(student.joinDate)) {
          // Parse YYYY-MM-DD format
          joinDate = new Date(student.joinDate);
        }
        
        startMonth = joinDate.getMonth();
      }
      
      // Calculate payment amount considering scholarship discount
      const paymentValue = calculatePaymentValue(student);
      
      for (let month = startMonth; month < 12; month++) {
        // Check if a payment for this student/month/year already exists
        const existingPayment = allPayments.some(p => 
          p.studentId === Number(student.id) && 
          p.month === MONTHS[month] && 
          p.year === currentYear.toString()
        );
        
        // Skip if payment already exists
        if (existingPayment) {
          continue;
        }
        
        const dueDay = 10;
        const dueDate = `${dueDay.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${currentYear}`;
        
        let status: 'Pendente' | 'Pago' | 'Atrasado' = "Pendente";
        if (month < currentMonth) {
          status = "Atrasado";
        }
        
        const payment: Payment = {
          id: Math.random(),
          studentId: Number(student.id),
          student: student.name,
          category: student.category,
          value: formatCurrency(paymentValue),
          dueDate: dueDate,
          status: status,
          paymentMethod: "PIX",
          month: MONTHS[month],
          year: currentYear.toString(),
          description: "",
          paymentTypeId: 1,
          paymentType: "Mensalidade"
        };
        
        allPayments.push(payment);
      }
    });
    
    return allPayments;
  };

  const getCategories = () => {
    const categories = new Set<string>();
    payments.forEach(payment => {
      if (payment.category) {
        categories.add(payment.category);
      }
    });
    return Array.from(categories);
  };

  useEffect(() => {
    const savedPayments = getLocalData<Payment[]>("payments", []);
    const students = getStoredStudents();
    
    if (savedPayments.length === 0 || shouldGenerateYearlyPayments(savedPayments)) {
      const generatedPayments = generateYearlyPayments(students);
      setPayments(generatedPayments);
      saveLocalData("payments", generatedPayments);
    } else {
      setPayments(savedPayments);
    }
  }, []);

  useEffect(() => {
    let result = [...payments];
    
    if (searchTerm) {
      result = result.filter(payment => 
        payment.student.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      result = result.filter(payment => 
        payment.status === statusFilter
      );
    }

    if (categoryFilter) {
      result = result.filter(payment => 
        payment.category === categoryFilter
      );
    }
    
    if (monthFilter) {
      result = result.filter(payment => {
        if (payment.month) {
          return payment.month === monthFilter;
        }
        
        const month = payment.dueDate.split('/')[1];
        const monthNumber = parseInt(month);
        const monthNumberMap: Record<string, number> = {
          'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
          'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
          'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12,
        };
        return monthNumber === monthNumberMap[monthFilter];
      });
    }
    
    setFilteredPayments(result);
  }, [payments, searchTerm, statusFilter, monthFilter, categoryFilter]);

  const handleConfirmPayment = (payment: Payment) => {
    const updatedPayments = payments.map(p => {
      if (p.id === payment.id) {
        return { ...p, status: "Pago" as const, paymentDate: new Date().toLocaleDateString("pt-BR") };
      }
      return p;
    });
    
    setPayments(updatedPayments);
    saveLocalData("payments", updatedPayments);
    
    toast({
      title: "Pagamento confirmado",
      description: `O pagamento de ${payment.student} foi confirmado com sucesso.`,
    });
  };

  const handleSavePayment = (payment: Payment) => {
    const isEditing = !!payment.id;
    
    if (isEditing) {
      const updatedPayments = payments.map(p => 
        p.id === payment.id ? payment : p
      );
      setPayments(updatedPayments);
      saveLocalData("payments", updatedPayments);
      toast({
        title: "Pagamento atualizado",
        description: "Os dados do pagamento foram atualizados com sucesso.",
      });
    } else {
      const newPayment = {
        ...payment,
        id: Date.now(),
      };
      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      saveLocalData("payments", updatedPayments);
      toast({
        title: "Pagamento adicionado",
        description: "Novo pagamento adicionado com sucesso.",
      });
    }
  };

  const handleGenerateAllPayments = () => {
    const students = getStoredStudents();
    const generatedPayments = generateYearlyPayments(students);
    
    setPayments(generatedPayments);
    saveLocalData("payments", generatedPayments);
    
    toast({
      title: "Pagamentos gerados",
      description: "Pagamentos para o ano corrente foram gerados com sucesso.",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setMonthFilter("");
    setCategoryFilter("");
  };

  return {
    payments,
    filteredPayments,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    monthFilter,
    setMonthFilter,
    categoryFilter,
    setCategoryFilter,
    handleConfirmPayment,
    handleSavePayment,
    handleGenerateAllPayments,
    clearFilters,
    getCategories,
  };
};
