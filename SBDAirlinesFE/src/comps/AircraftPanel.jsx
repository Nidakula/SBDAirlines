import React, { useState, useEffect } from 'react';
import { aircraftService, airlineService } from '../services/api';
import EntityPanel from './EntityPanel';

export default function AircraftPanel() {
  const [airlines, setAirlines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aircraftData, setAircraftData] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch airlines for the dropdown
        const airlinesResponse = await airlineService.getAllAirlines();
        setAirlines(airlinesResponse.data);
        
        // Fetch aircraft data directly here instead of relying on EntityPanel
        const aircraftResponse = await aircraftService.getAllAircraft();
        setAircraftData(aircraftResponse.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCreateAircraft = async (data) => {
    try {
      await aircraftService.createAircraft(data);
      // Refresh the data after creating
      const response = await aircraftService.getAllAircraft();
      setAircraftData(response.data);
      return { success: true };
    } catch (error) {
      console.error('Failed to create aircraft:', error);
      return { success: false, error: error.message };
    }
  };
  
  const handleUpdateAircraft = async (id, data) => {
    try {
      await aircraftService.updateAircraft(id, data);
      // Refresh the data after updating
      const response = await aircraftService.getAllAircraft();
      setAircraftData(response.data);
      return { success: true };
    } catch (error) {
      console.error('Failed to update aircraft:', error);
      return { success: false, error: error.message };
    }
  };
  
  const handleDeleteAircraft = async (id) => {
    try {
      await aircraftService.deleteAircraft(id);
      // Refresh the data after deleting
      const response = await aircraftService.getAllAircraft();
      setAircraftData(response.data);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete aircraft:', error);
      return { success: false, error: error.message };
    }
  };
  
  const columns = [
    { field: '_id', header: 'ID' },
    { field: 'nomor_registrasi', header: 'Registration' },
    { field: 'model_pesawat', header: 'Model' },
    { 
      field: 'maskapai_id', 
      header: 'Airline',
      render: (item) => {
        const airline = airlines.find(a => a._id === item.maskapai_id);
        return airline ? airline.nama_maskapai : 'Unknown';
      }
    },
    { field: 'kapasitas_penumpang', header: 'Capacity' },
    { 
      field: 'status_pesawat', 
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.status_pesawat === 'Aktif' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
          item.status_pesawat === 'Perawatan' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {item.status_pesawat}
        </span>
      )
    }
  ];
  
  const formFields = [
    {
      name: 'nomor_registrasi',
      label: 'Registration',
      type: 'text',
      required: true,
      placeholder: 'E.g., PK-LQJ'
    },
    {
      name: 'model_pesawat',
      label: 'Aircraft Model',
      type: 'text',
      required: true,
      placeholder: 'E.g., Boeing 737-800, Airbus A320'
    },
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
      name: 'kapasitas_penumpang',
      label: 'Passenger Capacity',
      type: 'number',
      required: true,
      min: 1,
      placeholder: 'Total number of seats'
    },
    {
      name: 'status_pesawat',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Aktif', label: 'Active' },
        { value: 'Perawatan', label: 'Maintenance' },
        { value: 'Tidak Beroperasi', label: 'Not Operating' }
      ]
    }
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  // Create a custom service object that matches what EntityPanel expects
  const customService = {
    getAllAircrafts: () => ({ data: aircraftData }),
    createAircraft: handleCreateAircraft,
    updateAircraft: handleUpdateAircraft,
    deleteAircraft: handleDeleteAircraft
  };

  return (
    <EntityPanel 
      title="Aircraft Management"
      entityName="Aircraft"
      service={customService}
      columns={columns}
      formFields={formFields}
      initialFormData={{
        nomor_registrasi: '',
        model_pesawat: '',
        maskapai_id: '',
        kapasitas_penumpang: '',
        status_pesawat: 'Aktif'
      }}
      idField="_id"
      data={aircraftData}
      error={error}
    />
  );
}