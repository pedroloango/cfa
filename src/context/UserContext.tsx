import React, { createContext, useState, useEffect } from 'react';
import { User } from '@/types/user';

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      console.log('UserProvider - Initial stored user:', storedUser);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('UserProvider - Parsed stored user:', parsedUser);
        return parsedUser;
      }
    } catch (error) {
      console.error('UserProvider - Error loading stored user:', error);
      localStorage.removeItem('user');
    }
    return null;
  });

  useEffect(() => {
    console.log('UserProvider - User state changed:', user);
  }, [user]);

  const contextValue = React.useMemo(() => ({
    user,
    setUser: (newUser: User | null) => {
      console.log('UserProvider - Setting new user:', newUser);
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('user');
      }
      setUser(newUser);
    },
  }), [user]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}; 