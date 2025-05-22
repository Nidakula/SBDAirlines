import React, { useState, useEffect } from 'react';
import { ticketService, passengerService, flightService } from '../services/api';
import EntityPanel from './EntityPanel';

export default function TicketsPanel() {
  const [passengers, setPassengers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [passengersRes, flightsRes] = await Promise.all([
          passengerService.getAllPassengers(),
          flightService.getAllFlights()
        ]);
        
        setPassengers(passengersRes.data);
        setFlights(flightsRes.data);
      } catch (error) {
        console.error('Failed to fetch ticket dependencies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDependencies();
  }, []);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const generateSeatOptions = (flightId) => {

    const rows = 30;
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seats = [];
    
    for (let row = 1; row <= rows; row++) {
      cols.forEach(col => {
        seats.push(`${row}${col}`);
      });
    }
    
    return seats.map(seat => ({
      value: seat,
      label: seat
    }));
  };
  
  const columns = [
    { field: '_id', header: 'ID' },
    { 
      field: 'penumpang_id', 
      header: 'Passenger',
      render: (item) => {
        const passenger = passengers.find(p => p._id === item.penumpang_id);
        return passenger ? passenger.nama_penumpang : 'Unknown';
      }
    },
    { 
      field: 'flight_id', 
      header: 'Flight',
      render: (item) => {
        const flight = flights.find(f => f._id === item.flight_id);
        return flight ? `${flight.asal_bandara} → ${flight.tujuan_bandara}` : 'Unknown';
      }
    },
    { field: 'seat_number', header: 'Seat' },
    { field: 'kelas_penerbangan', header: 'Class' },
    { 
      field: 'harga_tiket', 
      header: 'Price',
      render: (item) => formatCurrency(item.harga_tiket)
    },
    { 
      field: 'status_tiket', 
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          item.status_tiket === 'Confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
          item.status_tiket === 'Checked-in' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {item.status_tiket}
        </span>
      )
    }
  ];
  
  const formFields = [
    {
      name: 'penumpang_id',
      label: 'Passenger',
      type: 'select',
      required: true,
      options: passengers.map(passenger => ({
        value: passenger._id,
        label: `${passenger.nama_penumpang} (${passenger.email || passenger.nomor_telepon || 'No contact'})`
      }))
    },
    {
      name: 'flight_id',
      label: 'Flight',
      type: 'select',
      required: true,
      options: flights.map(flight => ({
        value: flight._id,
        label: `${flight.asal_bandara} → ${flight.tujuan_bandara} (${new Date(flight.jadwal_keberangkatan).toLocaleString()})`
      }))
    },
    {
      name: 'seat_number',
      label: 'Seat Number',
      type: 'select',
      required: true,
      options: generateSeatOptions()
    },
    {
      name: 'kelas_penerbangan',
      label: 'Flight Class',
      type: 'select',
      required: true,
      options: [
        { value: 'Ekonomi', label: 'Economy' },
        { value: 'Bisnis', label: 'Business' },
        { value: 'First Class', label: 'First Class' }
      ]
    },
    {
      name: 'harga_tiket',
      label: 'Ticket Price',
      type: 'number',
      required: true,
      min: 0,
      placeholder: 'Price in IDR'
    },
    {
      name: 'status_tiket',
      label: 'Ticket Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Cancelled', label: 'Cancelled' },
        { value: 'Checked-in', label: 'Checked-in' }
      ]
    }
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <EntityPanel 
      title="Ticket Management"
      entityName="Ticket"
      service={ticketService}
      columns={columns}
      formFields={formFields}
      initialFormData={{
        penumpang_id: '',
        flight_id: '',
        seat_number: '',
        kelas_penerbangan: 'Ekonomi',
        harga_tiket: '',
        status_tiket: 'Confirmed'
      }}
      idField="_id"
    />
  );
}