import React, { useState, useEffect } from 'react';
import { gateService, terminalService } from '../services/api';
import EntityPanel from './EntityPanel';

export default function GatePanel() {
  const [terminals, setTerminals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTerminals = async () => {
      try {
        const response = await terminalService.getAllTerminals();
        setTerminals(response.data);
      } catch (error) {
        console.error('Failed to fetch terminals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTerminals();
  }, []);
  
  const columns = [
    { field: '_id', header: 'ID' },
    { field: 'nomor_gate', header: 'Gate Number' },
    { 
      field: 'terminal_id', 
      header: 'Terminal',
      render: (item) => {
        const terminal = terminals.find(t => t._id === item.terminal_id);
        return terminal ? terminal.nama_terminal : 'Unknown';
      }
    },
    { field: 'lokasi_gate', header: 'Location' },
    { field: 'kapasitas_area', header: 'Capacity' },
    { 
      field: 'status_gate', 
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.status_gate === 'Terbuka' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
          item.status_gate === 'Sedang Perbaikan' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {item.status_gate}
        </span>
      )
    }
  ];
  
  const formFields = [
    {
      name: 'terminal_id',
      label: 'Terminal',
      type: 'select',
      required: true,
      options: terminals.map(terminal => ({
        value: terminal._id,
        label: terminal.nama_terminal
      }))
    },
    {
      name: 'nomor_gate',
      label: 'Gate Number',
      type: 'text',
      required: true,
      placeholder: 'E.g., A1, B12, C5'
    },
    {
      name: 'lokasi_gate',
      label: 'Gate Location',
      type: 'text',
      required: true,
      placeholder: 'E.g., North Wing, International Departure'
    },
    {
      name: 'status_gate',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Terbuka', label: 'Open' },
        { value: 'Tertutup', label: 'Closed' },
        { value: 'Sedang Perbaikan', label: 'Under Maintenance' }
      ]
    },
    {
      name: 'kapasitas_area',
      label: 'Area Capacity',
      type: 'number',
      required: true,
      min: 1,
      placeholder: 'Number of passengers in waiting area'
    }
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <EntityPanel 
      title="Gate Management"
      entityName="Gate"
      service={gateService}
      columns={columns}
      formFields={formFields}
      initialFormData={{
        terminal_id: '',
        nomor_gate: '',
        lokasi_gate: '',
        status_gate: 'Terbuka',
        kapasitas_area: ''
      }}
      idField="_id"
    />
  );
}