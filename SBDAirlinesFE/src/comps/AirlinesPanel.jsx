import React from 'react';
import { airlineService } from '../services/api';
import EntityPanel from './EntityPanel';

export default function AirlinesPanel() {
  const columns = [
    { field: '_id', header: 'ID' },
    { field: 'nama_maskapai', header: 'Name' },
    { field: 'kode_maskapai', header: 'Code' },
    { field: 'negara_asal', header: 'Country' },
    { 
      field: 'logo', 
      header: 'Logo', 
      render: (item) => item.logo ? 
        <img src={item.logo} alt={item.nama_maskapai} className="h-8 w-auto object-contain" /> : 
        <span className="text-gray-400 dark:text-gray-500">No logo</span>
    },
    { 
      field: 'jumlah_pesawat', 
      header: 'Aircraft Count',
      render: (item) => item.jumlah_pesawat || '0'
    },
    { 
      field: 'tahun_berdiri', 
      header: 'Founded',
      render: (item) => item.tahun_berdiri || 'N/A'
    }
  ];
  
  const formFields = [
    {
      name: 'nama_maskapai',
      label: 'Airline Name',
      type: 'text',
      required: true,
      placeholder: 'Enter airline name'
    },
    {
      name: 'kode_maskapai',
      label: 'Airline Code',
      type: 'text',
      required: true,
      placeholder: 'E.g., JT, GA, AK',
      helperText: 'IATA/ICAO code for the airline'
    },
    {
      name: 'negara_asal',
      label: 'Country',
      type: 'text',
      required: true,
      placeholder: 'Country of origin'
    },
    {
      name: 'jumlah_pesawat',
      label: 'Aircraft Count',
      type: 'number',
      required: true,
      placeholder: 'Number of aircraft in fleet',
      min: 0
    },
    {
      name: 'tahun_berdiri',
      label: 'Founded',
      type: 'number',
      required: true,
      placeholder: 'Year the airline was founded',
      min: 1900,
      max: new Date().getFullYear()
    },
    {
      name: 'logo',
      label: 'Logo URL',
      type: 'text',
      placeholder: 'https://example.com/logo.png',
      helperText: 'Direct link to the airline logo image'
    }
  ];

  return (
    <EntityPanel 
      title="Airlines Management"
      entityName="Airline"
      service={airlineService}
      columns={columns}
      formFields={formFields}
      initialFormData={{
        nama_maskapai: '',
        kode_maskapai: '',
        negara_asal: '',
        jumlah_pesawat: '',
        tahun_berdiri: '',
        logo: ''
      }}
      idField="_id" 
    />
  );
}