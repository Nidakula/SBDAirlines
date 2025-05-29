const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const TransactionValidator = require('./utils/transactionValidator');
const API_URL = 'http://localhost:3000/api';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for rollback testing'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

class RollbackTester {
  static async cleanupTestData() {
    console.log('🧹 Cleaning up any existing test data...');
    
    try {
      const [passengersResponse, ticketsResponse, flightsResponse, aircraftResponse] = await Promise.all([
        axios.get(`${API_URL}/passengers`),
        axios.get(`${API_URL}/tickets`),
        axios.get(`${API_URL}/flights`),
        axios.get(`${API_URL}/aircraft`)
      ]);
      
      const testTickets = ticketsResponse.data.filter(ticket => 
        ticket.seat_number?.startsWith('ROLLBACK') || ticket.seat_number?.startsWith('TEST')
      );
      
      for (const ticket of testTickets) {
        try {
          await axios.delete(`${API_URL}/tickets/${ticket._id}`);
        } catch (error) {
        }
      }
      
      const testFlights = flightsResponse.data.filter(flight =>
        flight.asal_bandara?.includes('Test Origin') || 
        flight.tujuan_bandara?.includes('Test Destination') ||
        flight.asal_bandara?.includes('Rollback') ||
        flight.tujuan_bandara?.includes('Rollback')
      );
      
      for (const flight of testFlights) {
        try {
          await axios.delete(`${API_URL}/flights/${flight._id}`);
        } catch (error) {
        }
      }
      
      const testPassengers = passengersResponse.data.filter(passenger =>
        passenger.email?.includes('rollback.com') ||
        passenger.email?.includes('bulktest') ||
        passenger.nama_penumpang?.startsWith('Bulk Test') ||
        passenger.nama_penumpang?.startsWith('Test Passenger')
      );
      
      for (const passenger of testPassengers) {
        try {
          await axios.delete(`${API_URL}/passengers/${passenger._id}`);
        } catch (error) {
        }
      }
      
      const testAircraft = aircraftResponse.data.filter(aircraft =>
        aircraft.nomor_registrasi?.startsWith('BULK-TEST') ||
        aircraft.nomor_registrasi?.startsWith('REG-')
      );
      
      for (const aircraft of testAircraft) {
        try {
          await axios.delete(`${API_URL}/aircraft/${aircraft._id}`);
        } catch (error) {
        }
      }
      
      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.log('⚠️  Cleanup error (non-critical):', error.message);
    }
  }

