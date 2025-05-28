import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UserContext, User } from "@/context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id, full_name, email, role, permissions')
          .eq('id', session.user.id)
          .single();
        if (userProfile && !profileError) {
          setUser({
            id: userProfile.id,
            name: userProfile.full_name,
            email: userProfile.email,
            role: userProfile.role || 'user',
            password: '',
            permissions: Array.isArray(userProfile.permissions) ? userProfile.permissions : [],
          } as User);
          navigate("/dashboard", { replace: true });
        } else {
          await supabase.auth.signOut();
        }
      }
    };
  }, [navigate, setUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authResponse, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        console.error("Erro na autenticação Supabase:", signInError);
        toast({
          variant: "destructive",
          title: "Erro de Login",
          description: signInError.message === "Invalid login credentials" 
            ? "Credenciais inválidas. Verifique seu email e senha."
            : signInError.message || "Ocorreu um erro ao tentar fazer login.",
        });
        setIsLoading(false);
        return;
      }

      if (authResponse.user && authResponse.session) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id, full_name, email, role, permissions')
          .eq('id', authResponse.user.id)
          .single();

        if (profileError) {
          console.error("Erro ao buscar perfil do usuário após login:", profileError);
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Erro de Login",
            description: "Não foi possível carregar os dados do seu perfil. Tente novamente.",
          });
          setIsLoading(false);
          return;
        }

        if (userProfile) {
          const userDataForContext: User = {
            id: userProfile.id,
            name: userProfile.full_name,
            email: userProfile.email,
            role: userProfile.role || 'user',
            password: '',
            permissions: Array.isArray(userProfile.permissions) ? userProfile.permissions : [],
          };
          setUser(userDataForContext);

          toast({ title: "Sucesso!", description: "Login realizado com sucesso." });
          navigate("/dashboard", { replace: true });
        } else {
          console.error("Usuário autenticado mas perfil não encontrado na tabela 'users'.");
          await supabase.auth.signOut();
          toast({
            variant: "destructive",
            title: "Erro de Login",
            description: "Seu perfil de usuário não foi encontrado. Entre em contato com o suporte.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erro de Login",
          description: "Falha no login. Verifique suas credenciais e tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro inesperado no processo de login:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordRecovery = async () => {
    if (!email) {
      toast({ 
        variant: "destructive",
        title: "Recuperação de Senha",
        description: "Por favor, digite seu email no campo correspondente."
      });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);
    if (error) {
      console.error('Erro na recuperação de senha:', error);
      toast({ 
        variant: "destructive",
        title: "Erro",
        description: error.message || "Falha ao enviar email de recuperação."
      });
    } else {
      toast({
        title: "Verifique seu Email",
        description: "Se uma conta com este email existir, instruções de recuperação de senha foram enviadas."
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-football-green to-football-dark-green">
      <Card className="w-full max-w-md shadow-xl mx-4">
        <CardHeader className="text-center">
          <img src="/assets/craque-academy-logo.png" alt="Craque Academy Logo" className="w-20 h-20 mx-auto mb-4"/>
          <CardTitle className="text-3xl font-bold text-football-dark-green">Bem-vindo!</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar a escolinha.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-12"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-football-green hover:bg-football-dark-green text-white h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Entrando...</>
              ) : "Entrar"}
            </Button>
          </form>
          <div className="text-center mt-6">
            <button 
              type="button"
              onClick={handlePasswordRecovery} 
              className="text-sm text-gray-600 hover:text-football-green hover:underline disabled:opacity-50"
              disabled={isLoading}
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="mt-6 text-center text-sm">
            Não tem uma conta?{" "}
            <Link to="/register" className="font-medium text-football-green hover:text-football-dark-green hover:underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login; 