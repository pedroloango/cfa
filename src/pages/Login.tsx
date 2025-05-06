import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UserContext } from "@/context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUser } = useContext(UserContext);

  // Debug: Monitorar mudanças no contexto do usuário
  useEffect(() => {
    console.log('UserContext atualizado:', user);
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Iniciando processo de login...');

    try {
      console.log('Consultando banco de dados...');
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role, permissions')
        .eq('email', email)
        .eq('password', password)
        .single();

      console.log('Resposta do Supabase:', { data, error });

      if (error || !data) {
        console.error('Erro na autenticação:', error);
        toast({ 
          variant: "destructive",
          title: "Erro",
          description: "Credenciais inválidas."
        });
        setIsLoading(false);
        return;
      }

      // Garantir que permissions é um array
      const permissions = Array.isArray(data.permissions) ? data.permissions : [];
      console.log('Permissões do usuário:', permissions);

      // Salvar dados do usuário no contexto e localStorage
      const userData = {
        id: data.id,
        name: data.full_name,
        email: data.email,
        password: password,
        role: data.role || 'user',
        permissions: permissions
      };
      
      console.log('Dados do usuário preparados:', userData);

      // Primeiro salvar no localStorage
      try {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Dados salvos no localStorage');
      } catch (storageError) {
        console.error('Erro ao salvar no localStorage:', storageError);
      }
      
      // Depois atualizar o contexto
      console.log('Atualizando contexto do usuário...');
      setUser(userData);

      // Verificar permissões e redirecionar
      if (userData.role === 'admin' || permissions.includes("dashboard")) {
        console.log('Usuário tem permissão para acessar o dashboard');
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        
        console.log('Iniciando redirecionamento para /dashboard...');
        // Usar setTimeout para garantir que o contexto foi atualizado
        setTimeout(() => {
          console.log('Executando navigate("/dashboard")');
          navigate("/dashboard", { replace: true });
        }, 500); // Aumentado para 500ms para garantir
      } else {
        console.error('Usuário sem permissão de acesso');
        toast({ 
          variant: "destructive",
          title: "Erro",
          description: "Acesso negado. Você não tem permissão para acessar o sistema."
        });
      }
    } catch (error) {
      console.error('Erro no processo de login:', error);
      toast({ 
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao tentar fazer login."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async () => {
    if (!email) {
      toast({ 
        variant: "destructive",
        title: "Erro",
        description: "Digite seu email para recuperar a senha."
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      console.error('Erro na recuperação de senha:', error);
      toast({ 
        variant: "destructive",
        title: "Erro",
        description: "Falha ao enviar email de recuperação."
      });
    } else {
      toast({
        title: "Recuperação de Senha",
        description: "Instruções de recuperação de senha foram enviadas para o seu email."
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-football-green to-football-dark-green">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bem-vindo ao FutBoss</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="w-full bg-football-green hover:bg-football-dark-green text-white"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="text-center mt-4">
            <button 
              type="button"
              onClick={handlePasswordRecovery} 
              className="text-sm text-gray-600 hover:text-football-green hover:underline"
              disabled={isLoading}
            >
              Esqueceu a senha?
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 