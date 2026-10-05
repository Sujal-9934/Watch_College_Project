const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000/api';

async function testOtpLogin() {
  try {
    console.log('🧪 Testing OTP Login functionality...\n');

    // Test 1: Send login OTP
    console.log('1️⃣ Sending login OTP...');
    const sendOtpResponse = await axios.post(`${API_BASE_URL}/auth/send-login-otp`, {
      email: 'user@example.com'
    });

    console.log('✅ Send OTP Response:', sendOtpResponse.data);

    // Wait a bit for email to be sent
    console.log('\n⏳ Waiting 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Try to login with OTP (we'll need to check what OTP was generated)
    console.log('2️⃣ Checking database for OTP...');

    // For testing purposes, let's try a common OTP or check the database
    // This is just for testing - in real scenario, user would get OTP via email
    const testOtps = ['123456', '000000', '111111'];

    for (const otp of testOtps) {
      try {
        console.log(`🔍 Trying OTP: ${otp}`);
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login-with-otp`, {
          email: 'user@example.com',
          otp: otp
        });

        console.log('✅ Login successful with OTP:', otp);
        console.log('📋 Response:', loginResponse.data);
        break;

      } catch (error) {
        console.log(`❌ OTP ${otp} failed:`, error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testOtpLogin();
