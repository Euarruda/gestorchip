
import React, { useState } from 'react';
import { useChip, Chip } from '@/contexts/ChipContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Search, Download, Upload, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface ChipTableProps {
  onEdit: (chip: Chip) => void;
  onView: (chip: Chip) => void;
}

const ChipTable: React.FC<ChipTableProps> = ({ onEdit, onView }) => {
  const { 
    chips, 
    tags, 
    updateChip,
    deleteChip, 
    deleteMultipleChips, 
    updateMultipleChipsStatus,
    exportData,
    importData 
  } = useChip();
  
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('all');
  const [bulkAction, setBulkAction] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter chips based on search, filters and active tab
  const filteredChips = chips.filter(chip => {
    const matchesSearch = chip.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chip.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chip.function.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperator = operatorFilter === 'all' || chip.operator === operatorFilter;
    
    // Filter by active tab
    let matchesActiveFilter = true;
    if (activeFilter !== 'all') {
      matchesActiveFilter = chip.status === activeFilter;
    }
    
    return matchesSearch && matchesOperator && matchesActiveFilter;
  });

  // Get stats for filter tabs
  const getChipStats = () => {
    const stats = {
      all: chips.length,
      Ativo: chips.filter(c => c.status === 'Ativo').length,
      Aquecendo: chips.filter(c => c.status === 'Aquecendo').length,
      'Banido 24 horas': chips.filter(c => c.status === 'Banido 24 horas').length,
      'Banido permanente': chips.filter(c => c.status === 'Banido permanente').length,
    };
    
    // Add custom tags
    tags.forEach(tag => {
      if (!['Ativo', 'Aquecendo', 'Banido 24 horas', 'Banido permanente'].includes(tag.name)) {
        stats[tag.name] = chips.filter(c => c.status === tag.name).length;
      }
    });
    
    return stats;
  };

  const stats = getChipStats();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChips(filteredChips.map(chip => chip.id));
    } else {
      setSelectedChips([]);
    }
  };

  const handleSelectChip = (chipId: string, checked: boolean) => {
    if (checked) {
      setSelectedChips(prev => [...prev, chipId]);
    } else {
      setSelectedChips(prev => prev.filter(id => id !== chipId));
    }
  };

  const handleStatusChange = (chipId: string, newStatus: string) => {
    updateChip(chipId, { status: newStatus });
    toast.success(`Status alterado para ${newStatus}`);
  };

  const handleBulkAction = () => {
    if (selectedChips.length === 0) {
      toast.error('Selecione pelo menos um chip');
      return;
    }

    if (bulkAction === 'delete') {
      deleteMultipleChips(selectedChips);
      toast.success(`${selectedChips.length} chip(s) excluído(s) com sucesso`);
      setSelectedChips([]);
    } else if (bulkAction && bulkAction !== 'select') {
      updateMultipleChipsStatus(selectedChips, bulkAction);
      toast.success(`Status de ${selectedChips.length} chip(s) atualizado para ${bulkAction}`);
      setSelectedChips([]);
    }
    setBulkAction('');
  };

  const handleDelete = (chipId: string) => {
    deleteChip(chipId);
    toast.success('Chip excluído com sucesso');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (data.chips && Array.isArray(data.chips)) {
            importData(data.chips);
            toast.success('Dados importados com sucesso!');
          } else {
            toast.error('Formato de arquivo inválido');
          }
        } catch (error) {
          toast.error('Erro ao importar arquivo');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.name === tagName);
    return tag?.color || '#6b7280';
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <CardTitle className="text-xl md:text-2xl">Gerenciar Chips</CardTitle>
        
        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-500">
            <div className="text-xs md:text-sm text-blue-600 dark:text-blue-400">Total</div>
            <div className="text-lg md:text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.all}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-l-4 border-green-500">
            <div className="text-xs md:text-sm text-green-600 dark:text-green-400">Ativos</div>
            <div className="text-lg md:text-2xl font-bold text-green-700 dark:text-green-300">{stats.Ativo}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-500">
            <div className="text-xs md:text-sm text-yellow-600 dark:text-yellow-400">Aquecendo</div>
            <div className="text-lg md:text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.Aquecendo}</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border-l-4 border-orange-500">
            <div className="text-xs md:text-sm text-orange-600 dark:text-orange-400">Ban 24h</div>
            <div className="text-lg md:text-2xl font-bold text-orange-700 dark:text-orange-300">{stats['Banido 24 horas']}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-500">
            <div className="text-xs md:text-sm text-red-600 dark:text-red-400">Ban Perm</div>
            <div className="text-lg md:text-2xl font-bold text-red-700 dark:text-red-300">{stats['Banido permanente']}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-auto p-1 bg-muted rounded-lg min-w-full">
              <TabsTrigger 
                value="all" 
                className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Todos ({stats.all})
              </TabsTrigger>
              <TabsTrigger 
                value="Ativo" 
                className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Ativos ({stats.Ativo})
              </TabsTrigger>
              <TabsTrigger 
                value="Aquecendo" 
                className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
              >
                Aquecendo ({stats.Aquecendo})
              </TabsTrigger>
              <TabsTrigger 
                value="Banido 24 horas" 
                className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                Ban 24h ({stats['Banido 24 horas']})
              </TabsTrigger>
              <TabsTrigger 
                value="Banido permanente" 
                className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
              >
                Ban Perm ({stats['Banido permanente']})
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
        
        {/* Search and Filters - Mobile Responsive */}
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por número, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={operatorFilter} onValueChange={setOperatorFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Operadora" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Claro">Claro</SelectItem>
              <SelectItem value="Vivo">Vivo</SelectItem>
              <SelectItem value="TIM">TIM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions and Export/Import - Mobile Responsive */}
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:gap-2 md:items-center">
          <div className="flex gap-2">
            <Select 
              value={bulkAction} 
              onValueChange={setBulkAction}
              disabled={selectedChips.length === 0}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Ações em massa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="select">Selecionar ação</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.name}>
                    Alterar para {tag.name}
                  </SelectItem>
                ))}
                <SelectItem value="delete">Excluir selecionados</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleBulkAction}
              disabled={selectedChips.length === 0 || !bulkAction || bulkAction === 'select'}
              variant="outline"
              size="sm"
            >
              Aplicar ({selectedChips.length})
            </Button>
          </div>

          <div className="flex gap-2 md:ml-auto">
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Exportar</span>
            </Button>
            
            <label htmlFor="import-file">
              <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Importar</span>
                </span>
              </Button>
            </label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredChips.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {chips.length === 0 ? 'Nenhum chip cadastrado' : 'Nenhum chip encontrado com os filtros aplicados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Mobile Cards for small screens */}
              <div className="block md:hidden space-y-4">
                {filteredChips.map((chip) => (
                  <Card key={chip.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-mono font-bold text-lg">{chip.code}</h3>
                        <p className="text-sm text-muted-foreground">{chip.number}</p>
                      </div>
                      <Checkbox
                        checked={selectedChips.includes(chip.id)}
                        onCheckedChange={(checked) => handleSelectChip(chip.id, checked as boolean)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Data:</span>
                        <p>{new Date(chip.registrationDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Função:</span>
                        <p>{chip.function}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Operadora:</span>
                        <p>{chip.operator}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <Select 
                          value={chip.status} 
                          onValueChange={(value) => handleStatusChange(chip.id, value)}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tags.map(tag => (
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
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onView(chip)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(chip)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o chip {chip.code}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(chip.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedChips.length === filteredChips.length && filteredChips.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Data Reg.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Operadora</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChips.map((chip) => (
                      <TableRow key={chip.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedChips.includes(chip.id)}
                            onCheckedChange={(checked) => handleSelectChip(chip.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-mono font-bold">{chip.code}</TableCell>
                        <TableCell>{chip.number}</TableCell>
                        <TableCell>{new Date(chip.registrationDate).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Select 
                            value={chip.status} 
                            onValueChange={(value) => handleStatusChange(chip.id, value)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {tags.map(tag => (
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
                        </TableCell>
                        <TableCell>{chip.function}</TableCell>
                        <TableCell>{chip.operator}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => onView(chip)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onEdit(chip)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o chip {chip.code}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(chip.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChipTable;
