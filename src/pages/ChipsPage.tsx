
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ChipTable from '@/components/ChipTable';
import ChipForm from '@/components/ChipForm';
import { Chip } from '@/contexts/ChipContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Smartphone, User, Tag } from 'lucide-react';

const ChipsPage = () => {
  const [editingChip, setEditingChip] = useState<Chip | null>(null);
  const [viewingChip, setViewingChip] = useState<Chip | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (chip: Chip) => {
    setEditingChip(chip);
    setIsFormOpen(true);
  };

  const handleView = (chip: Chip) => {
    setViewingChip(chip);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingChip(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingChip(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <ChipTable onEdit={handleEdit} onView={handleView} />

        {/* Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingChip ? 'Editar Chip' : 'Adicionar Chip'}</DialogTitle>
            </DialogHeader>
            <ChipForm
              chip={editingChip || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!viewingChip} onOpenChange={(open) => !open && setViewingChip(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Chip</DialogTitle>
            </DialogHeader>
            
            {viewingChip && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-mono">{viewingChip.code}</CardTitle>
                    <Badge className="text-sm">{viewingChip.operator}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Número:</span>
                      <span>{viewingChip.number}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Registro:</span>
                      <span>{new Date(viewingChip.registrationDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Função:</span>
                      <span>{viewingChip.function}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Status:</span>
                      <Badge variant="outline">{viewingChip.status}</Badge>
                    </div>
                  </div>

                  {viewingChip.profiles.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Perfis Associados:</h4>
                        <div className="flex flex-wrap gap-2">
                          {viewingChip.profiles.map((profile, index) => (
                            <Badge key={index} variant="secondary">{profile}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Histórico de Status:</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {viewingChip.statusHistory.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <Badge variant="outline">{entry.status}</Badge>
                          <span className="text-muted-foreground">{entry.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ChipsPage;
