
import React, { useState, useEffect } from 'react';
import { useChip, Chip } from '@/contexts/ChipContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Shuffle } from 'lucide-react';
import { toast } from 'sonner';

interface ChipFormProps {
  chip?: Chip;
  onSubmit: () => void;
  onCancel: () => void;
}

const ChipForm: React.FC<ChipFormProps> = ({ chip, onSubmit, onCancel }) => {
  const { addChip, updateChip, tags, functions } = useChip();
  const [formData, setFormData] = useState({
    code: '',
    number: '',
    registrationDate: new Date().toISOString().split('T')[0],
    operator: 'Claro' as 'Claro' | 'Vivo' | 'TIM',
    function: '',
    status: '',
    profiles: [] as string[]
  });
  const [newProfile, setNewProfile] = useState('');

  useEffect(() => {
    if (chip) {
      setFormData({
        code: chip.code,
        number: chip.number,
        registrationDate: chip.registrationDate,
        operator: chip.operator,
        function: chip.function,
        status: chip.status,
        profiles: chip.profiles
      });
    } else {
      // Generate code for new chip
      generateCode();
    }
  }, [chip]);

  const generateCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const number = Math.floor(Math.random() * 10);
    setFormData(prev => ({ ...prev, code: `${letter}${number}` }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number || !formData.function || !formData.status) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (chip) {
      updateChip(chip.id, formData);
      toast.success('Chip atualizado com sucesso!');
    } else {
      addChip(formData);
      toast.success('Chip adicionado com sucesso!');
    }
    
    onSubmit();
  };

  const addProfile = () => {
    if (newProfile.trim() && !formData.profiles.includes(newProfile.trim())) {
      setFormData(prev => ({
        ...prev,
        profiles: [...prev.profiles, newProfile.trim()]
      }));
      setNewProfile('');
    }
  };

  const removeProfile = (profile: string) => {
    setFormData(prev => ({
      ...prev,
      profiles: prev.profiles.filter(p => p !== profile)
    }));
  };

  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName);
    return tag?.color || '#6b7280';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{chip ? 'Editar Chip' : 'Adicionar Novo Chip'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Ex: O7, A4, T9"
                  required
                />
                <Button type="button" variant="outline" size="icon" onClick={generateCode}>
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Número do Chip</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationDate">Data de Registro</Label>
              <Input
                id="registrationDate"
                type="date"
                value={formData.registrationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operator">Operadora</Label>
              <Select value={formData.operator} onValueChange={(value: 'Claro' | 'Vivo' | 'TIM') => 
                setFormData(prev => ({ ...prev, operator: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a operadora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Claro">Claro</SelectItem>
                  <SelectItem value="Vivo">Vivo</SelectItem>
                  <SelectItem value="TIM">TIM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="function">Função</Label>
              <Select value={formData.function} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, function: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {functions.map((func) => (
                    <SelectItem key={func.id} value={func.name}>
                      {func.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, status: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Profiles Section */}
          <div className="space-y-2">
            <Label>Perfis Associados</Label>
            <div className="flex gap-2">
              <Input
                value={newProfile}
                onChange={(e) => setNewProfile(e.target.value)}
                placeholder="Ex: WhatsApp, Telegram"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProfile())}
              />
              <Button type="button" variant="outline" size="icon" onClick={addProfile}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.profiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.profiles.map((profile, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {profile}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeProfile(profile)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Preview Section */}
          {formData.status && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Preview do Chip:</h4>
              <div className="flex items-center gap-2">
                <Badge 
                  style={{ 
                    backgroundColor: getTagColor(formData.status),
                    color: 'white'
                  }}
                >
                  {formData.status}
                </Badge>
                <span className="font-mono font-bold">{formData.code}</span>
                <span>-</span>
                <span>{formData.number}</span>
                <span>({formData.operator})</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {chip ? 'Atualizar' : 'Adicionar'} Chip
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChipForm;
