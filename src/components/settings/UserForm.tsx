import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AVAILABLE_PAGES, User } from "@/types/user";
import { getLocalData, saveLocalData } from "@/utils/localStorage";

const ROLES = ["Admin", "Professor", "Usuário"];

interface UserFormProps {
  onCancel: () => void
  onSave: (user: User) => void
  initialData?: User
}

export function UserForm({ onCancel, onSave, initialData }: UserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Usuário");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setPassword(initialData.password || "");
      const label = initialData.role === 'admin'
        ? 'Admin'
        : initialData.role === 'professor'
          ? 'Professor'
          : 'Usuário';
      setRole(label);
      setSelectedPermissions(initialData.permissions ?? []);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("Usuário");
      setSelectedPermissions([]);
    }
  }, [initialData]);

  const handleSave = () => {
    let roleValue: 'admin' | 'professor' | 'user';
    if (role === "Admin") {
      roleValue = 'admin';
    } else if (role === "Professor") {
      roleValue = 'professor';
    } else {
      roleValue = 'user';
    }

    const user: User = {
      id: initialData?.id ?? "",
      name,
      email,
      password,
      role: roleValue,
      permissions: selectedPermissions,
    };
    onSave(user);

    setName("");
    setEmail("");
    setPassword("");
    setRole("Usuário");
    setSelectedPermissions([]);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Adicionar Usuário</DialogTitle>
        <DialogDescription>
          Preencha os campos para adicionar um novo usuário.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" placeholder="Nome do usuário" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Perfil</Label>
          <Select
            value={role}
            onValueChange={setRole}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Permissões de Acesso</Label>
          <div className="grid gap-2">
            {AVAILABLE_PAGES.map((page) => (
              <div key={page.id} className="flex items-center space-x-2">
                <Checkbox
                  id={page.id}
                  checked={selectedPermissions.includes(page.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPermissions([...selectedPermissions, page.id]);
                    } else {
                      setSelectedPermissions(
                        selectedPermissions.filter((p) => p !== page.id)
                      );
                    }
                  }}
                />
                <Label htmlFor={page.id}>{page.label}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button className="bg-football-green hover:bg-football-dark-green" onClick={handleSave}>
          Salvar
        </Button>
      </div>
    </DialogContent>
  );
}
