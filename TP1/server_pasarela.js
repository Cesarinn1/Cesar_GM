const express = require('express');
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')('sk_test_51RMH7hP2alKibvzbTZThhKZosPCtUw48zkCQN3HUbas5WMjkZzAIpfWOqlepYfzRMkFVZrj3076fghuxGEdaqv7o00FSxWdboT');

const app = express();

// Configuración básica
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Sirve archivos estáticos desde el directorio actual

// Ruta principal - Sirve el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'demo_pasarela_ship.html'));
});

// Endpoint para crear un PaymentIntent
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card'],
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Inicia el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
