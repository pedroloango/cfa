import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { Student } from '@/components/students/StudentForm';

// Helper to convert dd/mm/yyyy or ISO datetime to YYYY-MM-DD for DB
const formatDateForDb = (dateStr: string | undefined | null): string | null => {
  if (!dateStr) return null;
  // if dd/mm/yyyy format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }
  // if ISO datetime or YYYY-MM-DD
  const iso = dateStr.split('T')[0];
  return iso;
}

// Add a helper to map camelCase Student to snake_case DB columns
const mapStudentToDb = (student: Partial<Student>) => ({
  name: student.name,
  birth_date: formatDateForDb(student.birthDate),
  rg: student.rg ?? null,
  cpf: student.cpf ?? null,
  category: student.category,
  join_date: formatDateForDb(student.joinDate)!,
  polo: student.polo ?? null,
  status: student.status,
  responsible_name: student.responsibleName ?? null,
  responsible_cpf: student.responsibleCpf ?? null,
  whatsapp: student.whatsapp ?? null,
  address: student.address ?? null,
  age: student.age,
  position: student.position,
  phone: student.phone,
  has_scholarship: student.hasScholarship ?? false,
  scholarship_discount: student.scholarshipDiscount ?? null,
})

export const useStudents = () =>
  useQuery<Student[], Error>({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*');
      if (error || !data) throw error;
      // Map DB row snake_case to Student type camelCase
      return data.map(row => ({
        id: row.id,
        name: row.name,
        birthDate: row.birth_date || '',
        rg: row.rg || '',
        cpf: row.cpf || '',
        category: row.category,
        joinDate: row.join_date ? row.join_date.toString() : '',
        polo: row.polo || '',
        status: row.status,
        responsibleName: row.responsible_name || '',
        responsibleCpf: row.responsible_cpf || '',
        whatsapp: row.whatsapp || '',
        address: row.address || '',
        age: row.age || 0,
        position: row.position,
        phone: row.phone,
        hasScholarship: row.has_scholarship || false,
        scholarshipDiscount: row.scholarship_discount || 0,
      } as Student));
    },
  });

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<Student[], Error, Omit<Student, 'id'>>({
    mutationFn: async (student) => {
      const payload = mapStudentToDb(student)
      // Debug: log payload before insert
      console.debug('Inserting student payload:', payload)
      const fullResp = await supabase.from('students').insert([payload]).select()
      const { data, error, status, statusText } = fullResp as any
      if (error) {
        console.error('Supabase insert error', { status, statusText, error, payload })
        throw error
      }
      return data as Student[]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<Student[], Error, Student>({
    mutationFn: async (student) => {
      const payload = mapStudentToDb(student)
      const { data, error } = await supabase.from('students').update(payload).eq('id', student.id)
      if (error) throw error;
      return data as Student[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}; 