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

const monthlyData = [
  { name: 'Jan', alunos: 85, receita: 12750 },
  { name: 'Fev', alunos: 90, receita: 13500 },
  { name: 'Mar', alunos: 102, receita: 15300 },
  { name: 'Abr', alunos: 115, receita: 17250 },
  { name: 'Mai', alunos: 120, receita: 18000 },
  { name: 'Jun', alunos: 118, receita: 17700 },
  { name: 'Jul', alunos: 125, receita: 18750 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Relatorios = () => {
  const { data: students = [] } = useStudents();
  const { data: payments = [] } = useDbPayments();

  // Calculate total students
  const totalStudents = students.length;

  // Calculate monthly student growth
  const monthlyGrowth = students.reduce((acc, student) => {
    const month = new Date(student.joinDate).toLocaleString('pt-BR', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const growthData = Object.entries(monthlyGrowth).map(([month, count]) => ({
    month,
    count,
  }));

  // Calculate distribution by age category
  const ageCategories = students.reduce((acc, student) => {
    if (!student.birthDate) return acc; // Garante que birthDate existe
    const age = new Date().getFullYear() - new Date(student.birthDate as string).getFullYear();
    let category = "Outros";
    
    if (age < 6) category = "Sub-6";
    else if (age < 8) category = "Sub-8";
    else if (age < 10) category = "Sub-10";
    else if (age < 12) category = "Sub-12";
    else if (age < 14) category = "Sub-14";
    else if (age < 16) category = "Sub-16";
    else if (age < 18) category = "Sub-18";
    
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(ageCategories).map(([category, count]) => ({
    name: category,
    value: count,
  }));

  // Calculate payment status
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const currentYear = new Date().getFullYear().toString();
  
  const monthlyPayments = payments.filter(payment => 
    payment.month === currentMonth && payment.year === currentYear
  );

  const paymentStatus = {
    paid: monthlyPayments.filter(p => p.status === "Pago").length,
    pending: monthlyPayments.filter(p => p.status === "Pendente").length,
    overdue: monthlyPayments.filter(p => p.status === "Atrasado").length,
  };

  // Count payments by status (all payments)
  const statusCountData = [
    { name: "Pago", value: payments.filter(p => p.status === "Pago").length },
    { name: "Pendente", value: payments.filter(p => p.status === "Pendente").length },
    { name: "Atrasado", value: payments.filter(p => p.status === "Atrasado").length },
  ];

  // Prepare data for charts
  const paymentData = [
    { name: "Pago", value: paymentStatus.paid },
    { name: "Pendente", value: paymentStatus.pending },
    { name: "Atrasado", value: paymentStatus.overdue },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Análise de dados da Craque Academy
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            {/* KPI Card */}
            <Card>
              <CardHeader>
                <CardTitle>Total de Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-football-green">{totalStudents}</div>
              </CardContent>
            </Card>

            {/* Student Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Alunos</CardTitle>
                <CardDescription>
                  Crescimento mensal no número de alunos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#0D9F4F" 
                        strokeWidth={2}
                        name="Alunos"
                        label={{ position: 'top' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Age Category Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>
                  Alunos por categoria de idade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#0D9F4F" name="Alunos" label={{ position: 'top' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Mensalidades por Status de Pagamentos</CardTitle>
                <CardDescription>
                  Quantidade de mensalidades por status de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusCountData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#0D9F4F" name="Quantidade" label={{ position: 'top' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            {/* Monthly Revenue Total Value Received */}
            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal - Valor Total Recebido</CardTitle>
                <CardDescription>
                  Valor total recebido mensalmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`R$ ${value}`, 'Receita']} />
                      <Legend />
                      <Bar dataKey="receita" fill="#0D9F4F" name="Receita (R$)" label={{ position: 'top', formatter: (value: number) => `R$ ${value}` }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Total Value by Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal - Valor Total por Status de Pagamento</CardTitle>
                <CardDescription>
                  Valor total por status de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`R$ ${value}`, 'Receita']} />
                      <Legend />
                      <Bar dataKey="value" fill="#0D9F4F" name="Valor (R$)" label={{ position: 'top', formatter: (value: number) => `R$ ${value}` }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Total Value by Revenue Type and Payment Type */}
            <Card>
              <CardHeader>
                <CardTitle>Receita Mensal - Valor Total por Tipo de Receita e Pagamento</CardTitle>
                <CardDescription>
                  Valor total por tipo de receita e pagamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`R$ ${value}`, 'Receita']} />
                      <Legend />
                      <Bar dataKey="receita" fill="#0D9F4F" name="Receita (R$)" label={{ position: 'top', formatter: (value: number) => `R$ ${value}` }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Status de Pagamentos - Visão Geral</CardTitle>
                <CardDescription>
                  Visão geral dos pagamentos mensais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusCountData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#0D9F4F" name="Quantidade" label={{ position: 'top' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryData.map((category) => (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription>
                      {(category.value as number)} alunos ({(((category.value as number) / totalStudents) * 100).toFixed(1)}% do total)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Mensalidade média</p>
                        <p className="text-2xl font-bold">R$ 150,00</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Receita mensal</p>
                        <p className="text-2xl font-bold">R$ {(category.value as number) * 150},00</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
