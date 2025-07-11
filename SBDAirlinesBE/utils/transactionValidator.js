const mongoose = require('mongoose');
const { Penumpang, Tiket, Penerbangan } = require('../models/index.model');
const User = require('../models/user.model');

class TransactionValidator {
  static async checkOrphanedPassengers() {
    try {
      const passengersWithoutUsers = await Penumpang.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'penumpang_id',
            as: 'user'
          }
        },
        {
          $match: {
            user: { $size: 0 }
          }
        }
      ]);

      return {
        hasOrphans: passengersWithoutUsers.length > 0,
        count: passengersWithoutUsers.length,
        orphans: passengersWithoutUsers.map(p => ({
          id: p._id,
          email: p.email,
          name: p.nama_penumpang
        }))
      };
    } catch (error) {
      throw new Error(`Failed to check orphaned passengers: ${error.message}`);
    }
  }

  static async checkUsersWithoutPassengers() {
    try {
      const usersWithoutPassengers = await User.find({
        $or: [
          { penumpang_id: { $exists: false } },
          { penumpang_id: null }
        ]
      });

      return {
        hasIncomplete: usersWithoutPassengers.length > 0,
        count: usersWithoutPassengers.length,
        users: usersWithoutPassengers.map(u => ({
          id: u._id,
          username: u.username,
          email: u.email
        }))
      };
    } catch (error) {
      throw new Error(`Failed to check users without passengers: ${error.message}`);
    }
  }

  static async validateFlightBookingCounts() {
    try {
      const flights = await Penerbangan.find({});
      const inconsistencies = [];

      for (const flight of flights) {
        const actualTicketCount = await Tiket.countDocuments({ 
          flight_id: flight._id 
        });
        
        const recordedBookedSeats = flight.booked_seats || 0;
        
        if (actualTicketCount !== recordedBookedSeats) {
          inconsistencies.push({
            flightId: flight._id,
            flightCode: flight.kode_penerbangan,
            actualTickets: actualTicketCount,
            recordedBookedSeats: recordedBookedSeats,
            difference: actualTicketCount - recordedBookedSeats
          });
        }
      }

      return {
        hasInconsistencies: inconsistencies.length > 0,
        count: inconsistencies.length,
        inconsistencies: inconsistencies
      };
    } catch (error) {
      throw new Error(`Failed to validate flight booking counts: ${error.message}`);
    }
  }

  static async checkDuplicateSeats() {
    try {
      const duplicates = await Tiket.aggregate([
        {
          $group: {
            _id: {
              flight_id: '$flight_id',
              seat_number: '$seat_number'
            },
            count: { $sum: 1 },
            tickets: { $push: '$_id' }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        }
      ]);

      return {
        hasDuplicates: duplicates.length > 0,
        count: duplicates.length,
        duplicates: duplicates.map(d => ({
          flightId: d._id.flight_id,
          seatNumber: d._id.seat_number,
          ticketCount: d.count,
          ticketIds: d.tickets
        }))
      };
    } catch (error) {
      throw new Error(`Failed to check duplicate seats: ${error.message}`);
    }
  }

  static async checkBrokenReferences() {
    try {
      const brokenReferences = [];

      const ticketsWithInvalidFlights = await Tiket.aggregate([
        {
          $lookup: {
            from: 'penerbangans',
            localField: 'flight_id',
            foreignField: '_id',
            as: 'flight'
          }
        },
        {
          $match: {
            flight: { $size: 0 }
          }
        }
      ]);

      const ticketsWithInvalidPassengers = await Tiket.aggregate([
        {
          $lookup: {
            from: 'penumpangs',
            localField: 'penumpang_id',
            foreignField: '_id',
            as: 'passenger'
          }
        },
        {
          $match: {
            passenger: { $size: 0 }
          }
        }
      ]);

      if (ticketsWithInvalidFlights.length > 0) {
        brokenReferences.push({
          type: 'invalid_flight_references',
          count: ticketsWithInvalidFlights.length,
          tickets: ticketsWithInvalidFlights.map(t => t._id)
        });
      }

      if (ticketsWithInvalidPassengers.length > 0) {
        brokenReferences.push({
          type: 'invalid_passenger_references',
          count: ticketsWithInvalidPassengers.length,
          tickets: ticketsWithInvalidPassengers.map(t => t._id)
        });
      }

      return {
        hasBrokenReferences: brokenReferences.length > 0,
        count: brokenReferences.length,
        references: brokenReferences
      };
    } catch (error) {
      throw new Error(`Failed to check broken references: ${error.message}`);
    }
  }

  static async runFullValidation() {
    try {
      console.log('Running full database validation...');
      
      const [
        orphanedPassengers,
        incompleteUsers,
        flightBookingCounts,
        duplicateSeats,
        brokenReferences
      ] = await Promise.all([
        this.checkOrphanedPassengers(),
        this.checkUsersWithoutPassengers(),
        this.validateFlightBookingCounts(),
        this.checkDuplicateSeats(),
        this.checkBrokenReferences()
      ]);

      const checks = {
        orphanedPassengers,
        incompleteUsers,
        flightBookingCounts,
        duplicateSeats,
        brokenReferences
      };

      const hasIssues = orphanedPassengers.hasOrphans ||
                       incompleteUsers.hasIncomplete ||
                       flightBookingCounts.hasInconsistencies ||
                       duplicateSeats.hasDuplicates ||
                       brokenReferences.hasBrokenReferences;

      return {
        status: hasIssues ? 'ISSUES_FOUND' : 'HEALTHY',
        timestamp: new Date().toISOString(),
        summary: this.generateSummary(checks),
        details: checks
      };
    } catch (error) {
      console.error('Validation error:', error);
      return {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: error.message,
        summary: ['Validation failed due to error']
      };
    }
  }

  static generateSummary(checks) {
    const summary = [];

    if (checks.orphanedPassengers.hasOrphans) {
      summary.push(`${checks.orphanedPassengers.count} orphaned passenger(s)`);
    }

    if (checks.incompleteUsers.hasIncomplete) {
      summary.push(`${checks.incompleteUsers.count} incomplete user(s)`);
    }

    if (checks.flightBookingCounts.hasInconsistencies) {
      summary.push(`${checks.flightBookingCounts.count} flight booking inconsistencies`);
    }

    if (checks.duplicateSeats.hasDuplicates) {
      summary.push(`${checks.duplicateSeats.count} duplicate seat assignments`);
    }

    if (checks.brokenReferences.hasBrokenReferences) {
      summary.push(`${checks.brokenReferences.count} broken reference(s)`);
    }

    return summary.length > 0 ? summary : ['Database is consistent'];
  }
}

module.exports = TransactionValidator;
