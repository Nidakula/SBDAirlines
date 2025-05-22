import React from 'react';
import { passengerService } from '../services/api';
import EntityPanel from './EntityPanel';

export default function PassengersPanel() {
  const columns = [
    { field: '_id', header: 'ID' },
    { field: 'nama_penumpang', header: 'Name' },
    { 
      field: 'nomor_identitas', 
      header: 'ID Number',
      render: (item) => item.nomor_identitas || 'N/A'
    },
    { 
      field: 'nomor_passport', 
      header: 'Passport',
      render: (item) => item.nomor_passport || 'N/A'
    },
    { 
      field: 'nomor_telepon', 
      header: 'Phone',
      render: (item) => item.nomor_telepon || 'N/A'
    },
    { field: 'email', header: 'Email' },
    { field: 'kewarganegaraan', header: 'Nationality' }
  ];
  
  const formFields = [
    {
      name: 'nama_penumpang',
      label: 'Passenger Name',
      type: 'text',
      required: true,
      placeholder: 'Full name'
    },
    {
      name: 'nomor_identitas',
      label: 'ID Number',
      type: 'text',
      placeholder: 'National ID number'
    },
    {
      name: 'nomor_passport',
      label: 'Passport Number',
      type: 'text',
      placeholder: 'For international travelers'
    },
    {
      name: 'nomor_telepon',
      label: 'Phone Number',
      type: 'text',
      placeholder: 'Contact phone number'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
      placeholder: 'Email address'
    },
    {
      name: 'alamat',
      label: 'Address',
      type: 'textarea',
      placeholder: 'Full address',
      rows: 2
    },
    {
      name: 'kewarganegaraan',
      label: 'Nationality',
      type: 'text',
      required: true,
      placeholder: 'Country of citizenship'
    }
  ];

  return (
    <EntityPanel 
      title="Passenger Management"
      entityName="Passenger"
      service={passengerService}
      columns={columns}
      formFields={formFields}
      initialFormData={{
        nama_penumpang: '',
        nomor_identitas: '',
        nomor_passport: '',
        nomor_telepon: '',
        email: '',
        alamat: '',
        kewarganegaraan: ''
      }}
      idField="_id"
    />
  );
}