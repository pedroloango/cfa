import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Star, MoreVertical, FileText, PenLine, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Evaluation } from "@/components/students/EvaluationForm";

interface EvaluationTableProps {
  evaluations: Evaluation[];
  onView: (evaluation: Evaluation) => void;
  onEdit: (evaluation: Evaluation) => void;
  onDelete: (id: number) => void;
}

export function EvaluationTable({
  evaluations,
  onView,
  onEdit,
  onDelete,
}: EvaluationTableProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Técnica</TableHead>
              <TableHead>Tática</TableHead>
              <TableHead>Física</TableHead>
              <TableHead>Mental</TableHead>
              <TableHead>Avaliação Geral</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map(evaluation => (
              <TableRow key={evaluation.id}>
                <TableCell className="font-medium">
                  {evaluation.student?.name}
                </TableCell>
                <TableCell>{evaluation.student?.category}</TableCell>
                <TableCell>
                  {format(evaluation.date, "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>{evaluation.technical}/10</TableCell>
                <TableCell>{evaluation.tactical}/10</TableCell>
                <TableCell>{evaluation.physical}/10</TableCell>
                <TableCell>{evaluation.mental}/10</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-amber-500 mr-1" />
                    {(
                      (evaluation.technical +
                        evaluation.tactical +
                        evaluation.physical +
                        evaluation.mental) /
                      4
                    ).toFixed(1)}
                    /10
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onView(evaluation)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(evaluation)}>
                        <PenLine className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => evaluation.id && onDelete(evaluation.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
