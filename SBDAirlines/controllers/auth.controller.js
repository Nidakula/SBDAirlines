const User = require('../models/user.model');
const { Penumpang } = require('../models/index.model');

const register = async (req, res) => {
  try {
    const { username, email, password, name, nomor_identitas, nomor_telepon, kewarganegaraan, role } = req.body;

    // Check if user already exists with the same email or username
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Validasi email (wajib)
    if (email) {
      // Cek apakah email sudah digunakan
      const existingPassenger = await Penumpang.findOne({ email });
      if (existingPassenger) {
        return res.status(400).json({
          message: 'A passenger with this email already exists.'
        });
      }
      
      // Nomor identitas dan nomor telepon adalah opsional
      // Hanya validasi jika disediakan oleh pengguna
      if (nomor_identitas && nomor_identitas.trim() !== '') {
        const existingWithIdentitas = await Penumpang.findOne({ nomor_identitas });
        if (existingWithIdentitas) {
          return res.status(400).json({
            message: 'The ID number is already in use. Please use a different one.'
          });
        }
      }
      
      if (nomor_telepon && nomor_telepon.trim() !== '') {
        const existingWithTelepon = await Penumpang.findOne({ nomor_telepon });
        if (existingWithTelepon) {
          return res.status(400).json({
            message: 'The phone number is already in use. Please use a different one.'
          });
        }
      }
    }

    const passengerName = name || username;
    const nationality = kewarganegaraan || 'Not Specified';
    
    try {
      // Buat object passenger baru
      const newPassenger = new Penumpang({
        nama_penumpang: passengerName,
        email: email
      });
      
      // Tambahkan field opsional hanya jika disediakan
      if (nomor_identitas && nomor_identitas.trim() !== '') {
        newPassenger.nomor_identitas = nomor_identitas;
      }
      
      if (nomor_telepon && nomor_telepon.trim() !== '') {
        newPassenger.nomor_telepon = nomor_telepon;
      }
      
      if (nationality) {
        newPassenger.kewarganegaraan = nationality;
      }
      
      const savedPassenger = await newPassenger.save();
      console.log("Passenger created successfully:", savedPassenger._id);
      
      const userRole = !role || role === 'passenger' ? 'passenger' : 'admin';
      const newUser = new User({
        username,
        email,
        password,
        role: userRole,
        penumpang_id: savedPassenger._id
      });
      
      const savedUser = await newUser.save();
      console.log("User created successfully:", savedUser._id);
      
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
      console.error("Error during registration:", error);
      
      // Clean up passenger if we created one but failed to create the user
      const passenger = await Penumpang.findOne({ email });
      if (passenger) {
        await Penumpang.findByIdAndDelete(passenger._id);
        console.log("Cleaned up orphaned passenger record:", passenger._id);
      }
      
      if (error.code === 11000 || error.code === 11001) {
        // This is a MongoDB duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({ 
          message: `The ${field} value already exists. Please use a different value.` 
        });
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.code === 11000 || error.code === 11001) {
      // This is a MongoDB duplicate key error that wasn't caught earlier
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `The ${field} value already exists. Please use a different value.` 
      });
    }
    
    res.status(500).json({ message: error.message });
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

    const passengerName = name || user.username;
    const nationality = kewarganegaraan || 'Not Specified';
    
    const newPassenger = new Penumpang({
      nama_penumpang: passengerName,
      nomor_identitas,
      nomor_telepon,
      email: user.email,
      kewarganegaraan: nationality
    });

    const savedPassenger = await newPassenger.save();

    user.penumpang_id = savedPassenger._id;
    await user.save();

    res.status(201).json({
      message: 'Passenger record created successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        penumpang_id: user.penumpang_id
      },
      passenger: savedPassenger
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};

const migrateUsers = async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { penumpang_id: { $exists: false } },
        { penumpang_id: null }
      ]
    });

    const results = [];

    for (const user of users) {
      const newPassenger = new Penumpang({
        nama_penumpang: user.username,
        email: user.email,
        kewarganegaraan: 'Not Specified'
      });

      const savedPassenger = await newPassenger.save();

      user.penumpang_id = savedPassenger._id;
      await user.save();

      results.push({
        username: user.username,
        penumpang_id: savedPassenger._id
      });
    }

    res.status(200).json({
      message: `Migrated ${results.length} users to have passenger IDs`,
      results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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