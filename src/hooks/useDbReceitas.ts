import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { Revenue } from '@/types/revenue';

interface DbReceitaRow {
  id: number;
  description: string;
  payment_type_id: number;
  payment_type: { id: number; name: string };
  value: number;
  revenue_date: string;
}

export function useDbReceitas() {
  const qc = useQueryClient();

  const receitasQuery = useQuery<Revenue[], Error>({
    queryKey: ['receitas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receitas')
        .select(
          'id, description, payment_type_id, value, revenue_date, ' +
          'payment_type:payment_type_id(id, name)'
        );
      if (error || !data) throw error;
      const rows = data as unknown as DbReceitaRow[];
      return rows.map(row => ({
        id: row.id,
        description: row.description,
        paymentTypeId: row.payment_type_id,
        paymentType: row.payment_type.name,
        value: row.value.toString(),
        revenueDate: row.revenue_date,
      }));
    },
    staleTime: Infinity,
  });

  const createReceita = useMutation<void, Error, Omit<Revenue, 'id'>>({
    mutationFn: async r => {
      const payload = {
        description: r.description,
        payment_type_id: r.paymentTypeId,
        value: parseFloat(
          r.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
        ),
        revenue_date: (() => {
          const parts = r.revenueDate.split('/');
          return parts.length === 3
            ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
            : r.revenueDate;
        })(),
      };
      console.log('Creating receita with payload:', payload);
      const { error } = await supabase.from('receitas').insert([payload]);
      console.log('Create receita error:', error);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['receitas'] }),
  });

  const updateReceita = useMutation<void, Error, Revenue>({
    mutationFn: async r => {
      const payload = {
        description: r.description,
        payment_type_id: r.paymentTypeId,
        value: parseFloat(
          r.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
        ),
        revenue_date: (() => {
          const parts = r.revenueDate.split('/');
          return parts.length === 3
            ? `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
            : r.revenueDate;
        })(),
      };
      console.log('Updating receita with payload:', payload);
      const { error } = await supabase.from('receitas').update(payload).eq('id', r.id);
      console.log('Update receita error:', error);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['receitas'] }),
  });

  const deleteReceita = useMutation<void, Error, number>({
    mutationFn: async id => {
      const { error } = await supabase.from('receitas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['receitas'] }),
  });

  return {
    ...receitasQuery,
    createReceita,
    updateReceita,
    deleteReceita,
  };
} 