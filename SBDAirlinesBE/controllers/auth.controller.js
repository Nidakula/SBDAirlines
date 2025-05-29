const User = require('../models/user.model');
const { Penumpang } = require('../models/index.model');
const mongoose = require('mongoose');

const register = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { username, email, password, name, nomor_identitas, nomor_telepon, kewarganegaraan, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Username, email, and password are required' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    await session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority', j: true },
      readPreference: 'primary'
    });

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    }).session(session);

    if (existingUser) {
      throw new Error(existingUser.email === email ? 
        'User with this email already exists' : 
        'User with this username already exists'
      );
    }

    const existingPassenger = await Penumpang.findOne({ email }).session(session);
    if (existingPassenger) {
      throw new Error('Passenger with this email already exists');
    }

    const passengerName = name || username;
    const nationality = kewarganegaraan || 'Not Specified';
    
    const newPassenger = new Penumpang({
      nama_penumpang: passengerName,
      nomor_identitas: nomor_identitas || '',
      nomor_telepon: nomor_telepon || '',
      email,
      kewarganegaraan: nationality
    });
    
    const savedPassenger = await newPassenger.save({ session });
    console.log("Passenger created successfully:", savedPassenger._id);
    
    const userRole = !role || role === 'passenger' ? 'passenger' : 'admin';
    const newUser = new User({
      username,
      email,
      password,
      role: userRole,
      penumpang_id: savedPassenger._id
    });
    
    const savedUser = await newUser.save({ session });
    console.log("User created successfully:", savedUser._id);
    
    await session.commitTransaction();
    
    const userResponse = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      penumpang_id: savedUser.penumpang_id
    };
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });

  } catch (error) {
    console.error("Registration error:", error);
    await session.abortTransaction();
    
    if (error.code === 11000) {
      const field = error.keyPattern?.email ? 'email' : 'username';
      res.status(400).json({ 
        message: `User with this ${field} already exists` 
      });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: error.message 
      });
    } else {
      res.status(400).json({ 
        message: error.message
      });
    }
  } finally {
    await session.endSession();
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      penumpang_id: user.penumpang_id
    };

    if (user.penumpang_id) {
      try {
        const passengerDetails = await Penumpang.findById(user.penumpang_id);
        if (passengerDetails) {
          userData.passenger_details = passengerDetails;
        }
      } catch (err) {
        console.log("Could not fetch passenger details:", err);
      }
    }
    
    res.status(200).json({
      message: 'Login successful',
      user: userData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPassengerForUser = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const userId = req.params.id;
    const { name, nomor_identitas, nomor_telepon, kewarganegaraan } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.penumpang_id) {
      return res.status(400).json({ 
        message: 'User already has a passenger ID',
        penumpang_id: user.penumpang_id
      });
    }

    await session.startTransaction({
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true }
    });

    const passengerName = name || user.username;
    const nationality = kewarganegaraan || 'Not Specified';
    
    const newPassenger = new Penumpang({
      nama_penumpang: passengerName,
      nomor_identitas,
      nomor_telepon,
      email: user.email,
      kewarganegaraan: nationality
    });

    const savedPassenger = await newPassenger.save({ session });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { penumpang_id: savedPassenger._id },
      { new: true, session }
    );

    await session.commitTransaction();

    res.status(201).json({
      message: 'Passenger record created successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        penumpang_id: updatedUser.penumpang_id
      },
      passenger: savedPassenger
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

const logout = (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};

const migrateUsers = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const users = await User.find({
      $or: [
        { penumpang_id: { $exists: false } },
        { penumpang_id: null }
      ]
    });

    if (users.length === 0) {
      return res.status(200).json({
        message: 'No users found that need migration'
      });
    }

    await session.startTransaction({
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority', j: true }
    });

    const results = [];

    for (const user of users) {
      const newPassenger = new Penumpang({
        nama_penumpang: user.username,
        email: user.email,
        kewarganegaraan: 'Not Specified'
      });

      const savedPassenger = await newPassenger.save({ session });

      await User.findByIdAndUpdate(
        user._id,
        { penumpang_id: savedPassenger._id },
        { session }
      );

      results.push({
        username: user.username,
        penumpang_id: savedPassenger._id
      });
    }

    await session.commitTransaction();    res.status(200).json({
      message: `Migrated ${results.length} users to have passenger IDs`,
      results
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      penumpang_id: user.penumpang_id
    };
    
    if (user.penumpang_id) {
      try {
        const passengerDetails = await Penumpang.findById(user.penumpang_id);
        if (passengerDetails) {
          userData.passenger_details = passengerDetails;
        }
      } catch (err) {
        console.log("Could not fetch passenger details:", err);
      }
    }
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  createPassengerForUser,
  migrateUsers,
  getUserProfile 
};