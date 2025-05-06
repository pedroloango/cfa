import React from 'react';
import { Revenue } from '@/types/revenue';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';

interface RevenuesTableProps {
  receitas: Revenue[];
  onEdit: (rev: Revenue) => void;
  onDelete: (id: number) => void;
}

export function RevenuesTable({ receitas, onEdit, onDelete }: RevenuesTableProps) {
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receitas.length > 0 ? (
            receitas.map((rev) => (
              <TableRow key={rev.id}>
                <TableCell>{rev.description}</TableCell>
                <TableCell>{rev.paymentType}</TableCell>
                <TableCell>{rev.value}</TableCell>
                <TableCell>{rev.revenueDate}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(rev)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(rev.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                Nenhuma receita encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 