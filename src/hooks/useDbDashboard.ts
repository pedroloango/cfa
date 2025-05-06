import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export const useDbDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Buscar alunos
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*');

      if (studentsError) throw studentsError;

      // Buscar pagamentos do mês atual
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('month', currentMonth.toString())
        .eq('year', currentYear.toString());

      if (paymentsError) throw paymentsError;

      // Calcular estatísticas
      const total = students?.length || 0;
      const scholars = students?.filter(s => s.hasScholarship)?.length || 0;
      const paying = total - scholars;

      // Calcular total de mensalidades pagas
      const totalPaid = payments
        ?.filter(p => p.status === 'Pago')
        .reduce((acc, curr) => acc + (curr.value || 0), 0) || 0;

      // Calcular distribuição por categoria
      const categories = ["Sub-7", "Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17"];
      const distribution = categories.map(category => ({
        category,
        count: students?.filter(s => s.category === category)?.length || 0
      }));

      // Calcular próximos aniversariantes
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const upcomingBirthdays = students
        ?.filter(student => {
          if (!student.birthDate) return false;
          
          const birthDate = new Date(student.birthDate);
          const currentYear = today.getFullYear();
          
          // Criar data do aniversário para este ano
          const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
          
          // Se o aniversário já passou este ano, verificar para o próximo ano
          if (birthdayThisYear < today) {
            birthdayThisYear.setFullYear(currentYear + 1);
          }
          
          // Verificar se o aniversário está dentro dos próximos 7 dias
          return birthdayThisYear >= today && birthdayThisYear <= nextWeek;
        })
        ?.map(student => ({
          id: student.id,
          name: student.name,
          category: student.category,
          birthDate: student.birthDate
        }))
        ?.sort((a, b) => {
          const dateA = new Date(a.birthDate);
          const dateB = new Date(b.birthDate);
          
          const currentYear = today.getFullYear();
          const birthdayA = new Date(currentYear, dateA.getMonth(), dateA.getDate());
          const birthdayB = new Date(currentYear, dateB.getMonth(), dateB.getDate());
          
          if (birthdayA < today) birthdayA.setFullYear(currentYear + 1);
          if (birthdayB < today) birthdayB.setFullYear(currentYear + 1);
          
          return birthdayA.getTime() - birthdayB.getTime();
        }) || [];

      return {
        stats: {
          total,
          paying,
          scholars,
          totalPaid
        },
        categoryData: distribution,
        studentRatio: [
          { 
            name: 'Alunos Pagantes', 
            value: paying, 
            percentage: total > 0 ? Math.round((paying / total) * 100) : 0 
          },
          { 
            name: 'Alunos Bolsistas', 
            value: scholars, 
            percentage: total > 0 ? Math.round((scholars / total) * 100) : 0 
          }
        ],
        birthdays: upcomingBirthdays,
        payments
      };
    }
  });
}; 