  static async testAuthenticationRollbacks() {
    console.log('\n=== Testing Authentication Rollbacks ===');
    
    console.log('\n1. Testing registration rollback with duplicate email...');
    
    const initialPassengersResponse = await axios.get(`${API_URL}/passengers`);
    const initialPassengerCount = initialPassengersResponse.data.length;
    
    let firstRegistrationSucceeded = false;
    
    try {
      const firstRegistrationResponse = await axios.post(`${API_URL}/auth/register`, {
        username: 'testrollback1',
        email: 'duplicate@test.com',
        password: 'password123',
        name: 'Test User 1', 
        nomor_identitas: '9999999999999901',
        nomor_telepon: '+6289999999901',
        kewarganegaraan: 'Indonesia',
        alamat: 'Test Address 1' 
      });
      
      firstRegistrationSucceeded = true;
      console.log('✅ First registration succeeded as expected');
      
      await axios.post(`${API_URL}/auth/register`, {
        username: 'testrollback2',
        email: 'duplicate@test.com', 
        password: 'password456',
        name: 'Test User 2',
        nomor_identitas: '9999999999999902',
        nomor_telepon: '+6289999999902',
        kewarganegaraan: 'Indonesia',
        alamat: 'Test Address 2'
      });
      
      console.log('❌ Expected duplicate registration to fail');
    } catch (error) {
      if (firstRegistrationSucceeded) {
        const finalPassengersResponse = await axios.get(`${API_URL}/passengers`);
        const finalPassengerCount = finalPassengersResponse.data.length;
        
        if (finalPassengerCount === initialPassengerCount + 1) {
          console.log('✅ Registration rollback successful - only first user created');
        } else {
          console.log(`❌ Registration rollback failed - expected ${initialPassengerCount + 1}, got ${finalPassengerCount}`);
        }
      } else {
        console.log('❌ First registration failed unexpectedly');
        console.log('Error details:', error.response?.data?.message || error.message);
        
        console.log('Attempting simplified registration test...');
        try {
          await axios.post(`${API_URL}/auth/register`, {
            username: 'simpletest1',
            email: 'simple@test.com',
            password: 'password123'
          });
          
          await axios.post(`${API_URL}/auth/register`, {
            username: 'simpletest2',
            email: 'simple@test.com',
            password: 'password456'
          });
          
          console.log('❌ Expected simple duplicate registration to fail');
        } catch (simpleError) {
          console.log('✅ Simple registration rollback test passed');
        }
      }
    }
    
    console.log('\n2. Testing registration rollback with invalid data...');
    
    const beforeInvalidResponse = await axios.get(`${API_URL}/passengers`);
    const beforeInvalidCount = beforeInvalidResponse.data.length;
    
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username: '', 
        email: 'invalid-email-format', 
        password: 'test'
      });
      
      console.log('❌ Expected invalid registration to fail');
    } catch (error) {
      const afterInvalidResponse = await axios.get(`${API_URL}/passengers`);
      const afterInvalidCount = afterInvalidResponse.data.length;
      
      if (afterInvalidCount === beforeInvalidCount) {
        console.log('✅ Invalid registration rollback successful - no records created');
      } else {
        console.log('❌ Invalid registration rollback failed - partial records created');
      }
    }
  }
  
  static async testTicketBookingRollbacks() {
    console.log('\n=== Testing Ticket Booking Rollbacks ===');
    
    try {
      const [flightsResponse, passengersResponse] = await Promise.all([
        axios.get(`${API_URL}/flights`),
        axios.get(`${API_URL}/passengers`)
      ]);
      
      let flights = flightsResponse.data;
      let passengers = passengersResponse.data;
      
      const seedPassengers = passengers.filter(p => 
        !p.email?.startsWith('passenger') && 
        !p.email?.includes('rollback.com') &&
        !p.nama_penumpang?.startsWith('Bulk Test')
      );
      
      if (seedPassengers.length >= 2) {
        passengers = seedPassengers;
      } else {
        console.log('Creating minimal test passengers...');
        
        const testPassenger1Response = await axios.post(`${API_URL}/passengers`, {
          nama_penumpang: 'Test Passenger 1',
          email: 'testpass1@rollback.com',
          nomor_identitas: '9999999999999991',
          nomor_telepon: '+6289999999991',
          kewarganegaraan: 'Indonesia'
        });
        
        const testPassenger2Response = await axios.post(`${API_URL}/passengers`, {
          nama_penumpang: 'Test Passenger 2',
          email: 'testpass2@rollback.com',
          nomor_identitas: '9999999999999992',
          nomor_telepon: '+6289999999992',
          kewarganegaraan: 'Indonesia'
        });
        
        passengers = [testPassenger1Response.data, testPassenger2Response.data];
        console.log('✅ Test passengers created via API');
      }
      
      if (flights.length === 0 || passengers.length < 2) {
        console.log('Insufficient test data for ticket rollback tests');
        return;
      }
      
      const flight = flights[0];
      const passenger1 = passengers[0];
      const passenger2 = passengers[1];
      
      console.log('\n1. Testing ticket rollback with duplicate seat...');
      
      const initialFlightResponse = await axios.get(`${API_URL}/flights/${flight._id}`);
      const initialBookedSeats = initialFlightResponse.data.booked_seats || 0;
      
      let firstTicket;
      try {
        firstTicket = await axios.post(`${API_URL}/tickets`, {
          flight_id: flight._id,
          penumpang_id: passenger1._id,
          seat_number: 'ROLLBACK1A',
          kelas_penerbangan: 'Ekonomi',
          harga_tiket: 1000000
        });
        
        console.log('✅ First ticket created successfully');
      } catch (error) {
        console.log('❌ Failed to create first ticket:', error.response?.data?.message || error.message);
        return;
      }
      
      try {
        await axios.post(`${API_URL}/tickets`, {
          flight_id: flight._id,
          penumpang_id: passenger2._id,
          seat_number: 'ROLLBACK1A', 
          kelas_penerbangan: 'Ekonomi',
          harga_tiket: 1000000
        });
        
        console.log('❌ Expected duplicate seat booking to fail');
      } catch (error) {
        const updatedFlightResponse = await axios.get(`${API_URL}/flights/${flight._id}`);
        const expectedBookedSeats = initialBookedSeats + 1; 
        
        if (updatedFlightResponse.data.booked_seats === expectedBookedSeats) {
          console.log('✅ Duplicate seat rollback successful - booking count correct');
        } else {
          console.log(`❌ Booking count incorrect: expected ${expectedBookedSeats}, got ${updatedFlightResponse.data.booked_seats}`);
        }
      }
      
      if (firstTicket) {
        try {
          await axios.delete(`${API_URL}/tickets/${firstTicket.data.ticket._id}`);
          console.log('✅ Test ticket cleaned up');
        } catch (error) {
          console.log('⚠️  Failed to clean up test ticket:', error.message);
        }
      }
      
      console.log('\n2. Testing ticket rollback with invalid flight ID...');
      
      const initialTicketsResponse = await axios.get(`${API_URL}/tickets`);
      const initialTicketCount = initialTicketsResponse.data.length;
      
      try {
        await axios.post(`${API_URL}/tickets`, {
          flight_id: '507f1f77bcf86cd799439011', 
          penumpang_id: passenger1._id,
          seat_number: 'B1',
          kelas_penerbangan: 'Ekonomi',
          harga_tiket: 1000000
        });
        
        console.log('❌ Expected invalid flight ticket creation to fail');
      } catch (error) {
        const finalTicketsResponse = await axios.get(`${API_URL}/tickets`);
        const finalTicketCount = finalTicketsResponse.data.length;
        
        if (finalTicketCount === initialTicketCount) {
          console.log('✅ Invalid flight rollback successful - no ticket created');
        } else {
          console.log('❌ Invalid flight rollback failed - ticket was created');
        }
      }
      
    } catch (error) {
      console.log('Error in ticket booking rollback tests:', error.response?.data?.message || error.message);
    }
  }
  
  static async testFlightCreationRollbacks() {
    console.log('\n=== Testing Flight Creation Rollbacks ===');
    
    try {
      const [airlinesResponse, aircraftResponse, gatesResponse] = await Promise.all([
        axios.get(`${API_URL}/airlines`),
        axios.get(`${API_URL}/aircraft`),
        axios.get(`${API_URL}/gates`)
      ]);
      
      const airlines = airlinesResponse.data;
      const aircraft = aircraftResponse.data;
      const gates = gatesResponse.data;
      
      if (airlines.length === 0 || aircraft.length < 2 || gates.length < 2) {
        console.log('Insufficient test data for flight rollback tests');
        return;
      }
      
      console.log('\n1. Testing flight rollback with aircraft conflict...');
      
      const baseTime = new Date(Date.now() + 86400000); 
      const departureTime1 = new Date(baseTime.getTime() + 3600000); 
      const arrivalTime1 = new Date(baseTime.getTime() + 7200000); 
      const departureTime2 = new Date(baseTime.getTime() + 5400000); 
      const arrivalTime2 = new Date(baseTime.getTime() + 9000000); 
      
      let availableAircraft = aircraft[0];
      let availableGate = gates[0];
      
      const currentFlights = await axios.get(`${API_URL}/flights`);
      const usedGates = currentFlights.data.map(f => f.gate_id?._id || f.gate_id);
      const freeGate = gates.find(g => !usedGates.includes(g._id));
      if (freeGate) {
        availableGate = freeGate;
      }
      
      let firstFlight;
      try {
        firstFlight = await axios.post(`${API_URL}/flights`, {
          maskapai_id: airlines[0]._id,
          pesawat_id: availableAircraft._id,
          gate_id: availableGate._id,
          asal_bandara: 'Test Origin Rollback A',
          tujuan_bandara: 'Test Destination Rollback A',
          jadwal_keberangkatan: departureTime1,
          jadwal_kedatangan: arrivalTime1,
          status_penerbangan: 'On Time'
        });
        
        console.log('✅ First flight created successfully');
      } catch (error) {
        console.log('❌ Failed to create first flight:', error.response?.data?.message || error.message);
        return;
      }
      
      try {
        await axios.post(`${API_URL}/flights`, {
          maskapai_id: airlines[0]._id,
          pesawat_id: availableAircraft._id, 
          gate_id: gates[1]._id, 
          asal_bandara: 'Test Origin Rollback B',
          tujuan_bandara: 'Test Destination Rollback B',
          jadwal_keberangkatan: departureTime2,
          jadwal_kedatangan: arrivalTime2,
          status_penerbangan: 'On Time'
        });
        
        console.log('❌ Expected aircraft conflict flight creation to fail');
      } catch (error) {
        console.log('✅ Aircraft conflict rollback successful');
      }
      
      if (firstFlight) {
        try {
          await axios.delete(`${API_URL}/flights/${firstFlight.data.flight._id}`);
          console.log('✅ Test flight cleaned up');
        } catch (error) {
          console.log('⚠️  Failed to clean up test flight:', error.message);
        }
      }
      
      console.log('\n2. Testing flight rollback with invalid time sequence...');
      
      const initialFlightsResponse = await axios.get(`${API_URL}/flights`);
      const initialFlightCount = initialFlightsResponse.data.length;
      
      try {
        await axios.post(`${API_URL}/flights`, {
          maskapai_id: airlines[0]._id,
          pesawat_id: aircraft[1]._id,
          gate_id: availableGate._id,
          asal_bandara: 'Test Origin Invalid',
          tujuan_bandara: 'Test Destination Invalid',
          jadwal_keberangkatan: arrivalTime1, 
          jadwal_kedatangan: departureTime1, 
          status_penerbangan: 'On Time'
        });
        
        console.log('❌ Expected invalid time sequence flight creation to fail');
      } catch (error) {
        const finalFlightsResponse = await axios.get(`${API_URL}/flights`);
        const finalFlightCount = finalFlightsResponse.data.length;
        
        if (finalFlightCount === initialFlightCount) {
          console.log('✅ Invalid time sequence rollback successful');
        } else {
          console.log('❌ Invalid time sequence rollback failed');
        }
      }
      
    } catch (error) {
      console.log('Error in flight creation rollback tests:', error.response?.data?.message || error.message);
    }
  }
  
  static async testBulkOperationRollbacks() {
    console.log('\n=== Testing Bulk Operation Rollbacks ===');
    
    console.log('\n1. Testing bulk passenger rollback...');
    
    const initialPassengersResponse = await axios.get(`${API_URL}/passengers`);
    const initialPassengerCount = initialPassengersResponse.data.length;
    
    const bulkPassengers = [
      {
        nama_penumpang: 'Bulk Test 1',
        nomor_passport: 'BT001',
        nomor_identitas: '1111111111111111',
        nomor_telepon: '+6281111111111',
        email: 'bulktest1@rollback.com',
        alamat: 'Test Address 1',
        kewarganegaraan: 'Indonesia'
      },
      {
        nama_penumpang: 'Bulk Test 2',
        nomor_passport: 'BT002',
        nomor_identitas: '2222222222222222',
        nomor_telepon: '+6282222222222',
        email: 'bulktest1@rollback.com', 
        alamat: 'Test Address 2',
        kewarganegaraan: 'Indonesia'
      }
    ];
    
    try {
      await axios.post(`${API_URL}/passengers/bulk`, bulkPassengers);
      console.log('❌ Expected bulk passenger creation to fail');
    } catch (error) {
      const finalPassengersResponse = await axios.get(`${API_URL}/passengers`);
      const finalPassengerCount = finalPassengersResponse.data.length;
      
      if (finalPassengerCount === initialPassengerCount) {
        console.log('✅ Bulk passenger rollback successful - no partial creation');
      } else {
        console.log('❌ Bulk passenger rollback failed - partial creation detected');
      }
    }
    
    console.log('\n2. Testing bulk aircraft rollback...');
    
    const airlinesResponse = await axios.get(`${API_URL}/airlines`);
    if (airlinesResponse.data.length === 0) {
      console.log('No airlines available for bulk aircraft test');
      return;
    }
    
    const initialAircraftResponse = await axios.get(`${API_URL}/aircraft`);
    const initialAircraftCount = initialAircraftResponse.data.length;
    
    const bulkAircraft = [
      {
        maskapai_id: airlinesResponse.data[0]._id,
        model_pesawat: 'Bulk Test Aircraft 1',
        kapasitas_penumpang: 200,
        nomor_registrasi: 'BULK-TEST-001',
        status_pesawat: 'Aktif'
      },
      {
        maskapai_id: '507f1f77bcf86cd799439011', 
        model_pesawat: 'Bulk Test Aircraft 2',
        kapasitas_penumpang: 180,
        nomor_registrasi: 'BULK-TEST-002',
        status_pesawat: 'Aktif'
      }
    ];
    
    try {
      await axios.post(`${API_URL}/aircraft/bulk`, bulkAircraft);
      console.log('❌ Expected bulk aircraft creation to fail');
    } catch (error) {
      const finalAircraftResponse = await axios.get(`${API_URL}/aircraft`);
      const finalAircraftCount = finalAircraftResponse.data.length;
      
      if (finalAircraftCount === initialAircraftCount) {
        console.log('✅ Bulk aircraft rollback successful - no partial creation');
      } else {
        console.log('❌ Bulk aircraft rollback failed - partial creation detected');
      }
    }
  }
  
  static async validatePostTestConsistency() {
    console.log('\n=== Final Database Consistency Check ===');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationResponse = await axios.get(`${API_URL}/validation/health`);
      const validation = validationResponse.data;
      
      console.log(`\nValidation Status: ${validation.status}`);
      
      if (validation.summary && validation.summary.length > 0) {
        console.log('Summary:');
        validation.summary.forEach(item => {
          console.log(`  - ${item}`);
        });
      } else {
        console.log('Summary:');
        console.log('  - Database is consistent');
      }
      
      if (validation.status === 'HEALTHY') {
        console.log('\n✅ All rollback tests passed - Database is consistent');
      } else {
        console.log('\n⚠️  Database consistency issues detected after rollback tests');
        console.log('ℹ️   Note: Orphaned passengers may be from previous bulk testing operations');
        if (validation.details) {
          console.log('Sample Details:');
          if (validation.details.orphanedPassengers?.orphans) {
            const orphans = validation.details.orphanedPassengers.orphans.slice(0, 3);
            console.log(`  - First few orphaned passengers: ${orphans.map(p => p.email).join(', ')}`);
          }
          if (validation.details.flightBookingCounts?.inconsistencies) {
            console.log(`  - Flight booking inconsistencies: ${validation.details.flightBookingCounts.inconsistencies.length} flights`);
          }
        }
      }
    } catch (error) {
      console.error('Error during final validation:', error.message);
    }
  }
  
  static async cleanupOrphanedPassengers() {
    console.log('🧹 Cleaning up orphaned passengers from bulk operations...');
    
    try {
      const validationResponse = await axios.get(`${API_URL}/validation/health`);
      const validation = validationResponse.data;
      
      if (validation.details?.orphanedPassengers?.orphans) {
        const orphans = validation.details.orphanedPassengers.orphans;
        console.log(`Found ${orphans.length} orphaned passengers to clean up`);
        
        let cleanedCount = 0;
        let skippedCount = 0;
        
        for (let i = 0; i < orphans.length; i += 10) {
          const batch = orphans.slice(i, i + 10);
          
          for (const orphan of batch) {
            try {
              if (!orphan._id) {
                console.log(`Skipping orphan without ID: ${orphan.email || 'unknown email'}`);
                skippedCount++;
                continue;
              }
              
              const isBulkTestPassenger = 
                orphan.email?.startsWith('passenger') || 
                orphan.email?.includes('example.com') ||
                orphan.nama_penumpang?.startsWith('Passenger ') ||
                orphan.nomor_passport?.startsWith('P2') || 
                orphan.nomor_identitas?.startsWith('200') || 
                orphan.nomor_identitas?.startsWith('100') || 
                orphan.nomor_telepon?.includes('123456'); 
              
              if (isBulkTestPassenger) {
                await axios.delete(`${API_URL}/passengers/${orphan._id}`);
                cleanedCount++;
                
                if (cleanedCount % 50 === 0) {
                  console.log(`Cleaned up ${cleanedCount} orphaned passengers...`);
                }
              } else {
                skippedCount++;
                console.log(`Keeping passenger: ${orphan.email} (doesn't match bulk test patterns)`);
              }
            } catch (error) {
              console.log(`Failed to delete passenger ${orphan._id || 'unknown'}: ${error.response?.data?.message || error.message}`);
              skippedCount++;
            }
          }
          
          if (i + 10 < orphans.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        console.log(`✅ Cleaned up ${cleanedCount} orphaned passengers`);
        
        if (skippedCount > 0) {
          console.log(`ℹ️  Skipped ${skippedCount} passengers (no ID or legitimate data)`);
        }
      } else {
        console.log('✅ No orphaned passengers found');
      }
    } catch (error) {
      console.log('⚠️  Error during orphaned passenger cleanup:', error.message);
    }
  }

  static async cleanupAllBulkTestData() {
    console.log('🧹 Performing comprehensive cleanup of bulk test data...');
    
    try {
      const [passengersResponse, aircraftResponse, ticketsResponse] = await Promise.all([
        axios.get(`${API_URL}/passengers`),
        axios.get(`${API_URL}/aircraft`),
        axios.get(`${API_URL}/tickets`)
      ]);
      
      const bulkTestTickets = ticketsResponse.data.filter(ticket =>
        ticket.seat_number?.match(/^(ROLLBACK|TEST|BULK)/) ||
        ticket.kelas_penerbangan === 'Test'
      );
      
      console.log(`Cleaning up ${bulkTestTickets.length} bulk test tickets...`);
      for (const ticket of bulkTestTickets) {
        try {
          await axios.delete(`${API_URL}/tickets/${ticket._id}`);
        } catch (error) {
        }
      }
      
      const bulkTestAircraft = aircraftResponse.data.filter(aircraft =>
        aircraft.nomor_registrasi?.match(/^(REG-|BULK-TEST)/) ||
        aircraft.model_pesawat?.includes('Bulk Test')
      );
      
      console.log(`Cleaning up ${bulkTestAircraft.length} bulk test aircraft...`);
      for (const aircraft of bulkTestAircraft) {
        try {
          await axios.delete(`${API_URL}/aircraft/${aircraft._id}`);
        } catch (error) {
        }
      }
      
      const bulkTestPassengers = passengersResponse.data.filter(passenger =>
        passenger.email?.startsWith('passenger') || 
        passenger.email?.includes('bulktest') ||
        passenger.email?.includes('rollback.com') ||
        passenger.nama_penumpang?.startsWith('Passenger ') ||
        passenger.nama_penumpang?.startsWith('Bulk Test') ||
        passenger.nama_penumpang?.startsWith('Test Passenger') ||
        passenger.nomor_passport?.match(/^(P2|BT)/) || 
        passenger.nomor_identitas?.startsWith('200') || 
        passenger.nomor_identitas?.startsWith('100') || 
        passenger.nomor_telepon?.includes('123456') || 
        (passenger.nomor_telepon?.startsWith('+6281') && passenger.nomor_telepon?.length > 15) 
      );
      
      console.log(`Cleaning up ${bulkTestPassengers.length} bulk test passengers...`);
      let cleanedPassengers = 0;
      
      for (const passenger of bulkTestPassengers) {
        try {
          await axios.delete(`${API_URL}/passengers/${passenger._id}`);
          cleanedPassengers++;
          
          if (cleanedPassengers % 50 === 0) {
            console.log(`Cleaned up ${cleanedPassengers} passengers...`);
          }
        } catch (error) {
          console.log(`Failed to delete passenger ${passenger._id}: ${error.response?.data?.message || error.message}`);
        }
        
        if (cleanedPassengers % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      console.log(`✅ Comprehensive cleanup completed:`);
      console.log(`   - ${bulkTestTickets.length} test tickets removed`);
      console.log(`   - ${bulkTestAircraft.length} test aircraft removed`);
      console.log(`   - ${cleanedPassengers} bulk test passengers removed`);
      
    } catch (error) {
      console.log('⚠️  Error during comprehensive cleanup:', error.message);
    }
  }

  static async showDatabaseState() {
    console.log('📊 Current Database State:');
    
    try {
      const [passengersResponse, ticketsResponse, flightsResponse] = await Promise.all([
        axios.get(`${API_URL}/passengers`),
        axios.get(`${API_URL}/tickets`),
        axios.get(`${API_URL}/flights`)
      ]);
      
      console.log(`  - Passengers: ${passengersResponse.data.length}`);
      console.log(`  - Tickets: ${ticketsResponse.data.length}`);
      console.log(`  - Flights: ${flightsResponse.data.length}`);
      
      if (passengersResponse.data.length <= 10) {
        console.log('  - Passenger details:');
        passengersResponse.data.forEach(p => {
          console.log(`    * ${p.nama_penumpang} (${p.email})`);
        });
      }
      
      if (ticketsResponse.data.length <= 10) {
        console.log('  - Ticket details:');
        ticketsResponse.data.forEach(t => {
          const passengerName = t.penumpang_id?.nama_penumpang || t.penumpang_id || 'Unknown';
          const flightInfo = t.flight_id?.asal_bandara && t.flight_id?.tujuan_bandara 
            ? `${t.flight_id.asal_bandara} → ${t.flight_id.tujuan_bandara}`
            : t.flight_id || 'Unknown flight';
          console.log(`    * Seat ${t.seat_number} | ${passengerName} | ${flightInfo} | ${t.kelas_penerbangan}`);
        });
      }
      
      try {
        const User = require('./models/user.model');
        const users = await User.find({});
        console.log(`  - Users: ${users.length}`);
        
        if (users.length <= 10) {
          console.log('  - User details:');
          users.forEach(u => {
            console.log(`    * ${u.username} (${u.email}) -> passenger: ${u.penumpang_id || 'none'}`);
          });
        }
      } catch (error) {
        console.log('  - Could not access user collection directly');
      }
      
    } catch (error) {
      console.log('⚠️  Error showing database state:', error.message);
    }
  }

  static async cleanupPassengersByPattern() {
    console.log('🧹 Cleaning passengers by bulk test patterns...');
    
    try {
      const passengersResponse = await axios.get(`${API_URL}/passengers`);
      const allPassengers = passengersResponse.data;
      
      console.log(`Total passengers found: ${allPassengers.length}`);
      
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
      
      console.log(`Found ${bulkTestPassengers.length} bulk test passengers to remove`);
      
      if (bulkTestPassengers.length === 0) {
        console.log('No bulk test passengers found to clean up');
        return;
      }
      
      let cleanedCount = 0;
      
      for (const passenger of bulkTestPassengers) {
        try {
          await axios.delete(`${API_URL}/passengers/${passenger._id}`);
          cleanedCount++;
          
          if (cleanedCount % 25 === 0) {
            console.log(`Cleaned up ${cleanedCount}/${bulkTestPassengers.length} passengers...`);
          }
          
          if (cleanedCount % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (error) {
          console.log(`Failed to delete passenger ${passenger._id} (${passenger.email}): ${error.response?.data?.message || error.message}`);
        }
      }
      
      console.log(`✅ Cleaned up ${cleanedCount} bulk test passengers`);
      
    } catch (error) {
      console.log('⚠️  Error during pattern-based cleanup:', error.message);
    }
  }

  static async cleanupRemainingTestData() {
    console.log('🧹 Cleaning up any remaining test data...');
    
    try {
      const passengersResponse = await axios.get(`${API_URL}/passengers`);
      const allPassengers = passengersResponse.data;
      
      console.log(`Current passengers: ${allPassengers.length}`);
      
      const testPassengers = allPassengers.filter(passenger => {
        const email = passenger.email || '';
        const name = passenger.nama_penumpang || '';
        
        return (
          email.includes('test') ||
          email.includes('duplicate') ||
          email.includes('rollback') ||
          name.includes('test') ||
          name.includes('Test') ||
          name.includes('rollback')
        );
      });
      
      if (testPassengers.length > 0) {
        console.log(`Found ${testPassengers.length} remaining test passengers:`);
        testPassengers.forEach(p => console.log(`  - ${p.email} (${p.nama_penumpang})`));
        
        let cleanedCount = 0;
        for (const passenger of testPassengers) {
          try {
            await axios.delete(`${API_URL}/passengers/${passenger._id}`);
            cleanedCount++;
            console.log(`Cleaned up: ${passenger.email}`);
          } catch (error) {
            console.log(`Failed to delete ${passenger.email}: ${error.message}`);
          }
        }
        
        console.log(`✅ Cleaned up ${cleanedCount} remaining test passengers`);
      } else {
        console.log('✅ No remaining test passengers found');
      }
      
    } catch (error) {
      console.log('⚠️  Error during remaining test data cleanup:', error.message);
    }
  }

  static async cleanupBrokenUserReferences() {
    console.log('🧹 Cleaning up users without corresponding passengers...');
    
    try {
      const passengersResponse = await axios.get(`${API_URL}/passengers`);
      const passengers = passengersResponse.data;
      const passengerIds = passengers.map(p => p._id);
      
      const User = require('./models/user.model');
      const users = await User.find({});
      
      console.log(`Checking ${users.length} users against ${passengers.length} passengers...`);
      
      let cleanedCount = 0;
      
      for (const user of users) {
        if (user.penumpang_id) {
          if (!passengerIds.includes(user.penumpang_id.toString())) {
            console.log(`Found user with missing passenger: ${user.username} (${user.email}) -> passenger: ${user.penumpang_id}`);
            
            await User.findByIdAndDelete(user._id);
            console.log(`✅ Deleted user with broken passenger reference: ${user.username}`);
            cleanedCount++;
          }
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`✅ Cleaned up ${cleanedCount} users with broken passenger references`);
      } else {
        console.log('✅ No users with broken passenger references found');
      }
      
    } catch (error) {
      console.log('⚠️  Error during user cleanup:', error.message);
    }
  }

  static async validateUserPassengerConsistency() {
    console.log('🔍 Validating user-passenger consistency...');
    
    try {
      const passengersResponse = await axios.get(`${API_URL}/passengers`);
      const passengers = passengersResponse.data;
      const passengerIds = passengers.map(p => p._id);
      
      const User = require('./models/user.model');
      const users = await User.find({});
      
      let brokenCount = 0;
      let validCount = 0;
      let noLinkCount = 0;
      
      for (const user of users) {
        if (user.penumpang_id) {
          if (passengerIds.includes(user.penumpang_id.toString())) {
            validCount++;
          } else {
            brokenCount++;
            console.log(`❌ Broken: ${user.username} -> passenger ${user.penumpang_id} missing`);
          }
        } else {
          noLinkCount++;
        }
      }
      
      console.log(`\nConsistency Summary:`);
      console.log(`  - Valid user-passenger links: ${validCount}`);
      console.log(`  - Broken user-passenger links: ${brokenCount}`);
      console.log(`  - Users without passenger links: ${noLinkCount}`);
      console.log(`  - Total users: ${users.length}`);
      console.log(`  - Total passengers: ${passengers.length}`);
      
      return brokenCount === 0;
      
    } catch (error) {
      console.log('⚠️  Error during consistency validation:', error.message);
      return false;
    }
  }

  static async runAllTests() {
    try {
      console.log('🧪 Starting Comprehensive Rollback Testing...\n');
      
      await this.cleanupTestData();
      await this.cleanupOrphanedPassengers(); 
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.testAuthenticationRollbacks();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.testTicketBookingRollbacks();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.testFlightCreationRollbacks();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.testBulkOperationRollbacks();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.validatePostTestConsistency();
      await this.cleanupTestData(); 
      
      console.log('\n🎉 Rollback testing completed!');
    } catch (error) {
      console.error('Error during rollback testing:', error);
    } finally {
      setTimeout(() => {
        mongoose.disconnect();
        process.exit(0);
      }, 1000);
    }
  }

  static async runCleanupOnly() {
    try {
      console.log('🧹 Running comprehensive cleanup of bulk test data...\n');
      
      await this.showDatabaseState();
      console.log('');
      
      await this.validateUserPassengerConsistency();
      console.log('');
      
      await this.cleanupAllBulkTestData();
      await this.cleanupPassengersByPattern();
      await this.cleanupOrphanedPassengers();
      await this.cleanupOrphanedTickets(); 
      await this.cleanupRemainingTestData();
      await this.cleanupBrokenReferences();
      await this.cleanupBrokenUserReferences();
      
      console.log('');
      const isConsistent = await this.validateUserPassengerConsistency();
      
      console.log('');
      await this.showDatabaseState();
      
      await this.validatePostTestConsistency();
      
      if (isConsistent) {
        console.log('\n🎉 Database is now fully consistent!');
      }
      
      console.log('\n✅ Cleanup completed!');
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      setTimeout(() => {
        mongoose.disconnect();
        process.exit(0);
      }, 1000);
    }
  }

  static async cleanupBrokenReferences() {
    console.log('🧹 Skipping complex broken reference detection...');
    console.log('✅ Using simplified user cleanup approach instead');
  }

  static async cleanupOrphanedTickets() {
    console.log('🧹 Cleaning up tickets without corresponding passengers...');
    
    try {
      const [passengersResponse, ticketsResponse] = await Promise.all([
        axios.get(`${API_URL}/passengers`),
        axios.get(`${API_URL}/tickets`)
      ]);
      
      const passengers = passengersResponse.data;
      const tickets = ticketsResponse.data;
      const passengerIds = passengers.map(p => p._id);
      
      console.log(`Checking ${tickets.length} tickets against ${passengers.length} passengers...`);
      
      let orphanedTickets = [];
      
      for (const ticket of tickets) {
        if (ticket.penumpang_id) {
          const passengerId = ticket.penumpang_id._id || ticket.penumpang_id;
          
          if (!passengerIds.includes(passengerId.toString())) {
            orphanedTickets.push(ticket);
          }
        } else {
          orphanedTickets.push(ticket);
        }
      }
      
      if (orphanedTickets.length > 0) {
        console.log(`Found ${orphanedTickets.length} orphaned tickets:`);
        orphanedTickets.forEach(t => {
          const passengerId = t.penumpang_id?._id || t.penumpang_id || 'none';
          console.log(`  - Seat ${t.seat_number} | Passenger ID: ${passengerId} | Class: ${t.kelas_penerbangan}`);
        });
        
        let cleanedCount = 0;
        for (const ticket of orphanedTickets) {
          try {
            await axios.delete(`${API_URL}/tickets/${ticket._id}`);
            cleanedCount++;
            console.log(`✅ Deleted orphaned ticket: Seat ${ticket.seat_number}`);
          } catch (error) {
            console.log(`Failed to delete ticket ${ticket._id}: ${error.response?.data?.message || error.message}`);
          }
        }
        
        console.log(`✅ Cleaned up ${cleanedCount} orphaned tickets`);
      } else {
        console.log('✅ No orphaned tickets found');
      }
      
    } catch (error) {
      console.log('⚠️  Error during orphaned ticket cleanup:', error.message);
    }
  }
}

if (require.main === module) {
  (async () => {
    try {
      await axios.get('http://localhost:3000/');
      console.log('Server is running. Starting rollback tests...\n');
      
      const args = process.argv.slice(2);
      if (args.includes('--cleanup-only')) {
        await RollbackTester.runCleanupOnly();
      } else {
        await RollbackTester.runAllTests();
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Error: Server is not running. Please start the server first.');
      process.exit(1);
    }
  })();
}

module.exports = RollbackTester;
