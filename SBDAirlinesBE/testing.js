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
const TransactionValidator = require('./utils/transactionValidator');

const API_URL = 'http://localhost:3000/api';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // Clear in proper order to avoid foreign key issues and orphaned records
    await Tiket.deleteMany({});
    await Penerbangan.deleteMany({});
    
    // Clear users first, then passengers to avoid orphans
    const User = require('./models/user.model');
    await User.deleteMany({});
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
        gate_id: gates[0]._id,
        booked_seats: 0 // Initialize to 0
      },
      {
        maskapai_id: airlines[1]._id,
        pesawat_id: aircraft[1]._id,
        asal_bandara: 'Jakarta (CGK)',
        tujuan_bandara: 'Bali (DPS)',
        jadwal_keberangkatan: departureDate2,
        jadwal_kedatangan: arrivalDate2,
        status_penerbangan: 'On Time',
        gate_id: gates[1]._id,
        booked_seats: 0
      },
      {
        maskapai_id: airlines[2]._id,
        pesawat_id: aircraft[2]._id,
        asal_bandara: 'Singapore (SIN)',
        tujuan_bandara: 'Tokyo (NRT)',
        jadwal_keberangkatan: departureDate3,
        jadwal_kedatangan: arrivalDate3,
        status_penerbangan: 'On Time',
        gate_id: gates[3]._id,
        booked_seats: 0
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

    // Update flight booking counts to match actual tickets
    await Penerbangan.findByIdAndUpdate(flights[0]._id, { booked_seats: 2 }); // 2 tickets
    await Penerbangan.findByIdAndUpdate(flights[1]._id, { booked_seats: 1 }); // 1 ticket
    await Penerbangan.findByIdAndUpdate(flights[2]._id, { booked_seats: 1 }); // 1 ticket

    // Create corresponding users for passengers to avoid orphans
    await User.create([
      {
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'passenger',
        penumpang_id: passengers[0]._id
      },
      {
        username: 'janesmith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'passenger',
        penumpang_id: passengers[1]._id
      },
      {
        username: 'leeminho',
        email: 'lee.minho@example.com',
        password: 'password123',
        role: 'passenger',
        penumpang_id: passengers[2]._id
      },
      {
        username: 'mariagarcia',
        email: 'maria.garcia@example.com',
        password: 'password123',
        role: 'passenger',
        penumpang_id: passengers[3]._id
      }
    ]);

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
    
    // Clean up bulk test data after testing
    await cleanupBulkTestData();
  } catch (error) {
    console.error('Error during bulk operation testing:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Add cleanup function for bulk test data
const cleanupBulkTestData = async () => {
  try {
    console.log('\n🧹 Cleaning up bulk test data...');
    
    // Get all passengers and filter bulk test ones
    const passengersResponse = await axios.get(`${API_URL}/passengers`);
    const allPassengers = passengersResponse.data;
    
    const bulkTestPassengers = allPassengers.filter(passenger => {
      const email = passenger.email || '';
      const name = passenger.nama_penumpang || '';
      const passport = passenger.nomor_passport || '';
      const identity = passenger.nomor_identitas || '';
      const phone = passenger.nomor_telepon || '';
      
      return (
        email.startsWith('passenger') ||
        email.match(/^passenger\d+@example\.com$/) ||
        name.startsWith('Passenger ') ||
        passport.startsWith('P2') ||
        identity.startsWith('200') ||
        identity.startsWith('100') ||
        phone.includes('123456') ||
        (phone.startsWith('+6281') && phone.length > 15)
      );
    });
    
    console.log(`Found ${bulkTestPassengers.length} bulk test passengers to clean up`);
    
    // Clean up passengers in batches
    let cleanedCount = 0;
    for (const passenger of bulkTestPassengers) {
      try {
        await axios.delete(`${API_URL}/passengers/${passenger._id}`);
        cleanedCount++;
        
        if (cleanedCount % 50 === 0) {
          console.log(`Cleaned up ${cleanedCount}/${bulkTestPassengers.length} passengers...`);
        }
      } catch (error) {
        // Continue with next passenger if one fails
      }
      
      // Small delay to avoid overwhelming the server
      if (cleanedCount % 20 === 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    // Clean up bulk test aircraft
    const aircraftResponse = await axios.get(`${API_URL}/aircraft`);
    const bulkTestAircraft = aircraftResponse.data.filter(aircraft =>
      aircraft.nomor_registrasi?.startsWith('REG-2') ||
      aircraft.model_pesawat?.includes('-2')
    );
    
    console.log(`Found ${bulkTestAircraft.length} bulk test aircraft to clean up`);
    
    for (const aircraft of bulkTestAircraft) {
      try {
        await axios.delete(`${API_URL}/aircraft/${aircraft._id}`);
      } catch (error) {
        // Continue with next aircraft
      }
    }
    
    console.log(`✅ Bulk test data cleanup completed:`);
    console.log(`   - ${cleanedCount} bulk test passengers removed`);
    console.log(`   - ${bulkTestAircraft.length} bulk test aircraft removed`);
    
  } catch (error) {
    console.log('⚠️  Error during bulk test data cleanup:', error.message);
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
    
    await testBulkOperations(); // This now includes cleanup
    
    // Add rollback testing
    await testTransactionRollbacks();
    
    // Final cleanup to ensure no test data remains
    await cleanupBulkTestData();
    
    process.exit(0);
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
};

const testTransactionRollbacks = async () => {
  try {
    console.log('\n--- Testing Transaction Rollback Functionality ---\n');

    // Test user registration rollback
    await testUserRegistrationRollback();
    
    // Test ticket creation rollback
    await testTicketCreationRollback();
    
    // Test flight creation rollback
    await testFlightCreationRollback();
    
    // Test aircraft creation rollback
    await testAircraftCreationRollback();
    
    // Test bulk operation rollback
    await testBulkOperationRollback();
    
    // Validate database consistency after all rollback tests
    await validateDatabaseConsistency();
    
    console.log('\n--- Transaction Rollback Tests Completed ---');
  } catch (error) {
    console.error('Error during rollback testing:', error.message);
  }
};

const testUserRegistrationRollback = async () => {
  try {
    console.log('Testing user registration rollback scenarios:');
    
    // Test 1: Duplicate email should rollback
    console.log('1. Testing duplicate email rollback...');
    const duplicateEmailUser = {
      username: 'testuser123',
      email: 'john.doe@example.com', // This email already exists from seed data
      password: 'testpass123',
      name: 'Test User',
      nomor_identitas: '1234567890123999',
      nomor_telepon: '+62812345999',
      kewarganegaraan: 'Indonesia'
    };
    
    try {
      await axios.post(`${API_URL}/auth/register`, duplicateEmailUser);
      console.log('❌ Expected registration to fail due to duplicate email');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Registration correctly failed and rolled back');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 2: Invalid data should rollback
    console.log('2. Testing invalid data rollback...');
    const invalidUser = {
      username: '', // Invalid empty username
      email: 'invalid-email', // Invalid email format
      password: 'test'
    };
    
    try {
      await axios.post(`${API_URL}/auth/register`, invalidUser);
      console.log('❌ Expected registration to fail due to invalid data');
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        console.log('✅ Registration correctly failed with invalid data');
      }
    }
    
  } catch (error) {
    console.error('Error in user registration rollback test:', error.message);
  }
};

const testTicketCreationRollback = async () => {
  try {
    console.log('\nTesting ticket creation rollback scenarios:');
    
    // Get existing data for testing
    const [flightsResponse, passengersResponse] = await Promise.all([
      axios.get(`${API_URL}/flights`),
      axios.get(`${API_URL}/passengers`)
    ]);
    
    if (flightsResponse.data.length === 0 || passengersResponse.data.length === 0) {
      console.log('Skipping ticket rollback tests - insufficient test data');
      return;
    }
    
    const flight = flightsResponse.data[0];
    const passenger = passengersResponse.data[0];
    
    // Test 1: Invalid flight ID should rollback
    console.log('1. Testing invalid flight ID rollback...');
    const invalidFlightTicket = {
      flight_id: '507f1f77bcf86cd799439011', // Non-existent ObjectId
      penumpang_id: passenger._id,
      seat_number: 'A1',
      kelas_penerbangan: 'Ekonomi',
      harga_tiket: 1000000
    };
    
    try {
      await axios.post(`${API_URL}/tickets`, invalidFlightTicket);
      console.log('❌ Expected ticket creation to fail due to invalid flight ID');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Ticket creation correctly failed and rolled back');
      }
    }
    
    // Test 2: Duplicate seat assignment should rollback
    console.log('2. Testing duplicate seat assignment rollback...');
    
    // First, create a valid ticket
    const validTicket = {
      flight_id: flight._id,
      penumpang_id: passenger._id,
      seat_number: 'TEST1A',
      kelas_penerbangan: 'Ekonomi',
      harga_tiket: 1000000
    };
    
    let firstTicketId = null;
    try {
      const firstTicketResponse = await axios.post(`${API_URL}/tickets`, validTicket);
      firstTicketId = firstTicketResponse.data.ticket._id;
      console.log('✅ First ticket created successfully');
      
      // Now try to create a duplicate seat
      const duplicateSeatTicket = {
        flight_id: flight._id,
        penumpang_id: passengersResponse.data[1]._id, // Different passenger
        seat_number: 'TEST1A', // Same seat
        kelas_penerbangan: 'Ekonomi',
        harga_tiket: 1000000
      };
      
      try {
        await axios.post(`${API_URL}/tickets`, duplicateSeatTicket);
        console.log('❌ Expected ticket creation to fail due to duplicate seat');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('✅ Duplicate seat ticket correctly failed and rolled back');
        }
      }
      
    } catch (createError) {
      console.log('❌ Failed to create first ticket:', createError.message);
    } finally {
      // Clean up - delete the test ticket if it was created
      if (firstTicketId) {
        try {
          await axios.delete(`${API_URL}/tickets/${firstTicketId}`);
          console.log('✅ Test ticket cleaned up');
        } catch (deleteError) {
          console.log('⚠️ Failed to clean up test ticket:', deleteError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error in ticket creation rollback test:', error.message);
  }
};

const testFlightCreationRollback = async () => {
  try {
    console.log('\nTesting flight creation rollback scenarios:');
    
    // Get existing data
    const [airlinesResponse, aircraftResponse, gatesResponse] = await Promise.all([
      axios.get(`${API_URL}/airlines`),
      axios.get(`${API_URL}/aircraft`),
      axios.get(`${API_URL}/gates`)
    ]);
    
    if (airlinesResponse.data.length === 0 || aircraftResponse.data.length === 0 || gatesResponse.data.length === 0) {
      console.log('Skipping flight rollback tests - insufficient test data');
      return;
    }
    
    // Test 1: Invalid airline ID should rollback
    console.log('1. Testing invalid airline ID rollback...');
    const invalidAirlineFlight = {
      maskapai_id: '507f1f77bcf86cd799439011', // Non-existent ObjectId
      pesawat_id: aircraftResponse.data[0]._id,
      gate_id: gatesResponse.data[0]._id,
      asal_bandara: 'Test Origin',
      tujuan_bandara: 'Test Destination',
      jadwal_keberangkatan: new Date(Date.now() + 3600000), // 1 hour from now
      jadwal_kedatangan: new Date(Date.now() + 7200000), // 2 hours from now
      status_penerbangan: 'On Time'
    };
    
    try {
      await axios.post(`${API_URL}/flights`, invalidAirlineFlight);
      console.log('❌ Expected flight creation to fail due to invalid airline ID');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Flight creation correctly failed and rolled back');
      }
    }
    
    // Test 2: Invalid time sequence should rollback
    console.log('2. Testing invalid time sequence rollback...');
    const invalidTimeFlight = {
      maskapai_id: airlinesResponse.data[0]._id,
      pesawat_id: aircraftResponse.data[0]._id,
      gate_id: gatesResponse.data[0]._id,
      asal_bandara: 'Test Origin',
      tujuan_bandara: 'Test Destination',
      jadwal_keberangkatan: new Date(Date.now() + 7200000), // 2 hours from now
      jadwal_kedatangan: new Date(Date.now() + 3600000), // 1 hour from now (invalid)
      status_penerbangan: 'On Time'
    };
    
    try {
      await axios.post(`${API_URL}/flights`, invalidTimeFlight);
      console.log('❌ Expected flight creation to fail due to invalid time sequence');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Flight creation correctly failed with invalid time sequence');
      }
    }
    
  } catch (error) {
    console.error('Error in flight creation rollback test:', error.message);
  }
};

const testAircraftCreationRollback = async () => {
  try {
    console.log('\nTesting aircraft creation rollback scenarios:');
    
    // Get existing airlines
    const airlinesResponse = await axios.get(`${API_URL}/airlines`);
    if (airlinesResponse.data.length === 0) {
      console.log('Skipping aircraft rollback tests - no airlines available');
      return;
    }
    
    // Test 1: Invalid airline ID should rollback
    console.log('1. Testing invalid airline ID rollback...');
    const invalidAirlineAircraft = {
      maskapai_id: '507f1f77bcf86cd799439011', // Non-existent ObjectId
      model_pesawat: 'Test Aircraft',
      kapasitas_penumpang: 200,
      nomor_registrasi: 'TEST-001',
      status_pesawat: 'Aktif'
    };
    
    try {
      await axios.post(`${API_URL}/aircraft`, invalidAirlineAircraft);
      console.log('❌ Expected aircraft creation to fail due to invalid airline ID');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Aircraft creation correctly failed and rolled back');
      }
    }
    
    // Test 2: Duplicate registration number should rollback
    console.log('2. Testing duplicate registration rollback...');
    
    // Get existing aircraft to find a registration number
    const aircraftResponse = await axios.get(`${API_URL}/aircraft`);
    if (aircraftResponse.data.length > 0) {
      const existingRegistration = aircraftResponse.data[0].nomor_registrasi;
      
      const duplicateRegAircraft = {
        maskapai_id: airlinesResponse.data[0]._id,
        model_pesawat: 'Test Aircraft Duplicate',
        kapasitas_penumpang: 180,
        nomor_registrasi: existingRegistration, // Duplicate registration
        status_pesawat: 'Aktif'
      };
      
      try {
        await axios.post(`${API_URL}/aircraft`, duplicateRegAircraft);
        console.log('❌ Expected aircraft creation to fail due to duplicate registration');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('✅ Aircraft creation correctly failed with duplicate registration');
        }
      }
    }
    
  } catch (error) {
    console.error('Error in aircraft creation rollback test:', error.message);
  }
};

const testBulkOperationRollback = async () => {
  try {
    console.log('\nTesting bulk operation rollback scenarios:');
    
    // Test 1: Bulk passenger creation with duplicate email should rollback all
    console.log('1. Testing bulk passenger rollback with duplicate email...');
    
    // Get current passenger count
    const initialPassengersResponse = await axios.get(`${API_URL}/passengers`);
    const initialCount = initialPassengersResponse.data.length;
    
    const bulkPassengersWithDuplicate = [
      {
        nama_penumpang: 'Bulk Test 1',
        nomor_passport: 'BT000001',
        nomor_identitas: '1000000000000001',
        nomor_telepon: '+6281000000001',
        email: 'bulktest1@rollback.com',
        alamat: 'Test Address 1',
        kewarganegaraan: 'Indonesia'
      },
      {
        nama_penumpang: 'Bulk Test 2',
        nomor_passport: 'BT000002',
        nomor_identitas: '1000000000000002',
        nomor_telepon: '+6281000000002',
        email: 'bulktest1@rollback.com', // Duplicate email within batch
        alamat: 'Test Address 2',
        kewarganegaraan: 'Indonesia'
      }
    ];
    
    try {
      await axios.post(`${API_URL}/passengers/bulk`, bulkPassengersWithDuplicate);
      console.log('❌ Expected bulk passenger creation to fail due to duplicate email');
      
      // Check if any were created despite the error
      const afterPassengersResponse = await axios.get(`${API_URL}/passengers`);
      const afterCount = afterPassengersResponse.data.length;
      
      if (afterCount > initialCount) {
        console.log('❌ Partial creation detected - rollback failed');
        console.log(`Expected: ${initialCount}, Got: ${afterCount}`);
      }
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Bulk passenger creation correctly failed');
        
        // Verify no partial creation occurred
        const finalPassengersResponse = await axios.get(`${API_URL}/passengers`);
        const finalCount = finalPassengersResponse.data.length;
        
        if (finalCount === initialCount) {
          console.log('✅ No partial creation - complete rollback successful');
        } else {
          console.log('❌ Partial creation detected - rollback incomplete');
          console.log(`Expected: ${initialCount}, Got: ${finalCount}`);
          
          // Clean up any partial creations
          const partialPassengers = finalPassengersResponse.data.filter(p => 
            p.email?.includes('bulktest') || p.nama_penumpang?.startsWith('Bulk Test')
          );
          for (const passenger of partialPassengers) {
            try {
              await axios.delete(`${API_URL}/passengers/${passenger._id}`);
              console.log(`Cleaned up partial creation: ${passenger.email}`);
            } catch (cleanupError) {
              console.log(`Failed to clean up ${passenger.email}`);
            }
          }
        }
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 2: Bulk aircraft creation with invalid airline ID should rollback all
    console.log('2. Testing bulk aircraft rollback with invalid airline ID...');
    
    const airlinesResponse = await axios.get(`${API_URL}/airlines`);
    if (airlinesResponse.data.length > 0) {
      const initialAircraftResponse = await axios.get(`${API_URL}/aircraft`);
      const initialAircraftCount = initialAircraftResponse.data.length;
      
      const bulkAircraftWithInvalid = [
        {
          maskapai_id: airlinesResponse.data[0]._id,
          model_pesawat: 'Bulk Test Aircraft 1',
          kapasitas_penumpang: 200,
          nomor_registrasi: `BULK-TEST-${Date.now()}-001`,
          status_pesawat: 'Aktif'
        },
        {
          maskapai_id: '507f1f77bcf86cd799439011', // Invalid airline ID
          model_pesawat: 'Bulk Test Aircraft 2',
          kapasitas_penumpang: 180,
          nomor_registrasi: `BULK-TEST-${Date.now()}-002`,
          status_pesawat: 'Aktif'
        }
      ];
      
      try {
        await axios.post(`${API_URL}/aircraft/bulk`, bulkAircraftWithInvalid);
        console.log('❌ Expected bulk aircraft creation to fail due to invalid airline ID');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log('✅ Bulk aircraft creation correctly failed and rolled back');
          
          // Verify no partial creation occurred
          const finalAircraftResponse = await axios.get(`${API_URL}/aircraft`);
          const finalAircraftCount = finalAircraftResponse.data.length;
          
          if (finalAircraftCount === initialAircraftCount) {
            console.log('✅ No partial creation - complete rollback successful');
          } else {
            console.log('❌ Partial creation detected - rollback incomplete');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error in bulk operation rollback test:', error.message);
  }
};

const validateDatabaseConsistency = async () => {
  try {
    console.log('\nValidating database consistency after rollback tests...');
    
    // Wait a moment for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const validationResponse = await axios.get(`${API_URL}/validation/health`);
    const validation = validationResponse.data;
    
    if (validation.status === 'HEALTHY') {
      console.log('✅ Database consistency validation passed');
      console.log('✅ All rollback tests maintained data integrity');
    } else if (validation.status === 'ISSUES_FOUND') {
      console.log('⚠️  Database consistency issues found:');
      validation.summary.forEach(issue => {
        console.log(`   - ${issue}`);
      });
      
      // Detailed investigation of broken references
      if (validation.details?.brokenReferences?.references?.length > 0) {
        console.log('\n🔍 Investigating broken references...');
        const brokenRefs = validation.details.brokenReferences.references;
        
        for (const ref of brokenRefs) {
          console.log(`Found ${ref.type}: ${ref.count} tickets`);
          
          if (ref.type === 'invalid_flight_references') {
            console.log('🧹 Cleaning up tickets with invalid flight references...');
            let cleanedTickets = 0;
            
            for (const ticketId of ref.tickets) {
              try {
                await axios.delete(`${API_URL}/tickets/${ticketId}`);
                cleanedTickets++;
              } catch (error) {
                console.log(`Failed to delete ticket ${ticketId}: ${error.message}`);
              }
            }
            
            if (cleanedTickets > 0) {
              console.log(`✅ Cleaned up ${cleanedTickets} tickets with invalid flight references`);
            }
          }
          
          if (ref.type === 'invalid_passenger_references') {
            console.log('🧹 Cleaning up tickets with invalid passenger references...');
            let cleanedTickets = 0;
            
            for (const ticketId of ref.tickets) {
              try {
                await axios.delete(`${API_URL}/tickets/${ticketId}`);
                cleanedTickets++;
              } catch (error) {
                console.log(`Failed to delete ticket ${ticketId}: ${error.message}`);
              }
            }
            
            if (cleanedTickets > 0) {
              console.log(`✅ Cleaned up ${cleanedTickets} tickets with invalid passenger references`);
            }
          }
        }
      }
      
      // Attempt to clean up known orphaned passengers
      if (validation.details?.orphanedPassengers?.orphans?.length > 0) {
        console.log('\n🧹 Attempting to clean up orphaned passengers...');
        const orphans = validation.details.orphanedPassengers.orphans;
        
        let cleanedCount = 0;
        for (const orphan of orphans) {
          try {
            // Only clean up obvious test passengers
            if (orphan.email?.includes('bulktest') || 
                orphan.nama_penumpang?.startsWith('Bulk Test') ||
                orphan.email?.includes('rollback.com') ||
                orphan.email?.includes('@test.com')) {
              await axios.delete(`${API_URL}/passengers/${orphan._id}`);
              cleanedCount++;
            }
          } catch (error) {
            // Continue with next orphan
          }
        }
        
        if (cleanedCount > 0) {
          console.log(`✅ Cleaned up ${cleanedCount} test orphaned passengers`);
        }
      }
      
      // Re-validate after cleanup attempts
      console.log('\n🔄 Re-validating database consistency after cleanup...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const revalidationResponse = await axios.get(`${API_URL}/validation/health`);
      const revalidation = revalidationResponse.data;
      
      if (revalidation.status === 'HEALTHY') {
        console.log('✅ Database consistency restored after cleanup');
      } else {
        console.log('⚠️  Some consistency issues remain:');
        revalidation.summary.forEach(issue => {
          console.log(`   - ${issue}`);
        });
        
        // Show more details about remaining issues
        if (revalidation.details) {
          console.log('\nRemaining issues details:');
          if (revalidation.details.brokenReferences?.references?.length > 0) {
            revalidation.details.brokenReferences.references.forEach(ref => {
              console.log(`  - ${ref.type}: ${ref.count} tickets`);
              console.log(`    Ticket IDs: ${ref.tickets.slice(0, 3).join(', ')}${ref.tickets.length > 3 ? '...' : ''}`);
            });
          }
          if (revalidation.details.orphanedPassengers?.orphans?.length > 0) {
            const orphans = revalidation.details.orphanedPassengers.orphans.slice(0, 3);
            console.log(`  - Sample orphaned passengers: ${orphans.map(o => o.email).join(', ')}`);
          }
        }
      }
    } else {
      console.log('❌ Database validation error:', validation.error);
    }
    
  } catch (error) {
    console.error('Error during database consistency validation:', error.message);
  }
};

runSeedAndTest();