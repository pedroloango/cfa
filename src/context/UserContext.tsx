import React, { createContext, useState, useEffect, ReactNode } from 'react';
// import { User } from '@/types/user'; // Remover esta importação para evitar conflito

// Definir e exportar a interface User diretamente aqui
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Senha é opcional, pois não será armazenada no contexto após o login seguro
  role: string;
  permissions: string[];
}

export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  isLoading: boolean; 
}

const defaultState: UserContextType = {
  user: null,
  setUser: () => {},
  logout: () => {},
  isLoading: true, 
};

export const UserContext = createContext<UserContextType>(defaultState);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tenta carregar o usuário do localStorage ou de uma sessão Supabase ao iniciar
    // Esta parte pode ser ajustada conforme a lógica de sessão do Supabase
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user'); // Limpa item inválido
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    // Lógica de logout: limpar Supabase Auth, localStorage e estado do contexto
    // Exemplo: await supabase.auth.signOut();
    localStorage.removeItem('user');
    setUser(null);
    // Idealmente, redirecionar para a página de login aqui
    // navigate('/login'); // Se o navigate estiver disponível neste escopo
  };

  // Atualiza o localStorage quando o usuário mudar
  // REMOVER SE O SUPABASE GERENCIA A SESSÃO AUTOMATICAMENTE
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}; 