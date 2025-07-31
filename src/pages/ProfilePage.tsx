
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { User, Sun, Moon, Save } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, updateUser, toggleTheme } = useUser();
  const [formData, setFormData] = useState({
    name: user.name,
    profileImage: user.profileImage
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, profileImage: url }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Perfil do Usuário</h1>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Preview */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.profileImage} alt={formData.name} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="profileImage">URL da Foto de Perfil</Label>
                  <Input
                    id="profileImage"
                    type="url"
                    value={formData.profileImage}
                    onChange={handleImageChange}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Cole aqui o link de uma imagem para usar como foto de perfil
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {user.theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <div>
                  <Label>Tema do Sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    {user.theme === 'light' ? 'Tema claro ativo' : 'Tema escuro ativo'}
                  </p>
                </div>
              </div>
              <Switch
                checked={user.theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Desenvolvido por:</span>
              <span>Sistema de Gerenciamento de Chips</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última atualização:</span>
              <span>{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;
