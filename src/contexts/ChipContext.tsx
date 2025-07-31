import React, { createContext, useContext, useState, useEffect } from 'react';
import { useN8nIntegration } from '@/hooks/useN8nIntegration';

export interface Chip {
  id: string;
  code: string;
  number: string;
  registrationDate: string;
  operator: 'Claro' | 'Vivo' | 'TIM';
  function: string;
  status: string;
  profiles: string[];
  statusHistory: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  status: string;
  date: string;
  timestamp: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface ChipFunction {
  id: string;
  name: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
  read: boolean;
}

interface ChipContextType {
  chips: Chip[];
  tags: Tag[];
  functions: ChipFunction[];
  notifications: Notification[];
  addChip: (chip: Omit<Chip, 'id' | 'statusHistory'>) => void;
  updateChip: (id: string, chip: Partial<Chip>) => void;
  deleteChip: (id: string) => void;
  deleteMultipleChips: (ids: string[]) => void;
  updateMultipleChipsStatus: (ids: string[], status: string) => void;
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  addFunction: (func: Omit<ChipFunction, 'id'>) => void;
  updateFunction: (id: string, func: Partial<ChipFunction>) => void;
  deleteFunction: (id: string) => void;
  exportData: () => void;
  importData: (data: any[]) => void;
  markNotificationAsRead: (id: string) => void;
  sendToN8n: (data: any) => Promise<void>;
  isN8nLoading: boolean;
}

const ChipContext = createContext<ChipContextType | undefined>(undefined);

const defaultTags: Tag[] = [
  { id: '1', name: 'Ativo', color: '#10b981' },
  { id: '2', name: 'Aquecendo', color: '#f59e0b' },
  { id: '3', name: 'Banido 24 horas', color: '#ef4444' },
  { id: '4', name: 'Banido permanente', color: '#7c2d12' },
];

const defaultFunctions: ChipFunction[] = [
  { id: '1', name: 'Vendas' },
  { id: '2', name: 'Suporte' },
  { id: '3', name: 'Marketing' },
];

export const ChipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chips, setChips] = useState<Chip[]>([]);
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [functions, setFunctions] = useState<ChipFunction[]>(defaultFunctions);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { sendChipData, sendMultipleChipsData, sendStatusUpdate, sendToN8n, isLoading: isN8nLoading } = useN8nIntegration();

  // Generate unique code
  const generateCode = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const number = Math.floor(Math.random() * 10);
    return `${letter}${number}`;
  };

  // Add chip with n8n integration
  const addChip = (chipData: Omit<Chip, 'id' | 'statusHistory'>) => {
    const newChip: Chip = {
      ...chipData,
      id: Date.now().toString(),
      statusHistory: [{
        status: chipData.status,
        date: new Date().toLocaleString('pt-BR'),
        timestamp: Date.now()
      }]
    };
    setChips(prev => [...prev, newChip]);
    
    // Send to n8n
    sendChipData(newChip, 'created');
  };

  // Update chip with n8n integration
  const updateChip = (id: string, chipData: Partial<Chip>) => {
    setChips(prev => prev.map(chip => {
      if (chip.id === id) {
        const updatedChip = { ...chip, ...chipData };
        
        // Add to status history if status changed
        if (chipData.status && chipData.status !== chip.status) {
          updatedChip.statusHistory = [
            ...chip.statusHistory,
            {
              status: chipData.status,
              date: new Date().toLocaleString('pt-BR'),
              timestamp: Date.now()
            }
          ];
        }
        
        // Send to n8n
        sendChipData(updatedChip, 'updated');
        
        return updatedChip;
      }
      return chip;
    }));
  };

  // Delete chip with n8n integration
  const deleteChip = (id: string) => {
    const chipToDelete = chips.find(chip => chip.id === id);
    if (chipToDelete) {
      sendChipData(chipToDelete, 'deleted');
    }
    setChips(prev => prev.filter(chip => chip.id !== id));
  };

  // Delete multiple chips with n8n integration
  const deleteMultipleChips = (ids: string[]) => {
    const chipsToDelete = chips.filter(chip => ids.includes(chip.id));
    sendMultipleChipsData(chipsToDelete, 'bulk_delete');
    setChips(prev => prev.filter(chip => !ids.includes(chip.id)));
  };

  // Update multiple chips status with n8n integration
  const updateMultipleChipsStatus = (ids: string[], status: string) => {
    sendStatusUpdate(ids, status, chips);
    
    setChips(prev => prev.map(chip => {
      if (ids.includes(chip.id)) {
        return {
          ...chip,
          status,
          statusHistory: [
            ...chip.statusHistory,
            {
              status,
              date: new Date().toLocaleString('pt-BR'),
              timestamp: Date.now()
            }
          ]
        };
      }
      return chip;
    }));
  };

  // Tag management
  const addTag = (tagData: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      ...tagData,
      id: Date.now().toString()
    };
    setTags(prev => [...prev, newTag]);
  };

  const updateTag = (id: string, tagData: Partial<Tag>) => {
    setTags(prev => prev.map(tag => tag.id === id ? { ...tag, ...tagData } : tag));
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  };

  // Function management
  const addFunction = (funcData: Omit<ChipFunction, 'id'>) => {
    const newFunction: ChipFunction = {
      ...funcData,
      id: Date.now().toString()
    };
    setFunctions(prev => [...prev, newFunction]);
  };

  const updateFunction = (id: string, funcData: Partial<ChipFunction>) => {
    setFunctions(prev => prev.map(func => func.id === id ? { ...func, ...funcData } : func));
  };

  const deleteFunction = (id: string) => {
    setFunctions(prev => prev.filter(func => func.id !== id));
  };

  // Export data
  const exportData = () => {
    const dataStr = JSON.stringify({ chips, tags, functions }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chips_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import data
  const importData = (data: any[]) => {
    const importedChips = data.map(item => ({
      id: Date.now().toString() + Math.random(),
      code: item.code || generateCode(),
      number: item.number || '',
      registrationDate: item.registrationDate || new Date().toISOString().split('T')[0],
      operator: item.operator || 'Claro',
      function: item.function || 'Vendas',
      status: item.status || 'Ativo',
      profiles: item.profiles || [],
      statusHistory: [{
        status: item.status || 'Ativo',
        date: new Date().toLocaleString('pt-BR'),
        timestamp: Date.now()
      }]
    }));
    
    setChips(prev => [...prev, ...importedChips]);
  };

  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  // Generate smart notifications
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];
      
      // Check for chips in "Aquecendo" status for too long
      const aquecendoChips = chips.filter(chip => chip.status === 'Aquecendo');
      aquecendoChips.forEach(chip => {
        const lastStatusChange = chip.statusHistory[chip.statusHistory.length - 1];
        const daysSince = Math.floor((Date.now() - lastStatusChange.timestamp) / (1000 * 60 * 60 * 24));
        
        if (daysSince >= 7) {
          newNotifications.push({
            id: `aquecendo_${chip.id}`,
            message: `Alerta: O chip ${chip.code} está no status 'Aquecendo' há ${daysSince} dias. Deseja alterá-lo para 'Ativo'?`,
            type: 'warning',
            date: new Date().toLocaleString('pt-BR'),
            read: false
          });
        }
      });

      // Check for banned chips today
      const today = new Date().toDateString();
      const bannedToday = chips.filter(chip => {
        const lastStatus = chip.statusHistory[chip.statusHistory.length - 1];
        return (lastStatus.status.includes('Banido') && 
                new Date(lastStatus.timestamp).toDateString() === today);
      });

      if (bannedToday.length > 0) {
        newNotifications.push({
          id: `banned_today_${Date.now()}`,
          message: `Atenção: ${bannedToday.length} chip${bannedToday.length > 1 ? 's foram banidos' : ' foi banido'} hoje.`,
          type: 'warning',
          date: new Date().toLocaleString('pt-BR'),
          read: false
        });
      }

      // Positive feedback for no bans this week
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const bannedThisWeek = chips.some(chip => {
        return chip.statusHistory.some(entry => 
          entry.status.includes('Banido') && entry.timestamp > weekAgo
        );
      });

      if (!bannedThisWeek && chips.length > 0) {
        newNotifications.push({
          id: `good_week_${Date.now()}`,
          message: 'Dica: Nenhum chip foi banido esta semana. Bom trabalho!',
          type: 'success',
          date: new Date().toLocaleString('pt-BR'),
          read: false
        });
      }

      // Update notifications (avoid duplicates)
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id);
        const filteredNew = newNotifications.filter(n => !existingIds.includes(n.id));
        return [...prev, ...filteredNew];
      });
    };

    if (chips.length > 0) {
      generateNotifications();
    }
  }, [chips]);

  const value = {
    chips,
    tags,
    functions,
    notifications,
    addChip,
    updateChip,
    deleteChip,
    deleteMultipleChips,
    updateMultipleChipsStatus,
    addTag,
    updateTag,
    deleteTag,
    addFunction,
    updateFunction,
    deleteFunction,
    exportData,
    importData,
    markNotificationAsRead,
    sendToN8n,
    isN8nLoading
  };

  return (
    <ChipContext.Provider value={value}>
      {children}
    </ChipContext.Provider>
  );
};

export const useChip = () => {
  const context = useContext(ChipContext);
  if (context === undefined) {
    throw new Error('useChip must be used within a ChipProvider');
  }
  return context;
};
