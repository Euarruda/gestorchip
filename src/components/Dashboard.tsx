
import React, { useState } from 'react';
import { useChip } from '@/contexts/ChipContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Smartphone, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { chips, tags } = useChip();
  const [selectedChipForAnalysis, setSelectedChipForAnalysis] = useState<string>('');

  // Status distribution data
  const statusDistribution = tags.map(tag => {
    const count = chips.filter(chip => chip.status === tag.name).length;
    return {
      name: tag.name,
      value: count,
      color: tag.color,
      percentage: chips.length > 0 ? ((count / chips.length) * 100).toFixed(1) : '0'
    };
  }).filter(item => item.value > 0);

  // Top 10 chips with most bans
  const chipBanHistory = chips.map(chip => {
    const banCount = chip.statusHistory.filter(entry => 
      entry.status.includes('Banido')
    ).length;
    
    return {
      code: chip.code,
      number: chip.number,
      banCount
    };
  }).sort((a, b) => b.banCount - a.banCount).slice(0, 10);

  // Overall stats
  const totalChips = chips.length;
  const activeChips = chips.filter(chip => chip.status === 'Ativo').length;
  const bannedChips = chips.filter(chip => chip.status.includes('Banido')).length;
  const warmingChips = chips.filter(chip => chip.status === 'Aquecendo').length;

  // Individual chip analysis
  const selectedChip = chips.find(chip => chip.id === selectedChipForAnalysis);
  const chipHistoryData = selectedChip ? selectedChip.statusHistory.map((entry, index) => ({
    date: new Date(entry.timestamp).toLocaleDateString('pt-BR'),
    status: entry.status,
    index: index + 1
  })) : [];

  const getStatusDays = (chip: any, status: string) => {
    const statusEntry = chip.statusHistory.find((entry: any) => entry.status === status);
    if (!statusEntry) return null;
    
    const days = Math.floor((Date.now() - statusEntry.timestamp) / (1000 * 60 * 60 * 24));
    return days;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{`${payload[0].payload.name}: ${payload[0].value}`}</p>
          <p className="text-sm text-muted-foreground">{`${payload[0].payload.percentage}% do total`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Total: {totalChips} chips
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Chips</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChips}</div>
            <p className="text-xs text-muted-foreground">
              Chips cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chips Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeChips}</div>
            <p className="text-xs text-muted-foreground">
              {totalChips > 0 ? `${((activeChips / totalChips) * 100).toFixed(1)}% do total` : '0% do total'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aquecendo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warmingChips}</div>
            <p className="text-xs text-muted-foreground">
              {totalChips > 0 ? `${((warmingChips / totalChips) * 100).toFixed(1)}% do total` : '0% do total'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chips Banidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bannedChips}</div>
            <p className="text-xs text-muted-foreground">
              {totalChips > 0 ? `${((bannedChips / totalChips) * 100).toFixed(1)}% do total` : '0% do total'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusDistribution.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Nenhum chip cadastrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Banned Chips */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Chips com Mais Banimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {chipBanHistory.length > 0 && chipBanHistory.some(chip => chip.banCount > 0) ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chipBanHistory.filter(chip => chip.banCount > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="code" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="banCount" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Nenhum chip foi banido ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Individual Chip Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Individual de Chip</CardTitle>
          <Select value={selectedChipForAnalysis} onValueChange={setSelectedChipForAnalysis}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Selecione um chip para análise" />
            </SelectTrigger>
            <SelectContent>
              {chips.map(chip => (
                <SelectItem key={chip.id} value={chip.id}>
                  {chip.code} - {chip.number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {selectedChip ? (
            <div className="space-y-6">
              {/* Chip Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Status Atual</h4>
                  <Badge 
                    style={{ 
                      backgroundColor: tags.find(t => t.name === selectedChip.status)?.color,
                      color: 'white'
                    }}
                  >
                    {selectedChip.status}
                  </Badge>
                  {selectedChip.status === 'Ativo' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Ativo há {getStatusDays(selectedChip, 'Ativo')} dias
                    </p>
                  )}
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Histórico de Banimentos</h4>
                  <p className="text-2xl font-bold">
                    {selectedChip.statusHistory.filter(entry => entry.status.includes('Banido')).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total de banimentos</p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Última Mudança</h4>
                  <p className="text-sm">
                    {selectedChip.statusHistory[selectedChip.statusHistory.length - 1]?.date}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Para: {selectedChip.statusHistory[selectedChip.statusHistory.length - 1]?.status}
                  </p>
                </div>
              </div>

              {/* Status History Chart */}
              <div>
                <h4 className="font-semibold mb-4">Histórico de Mudanças de Status</h4>
                {chipHistoryData.length > 1 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chipHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="index" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ fill: '#8884d8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    Chip ainda não teve mudanças de status
                  </div>
                )}
              </div>

              {/* Detailed History */}
              <div>
                <h4 className="font-semibold mb-4">Histórico Detalhado</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedChip.statusHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <Badge 
                        style={{ 
                          backgroundColor: tags.find(t => t.name === entry.status)?.color,
                          color: 'white'
                        }}
                      >
                        {entry.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{entry.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              Selecione um chip para ver a análise detalhada
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
