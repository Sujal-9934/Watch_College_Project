<<<<<<< HEAD
const axios = require('axios');

const testLogin = async () => {
    try {
        const response = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'sujalvadhaiya531@gmail.com',
            password: 'sujal123'
        });
        console.log('Login Success:', response.data);
    } catch (error) {
        console.log('Login Failed:', error.response ? error.response.status : error.message);
        console.log('Error Data:', error.response ? error.response.data : 'No data');
    }
}

testLogin();
=======
require('dotenv').config();

const testLogin = async () => {
  const { API_BASE_URL = 'http://localhost:5000/api', TEST_EMAIL, TEST_PASSWORD } = process.env;
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error('Set TEST_EMAIL and TEST_PASSWORD before running this smoke test.');
  }

  const response = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Login failed with HTTP ${response.status}: ${result.message || 'Unknown error'}`);
  }

  console.log(`Login endpoint returned HTTP ${response.status}.`);
};

testLogin().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
>>>>>>> ffdff2f (Prepare backend for Render deployment)
