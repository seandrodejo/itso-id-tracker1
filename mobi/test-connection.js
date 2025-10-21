// Simple test script to verify API connection
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testConnection() {
  console.log('🔍 Testing API connection...');
  
  try {
    // Test basic connectivity
    const response = await axios.get(`${API_BASE_URL}/auth/test`);
    console.log('✅ API connection successful:', response.data);
    
    // Test login endpoint (with dummy credentials)
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'test@nu-dasma.edu.ph',
        student_id: 'test123',
        password: 'test123'
      });
      console.log('✅ Login endpoint accessible:', loginResponse.status);
    } catch (loginError) {
      if (loginError.response?.status === 400) {
        console.log('✅ Login endpoint accessible (expected validation error)');
      } else {
        console.log('❌ Login endpoint error:', loginError.response?.status);
      }
    }
    
    // Test announcements endpoint
    try {
      const announcementsResponse = await axios.get(`${API_BASE_URL}/announcements`);
      console.log('✅ Announcements endpoint accessible:', announcementsResponse.status);
    } catch (announcementsError) {
      console.log('❌ Announcements endpoint error:', announcementsError.response?.status);
    }
    
    // Test slots endpoint
    try {
      const slotsResponse = await axios.get(`${API_BASE_URL}/slots/available`);
      console.log('✅ Slots endpoint accessible:', slotsResponse.status);
    } catch (slotsError) {
      console.log('❌ Slots endpoint error:', slotsError.response?.status);
    }
    
    // Test calendar closures endpoint
    try {
      const closuresResponse = await axios.get(`${API_BASE_URL}/calendar-closures`);
      console.log('✅ Calendar closures endpoint accessible:', closuresResponse.status);
    } catch (closuresError) {
      console.log('❌ Calendar closures endpoint error:', closuresError.response?.status);
    }
    
    // Test scheduling windows endpoint
    try {
      const windowsResponse = await axios.get(`${API_BASE_URL}/scheduling-windows/active`);
      console.log('✅ Scheduling windows endpoint accessible:', windowsResponse.status);
    } catch (windowsError) {
      console.log('❌ Scheduling windows endpoint error:', windowsError.response?.status);
    }
    
  } catch (error) {
    console.log('❌ API connection failed:', error.message);
    console.log('Make sure the server is running on http://localhost:5000');
  }
}

testConnection();

