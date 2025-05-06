import { useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const NoPermissionMessage = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Acesso Negado",
      description: "Você não tem permissão para acessar esta página.",
      variant: "destructive"
    });
  }, []);

  return null;
}; 