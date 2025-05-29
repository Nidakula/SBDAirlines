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

module.exports = router;
