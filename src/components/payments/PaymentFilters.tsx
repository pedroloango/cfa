
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, FilterX } from "lucide-react";
import { MONTHS } from "@/types/payment";

interface PaymentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  monthFilter: string;
  onMonthFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  onClearFilters: () => void;
  categories: string[];
}

export const PaymentFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  monthFilter,
  onMonthFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onClearFilters,
  categories,
}: PaymentFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-2">
      <div className="relative flex-1 max-w-full sm:max-w-sm w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por aluno..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">Status</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onStatusFilterChange("")}>Todos</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("Pendente")}>Pendente</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("Pago")}>Pago</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("Atrasado")}>Atrasado</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">Mês</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onMonthFilterChange("")}>Todos</DropdownMenuItem>
          {MONTHS.map((month) => (
            <DropdownMenuItem key={month} onClick={() => onMonthFilterChange(month)}>
              {month}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">Categoria</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onCategoryFilterChange("")}>Todas</DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem key={category} onClick={() => onCategoryFilterChange(category)}>
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {(searchTerm || statusFilter || monthFilter || categoryFilter) && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClearFilters}
          title="Limpar filtros"
        >
          <FilterX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
