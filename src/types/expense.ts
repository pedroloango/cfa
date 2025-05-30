export interface ExpenseCategory {
  id: string;
  name: string;
  user_defined: boolean;
  created_at?: string; 
}

export type ExpenseStatus = 'Pago' | 'Pendente';
export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Transferência Bancária' | 'Boleto' | 'Outro';

export interface Expense {
  id: string;
  created_at?: string;
  category_id: string;
  category?: ExpenseCategory; // Para dados populados
  description: string;
  amount: number;
  due_date: string; // Formato YYYY-MM-DD
  payment_date?: string | null; // Formato YYYY-MM-DD
  payment_method?: PaymentMethod | string | null; // Permitir string para 'Outro'
  status: ExpenseStatus;
  is_recurring: boolean;
  user_id?: string;
} 