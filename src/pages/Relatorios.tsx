import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart,
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useStudents } from "@/hooks/useStudents";
import { useDbPayments } from "@/hooks/useDbPayments";
import { useMemo, useEffect, useState } from "react";
import { Payment } from "@/types/payment";
import { Check, DollarSign, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Helper Functions (MOVIDAS PARA FORA DO COMPONENTE) ---
const parseCurrency = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const numericValue = parseFloat(
    value.replace(/R\$\s?/, "").replace(/\./g, "").replace(",", ".")
  );
  return isNaN(numericValue) ? 0 : numericValue;
};

const formatDateToMonthYear = (dateString: string) => {
  // Adiciona 'T00:00:00Z' para tratar a string como UTC e evitar problemas de fuso horário no parsing
  // e garantir consistência na formatação do mês/ano.
  const date = new Date(dateString + 'T00:00:00Z'); 
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' });
};

// --- Interfaces --- 
interface FeeSetting {
  category: string;
  value: number;
  // id?: number;
  // year?: number;
}

interface Receita {
  id: number;
  description: string | null;
  payment_type: number; // ID para payment_types.name
  value: number;
  revenue_date: string; // Formato YYYY-MM-DD
}

interface PaymentType {
  id: number;
  name: string;
  // Outras colunas se houver
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF5733', '#C70039'];

const COLORS_BY_STATUS = {
  Pago: '#48BB78', // Verde
  Pendente: '#F59E0B', // Amarelo/Âmbar
  Atrasado: '#EF4444', // Vermelho
};

const Relatorios = () => {
  const { data: students = [], isLoading: isLoadingStudents } = useStudents();
  const { data: payments = [], isLoading: isLoadingPayments } = useDbPayments();

  // Adicionando logs para depuração de pagamentos
  useEffect(() => {
    if (!isLoadingPayments && payments.length > 0) {
      console.log("Relatorios - Todos os Pagamentos Recebidos:", JSON.parse(JSON.stringify(payments))); // Clonar para melhor inspeção
      const suspectedOverdue = payments.filter(p => {
        if (!p.dueDate) return false;
        const dueDate = new Date(p.dueDate + 'T00:00:00Z');
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Comparar com UTC já que dueDate é tratada como UTC
        return p.status === "Pendente" && dueDate < today;
      });
      console.log("Relatorios - Pagamentos que DEVERIAM ser 'Atrasado' (baseado em dueDate e status Pendente):", suspectedOverdue);
      
      const actualOverdue = payments.filter(p => p.status === "Atrasado");
      console.log("Relatorios - Pagamentos COM STATUS 'Atrasado' no banco:", actualOverdue);
      console.log("Relatorios - Contagem de 'Atrasado' no banco:", actualOverdue.length);
    }
  }, [payments, isLoadingPayments]);

  // --- Simulação de Hooks (Substituir por chamadas reais ao Supabase/Hooks) ---
  const [feeSettings, setFeeSettings] = useState<FeeSetting[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  
  const [isLoadingFeeSettings, setIsLoadingFeeSettings] = useState(true);
  const [isLoadingReceitas, setIsLoadingReceitas] = useState(true);
  const [isLoadingPaymentTypes, setIsLoadingPaymentTypes] = useState(true);

  // Estado para a categoria selecionada na aba "Categorias"
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null para "Todas as Categorias"

  useEffect(() => {
    // Simulação FeeSettings
    const mockFeeSettingsData: FeeSetting[] = [
      { category: "Sub-7", value: 150.00 }, { category: "Sub-9", value: 160.00 },
      { category: "Sub-11", value: 170.00 }, { category: "Sub-13", value: 180.00 },
      { category: "Sub-15", value: 190.00 }, { category: "Sub-17", value: 200.00 },
      { category: "Adulto", value: 220.00 }, 
    ];
    setFeeSettings(mockFeeSettingsData);
    setIsLoadingFeeSettings(false);

    // Simulação Receitas
    const mockReceitasData: Receita[] = [
      { id: 1, description: "Venda Cantina", payment_type: 100, value: 75.50, revenue_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { id: 2, description: "Patrocínio Local", payment_type: 101, value: 500.00, revenue_date: new Date().toISOString().split('T')[0] }, 
      { id: 3, description: "Venda Uniforme Extra", payment_type: 3, value: 120.00, revenue_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }, 
    ];
    setReceitas(mockReceitasData);
    setIsLoadingReceitas(false);

    // Simulação PaymentTypes
    const mockPaymentTypesData: PaymentType[] = [
      { id: 1, name: "Mensalidade" }, { id: 2, name: "Taxa de Inscrição" }, 
      { id: 3, name: "Uniforme" }, { id: 4, name: "Taxa de Arbitragem" },
      { id: 100, name: "Venda Avulsa"}, {id: 101, name: "Patrocínio"}
    ];
    setPaymentTypes(mockPaymentTypesData);
    setIsLoadingPaymentTypes(false);
  }, []);

  // --- Cálculos Comuns ---
  const activeStudents = useMemo(() => students.filter(s => s.status === "Ativo"), [students]);
  const today = useMemo(() => new Date(), []); // Memoizar today para evitar recálculos desnecessários
  const todayNormalized = useMemo(() => {
    const date = new Date(today);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }, [today]);

  const currentMonth = useMemo(() => today.getUTCMonth(), [today]);
  const currentYear = useMemo(() => today.getUTCFullYear(), [today]);

  // --- KPIs Aba Geral (Valores Monetários Globais) ---
  const totalPagoGeral = useMemo(() => {
    if (isLoadingPayments) return 0;
    return payments
      .filter(p => p.status === "Pago")
      .reduce((sum, p) => sum + parseCurrency(p.value), 0);
  }, [payments, isLoadingPayments]);

  const pagamentosConsideradosAtrasados = useMemo(() => {
    if (isLoadingPayments) return [];
    return payments.filter(p => {
      if (!p.dueDate || p.status !== "Pendente") return false; 
      const dueDate = new Date(p.dueDate + 'T00:00:00Z'); 
      return dueDate < todayNormalized;
    });
  }, [payments, isLoadingPayments, todayNormalized]);

  const totalAtrasadoGeral = useMemo(() => {
    return pagamentosConsideradosAtrasados.reduce((sum, p) => sum + parseCurrency(p.value), 0);
  }, [pagamentosConsideradosAtrasados]);

  const pagamentosRealmentePendentes = useMemo(() => {
    if (isLoadingPayments) return [];
    return payments.filter(p => {
        if (!p.dueDate || p.status !== "Pendente") return false;
        const dueDate = new Date(p.dueDate + 'T00:00:00Z');
        return dueDate >= todayNormalized; 
    });
  }, [payments, isLoadingPayments, todayNormalized]);

  const totalPendenteGeral = useMemo(() => {
    return pagamentosRealmentePendentes.reduce((sum, p) => sum + parseCurrency(p.value), 0);
  }, [pagamentosRealmentePendentes]);
  
  const valorTotalPrevistoGeral = useMemo(() => {
    if (isLoadingPayments) return 0;
    // Soma todos os pagamentos, independentemente do status, para obter o valor total que foi gerado/esperado.
    // Isso inclui pagos, pendentes (que não estão atrasados), e os que consideramos atrasados (pendentes com data vencida).
    return payments.reduce((sum, p) => sum + parseCurrency(p.value), 0);
  }, [payments, isLoadingPayments]);

  // --- KPIs Aba Geral (Contagens Globais de Pagamentos) ---
  const totalPaymentsCount = useMemo(() => payments.length, [payments]);
  
  const paidPaymentsCount = useMemo(() => {
      if (isLoadingPayments) return 0;
      return payments.filter(p => p.status === "Pago").length;
  }, [payments, isLoadingPayments]);

  const pendingPaymentsCount = useMemo(() => {
      return pagamentosRealmentePendentes.length;
  }, [pagamentosRealmentePendentes]);

  const overduePaymentsCount = useMemo(() => {
      return pagamentosConsideradosAtrasados.length;
  }, [pagamentosConsideradosAtrasados]);

  // --- KPIs Aba Geral ---
  const totalActiveStudents = useMemo(() => activeStudents.length, [activeStudents]);

  const totalScholarshipDiscountValue = useMemo(() => {
    if (isLoadingStudents || isLoadingFeeSettings) return 0;
    return activeStudents.reduce((total, student) => {
      if (student.hasScholarship && student.scholarshipDiscount && student.category) {
        const fee = feeSettings.find(fs => fs.category === student.category);
        if (fee?.value) {
          return total + (fee.value * student.scholarshipDiscount / 100);
        }
      }
      return total;
    }, 0);
  }, [activeStudents, feeSettings, isLoadingStudents, isLoadingFeeSettings]);

  const receitaTotalMesAtual = useMemo(() => {
    if (isLoadingPayments || isLoadingReceitas) return 0;
    const receitaPagamentos = payments
      .filter(p => {
        if (p.status !== "Pago" || !p.paymentDate) return false;
        const paymentDate = new Date(p.paymentDate + 'T00:00:00Z');
        return paymentDate.getUTCMonth() === currentMonth && paymentDate.getUTCFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + parseCurrency(p.value), 0);
    const receitaOutras = receitas
      .filter(r => {
        const revenueDate = new Date(r.revenue_date + 'T00:00:00Z');
        return revenueDate.getUTCMonth() === currentMonth && revenueDate.getUTCFullYear() === currentYear;
      })
      .reduce((sum, r) => sum + r.value, 0);
    return receitaPagamentos + receitaOutras;
  }, [payments, receitas, currentMonth, currentYear, isLoadingPayments, isLoadingReceitas]);

  const taxaInadimplenciaMesAtual = useMemo(() => {
    if (isLoadingPayments) return { percent: 0, details: "" };
    const pagamentosDoMes = payments.filter(p => {
      const dueDate = new Date(p.dueDate + 'T00:00:00Z');
      return dueDate.getUTCMonth() === currentMonth && dueDate.getUTCFullYear() === currentYear;
    });
    const valorTotalDevido = pagamentosDoMes.reduce((sum, p) => sum + parseCurrency(p.value), 0);
    if (valorTotalDevido === 0) return { percent: 0, details: "Nenhum pgto. devido."};
    const valorInadimplente = pagamentosDoMes
      .filter(p => p.status === "Pendente" || p.status === "Atrasado")
      .reduce((sum, p) => sum + parseCurrency(p.value), 0);
    const percent = (valorInadimplente / valorTotalDevido) * 100;
    return {
        percent: parseFloat(percent.toFixed(1)) || 0, 
        details: `R$ ${valorInadimplente.toFixed(2)} de R$ ${valorTotalDevido.toFixed(2)} inadimplentes.`
    };
  }, [payments, currentMonth, currentYear, isLoadingPayments]);

  // --- Gráficos Aba Geral ---
  const monthlyStudentGrowth = useMemo(() => {
    if (isLoadingStudents) return [];
    const growthMap: Record<string, { monthYear: string, year: number, monthNum: number, count: number }> = {};
    activeStudents.sort((a,b) => new Date(a.joinDate + 'T00:00:00Z').getTime() - new Date(b.joinDate + 'T00:00:00Z').getTime())
      .forEach(student => {
        const joinDateObj = new Date(student.joinDate + 'T00:00:00Z');
        const monthYear = joinDateObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' });
        const year = joinDateObj.getUTCFullYear();
        const monthNum = joinDateObj.getUTCMonth();
        if (!growthMap[monthYear]) {
          growthMap[monthYear] = { monthYear, year, monthNum, count: 0 };
        }
        growthMap[monthYear].count++;
      });
    let accumulatedCount = 0;
    const sortedMonths = Object.values(growthMap).sort((a,b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNum - b.monthNum;
    });
    const resultData = sortedMonths.map(data => {
        accumulatedCount += data.count;
        return { month: data.monthYear, alunos: accumulatedCount };
    });
    return resultData.slice(-12);
  }, [activeStudents, isLoadingStudents]);

  const studentDistributionByCategory = useMemo(() => {
    if (isLoadingStudents) return [];
    const categories: Record<string, number> = {};
    activeStudents.forEach(student => {
      const category = student.category || "Sem Categoria";
      categories[category] = (categories[category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [activeStudents, isLoadingStudents]);

  const statusCountData = useMemo(() => {
    if(isLoadingPayments) return [];
    return [
      { name: "Pago", value: paidPaymentsCount, fill: COLORS_BY_STATUS.Pago },
      { name: "Pendente", value: pendingPaymentsCount, fill: COLORS_BY_STATUS.Pendente },
      { name: "Atrasado", value: overduePaymentsCount, fill: COLORS_BY_STATUS.Atrasado },
    ];
  }, [paidPaymentsCount, pendingPaymentsCount, overduePaymentsCount, isLoadingPayments]);
  
  // --- Cálculos Aba Financeiro ---
  const totalRecebidoUltimos30Dias = useMemo(() => {
    if (isLoadingPayments || isLoadingReceitas) return 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(today.getUTCDate() - 30);
    thirtyDaysAgo.setUTCHours(0,0,0,0);
    const receitaPagamentos = payments
      .filter(p => {
        if (p.status !== "Pago" || !p.paymentDate) return false;
        const paymentDate = new Date(p.paymentDate + 'T00:00:00Z');
        return paymentDate >= thirtyDaysAgo;
      })
      .reduce((sum, p) => sum + parseCurrency(p.value), 0);
    const receitaOutras = receitas
      .filter(r => new Date(r.revenue_date + 'T00:00:00Z') >= thirtyDaysAgo)
      .reduce((sum, r) => sum + r.value, 0);
    return receitaPagamentos + receitaOutras;
  }, [payments, receitas, today, isLoadingPayments, isLoadingReceitas]);

  const receitaMensalPagoVsPrevisto = useMemo(() => {
    if (isLoadingPayments || isLoadingReceitas) return [];
    const dataMap: Record<string, { name: string, pago: number, previsto: number, year: number, monthNum: number }> = {};
    const N = 12; 
    payments.forEach(p => {
      const dueDate = new Date(p.dueDate + 'T00:00:00Z');
      const monthYear = formatDateToMonthYear(p.dueDate);
      const year = dueDate.getUTCFullYear();
      const monthNum = dueDate.getUTCMonth();
      if (!dataMap[monthYear]) dataMap[monthYear] = { name: monthYear, pago: 0, previsto: 0, year, monthNum };
      dataMap[monthYear].previsto += parseCurrency(p.value);
      if (p.status === "Pago" && p.paymentDate) {
        dataMap[monthYear].pago += parseCurrency(p.value);
      }
    });
    receitas.forEach(r => {
      const revenueDate = new Date(r.revenue_date + 'T00:00:00Z');
      const monthYear = formatDateToMonthYear(r.revenue_date);
      const year = revenueDate.getUTCFullYear();
      const monthNum = revenueDate.getUTCMonth();
      if (!dataMap[monthYear]) dataMap[monthYear] = { name: monthYear, pago: 0, previsto: 0, year, monthNum };
      dataMap[monthYear].pago += r.value; 
    });
    return Object.values(dataMap)
      .sort((a, b) => (a.year === b.year ? a.monthNum - b.monthNum : a.year - b.year))
      .slice(-N);
  }, [payments, receitas, isLoadingPayments, isLoadingReceitas]);
  
  const distribuicaoReceitaPorTipo = useMemo(() => {
    if (isLoadingPayments || isLoadingReceitas || isLoadingPaymentTypes) return [];
    const dataMap: Record<string, number> = {};
    payments.filter(p => p.status === "Pago").forEach(p => {
        const paymentTypeName = paymentTypes.find(pt => pt.id === p.paymentTypeId)?.name || `Tipo ID ${p.paymentTypeId}`;
        dataMap[paymentTypeName] = (dataMap[paymentTypeName] || 0) + parseCurrency(p.value);
    });
    receitas.forEach(r => {
        const paymentTypeName = paymentTypes.find(pt => pt.id === r.payment_type)?.name || `Tipo ID ${r.payment_type} (Receita)`;
        dataMap[paymentTypeName] = (dataMap[paymentTypeName] || 0) + r.value;
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [payments, receitas, paymentTypes, isLoadingPayments, isLoadingReceitas, isLoadingPaymentTypes]);

  const receitaPorCategoriaEStatus = useMemo(() => {
    if (isLoadingPayments || isLoadingStudents) return [];

    const dataMap: Record<string, { categoryName: string; Pago: number; Pendente: number; Atrasado: number }> = {};

    payments.forEach(payment => {
      const student = students.find(s => s.id === payment.studentId);
      const category = student?.category || "Sem Categoria";

      if (!dataMap[category]) {
        dataMap[category] = { categoryName: category, Pago: 0, Pendente: 0, Atrasado: 0 };
      }

      const value = parseCurrency(payment.value);
      if (payment.status === "Pago") {
        dataMap[category].Pago += value;
      } else if (payment.status === "Pendente") {
        if (payment.dueDate) { 
          const dueDate = new Date(payment.dueDate + 'T00:00:00Z');
          if (dueDate < todayNormalized) {
            dataMap[category].Atrasado += value;
          } else {
            dataMap[category].Pendente += value;
          }
        } else { 
          dataMap[category].Pendente += value; // Sem dueDate, continua Pendente
        }
      }
      // Não há "else if (payment.status === "Atrasado")" pois já é coberto acima
    });
    return Object.values(dataMap).sort((a,b) => a.categoryName.localeCompare(b.categoryName));
  }, [payments, students, isLoadingPayments, isLoadingStudents, todayNormalized]);

  // --- Cálculos para Aba Categorias ---
  const uniqueStudentCategories = useMemo(() => {
    if (isLoadingStudents) return [];
    const categories = new Set(activeStudents.map(s => s.category || "Sem Categoria"));
    return Array.from(categories).sort();
  }, [activeStudents, isLoadingStudents]);

  const studentsInSelectedCategory = useMemo(() => {
    if (!selectedCategory) return activeStudents; // "Todas as Categorias"
    return activeStudents.filter(s => s.category === selectedCategory);
  }, [activeStudents, selectedCategory]);

  const paymentsOfSelectedCategory = useMemo(() => {
    if (isLoadingPayments || isLoadingStudents) return [];
    const studentIdsInSelectedCategory = new Set(studentsInSelectedCategory.map(s => s.id));
    return payments.filter(p => studentIdsInSelectedCategory.has(p.studentId));
  }, [payments, studentsInSelectedCategory, isLoadingPayments, isLoadingStudents]);

  // KPIs para categoria selecionada
  const kpiTotalStudentsInSelectedCat = useMemo(() => studentsInSelectedCategory.length, [studentsInSelectedCategory]);

  const kpiReceitaTotalSelectedCatMesAtual = useMemo(() => {
    if (isLoadingPayments) return 0;
    return paymentsOfSelectedCategory
      .filter(p => {
        if (p.status !== "Pago" || !p.paymentDate) return false;
        const paymentDate = new Date(p.paymentDate + 'T00:00:00Z');
        return paymentDate.getUTCMonth() === currentMonth && paymentDate.getUTCFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + parseCurrency(p.value), 0);
  }, [paymentsOfSelectedCategory, currentMonth, currentYear, isLoadingPayments]);

  const kpiPagamentosEmDiaSelectedCatMesAtual = useMemo(() => {
    if (isLoadingPayments) return { percent: 0, details: "N/A" };
    const pagamentosDoMesNaCategoria = paymentsOfSelectedCategory.filter(p => {
      const dueDate = new Date(p.dueDate + 'T00:00:00Z');
      return dueDate.getUTCMonth() === currentMonth && dueDate.getUTCFullYear() === currentYear;
    });
    const totalDevido = pagamentosDoMesNaCategoria.reduce((sum, p) => sum + parseCurrency(p.value), 0);
    if (totalDevido === 0) return { percent: 0, details: "Sem pgtos. devidos" };

    const pagos = pagamentosDoMesNaCategoria.filter(p => p.status === "Pago").length;
    const totalPagamentosNoMes = pagamentosDoMesNaCategoria.length;
    if (totalPagamentosNoMes === 0) return { percent: 0, details: "Sem pgtos. no mês" };
    
    const percent = (pagos / totalPagamentosNoMes) * 100;
    return {
      percent: parseFloat(percent.toFixed(1)) || 0,
      details: `${pagos} de ${totalPagamentosNoMes} pgtos.`
    };
  }, [paymentsOfSelectedCategory, currentMonth, currentYear, isLoadingPayments]);

  // Dados para gráfico de Pizza: Status de Pagamento na Categoria (Mês Atual)
  const statusPagamentosSelectedCatMesAtual = useMemo(() => {
    if (isLoadingPayments) return [];
    const pagamentosDoMes = paymentsOfSelectedCategory.filter(p => {
      if (!p.dueDate) return false; 
      const dueDate = new Date(p.dueDate + 'T00:00:00Z'); 
      return dueDate.getUTCMonth() === currentMonth && dueDate.getUTCFullYear() === currentYear;
    });

    const statusMap = {
      Pago: 0,
      Pendente: 0, // Pendente não vencido no mês atual
      Atrasado: 0  // Pendente vencido no mês atual
    };

    pagamentosDoMes.forEach(p => {
      const value = parseCurrency(p.value);
      if (p.status === "Pago") {
        statusMap.Pago += value;
      } else if (p.status === "Pendente") {
        const dueDate = new Date(p.dueDate! + 'T00:00:00Z');
        if (dueDate < todayNormalized) {
          statusMap.Atrasado += value;
        } else {
          statusMap.Pendente += value;
        }
      }
      // Não há status "Atrasado" explícito do banco
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
  }, [paymentsOfSelectedCategory, currentMonth, currentYear, isLoadingPayments, todayNormalized]);

  // --- Cálculos para Gráfico Comparativo de Receita Mensal (Categoria vs Média Geral) ---
  const receitaMensalCategoriaSelecionada = useMemo(() => {
    if (isLoadingPayments) return [];
    const dataMap: Record<string, { name: string, valor: number, year: number, monthNum: number }> = {};
    const N = 12; // Últimos 12 meses

    paymentsOfSelectedCategory.forEach(p => {
      if (p.status === "Pago" && p.paymentDate) {
        const paymentDateObj = new Date(p.paymentDate + 'T00:00:00Z');
        const monthYear = formatDateToMonthYear(p.paymentDate);
        const year = paymentDateObj.getUTCFullYear();
        const monthNum = paymentDateObj.getUTCMonth();

        if (!dataMap[monthYear]) {
          dataMap[monthYear] = { name: monthYear, valor: 0, year, monthNum };
        }
        dataMap[monthYear].valor += parseCurrency(p.value);
      }
    });
    return Object.values(dataMap)
      .sort((a, b) => (a.year === b.year ? a.monthNum - b.monthNum : a.year - b.year))
      .slice(-N);
  }, [paymentsOfSelectedCategory, isLoadingPayments]);

  const receitaMediaMensalGeralPorAluno = useMemo(() => {
    if (isLoadingPayments || totalActiveStudents === 0) return [];
    const dataMap: Record<string, { name: string, valorMedio: number, year: number, monthNum: number }> = {};
    const N = 12;

    payments.forEach(p => {
      if (p.status === "Pago" && p.paymentDate) {
        const paymentDateObj = new Date(p.paymentDate + 'T00:00:00Z');
        const monthYear = formatDateToMonthYear(p.paymentDate);
        const year = paymentDateObj.getUTCFullYear();
        const monthNum = paymentDateObj.getUTCMonth();

        if (!dataMap[monthYear]) {
          dataMap[monthYear] = { name: monthYear, valorMedio: 0, year, monthNum }; // Inicializa valorMedio, será somado e depois dividido
        }
        dataMap[monthYear].valorMedio += parseCurrency(p.value); // Soma todos os pagamentos pagos no mês
      }
    });

    // Calcula a média e ordena
    return Object.values(dataMap)
      .map(item => ({
        ...item,
        valorMedio: parseFloat((item.valorMedio / totalActiveStudents).toFixed(2)) // Divide pelo total de alunos ativos (geral)
      }))
      .sort((a, b) => (a.year === b.year ? a.monthNum - b.monthNum : a.year - b.year))
      .slice(-N);
  }, [payments, isLoadingPayments, totalActiveStudents]);

  const comparativoReceitaMensalData = useMemo(() => {
    const N = 12;
    const combinedData: Record<string, { monthYear: string, receitaCategoria?: number, receitaMediaGeral?: number, year?: number, monthNum?: number }> = {};

    receitaMensalCategoriaSelecionada.forEach(item => {
      if (!combinedData[item.name]) combinedData[item.name] = { monthYear: item.name, year: item.year, monthNum: item.monthNum };
      combinedData[item.name].receitaCategoria = item.valor;
    });

    receitaMediaMensalGeralPorAluno.forEach(item => {
      if (!combinedData[item.name]) combinedData[item.name] = { monthYear: item.name, year: item.year, monthNum: item.monthNum };
      combinedData[item.name].receitaMediaGeral = item.valorMedio;
    });
    
    // Garantir que todos os meses dos últimos N tenham entrada, mesmo que com valor 0
    const last12Months = [];
    const d = new Date();
    d.setUTCDate(1); // Garante que estamos no início do mês para evitar pulos

    for (let i = 0; i < N; i++) {
        const monthYear = d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' });
        const year = d.getUTCFullYear();
        const monthNum = d.getUTCMonth();
        if (!combinedData[monthYear]) {
            combinedData[monthYear] = { monthYear, year, monthNum };
        }
        // Move para o mês anterior, tratando a virada do ano corretamente
        d.setUTCMonth(d.getUTCMonth() - 1);
    }

    return Object.values(combinedData)
        .map(item => ({
            monthYear: item.monthYear,
            receitaCategoria: item.receitaCategoria || 0,
            receitaMediaGeral: item.receitaMediaGeral || 0,
            year: item.year,
            monthNum: item.monthNum
        }))
      .sort((a, b) => {
        if (!a.year || !b.year || !a.monthNum || !b.monthNum) return 0; // fallback se year/monthNum não estiver definido
        return (a.year === b.year ? a.monthNum - b.monthNum : a.year - b.year)
      })
      .slice(-N); // Garante que temos apenas os N mais recentes após a ordenação final
  }, [receitaMensalCategoriaSelecionada, receitaMediaMensalGeralPorAluno]);

  // --- Loading State ---
  if (isLoadingStudents || isLoadingPayments || isLoadingFeeSettings || isLoadingReceitas || isLoadingPaymentTypes) {
    return (
      <MainLayout><div className="flex justify-center items-center h-64"><p className="text-muted-foreground">Carregando dados dos relatórios...</p></div></MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div><h2 className="text-3xl font-bold tracking-tight">Relatórios</h2><p className="text-muted-foreground">Análise de dados da Craque Academy</p></div>
        <Tabs defaultValue="general" onValueChange={() => setSelectedCategory(null)}>
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>
          
          {/* --- ABA GERAL --- */}
          <TabsContent value="general" className="space-y-6">
            {/* KPIs Resumo Financeiro Geral (Valores) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-green-50"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-green-700">Total Pago (Geral)</CardTitle><Check className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-700">R$ {totalPagoGeral.toFixed(2).replace('.',',')}</div></CardContent></Card>
              <Card className="bg-amber-50"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-amber-700">Total Pendente (Geral)</CardTitle><DollarSign className="h-4 w-4 text-amber-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-amber-700">R$ {totalPendenteGeral.toFixed(2).replace('.',',')}</div></CardContent></Card>
              <Card className="bg-red-50"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-red-700">Total Atrasado (Geral)</CardTitle><AlertTriangle className="h-4 w-4 text-red-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-red-700">R$ {totalAtrasadoGeral.toFixed(2).replace('.',',')}</div></CardContent></Card>
              <Card className="bg-blue-50"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-blue-700">Valor Total Previsto (Geral)</CardTitle><DollarSign className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-blue-700">R$ {valorTotalPrevistoGeral.toFixed(2).replace('.',',')}</div></CardContent></Card>
            </div>

            {/* KPIs Contagens de Pagamentos */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card><CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Total de Mensalidades</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalPaymentsCount}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Pagas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{paidPaymentsCount}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Pendentes</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-amber-600">{pendingPaymentsCount}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Atrasadas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{overduePaymentsCount}</div></CardContent></Card>
                </div>
            
            {/* KPIs Adicionais da Aba Geral (Alunos, Descontos, Mês Atual) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-football-green">{totalActiveStudents}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Descontos Bolsistas (Estimado)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {totalScholarshipDiscountValue.toFixed(2).replace('.',',')}</div><p className="text-xs text-muted-foreground">Valor não realizado por bolsas</p></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Receita Total (Mês Atual)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {receitaTotalMesAtual.toFixed(2).replace('.',',')}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Inadimplência (Mês Atual)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{taxaInadimplenciaMesAtual.percent}%</div><p className="text-xs text-muted-foreground">{taxaInadimplenciaMesAtual.details}</p></CardContent></Card>
                </div>

            {/* Gráficos da Aba Geral */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4"><CardHeader><CardTitle>Evolução de Alunos Ativos</CardTitle><CardDescription>Número de alunos ativos (últimos 12 meses)</CardDescription></CardHeader><CardContent className="pl-2"><div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthlyStudentGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="alunos" stroke="#0D9F4F" strokeWidth={2} name="Alunos Ativos" dot={{ r: 4 }} activeDot={{ r: 6 }}/></LineChart></ResponsiveContainer></div></CardContent></Card>
              <Card className="lg:col-span-3"><CardHeader><CardTitle>Alunos Ativos por Categoria</CardTitle><CardDescription>Distribuição dos alunos ativos</CardDescription></CardHeader><CardContent className="pl-2"><div className="h-[350px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={studentDistributionByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis dataKey="name" type="category" width={100} interval={0} /><Tooltip /><Legend /><Bar dataKey="value" fill="#0D9F4F" name="Alunos" label={{ position: 'right' }} /></BarChart></ResponsiveContainer></div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>Pagamentos por Status (Visão Geral)</CardTitle><CardDescription>Quantidade total de todos os pagamentos registrados</CardDescription></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusCountData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false}/>
                      <Tooltip formatter={(value: number, name: string, props) => [`${props.payload.value} ${props.payload.name}`, "Quantidade"]}/>
                      <Legend />
                      <Bar dataKey="value" name="Quantidade" label={{ position: 'top' }} >
                        {statusCountData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* --- ABA FINANCEIRO --- */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Receita Total (Mês Atual)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {receitaTotalMesAtual.toFixed(2).replace('.',',')}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Recebido (Últimos 30d)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {totalRecebidoUltimos30Dias.toFixed(2).replace('.',',')}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pendente (Geral)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {totalPendenteGeral.toFixed(2).replace('.',',')}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Atrasado (Geral)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {totalAtrasadoGeral.toFixed(2).replace('.',',')}</div></CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle>Receita Mensal (Pago vs Previsto)</CardTitle><CardDescription>Inclui Pagamentos e Receitas Adicionais (últimos 12 meses)</CardDescription></CardHeader>
              <CardContent className="pl-2"><div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={receitaMensalPagoVsPrevisto} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                      <Legend />
                    <Bar dataKey="previsto" fill="#A0AEC0" name="Previsto (Mensalidades)" />
                    <Bar dataKey="pago" fill="#48BB78" name="Realizado (Pagos + Outras Receitas)" />
                    </BarChart>
                  </ResponsiveContainer>
              </div></CardContent>
            </Card>

            {/* NOVO GRÁFICO: Receita por Categoria e Status */}
            <Card>
              <CardHeader>
                <CardTitle>Receita por Categoria e Status</CardTitle>
                <CardDescription>Valores de mensalidades agrupados por categoria e status de pagamento.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={receitaPorCategoriaEStatus} margin={{ top: 5, right: 10, left: -20, bottom: 75 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoryName" angle={-45} textAnchor="end" interval={0} height={100} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                      <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
                      <Bar dataKey="Pago" fill="#48BB78" name="Pago" />
                      <Bar dataKey="Pendente" fill="#F59E0B" name="Pendente" /> {/* Amber color */}
                      <Bar dataKey="Atrasado" fill="#EF4444" name="Atrasado" /> {/* Red color */}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Distribuição da Receita por Tipo</CardTitle><CardDescription>Valores pagos de todas as fontes (Pagamentos e Receitas Adicionais)</CardDescription></CardHeader>
              <CardContent className="h-[400px] flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie data={distribuicaoReceitaPorTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent, value }) => `${name} (${(percent * 100).toFixed(0)}%) - R$${value.toFixed(0)}`}>
                            {distribuicaoReceitaPorTipo.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [`R$ ${value.toFixed(2)}`, name]} />
                        <Legend wrapperStyle={{bottom: 0, left: 0, right: 0, position: 'relative'}} />
                    </PieChart>
                  </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- ABA CATEGORIAS --- */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <label htmlFor="category-select" className="text-sm font-medium">Filtrar por Categoria:</label>
              <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
                <SelectTrigger id="category-select" className="w-[280px]">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias Ativas</SelectItem>
                  {uniqueStudentCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alunos em {selectedCategory || 'Todas as Categorias'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiTotalStudentsInSelectedCat}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total (Mês Atual)</CardTitle>
                  <CardDescription>{selectedCategory || 'Todas Ativas'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {kpiReceitaTotalSelectedCatMesAtual.toFixed(2).replace('.',',')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">% Pgtos. em Dia (Mês Atual)</CardTitle>
                  <CardDescription>{selectedCategory || 'Todas Ativas'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpiPagamentosEmDiaSelectedCatMesAtual.percent}%</div>
                  <p className="text-xs text-muted-foreground">{kpiPagamentosEmDiaSelectedCatMesAtual.details}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Status Pagamentos - {selectedCategory || 'Todas as Categorias'} (Mês Atual)</CardTitle>
                <CardDescription>Distribuição dos valores por status de pagamento no mês corrente.</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] flex justify-center items-center">
                {statusPagamentosSelectedCatMesAtual.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie 
                        data={statusPagamentosSelectedCatMesAtual} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100} 
                        labelLine={false}
                        label={({ name, percent, value }) => `${name} (${(percent * 100).toFixed(0)}%) - R$${value.toFixed(0)}`}
                      >
                        {statusPagamentosSelectedCatMesAtual.map((entry, index) => (
                          <Cell key={`cell-cat-${index}`} fill={entry.name === 'Pago' ? '#48BB78' : entry.name === 'Pendente' ? '#F59E0B' : '#EF4444'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string) => [`R$ ${value.toFixed(2)}`, name]} />
                      <Legend wrapperStyle={{bottom: -10, left: 0, right: 0, position: 'relative'}}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado de pagamento para o mês atual na categoria selecionada.</p>
                )}
              </CardContent>
            </Card>
            
            {/* Gráfico Comparativo de Receita Mensal */}
            <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Comparativo de Receita Mensal</CardTitle>
                    <CardDescription>
                        Receita da {selectedCategory || 'Geral (Todas Categorias)'} vs. Receita Média por Aluno (Geral)
                    </CardDescription>
                  </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[350px]">
                    {comparativoReceitaMensalData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={comparativoReceitaMensalData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="monthYear" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="receitaCategoria" 
                            name={`Receita ${selectedCategory || 'Geral'}`} 
                            stroke="#8884d8" 
                            strokeWidth={2} 
                            dot={{ r: 4 }} 
                            activeDot={{ r: 6 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="receitaMediaGeral" 
                            name="Receita Média por Aluno (Geral)" 
                            stroke="#82ca9d" 
                            strokeWidth={2} 
                            dot={{ r: 4 }} 
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-10">Dados insuficientes para exibir o gráfico comparativo.</p>
                    )}
                    </div>
                  </CardContent>
                </Card>

          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
