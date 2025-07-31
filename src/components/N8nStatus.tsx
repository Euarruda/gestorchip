
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChip } from '@/contexts/ChipContext';
import { Webhook, Send, Loader2 } from 'lucide-react';

const N8nStatus = () => {
  const { sendToN8n, isN8nLoading } = useChip();

  const testWebhook = async () => {
    await sendToN8n({
      action: 'test',
      message: 'Teste de conexão com n8n',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Webhook className="h-4 w-4" />
          Integração n8n
        </CardTitle>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Conectado
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Webhook: eualysson.app.n8n.cloud/webhook/gestorchip
          </div>
          <Button 
            onClick={testWebhook} 
            size="sm" 
            variant="outline" 
            disabled={isN8nLoading}
            className="w-full"
          >
            {isN8nLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Testar Conexão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default N8nStatus;
