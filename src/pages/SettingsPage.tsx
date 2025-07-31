
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useChip } from '@/contexts/ChipContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, X, Palette, Settings, Webhook } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { tags, functions, addTag, updateTag, deleteTag, addFunction, updateFunction, deleteFunction } = useChip();
  const { user } = useAuth();
  
  const [newTag, setNewTag] = useState({ name: '', color: '#6b7280' });
  const [newFunction, setNewFunction] = useState({ name: '' });
  const [editingTag, setEditingTag] = useState<any>(null);
  const [editingFunction, setEditingFunction] = useState<any>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isFunctionDialogOpen, setIsFunctionDialogOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(false);

  // Carregar webhook URL quando o componente é montado
  useEffect(() => {
    if (user) {
      loadWebhookUrl();
    }
  }, [user]);

  const loadWebhookUrl = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('webhook_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar webhook:', error);
        return;
      }

      if (data?.webhook_url) {
        setWebhookUrl(data.webhook_url);
      }
    } catch (error) {
      console.error('Erro ao carregar webhook:', error);
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error('URL do webhook é obrigatória');
      return;
    }

    setIsLoadingWebhook(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ webhook_url: webhookUrl })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast.success('Webhook configurado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar webhook:', error);
      toast.error('Erro ao salvar webhook. Tente novamente.');
    } finally {
      setIsLoadingWebhook(false);
    }
  };

  const predefinedColors = [
    '#10b981', '#f59e0b', '#ef4444', '#7c2d12', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'
  ];

  const handleAddTag = () => {
    if (!newTag.name.trim()) {
      toast.error('Nome da tag é obrigatório');
      return;
    }
    
    addTag(newTag);
    setNewTag({ name: '', color: '#6b7280' });
    setIsTagDialogOpen(false);
    toast.success('Tag adicionada com sucesso!');
  };

  const handleUpdateTag = () => {
    if (!editingTag?.name.trim()) {
      toast.error('Nome da tag é obrigatório');
      return;
    }
    
    updateTag(editingTag.id, { name: editingTag.name, color: editingTag.color });
    setEditingTag(null);
    toast.success('Tag atualizada com sucesso!');
  };

  const handleDeleteTag = (tagId: string, tagName: string) => {
    if (['Ativo', 'Aquecendo', 'Banido 24 horas', 'Banido permanente'].includes(tagName)) {
      toast.error('Tags padrão não podem ser excluídas');
      return;
    }
    deleteTag(tagId);
    toast.success('Tag excluída com sucesso!');
  };

  const handleAddFunction = () => {
    if (!newFunction.name.trim()) {
      toast.error('Nome da função é obrigatório');
      return;
    }
    
    addFunction(newFunction);
    setNewFunction({ name: '' });
    setIsFunctionDialogOpen(false);
    toast.success('Função adicionada com sucesso!');
  };

  const handleUpdateFunction = () => {
    if (!editingFunction?.name.trim()) {
      toast.error('Nome da função é obrigatório');
      return;
    }
    
    updateFunction(editingFunction.id, { name: editingFunction.name });
    setEditingFunction(null);
    toast.success('Função atualizada com sucesso!');
  };

  const handleDeleteFunction = (functionId: string, functionName: string) => {
    if (['Vendas', 'Suporte', 'Marketing'].includes(functionName)) {
      toast.error('Funções padrão não podem ser excluídas');
      return;
    }
    deleteFunction(functionId);
    toast.success('Função excluída com sucesso!');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Configurações do Sistema</h1>
        </div>

        <Tabs defaultValue="tags" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="tags" className="flex items-center gap-2 py-3">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Tags/Status</span>
              <span className="sm:hidden">Tags</span>
            </TabsTrigger>
            <TabsTrigger value="functions" className="flex items-center gap-2 py-3">
              <Settings className="h-4 w-4" />
              <span>Funções</span>
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center gap-2 py-3">
              <Webhook className="h-4 w-4" />
              <span>Webhook</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tags Tab */}
          <TabsContent value="tags" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Gerenciar Tags/Status</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Personalize as tags de status dos seus chips
                  </p>
                </div>
                <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Tag</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="tagName">Nome da Tag</Label>
                        <Input
                          id="tagName"
                          value={newTag.name}
                          onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Em Teste, Suspenso"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tagColor">Cor da Tag</Label>
                        <div className="space-y-3">
                          <div className="flex gap-2 items-center">
                            <Input
                              id="tagColor"
                              type="color"
                              value={newTag.color}
                              onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                              className="w-16 h-10"
                            />
                            <Input
                              value={newTag.color}
                              onChange={(e) => setNewTag(prev => ({ ...prev, color: e.target.value }))}
                              placeholder="#6b7280"
                              className="flex-1"
                            />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Cores sugeridas:</p>
                            <div className="grid grid-cols-5 gap-2">
                              {predefinedColors.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setNewTag(prev => ({ ...prev, color }))}
                                  className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsTagDialogOpen(false)} className="order-2 sm:order-1">
                          Cancelar
                        </Button>
                        <Button onClick={handleAddTag} className="order-1 sm:order-2">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tags.map((tag) => (
                    <Card key={tag.id} className="p-4 hover:shadow-md transition-shadow">
                      {editingTag?.id === tag.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editingTag.name}
                            onChange={(e) => setEditingTag(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nome da tag"
                          />
                          <div className="flex gap-2 items-center">
                            <Input
                              type="color"
                              value={editingTag.color}
                              onChange={(e) => setEditingTag(prev => ({ ...prev, color: e.target.value }))}
                              className="w-12 h-8"
                            />
                            <Input
                              value={editingTag.color}
                              onChange={(e) => setEditingTag(prev => ({ ...prev, color: e.target.value }))}
                              className="flex-1 text-xs"
                            />
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={handleUpdateTag} className="flex-1">
                              <Save className="h-3 w-3 mr-1" />
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingTag(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Badge 
                            style={{ 
                              backgroundColor: tag.color,
                              color: 'white'
                            }}
                            className="w-full justify-center py-2 text-sm"
                          >
                            {tag.name}
                          </Badge>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingTag({ ...tag })}
                              className="flex-1"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteTag(tag.id, tag.name)}
                              disabled={['Ativo', 'Aquecendo', 'Banido 24 horas', 'Banido permanente'].includes(tag.name)}
                              className="flex-1"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                          {['Ativo', 'Aquecendo', 'Banido 24 horas', 'Banido permanente'].includes(tag.name) && (
                            <p className="text-xs text-muted-foreground text-center">Tag padrão do sistema</p>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Functions Tab */}
          <TabsContent value="functions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Gerenciar Funções</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Defina as funções que os chips podem exercer
                  </p>
                </div>
                <Dialog open={isFunctionDialogOpen} onOpenChange={setIsFunctionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Função
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Função</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="functionName">Nome da Função</Label>
                        <Input
                          id="functionName"
                          value={newFunction.name}
                          onChange={(e) => setNewFunction(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Atendimento, Vendas Online"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsFunctionDialogOpen(false)} className="order-2 sm:order-1">
                          Cancelar
                        </Button>
                        <Button onClick={handleAddFunction} className="order-1 sm:order-2">
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {functions.map((func) => (
                    <Card key={func.id} className="p-4 hover:shadow-md transition-shadow">
                      {editingFunction?.id === func.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editingFunction.name}
                            onChange={(e) => setEditingFunction(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nome da função"
                          />
                          <div className="flex gap-1">
                            <Button size="sm" onClick={handleUpdateFunction} className="flex-1">
                              <Save className="h-3 w-3 mr-1" />
                              Salvar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingFunction(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg text-center">
                            <h4 className="font-medium">{func.name}</h4>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingFunction({ ...func })}
                              className="flex-1"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteFunction(func.id, func.name)}
                              disabled={['Vendas', 'Suporte', 'Marketing'].includes(func.name)}
                              className="flex-1"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                          {['Vendas', 'Suporte', 'Marketing'].includes(func.name) && (
                            <p className="text-xs text-muted-foreground text-center">Função padrão do sistema</p>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhook Tab */}
          <TabsContent value="webhook" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Webhook</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure o webhook para receber notificações de eventos do sistema
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL do Webhook</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://seu-webhook.com/endpoint"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta URL receberá notificações quando houver mudanças de status nos chips
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleSaveWebhook}
                    disabled={isLoadingWebhook}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoadingWebhook ? 'Salvando...' : 'Salvar Webhook'}
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Exemplo de Payload</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
{`{
  "action": "chip_status_changed",
  "chip": {
    "id": "123",
    "name": "Chip Vendas 01",
    "status": "Ativo",
    "function": "Vendas"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SettingsPage;
