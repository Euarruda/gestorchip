
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  profileImage: string;
  theme: 'light' | 'dark';
}

interface UserContextType {
  user: User;
  updateUser: (userData: Partial<User>) => void;
  toggleTheme: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    name: 'Usuário',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    theme: 'light'
  });

  // Load user data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('chipManager_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user data to localStorage
  useEffect(() => {
    localStorage.setItem('chipManager_user', JSON.stringify(user));
    
    // Apply theme to document
    if (user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const toggleTheme = () => {
    setUser(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, toggleTheme }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
