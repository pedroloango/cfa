import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDbReceitas } from "@/hooks/useDbReceitas";
import { RevenuesTable } from "@/components/receitas/RevenuesTable";
import { RevenueForm } from "@/components/receitas/RevenueForm";
import type { Revenue } from "@/types/revenue";

const Receitas = () => {
  const {
    data: receitas = [],
    isLoading,
    createReceita,
    updateReceita,
    deleteReceita,
  } = useDbReceitas();

  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);

  const handleSave = (rev: Revenue) => {
    if (selectedRevenue) {
      updateReceita.mutate(rev);
    } else {
      createReceita.mutate(rev);
    }
  };

  const handleEdit = (rev: Revenue) => {
    setSelectedRevenue(rev);
    setFormOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteReceita.mutate(id);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Receitas</h2>
            <p className="text-muted-foreground">Gerencie entradas financeiras</p>
          </div>
          <Button
            className="bg-football-green hover:bg-football-dark-green"
            onClick={() => {
              setSelectedRevenue(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nova Receita
          </Button>
        </div>

        <RevenuesTable
          receitas={receitas}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <RevenueForm
        open={isFormOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={selectedRevenue || undefined}
      />
    </MainLayout>
  );
};

export default Receitas; 