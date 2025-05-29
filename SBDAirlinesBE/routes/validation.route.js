const express = require('express');
const router = express.Router();
const TransactionValidator = require('../utils/transactionValidator');

// Health check endpoint for database consistency
router.get('/health', async (req, res) => {
  try {
    const validationResults = await TransactionValidator.runFullValidation();
    
    const statusCode = validationResults.status === 'HEALTHY' ? 200 : 
                      validationResults.status === 'ISSUES_FOUND' ? 207 : 500;
    
    res.status(statusCode).json({
      message: 'Database consistency check completed',
      ...validationResults
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to perform health check',
      error: error.message
    });
  }
});

// Specific validation endpoints
router.get('/orphaned-passengers', async (req, res) => {
  try {
    const result = await TransactionValidator.checkOrphanedPassengers();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/flight-bookings', async (req, res) => {
  try {
    const result = await TransactionValidator.validateFlightBookingCounts();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/duplicate-seats', async (req, res) => {
  try {
    const result = await TransactionValidator.checkDuplicateSeats();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new endpoints for testing rollback scenarios
router.get('/broken-references', async (req, res) => {
  try {
    const result = await TransactionValidator.checkBrokenReferences();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/incomplete-users', async (req, res) => {
  try {
    const result = await TransactionValidator.checkUsersWithoutPassengers();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint to simulate transaction failures
router.post('/test-rollback', async (req, res) => {
  try {
    const { testType } = req.body;
    
    switch (testType) {
      case 'user-registration':
        // Simulate a user registration failure
        res.status(400).json({
          message: 'Simulated registration failure for testing',
          testType: 'user-registration'
        });
        break;
        
      case 'ticket-creation':
        // Simulate a ticket creation failure
        res.status(400).json({
          message: 'Simulated ticket creation failure for testing',
          testType: 'ticket-creation'
        });
        break;
        
      default:
        res.status(400).json({
          message: 'Invalid test type',
          supportedTypes: ['user-registration', 'ticket-creation']
        });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
