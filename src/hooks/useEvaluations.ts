import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Evaluation } from '@/components/students/EvaluationForm'

// Type returned from DB with embedded student
interface DbEvaluation {
  id: number
  date: string
  technical: number
  tactical: number
  physical: number
  mental: number
  notes?: string
  student: {
    id: number
    name: string
    category: string
    position: string
  }
}

export const useEvaluations = () =>
  useQuery<Evaluation[], Error>({
    queryKey: ['evaluations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluations')
        // Select fields (excluding notes if not in DB), and embed student
        .select(
          'id, date, technical, tactical, physical, mental, student:student_id(id, name, category, position)'
        );
      if (error || !data) throw error;
      return data as unknown as Evaluation[];
    },
  });

// Map Evaluation to DB payload
const mapEvaluationToDb = (ev: Evaluation) => ({
  student_id: ev.student.id,
  date: ev.date,
  // Compute overall score as integer
  score: Math.round((ev.technical + ev.tactical + ev.physical + ev.mental) / 4),
  // Round individual ratings to integer to match DB schema
  technical: Math.round(ev.technical),
  tactical: Math.round(ev.tactical),
  physical: Math.round(ev.physical),
  mental: Math.round(ev.mental),
  // Include notes if provided
  notes: ev.notes ?? null,
})

// Direct REST endpoint configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const useCreateEvaluation = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, Evaluation>({
    mutationFn: async (ev) => {
      const payload = mapEvaluationToDb(ev)
      // Direct POST to Supabase REST API
      const res = await fetch(`${SUPABASE_URL}/rest/v1/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify([payload]),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluations'] }),
  })
}

export const useUpdateEvaluation = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, Evaluation>({
    mutationFn: async (ev) => {
      const payload = mapEvaluationToDb(ev)
      // Direct PATCH to Supabase REST API
      const res = await fetch(`${SUPABASE_URL}/rest/v1/evaluations?${new URLSearchParams({ id: `eq.${ev.id}` })}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluations'] }),
  })
}

export const useDeleteEvaluation = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, string | number>({
    mutationFn: async (id) => {
      // Delete the evaluation without returning columns
      const { error } = await supabase.from('evaluations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluations'] }),
  })
} 