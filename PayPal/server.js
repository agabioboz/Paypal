const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Serve static files from the "public" folder
app.use(express.static('public'));

const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
const { CLIENT_ID, SECRET } = process.env;

// Function to get access token from PayPal
async function getAccessToken() {
    const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, new URLSearchParams({ 'grant_type': 'client_credentials' }), {
        auth: { username: CLIENT_ID, password: SECRET }
    });
    return response.data.access_token;
}

// Route to create a PayPal order
app.post('/api/create-order', async (req, res) => {
    const accessToken = await getAccessToken();
    const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: { currency_code: 'EUR', value: '10.00' },
            shipping: { address: req.body }
        }]
    };
    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, orderData, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    res.json(response.data);
});

// Route to capture PayPal order payment
app.post('/api/capture-order/:orderID', async (req, res) => {
    const accessToken = await getAccessToken();
    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${req.params.orderID}/capture`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    res.json(response.data);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));