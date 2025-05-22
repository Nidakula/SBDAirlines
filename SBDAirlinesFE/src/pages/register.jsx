import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useTheme } from '../themeContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nomor_identitas, setNomorIdentitas] = useState('');
  const [nomor_telepon, setNomorTelepon] = useState('');
  const [kewarganegaraan, setKewarganegaraan] = useState('Indonesia');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  
  const handleRegister = async (e) => {
  e.preventDefault();
  
  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  
  setIsLoading(true);
  setError('');
  setSuccessMsg('');
  
  try {
    // Combine all the data into a single registration request
    const userData = {
      username,
      email,
      password,
      name, // Send name for passenger record
      nomor_identitas: nomor_identitas.trim(), // Kirim empty string jika kosong
      nomor_telepon: nomor_telepon.trim(), // Kirim empty string jika kosong
      kewarganegaraan,
      role: 'passenger' // Default role
    };
    
    console.log('Registering with data:', userData);
    
    const response = await authService.register(userData);
    
    if (response.data && response.data.user) {
      console.log('User registered:', response.data.user);
      
      setSuccessMsg('Registration successful! Logging you in...');
      
      // Store the user data in local storage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isLoggedIn', 'true');
      
      // Navigate to home page after a brief delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setError('Registration failed. Please try again.');
    }
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.response) {
      // Handle specific errors from the server
      if (err.response.data?.message?.includes('User with this email or username already exists')) {
        setError('This username or email is already registered. Please use different credentials.');
      } else if (err.response.data?.message?.includes('E11000 duplicate key error')) {
        setError('This email or phone number is already in use. Please use different details.');
      } else {
        setError(err.response.data?.message || 'Registration failed. Please try again.');
      }
    } else if (err.request) {
      setError('No response from server. Please check your connection.');
    } else {
      setError('Error: ' + err.message);
    }
  } finally {
    setIsLoading(false);
  }
};
  
  return (
    <div className="container mx-auto px-4 pt-28 pb-16 relative z-10 flex-grow flex justify-center">
      <div className={`max-w-md w-full p-8 rounded-lg shadow-2xl ${
        darkMode 
          ? 'bg-gray-800/90 text-white backdrop-blur-sm border border-gray-700' 
          : 'bg-white/90 text-gray-800 backdrop-blur-sm border border-gray-200'
      }`}>
        <h2 className="text-3xl font-bold mb-6 text-center">Create an Account</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 shadow">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMsg}
            </div>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="username" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
              required
              placeholder="your_username"
            />
          </div>
          
          <div>
            <label htmlFor="name" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
              required
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
              required
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="nomor_identitas" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              ID Number (KTP/Passport)
            </label>
            <input
              type="text"
              id="nomor_identitas"
              value={nomor_identitas}
              onChange={(e) => setNomorIdentitas(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
              placeholder="Your ID number (optional)"
            />
          </div>
          
          <div>
            <label htmlFor="nomor_telepon" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Phone Number
            </label>
            <input
              type="text"
              id="nomor_telepon"
              value={nomor_telepon}
              onChange={(e) => setNomorTelepon(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
              placeholder="Your phone number (optional)"
            />
          </div>
          
          <div>
            <label htmlFor="kewarganegaraan" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Nationality
            </label>
            <input
              type="text"
              id="kewarganegaraan"
              value={kewarganegaraan}
              onChange={(e) => setKewarganegaraan(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
              required
              placeholder="Your nationality"
            />
          </div>
          
          <div>
            <label htmlFor="password" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className={`block mb-2 font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200`}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-3 text-white font-medium rounded-lg ${
              darkMode
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
            } focus:outline-none focus:ring-4 ${darkMode ? 'focus:ring-blue-800' : 'focus:ring-blue-300'} ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            } transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center mt-2`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </>
            )}
          </button>
          
          <div className="mt-4 text-center">
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              Already have an account? <Link to="/login" className="text-blue-500 hover:underline font-medium">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}