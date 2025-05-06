import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export interface FeeSetting {
  id: number
  category: string
  value: number
}

export const useFeeSettings = () =>
  useQuery<FeeSetting[], Error>({
    queryKey: ['fee_settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fee_settings').select('*')
      if (error) throw error
      return data as FeeSetting[]
    },
  })

export const useCreateFeeSetting = () => {
  const queryClient = useQueryClient()
  return useMutation<FeeSetting[], Error, Omit<FeeSetting, 'id'>>({
    mutationFn: async (fee) => {
      const { data, error } = await supabase
        .from('fee_settings')
        .insert([{ category: fee.category, value: fee.value }])
        .select()
      if (error) throw error
      return data as FeeSetting[]
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fee_settings'] }),
  })
}

export const useUpdateFeeSetting = () => {
  const queryClient = useQueryClient()
  return useMutation<FeeSetting[], Error, FeeSetting>({
    mutationFn: async (fee) => {
      const { data, error } = await supabase
        .from('fee_settings')
        .update({ value: fee.value })
        .eq('id', fee.id)
        .select()
      if (error) throw error
      return data as FeeSetting[]
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fee_settings'] }),
  })
}

export const useDeleteFeeSetting = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('fee_settings').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fee_settings'] }),
  })
} 