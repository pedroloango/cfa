import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";

export function UsersTable({ users, onEdit, onDelete }: { users: User[]; onEdit: (user: User) => void; onDelete: (id: string) => void }) {
  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'dashboard': return 'Dashboard';
      case 'alunos': return 'Alunos';
      case 'mensalidades': return 'Mensalidades';
      case 'avaliacoes': return 'Avaliações';
      case 'scout': return 'Scout';
      case 'relatorios': return 'Relatórios';
      case 'relatorio-jogos': return 'Relatório de Jogos';
      case 'receitas': return 'Receitas';
      case 'configuracoes': return 'Configurações';
      default: return permission;
    }
  };

  return (
    <div className="border rounded-md">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Nome</th>
            <th className="text-left p-3 font-medium">Email</th>
            <th className="text-left p-3 font-medium">Função</th>
            <th className="text-left p-3 font-medium">Permissões</th>
            <th className="text-right p-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-b-0">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3 capitalize">{user.role}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1">
                  {user.permissions?.map(permission => (
                    <Badge key={permission} variant="outline" className="text-xs bg-muted/30">
                      {getPermissionLabel(permission)}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="p-3 text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(user.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
