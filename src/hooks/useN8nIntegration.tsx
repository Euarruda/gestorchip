
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Chip } from '@/contexts/ChipContext';

export const useN8nIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const webhookUrl = 'https://eualysson.app.n8n.cloud/webhook/gestorchip';

  const sendToN8n = async (data: any) => {
    setIsLoading(true);
    console.log('Enviando dados para n8n:', data);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'gestorchip',
        }),
      });

      toast({
        title: 'Dados enviados',
        description: 'Os dados foram enviados para o n8n com sucesso.',
      });

      console.log('Dados enviados para n8n com sucesso');
    } catch (error) {
      console.error('Erro ao enviar para n8n:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao enviar dados para o n8n. Verifique a conexão.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendChipData = async (chip: Chip, action: 'created' | 'updated' | 'deleted') => {
    await sendToN8n({
      action,
      chip,
      event: `chip_${action}`,
    });
  };

  const sendMultipleChipsData = async (chips: Chip[], action: string) => {
    await sendToN8n({
      action: 'bulk_update',
      chips,
      bulk_action: action,
      event: 'chips_bulk_update',
    });
  };

  const sendStatusUpdate = async (chipIds: string[], newStatus: string, chips: Chip[]) => {
    const updatedChips = chips.filter(chip => chipIds.includes(chip.id));
    await sendToN8n({
      action: 'status_update',
      chip_ids: chipIds,
      new_status: newStatus,
      chips: updatedChips,
      event: 'chips_status_update',
    });
  };

  return {
    sendToN8n,
    sendChipData,
    sendMultipleChipsData,
    sendStatusUpdate,
    isLoading,
  };
};
