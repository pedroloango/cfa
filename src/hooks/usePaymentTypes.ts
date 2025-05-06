import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

export interface PaymentType {
  id: number;
  name: string;
}

export function usePaymentTypes() {
  return useQuery<PaymentType[], Error>({
    queryKey: ['paymentTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_types')
        .select('id, name');
      if (error || !data) throw error;
      return data;
    },
    staleTime: Infinity,
  });
} 