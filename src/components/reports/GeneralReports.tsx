import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStudents } from "@/hooks/useStudents";
import { usePayments } from "@/hooks/usePayments";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, ResponsiveContainer as PieResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis as BarXAxis, YAxis as BarYAxis, CartesianGrid as BarCartesianGrid, Tooltip as BarTooltip, ResponsiveContainer as BarResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function GeneralReports() {
  const { data: students = [] } = useStudents();
  const { payments = [] } = usePayments();

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
    const age = new Date().getFullYear() - new Date(student.birthDate).getFullYear();
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
  const monthlyPayments = payments.filter(payment => 
    new Date(payment.dueDate).toLocaleString('pt-BR', { month: 'long' }) === currentMonth
  );

  const paymentStatus = {
    paid: monthlyPayments.filter(p => p.status === "Pago").length,
    pending: monthlyPayments.filter(p => p.status === "Pendente").length,
    overdue: monthlyPayments.filter(p => p.status === "Atrasado").length,
  };

  const paymentData = [
    { name: "Pago", value: paymentStatus.paid },
    { name: "Pendente", value: paymentStatus.pending },
    { name: "Atrasado", value: paymentStatus.overdue },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalStudents}</div>
        </CardContent>
      </Card>

      {/* Student Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Age Category Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <PieResponsiveContainer width="100%" height="100%">
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Payment Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Status de Pagamentos - {currentMonth}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <BarResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <BarCartesianGrid strokeDasharray="3 3" />
                <BarXAxis dataKey="name" />
                <BarYAxis />
                <BarTooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </BarResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 