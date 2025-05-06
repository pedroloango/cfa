import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types/user'

// DB User type
interface DbUser {
  id: string
  full_name: string
  email: string
  password: string
  role: User['role']
  permissions: string[]
}

// Map DB row to UI User
const mapDbToUser = (db: DbUser): User => ({
  id: db.id,
  name: db.full_name,
  email: db.email,
  password: db.password,
  role: db.role,
  permissions: db.permissions,
})

export const useUsers = () =>
  useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: async () => {
      // Fetch users from DB
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, permissions')
      if (error || !data) throw error
      // Cast to DbUser[] and map to UI User
      return (data as DbUser[]).map(mapDbToUser)
    },
  })

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation<User, Error, Omit<User, 'id'>>({
    mutationFn: async (user) => {
      // Build payload and insert, then fetch single record
      const payload = { full_name: user.name, email: user.email, password: user.password, role: user.role, permissions: user.permissions }
      const resp: any = await supabase
        .from('users')
        .insert([payload])
        .select('*')
        .single()
      const { data, error } = resp
      if (error || !data) {
        console.error('Error creating user:', error)
        throw error
      }
      return mapDbToUser(data as DbUser)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('users').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
}

// Hook to update an existing user
export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation<User, Error, User>({
    mutationFn: async (user) => {
      const payload = {
        full_name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        permissions: user.permissions,
      }
      const resp: any = await supabase
        .from('users')
        .update(payload)
        .eq('id', user.id)
        .select('*')
        .single()
      const { data, error } = resp
      if (error || !data) throw error
      return mapDbToUser(data as DbUser)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })
} 