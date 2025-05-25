const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const { 
  Maskapai, 
  Pesawat, 
  Terminal, 
  Gate, 
  Penumpang, 
  Penerbangan, 
  Tiket 
} = require('./models/index.model');

const API_URL = 'http://localhost:3000/api';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    await Tiket.deleteMany({});
    await Penerbangan.deleteMany({});
    await Penumpang.deleteMany({});
    await Gate.deleteMany({});
    await Terminal.deleteMany({});
    await Pesawat.deleteMany({});
    await Maskapai.deleteMany({});
    
    console.log('Database cleared');

    const airlines = await Maskapai.create([
      {
        nama_maskapai: 'Garuda Indonesia',
        kode_maskapai: 'GA',
        negara_asal: 'Indonesia',
        jumlah_pesawat: 142,
        tahun_berdiri: 1949
      },
      {
        nama_maskapai: 'Lion Air',
        kode_maskapai: 'JT',
        negara_asal: 'Indonesia',
        jumlah_pesawat: 112,
        tahun_berdiri: 2000
      },
      {
        nama_maskapai: 'Singapore Airlines',
        kode_maskapai: 'SQ',
        negara_asal: 'Singapore',
        jumlah_pesawat: 150,
        tahun_berdiri: 1947
      }
    ]);
    console.log('Airlines created', airlines.length);

    const aircraft = await Pesawat.create([
      {
        maskapai_id: airlines[0]._id,
        model_pesawat: 'Boeing 777-300ER',
        kapasitas_penumpang: 396,
        nomor_registrasi: 'PK-GIA',
        status_pesawat: 'Aktif'
      },
      {
        maskapai_id: airlines[1]._id,
        model_pesawat: 'Boeing 737-900ER',
        kapasitas_penumpang: 215,
        nomor_registrasi: 'PK-LJF',
        status_pesawat: 'Aktif'
      },
      {
        maskapai_id: airlines[2]._id,
        model_pesawat: 'Airbus A350-900',
        kapasitas_penumpang: 253,
        nomor_registrasi: 'SQ-ABA',
        status_pesawat: 'Aktif'
      },
      {
        maskapai_id: airlines[0]._id,
        model_pesawat: 'Airbus A330-300',
        kapasitas_penumpang: 290,
        nomor_registrasi: 'PK-GIE',
        status_pesawat: 'Perawatan'
      }
    ]);
    console.log('Aircraft created', aircraft.length);

    const terminals = await Terminal.create([
      {
        nama_terminal: 'Terminal 1',
        kapasitas_penumpang: 9000000,
        jumlah_gate: 10,
        fasilitas: 'Food court, Lounge, Shopping area'
      },
      {
        nama_terminal: 'Terminal 2',
        kapasitas_penumpang: 8000000,
        jumlah_gate: 8,
        fasilitas: 'Prayer room, Medical center, Duty free shops'
      },
      {
        nama_terminal: 'Terminal 3',
        kapasitas_penumpang: 15000000,
        jumlah_gate: 15,
        fasilitas: 'Premium lounge, Sleeping pods, Fine dining restaurants'
      }
    ]);
    console.log('Terminals created:', terminals.length);

    const gates = await Gate.create([
      {
        terminal_id: terminals[0]._id,
        nomor_gate: 'A1',
        lokasi_gate: 'East Wing',
        status_gate: 'Terbuka',
        kapasitas_area: 150
      },
      {
        terminal_id: terminals[0]._id,
        nomor_gate: 'A2',
        lokasi_gate: 'East Wing',
        status_gate: 'Terbuka',
        kapasitas_area: 150
      },
      {
        terminal_id: terminals[1]._id,
        nomor_gate: 'B1',
        lokasi_gate: 'West Wing',
        status_gate: 'Terbuka',
        kapasitas_area: 200
      },
      {
        terminal_id: terminals[2]._id,
        nomor_gate: 'C1',
        lokasi_gate: 'North Wing',
        status_gate: 'Terbuka',
        kapasitas_area: 250
      },
      {
        terminal_id: terminals[2]._id,
        nomor_gate: 'C2',
        lokasi_gate: 'North Wing',
        status_gate: 'Sedang Perbaikan',
        kapasitas_area: 250
      }
    ]);
    console.log('Gates created', gates.length);

    const passengers = await Penumpang.create([
      {
        nama_penumpang: 'John Doe',
        nomor_passport: 'A12345678',
        nomor_identitas: '1234567890123456',
        nomor_telepon: '+62812345678',
        email: 'john.doe@example.com',
        alamat: 'Jl. Sudirman No. 123, Jakarta',
        kewarganegaraan: 'Indonesia'
      },
      {
        nama_penumpang: 'Jane Smith',
        nomor_passport: 'B87654321',
        nomor_identitas: '6543210987654321',
        nomor_telepon: '+62898765432',
        email: 'jane.smith@example.com',
        alamat: 'Jl. Gatot Subroto No. 456, Jakarta',
        kewarganegaraan: 'United States'
      },
      {
        nama_penumpang: 'Lee Min Ho',
        nomor_passport: 'C11223344',
        nomor_identitas: '1122334455667788',
        nomor_telepon: '+6281122334455',
        email: 'lee.minho@example.com',
        alamat: 'Gangnam District, Seoul',
        kewarganegaraan: 'South Korea'
      },
      {
        nama_penumpang: 'Maria Garcia',
        nomor_passport: 'D99887766',
        nomor_identitas: '9988776655443322',
        nomor_telepon: '+6281199887766',
        email: 'maria.garcia@example.com',
        alamat: 'Jl. Asia Afrika No. 789, Bandung',
        kewarganegaraan: 'Spain'
      }
    ]);
    console.log('Passengers created', passengers.length);

    const today = new Date();
    const departureDate1 = new Date(today);
    departureDate1.setHours(today.getHours() + 2);
    
    const arrivalDate1 = new Date(departureDate1);
    arrivalDate1.setHours(departureDate1.getHours() + 2);
    
    const departureDate2 = new Date(today);
    departureDate2.setHours(today.getHours() + 4);
    
    const arrivalDate2 = new Date(departureDate2);
    arrivalDate2.setHours(departureDate2.getHours() + 1);
    
    const departureDate3 = new Date(today);
    departureDate3.setDate(today.getDate() + 1);
    
    const arrivalDate3 = new Date(departureDate3);
    arrivalDate3.setHours(departureDate3.getHours() + 5);

    const flights = await Penerbangan.create([
      {
        maskapai_id: airlines[0]._id,
        pesawat_id: aircraft[0]._id,
        asal_bandara: 'Jakarta (CGK)',
        tujuan_bandara: 'Singapore (SIN)',
        jadwal_keberangkatan: departureDate1,
        jadwal_kedatangan: arrivalDate1,
        status_penerbangan: 'On Time',
        gate_id: gates[0]._id
      },
      {
        maskapai_id: airlines[1]._id,
        pesawat_id: aircraft[1]._id,
        asal_bandara: 'Jakarta (CGK)',
        tujuan_bandara: 'Bali (DPS)',
        jadwal_keberangkatan: departureDate2,
        jadwal_kedatangan: arrivalDate2,
        status_penerbangan: 'On Time',
        gate_id: gates[1]._id
      },
      {
        maskapai_id: airlines[2]._id,
        pesawat_id: aircraft[2]._id,
        asal_bandara: 'Singapore (SIN)',
        tujuan_bandara: 'Tokyo (NRT)',
        jadwal_keberangkatan: departureDate3,
        jadwal_kedatangan: arrivalDate3,
        status_penerbangan: 'On Time',
        gate_id: gates[3]._id
      }
    ]);
    console.log('Flights created:', flights.length);

    const tickets = await Tiket.create([
      {
        penumpang_id: passengers[0]._id,
        flight_id: flights[0]._id,
        seat_number: '12A',
        kelas_penerbangan: 'Bisnis',
        harga_tiket: 3500000,
        status_tiket: 'Confirmed'
      },
      {
        penumpang_id: passengers[1]._id,
        flight_id: flights[0]._id,
        seat_number: '12B',
        kelas_penerbangan: 'Bisnis',
        harga_tiket: 3500000,
        status_tiket: 'Confirmed'
      },
      {
        penumpang_id: passengers[2]._id,
        flight_id: flights[1]._id,
        seat_number: '24C',
        kelas_penerbangan: 'Ekonomi',
        harga_tiket: 1200000,
        status_tiket: 'Checked-in'
      },
      {
        penumpang_id: passengers[3]._id,
        flight_id: flights[2]._id,
        seat_number: '1A',
        kelas_penerbangan: 'First Class',
        harga_tiket: 12000000,
        status_tiket: 'Confirmed'
      }
    ]);
    console.log('Tickets created:', tickets.length);

    console.log('Database seeded successfully!');
    return {
      airlines,
      aircraft,
      terminals,
      gates,
      passengers,
      flights,
      tickets
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

const testAPI = async (data) => {
  try {
    console.log('\n--- Starting API Tests ---\n');

    console.log('Testing Airline endpoints:');
    const airlineResponse = await axios.get(`${API_URL}/airlines`);
    console.log(`GET /airlines: ${airlineResponse.status} - Found ${airlineResponse.data.length} airlines`);
    
    if (data.airlines.length > 0) {
      const airlineDetailResponse = await axios.get(`${API_URL}/airlines/${data.airlines[0]._id}`);
      console.log(`GET /airlines/:id: ${airlineDetailResponse.status} - Found airline: ${airlineDetailResponse.data.nama_maskapai}`);
    }

    console.log('\nTesting Aircraft endpoints:');
    const aircraftResponse = await axios.get(`${API_URL}/aircraft`);
    console.log(`GET /aircraft: ${aircraftResponse.status} - Found ${aircraftResponse.data.length} aircraft`);
    
    if (data.aircraft.length > 0) {
      const aircraftDetailResponse = await axios.get(`${API_URL}/aircraft/${data.aircraft[0]._id}`);
      console.log(`GET /aircraft/:id: ${aircraftDetailResponse.status} - Found aircraft: ${aircraftDetailResponse.data.model_pesawat}`);
    }

    console.log('\nTesting Terminal endpoints:');
    const terminalResponse = await axios.get(`${API_URL}/terminals`);
    console.log(`GET /terminals: ${terminalResponse.status} - Found ${terminalResponse.data.length} terminals`);
    
    if (data.terminals.length > 0) {
      const terminalDetailResponse = await axios.get(`${API_URL}/terminals/${data.terminals[0]._id}`);
      console.log(`GET /terminals/:id: ${terminalDetailResponse.status} - Found terminal: ${terminalDetailResponse.data.nama_terminal}`);
    }

    console.log('\nTesting Gate endpoints:');
    const gateResponse = await axios.get(`${API_URL}/gates`);
    console.log(`GET /gates: ${gateResponse.status} - Found ${gateResponse.data.length} gates`);
    
    if (data.gates.length > 0) {
      const gateDetailResponse = await axios.get(`${API_URL}/gates/${data.gates[0]._id}`);
      console.log(`GET /gates/:id: ${gateDetailResponse.status} - Found gate: ${gateDetailResponse.data.nomor_gate}`);
    }

    console.log('\nTesting Passenger endpoints:');
    const passengerResponse = await axios.get(`${API_URL}/passengers`);
    console.log(`GET /passengers: ${passengerResponse.status} - Found ${passengerResponse.data.length} passengers`);
    
    if (data.passengers.length > 0) {
      const passengerDetailResponse = await axios.get(`${API_URL}/passengers/${data.passengers[0]._id}`);
      console.log(`GET /passengers/:id: ${passengerDetailResponse.status} - Found passenger: ${passengerDetailResponse.data.nama_penumpang}`);
    }

    console.log('\nTesting Flight endpoints:');
    const flightResponse = await axios.get(`${API_URL}/flights`);
    console.log(`GET /flights: ${flightResponse.status} - Found ${flightResponse.data.length} flights`);
    
    if (data.flights.length > 0) {
      const flightDetailResponse = await axios.get(`${API_URL}/flights/${data.flights[0]._id}`);
      console.log(`GET /flights/:id: ${flightDetailResponse.status} - Found flight from ${flightDetailResponse.data.asal_bandara} to ${flightDetailResponse.data.tujuan_bandara}`);
    }

    console.log('\nTesting Ticket endpoints:');
    const ticketResponse = await axios.get(`${API_URL}/tickets`);
    console.log(`GET /tickets: ${ticketResponse.status} - Found ${ticketResponse.data.length} tickets`);
    
    if (data.tickets.length > 0) {
      const ticketDetailResponse = await axios.get(`${API_URL}/tickets/${data.tickets[0]._id}`);
      console.log(`GET /tickets/:id: ${ticketDetailResponse.status} - Found ticket: seat ${ticketDetailResponse.data.seat_number}, class ${ticketDetailResponse.data.kelas_penerbangan}`);
    }

    console.log('\nTesting POST /passengers endpoint:');
    const newPassenger = {
      nama_penumpang: 'Alex Johnson',
      nomor_passport: 'E55443322',
      nomor_identitas: '5544332211998877',
      nomor_telepon: '+6282255443322',
      email: 'alex.johnson@example.com',
      alamat: 'Jl. Pemuda No. 101, Surabaya',
      kewarganegaraan: 'Australia'
    };
    
    const createPassengerResponse = await axios.post(`${API_URL}/passengers`, newPassenger);
    console.log(`POST /passengers: ${createPassengerResponse.status} - Created passenger with ID: ${createPassengerResponse.data._id}`);

    console.log('\nTesting PUT /passengers/:id endpoint:');
    const updatedPassenger = { ...newPassenger, alamat: 'Updated: Jl. Diponegoro No. 202, Surabaya' };
    const updatePassengerResponse = await axios.put(`${API_URL}/passengers/${createPassengerResponse.data._id}`, updatedPassenger);
    console.log(`PUT /passengers/:id: ${updatePassengerResponse.status} - Updated passenger with new address: ${updatePassengerResponse.data.alamat}`);

    console.log('\nTesting DELETE /passengers/:id endpoint:');
    const deletePassengerResponse = await axios.delete(`${API_URL}/passengers/${createPassengerResponse.data._id}`);
    console.log(`DELETE /passengers/:id: ${deletePassengerResponse.status} - ${deletePassengerResponse.data.message}`);

    console.log('\n--- API Tests Completed Successfully ---');
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

const generatePassengerBatch = (size, startIndex = 0) => {
  const passengers = [];
  
  for (let i = 0; i < size; i++) {
    const uniqueIndex = startIndex + i;
    passengers.push({
      nama_penumpang: `Passenger ${uniqueIndex}`,
      nomor_passport: `P${200000 + uniqueIndex}`, 
      nomor_identitas: `${20000000000000 + uniqueIndex}`, 
      nomor_telepon: `+628123456${String(uniqueIndex).padStart(4, '0')}`,
      email: `passenger${uniqueIndex}@example.com`,
      alamat: `Jl. Test No. ${uniqueIndex}, Jakarta`,
      kewarganegaraan: 'Indonesia'
    });
  }
  
  return passengers;
};

const generateAircraftBatch = (size, airlineIds, startIndex = 0) => {
  const aircraft = [];
  const models = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A350', 'ATR 72'];
  
  for (let i = 0; i < size; i++) {
    const uniqueIndex = startIndex + i;
    const randomAirlineIndex = Math.floor(Math.random() * airlineIds.length);
    const modelIndex = uniqueIndex % models.length;
    
    aircraft.push({
      maskapai_id: airlineIds[randomAirlineIndex],
      model_pesawat: `${models[modelIndex]}-${200 + uniqueIndex}`, 
      kapasitas_penumpang: 150 + (uniqueIndex % 250),
      nomor_registrasi: `REG-${20000 + uniqueIndex}`, 
      status_pesawat: uniqueIndex % 5 === 0 ? 'Perawatan' : 'Aktif'
    });
  }
  
  return aircraft;
};

const testBulkPassengerCreation = async (batchSize) => {
  try {
    if (!testBulkPassengerCreation.currentIndex) {
      testBulkPassengerCreation.currentIndex = 0;
    }
    
    const passengers = generatePassengerBatch(batchSize, testBulkPassengerCreation.currentIndex);
    testBulkPassengerCreation.currentIndex += batchSize;
    
    console.log(`\nTesting batch size: ${batchSize} passengers`);
    const startTime = Date.now();
    const response = await axios.post(`${API_URL}/passengers/bulk`, passengers);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`Batch size: ${batchSize}, Total time: ${totalTime} ms, Server processing time: ${response.data.processingTime}`);
    console.log(`Average time per record: ${totalTime / batchSize} ms`);
    console.log(`Success: Created ${response.data.count} passengers`);
  } catch (error) {
    console.error(`Error with batch size ${batchSize}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

const testBulkAircraftCreation = async (batchSize) => {
  try {
    if (!testBulkAircraftCreation.currentIndex) {
      testBulkAircraftCreation.currentIndex = 0;
    }
    
    const airlinesResponse = await axios.get(`${API_URL}/airlines`);
    const airlineIds = airlinesResponse.data.map(airline => airline._id);
    
    if (airlineIds.length === 0) {
      console.error('No airlines found in the database. Cannot test aircraft creation.');
      return;
    }
    
    const aircraft = generateAircraftBatch(batchSize, airlineIds, testBulkAircraftCreation.currentIndex);
    testBulkAircraftCreation.currentIndex += batchSize;
    
    console.log(`\nTesting batch size: ${batchSize} aircraft`);
    const startTime = Date.now();
    const response = await axios.post(`${API_URL}/aircraft/bulk`, aircraft);
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`Batch size: ${batchSize}, Total time: ${totalTime} ms, Server processing time: ${response.data.processingTime}`);
    console.log(`Average time per record: ${totalTime / batchSize} ms`);
    console.log(`Success: Created ${response.data.count} aircraft`);
  } catch (error) {
    console.error(`Error with batch size ${batchSize}:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

const testBulkOperations = async () => {
  try {
    console.log('\n--- Testing Bulk Operations for DB Efficiency ---\n');
    
    console.log('Testing Bulk Passenger Creation:');
    await testBulkPassengerCreation(10);
    await testBulkPassengerCreation(100);
    await testBulkPassengerCreation(200);
    
    console.log('\nTesting Bulk Aircraft Creation:');
    await testBulkAircraftCreation(10);
    await testBulkAircraftCreation(50);
    await testBulkAircraftCreation(100);
    
    console.log('\n--- Bulk Operation Tests Completed ---');
  } catch (error) {
    console.error('Error during bulk operation testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

  const runSeedAndTest = async () => {
    try {
      console.log('Checking if the server is running...');
      try {
        await axios.get('http://localhost:3000/');
        console.log('Server is running. Proceeding with tests...');
      } catch (error) {
        console.error('Error: Server is not running. Please start the server first.');
        process.exit(1);
      }
  
      const data = await seedData();
      
      await testAPI(data);
      
      await testBulkOperations();
      
      process.exit(0);
    } catch (error) {
      console.error('Error in main process:', error);
      process.exit(1);
    }
  };

  runSeedAndTest();