import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { Payment } from '@/types/payment';

interface DbPaymentRow {
  id: number;
  student_id: number;
  payment_type_id: number;
  payment_type: { id: number; name: string };
  description: string;
  category: string;
  value: number;
  due_date: string;
  status: string;
  payment_method: string;
  month: string;
  year: string;
  payment_date: string | null;
  student: { id: number; name: string };
}

export function useDbPayments() {
  const qc = useQueryClient();

  const paymentsQuery = useQuery<Payment[], Error>({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(
          'id, student_id, payment_type_id, description, category, value, due_date, status, payment_method, month, year, payment_date, ' +
          'student:student_id(id, name), payment_type:payment_type_id(id, name)'
        );
      if (error || !data) throw error;
      const rows = data as unknown as DbPaymentRow[];
      return rows.map(row => ({
        id: row.id,
        studentId: row.student_id,
        student: row.student.name,
        paymentTypeId: row.payment_type_id,
        paymentType: row.payment_type.name,
        description: row.description,
        category: row.category,
        value: row.value.toString(),
        dueDate: row.due_date,
        status: row.status as Payment['status'],
        paymentMethod: row.payment_method,
        month: row.month,
        year: row.year,
        paymentDate: row.payment_date || undefined,
      }));
    },
  });

  const createPayment = useMutation<void, Error, Omit<Payment, 'id'>>({
    mutationFn: async p => {
      const payload = {
        student_id: p.studentId,
        payment_type_id: p.paymentTypeId,
        description: p.description,
        category: p.category,
        value: parseFloat(p.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')),
        due_date: (() => {
          const parts = p.dueDate.split('/');
          return parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}` : p.dueDate;
        })(),
        status: p.status,
        payment_method: p.paymentMethod,
        month: p.month,
        year: p.year,
        payment_date: p.paymentDate ? (() => {
          const parts = p.paymentDate.split('/');
          return parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}` : p.paymentDate;
        })() : null,
      };
      console.log('Creating payment with payload:', payload);
      const { data, error } = await supabase.from('payments').insert([payload]);
      console.log({ data, error });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });

  const updatePayment = useMutation<void, Error, Payment>({
    mutationFn: async p => {
      const payload = {
        payment_type_id: p.paymentTypeId,
        description: p.description,
        category: p.category,
        value: parseFloat(p.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')),
        due_date: (() => {
          const parts = p.dueDate.split('/');
          return parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}` : p.dueDate;
        })(),
        status: p.status,
        payment_method: p.paymentMethod,
        month: p.month,
        year: p.year,
        payment_date: p.paymentDate ? (() => {
          const parts = p.paymentDate.split('/');
          return parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}` : p.paymentDate;
        })() : null,
      };
      console.log('Updating payment with payload:', payload);
      const { data, error } = await supabase.from('payments').update(payload).eq('id', p.id);
      console.log({ data, error });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });

  const deletePayment = useMutation<void, Error, number>({
    mutationFn: async id => {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  });

  return {
    ...paymentsQuery,
    createPayment,
    updatePayment,
    deletePayment,
  };
} 