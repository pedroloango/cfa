import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { User } from "@/types/user";
import { UserForm } from "./UserForm";
import { UsersTable } from "./UsersTable";
import { useToast } from "@/components/ui/use-toast";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";

export function UserManagement() {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const { toast } = useToast();

  const handleSaveUser = (user: User) => {
    if (selectedUser) {
      // Update existing
      updateUser.mutate(user, {
        onSuccess: () => {
          toast({ title: "Usuário atualizado", description: "Usuário atualizado com sucesso." });
          setShowUserForm(false);
          setSelectedUser(undefined);
        },
      });
    } else {
      // Create new
      createUser.mutate(user, {
        onSuccess: () => {
          toast({ title: "Usuário cadastrado", description: "Novo usuário adicionado com sucesso." });
          setShowUserForm(false);
        },
      });
    }
  };

  const handleDeleteUser = (id: string) => {
    deleteUser.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Usuário excluído",
          description: "Usuário removido com sucesso.",
          variant: "destructive",
        });
      },
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Usuários</h3>
        <Dialog open={showUserForm} onOpenChange={setShowUserForm}>
          <DialogTrigger asChild>
            <Button className="bg-football-green hover:bg-football-dark-green" onClick={() => { setSelectedUser(undefined); setShowUserForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <UserForm initialData={selectedUser} onCancel={() => { setShowUserForm(false); setSelectedUser(undefined); }} onSave={handleSaveUser} />
        </Dialog>
      </div>
      <UsersTable users={users} onDelete={handleDeleteUser} onEdit={handleEditUser} />
    </div>
  );
}
