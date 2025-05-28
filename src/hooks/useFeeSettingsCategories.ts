import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

const FEE_SETTINGS_CATEGORIES_QUERY_KEY = 'feeSettingsCategories';

interface FeeSettingCategory {
  category: string;
}

// Hook para buscar nomes de categorias distintas de fee_settings
export const useFeeSettingsCategories = () =>
  useQuery<string[], Error>({
    queryKey: [FEE_SETTINGS_CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      // Supabase não tem um `select distinct` direto no client JS de forma simples.
      // Uma forma é buscar todos e filtrar no client, ou criar uma View/RPC no Supabase.
      // Para simplicidade aqui, buscaremos todas as fee_settings e extrairemos as categorias únicas.
      const { data, error } = await supabase
        .from('fee_settings')
        .select('category');

      if (error) throw error;
      if (!data) return [];

      const distinctCategories = Array.from(new Set(data.map((item: FeeSettingCategory) => item.category).filter(Boolean)));
      return distinctCategories.sort(); // Ordena alfabeticamente
    },
    // Opcional: staleTime e gcTime para categorias que não mudam frequentemente
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  }); 