import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseCategory, ExpenseStatus } from "@/types/expense";
import { XIcon } from "lucide-react";
import { useState, useEffect } from "react";

export interface ExpenseFilterValues {
  month?: number; // 1-12
  year?: number;
  categoryId?: string;
  status?: ExpenseStatus | "all"; // Permitir "all"
  searchTerm?: string;
}

interface ExpenseFiltersProps {
  categories: ExpenseCategory[];
  onFilterChange: (filters: ExpenseFilterValues) => void;
  initialFilters?: ExpenseFilterValues;
}

// Helper para gerar lista de anos (ex: últimos 5 anos + próximos 2)
const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    years.push({ value: i, label: i.toString() });
  }
  return years;
};

const monthOptions = [
  { value: 1, label: "Janeiro" }, { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" }, { value: 4, label: "Abril" },
  { value: 5, label: "Maio" }, { value: 6, label: "Junho" },
  { value: 7, label: "Julho" }, { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" }, { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" }, { value: 12, label: "Dezembro" },
];

// O valor para "todos" não deve colidir com ExpenseStatus
const ALL_STATUS_VALUE = "__all_status__"; 

const statusOptions: Array<{value: ExpenseStatus | typeof ALL_STATUS_VALUE, label: string}> = [
  { value: ALL_STATUS_VALUE, label: "Todos os status" },
  { value: "Pendente", label: "Pendente" },
  { value: "Pago", label: "Pago" },
];

export const ExpenseFilters = ({ 
  categories,
  onFilterChange,
  initialFilters = {}
}: ExpenseFiltersProps) => {
  // console.log("ExpenseFilters: Component RENDER. initialFilters:", JSON.stringify(initialFilters));

  const [year, setYear] = useState<string | undefined>(initialFilters.year?.toString());
  const [month, setMonth] = useState<string | undefined>(initialFilters.month?.toString());
  const [categoryId, setCategoryId] = useState<string | undefined>(initialFilters.categoryId);
  // Estado local para status pode ser string para acomodar "__all_status__"
  const [selectedStatusValue, setSelectedStatusValue] = useState<string | undefined>(
    initialFilters.status || ALL_STATUS_VALUE
  );
  const [searchTerm, setSearchTerm] = useState<string | undefined>(initialFilters.searchTerm);

  const yearOptions = getYearOptions();

  useEffect(() => {
    // console.log("ExpenseFilters: useEffect ACIONADO. Deps:", 
    //   JSON.stringify({ month, year, categoryId, selectedStatusValue, searchTerm, onFilterChange: typeof onFilterChange })
    // );
    const filters: ExpenseFilterValues = {
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      categoryId: categoryId === "all" ? undefined : categoryId,
      status: selectedStatusValue === ALL_STATUS_VALUE ? undefined : selectedStatusValue as ExpenseStatus,
      searchTerm: searchTerm || undefined,
    };
    onFilterChange(filters);

    return () => {
      // console.log("ExpenseFilters: useEffect CLEANUP - Componente desmontando ou dependências mudaram antes da próxima execução.");
    };
  }, [month, year, categoryId, selectedStatusValue, searchTerm, onFilterChange]);

  const clearFilters = () => {
    setMonth(undefined);
    setYear(undefined);
    setCategoryId(undefined);
    setSelectedStatusValue(ALL_STATUS_VALUE);
    setSearchTerm("");
  };
  
  const hasActiveFilters = () => {
    return month || 
           year || 
           (categoryId && categoryId !== "all") || 
           (selectedStatusValue && selectedStatusValue !== ALL_STATUS_VALUE) || 
           (searchTerm && searchTerm.length > 0);
  }

  return (
    <div className="p-4 mb-6 bg-card border rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="space-y-1">
          <label htmlFor="search" className="text-sm font-medium">Buscar Descrição</label>
          <Input 
            id="search"
            placeholder="Ex: Aluguel do campo"
            value={searchTerm || ""}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="month" className="text-sm font-medium">Mês Vencimento</label>
          <Select value={month || "all"} onValueChange={(val) => setMonth(val === "all" ? undefined : val)}>
            <SelectTrigger id="month">
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {monthOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label htmlFor="year" className="text-sm font-medium">Ano Vencimento</label>
          <Select value={year || "all"} onValueChange={(val) => setYear(val === "all" ? undefined : val)}>
            <SelectTrigger id="year">
              <SelectValue placeholder="Todos os anos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {yearOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label htmlFor="category" className="text-sm font-medium">Categoria</label>
          <Select value={categoryId || "all"} onValueChange={(val) => setCategoryId(val === "all" ? undefined : val)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <Select value={selectedStatusValue} onValueChange={setSelectedStatusValue}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {hasActiveFilters() && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={clearFilters} className="text-sm">
            <XIcon className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}; 