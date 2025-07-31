
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User>({
    name: 'Usuário',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    theme: 'light'
  });

  // Load user data from Supabase when authenticated
  useEffect(() => {
    if (authUser) {
      loadUserProfile();
    } else {
      // Load from localStorage for fallback
      const savedUser = localStorage.getItem('chipManager_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [authUser]);

  // Apply theme changes
  useEffect(() => {
    if (user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user.theme]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', authUser?.id)
        .single();

      if (data) {
        setUser(prev => ({
          ...prev,
          name: data.name || authUser?.email?.split('@')[0] || 'Usuário',
          profileImage: data.avatar_url || prev.profileImage
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    setUser(prev => ({ ...prev, ...userData }));
    
    // Save to localStorage for immediate persistence
    localStorage.setItem('chipManager_user', JSON.stringify({ ...user, ...userData }));
    
    // Save to Supabase if authenticated
    if (authUser) {
      try {
        await supabase
          .from('profiles')
          .update({ 
            name: userData.name,
            avatar_url: userData.profileImage 
          })
          .eq('id', authUser.id);
      } catch (error) {
        console.error('Erro ao salvar no Supabase:', error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = user.theme === 'light' ? 'dark' : 'light';
    setUser(prev => ({ ...prev, theme: newTheme }));
    localStorage.setItem('chipManager_user', JSON.stringify({ ...user, theme: newTheme }));
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
