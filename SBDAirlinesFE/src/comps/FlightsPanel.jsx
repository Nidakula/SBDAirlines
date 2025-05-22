import React, { useState, useEffect } from 'react';
import { flightService, airlineService, aircraftService, gateService } from '../services/api';
import EntityPanel from './EntityPanel';

export default function FlightsPanel() {
  const [airlines, setAirlines] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [gates, setGates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [airlinesRes, aircraftRes, gatesRes] = await Promise.all([
          airlineService.getAllAirlines(),
          aircraftService.getAllAircraft(),
          gateService.getAllGates()
        ]);
        
        setAirlines(airlinesRes.data);
        setAircraft(aircraftRes.data);
        setGates(gatesRes.data);
      } catch (error) {
        console.error('Failed to fetch flight dependencies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDependencies();
  }, []);
  
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  const columns = [
    { field: '_id', header: 'ID' },
    { 
      field: 'maskapai_id', 
      header: 'Airline',
      render: (item) => {
        const airline = airlines.find(a => a._id === item.maskapai_id);
        return airline ? airline.nama_maskapai : 'Unknown';
      }
    },
    { 
      field: 'pesawat_id', 
      header: 'Aircraft',
      render: (item) => {
        const plane = aircraft.find(a => a._id === item.pesawat_id);
        return plane ? `${plane.model_pesawat} (${plane.nomor_registrasi})` : 'Unknown';
      }
    },
    { field: 'asal_bandara', header: 'Origin' },
    { field: 'tujuan_bandara', header: 'Destination' },
    { 
      field: 'jadwal_keberangkatan', 
      header: 'Departure',
      render: (item) => formatDateTime(item.jadwal_keberangkatan)
    },
    { 
      field: 'jadwal_kedatangan', 
      header: 'Arrival',
      render: (item) => formatDateTime(item.jadwal_kedatangan)
    },
    { 
      field: 'status_penerbangan', 
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.status_penerbangan === 'On Time' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
          item.status_penerbangan === 'Delayed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {item.status_penerbangan}
        </span>
      )
    },
    { 
      field: 'gate_id', 
      header: 'Gate',
      render: (item) => {
        const gate = gates.find(g => g._id === item.gate_id);
        return gate ? gate.nomor_gate : 'Unknown';
      }
    }
  ];
  
  const formFields = [
    {
      name: 'maskapai_id',
      label: 'Airline',
      type: 'select',
      required: true,
      options: airlines.map(airline => ({
        value: airline._id,
        label: airline.nama_maskapai
      }))
    },
    {
      name: 'pesawat_id',
      label: 'Aircraft',
      type: 'select',
      required: true,
      options: aircraft.map(plane => ({
        value: plane._id,
        label: `${plane.model_pesawat} (${plane.nomor_registrasi})`
      }))
    },
    {
      name: 'asal_bandara',
      label: 'Origin Airport',
      type: 'text',
      required: true,
      placeholder: 'E.g., CGK - Jakarta'
    },
    {
      name: 'tujuan_bandara',
      label: 'Destination Airport',
      type: 'text',
      required: true,
      placeholder: 'E.g., DPS - Bali'
    },
    {
      name: 'jadwal_keberangkatan',
      label: 'Departure Time',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'jadwal_kedatangan',
      label: 'Arrival Time',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'status_penerbangan',
      label: 'Flight Status',
      type: 'select',
      required: true,
      options: [
        { value: 'On Time', label: 'On Time' },
        { value: 'Delayed', label: 'Delayed' },
        { value: 'Cancelled', label: 'Cancelled' }
      ]
    },
    {
      name: 'gate_id',
      label: 'Gate',
      type: 'select',
      required: true,
      options: gates.map(gate => ({
        value: gate._id,
        label: gate.nomor_gate
      }))
    }
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <EntityPanel 
      title="Flight Management"
      entityName="Flight"
      service={flightService}
      columns={columns}
      formFields={formFields}
      initialFormData={{
        maskapai_id: '',
        pesawat_id: '',
        asal_bandara: '',
        tujuan_bandara: '',
        jadwal_keberangkatan: '',
        jadwal_kedatangan: '',
        status_penerbangan: 'On Time',
        gate_id: ''
      }}
      idField="_id"
    />
  );
}