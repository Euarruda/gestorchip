
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ChipForm from '@/components/ChipForm';

const AddChipPage = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/chips');
  };

  const handleCancel = () => {
    navigate('/chips');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Adicionar Novo Chip</h1>
        <ChipForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </Layout>
  );
};

export default AddChipPage;
