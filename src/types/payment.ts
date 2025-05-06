export interface Payment {
  id: number;
  studentId: number;
  student: string;
  description: string;
  paymentTypeId: number;
  paymentType: string;
  category: string;
  value: string;
  dueDate: string;
  status: 'Pendente' | 'Pago' | 'Atrasado';
  paymentMethod: string;
  month: string;
  year: string;
  paymentDate?: string;
}

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
