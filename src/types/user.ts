export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'professor' | 'user';
  permissions: string[];
}

export const AVAILABLE_PAGES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'alunos', label: 'Alunos' },
  { id: 'mensalidades', label: 'Mensalidades' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'relatorios', label: 'Relatórios' },
  { id: 'receitas', label: 'Receitas' },
  { id: 'scout', label: 'Scout' },
  { id: 'relatorio-jogos', label: 'Relatório de Jogos' },
  { id: 'configuracoes', label: 'Configurações' }
] as const;
