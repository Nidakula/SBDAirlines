import React from 'react';
import { terminalService } from '../services/api';
import EntityPanel from './EntityPanel';

export default function TerminalPanel() {
  const columns = [
    { field: '_id', header: 'ID' },
    { field: 'nama_terminal', header: 'Name' },
    { field: 'kapasitas_penumpang', header: 'Passenger Capacity' },
    { field: 'jumlah_gate', header: 'Number of Gates' },
    { 
      field: 'fasilitas', 
      header: 'Facilities',
      render: (item) => item.fasilitas || 'No facilities listed'
    }
  ];
  
  const formFields = [
    {
      name: 'nama_terminal',
      label: 'Terminal Name',
      type: 'text',
      required: true,
      placeholder: 'E.g., Terminal 1, Terminal 3 International'
    },
    {
      name: 'kapasitas_penumpang',
      label: 'Passenger Capacity',
      type: 'number',
      required: true,
      min: 1,
      placeholder: 'Maximum number of passengers'
    },
    {
      name: 'jumlah_gate',
      label: 'Number of Gates',
      type: 'number',
      required: true,
      min: 1,
      placeholder: 'Total gates in this terminal'
    },
    {
      name: 'fasilitas',
      label: 'Facilities',
      type: 'textarea',
      placeholder: 'List of available facilities',
      rows: 3
    }
  ];

  return (
    <EntityPanel 
      title="Terminal Management"
      entityName="Terminal"
      service={terminalService}
      columns={columns}
      formFields={formFields}
      initialFormData={{
        nama_terminal: '',
        kapasitas_penumpang: '',
        jumlah_gate: '',
        fasilitas: ''
      }}
      idField="_id"
    />
  );
}