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
