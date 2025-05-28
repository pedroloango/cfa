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
import React from "react";

interface PaymentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  monthFilter: string;
  onMonthFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  paymentTypeFilter: string;
  onPaymentTypeFilterChange: (value: string) => void;
  descriptionFilter: string;
  onDescriptionFilterChange: (value: string) => void;
  onClearFilters: () => void;
  categories: string[];
  paymentTypes: string[];
}

export const PaymentFilters = React.memo(({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  monthFilter,
  onMonthFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  paymentTypeFilter,
  onPaymentTypeFilterChange,
  descriptionFilter,
  onDescriptionFilterChange,
  onClearFilters,
  categories,
  paymentTypes,
}: PaymentFiltersProps) => {
  console.log("PaymentFilters rendered");
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row items-start lg:items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar por aluno..."
          className="pl-8 w-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="relative flex-1 min-w-[200px]">
        <Input
          type="text"
          placeholder="Buscar por descrição..."
          className="w-full"
          value={descriptionFilter}
          onChange={(e) => onDescriptionFilterChange(e.target.value)}
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">Tipo de Pagamento</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onPaymentTypeFilterChange("")}>Todos</DropdownMenuItem>
          {paymentTypes.map((type) => (
            <DropdownMenuItem key={type} onClick={() => onPaymentTypeFilterChange(type)}>
              {type}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {(searchTerm || statusFilter || monthFilter || categoryFilter || paymentTypeFilter || descriptionFilter) && (
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
});
