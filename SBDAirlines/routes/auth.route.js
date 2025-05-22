const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  createPassengerForUser,
  migrateUsers,
  getUserProfile
} = require('../controllers/auth.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/create-passenger/:id', createPassengerForUser);
router.post('/migrate-users', migrateUsers);
router.get('/profile/:id', getUserProfile);

module.exports = router;