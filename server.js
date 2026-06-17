import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint to process Yoco payment
app.post('/api/charge', async (req, res) => {
  const { token, amountInCents } = req.body;

  if (!token || !amountInCents) {
    return res.status(400).json({ success: false, error: 'Token and amountInCents are required' });
  }

  const secretKey = process.env.YOCO_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ success: false, error: 'Yoco Secret Key is not configured on the server' });
  }

  try {
    // Call Yoco's charge API
    const yocoResponse = await fetch('https://online.yoco.com/v1/charges/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Yoco expects the Secret Key to be passed via Basic Auth or X-Auth-Secret-Key.
        // Standard HTTP Basic Auth: Base64(username:password). For Yoco, username is the secret key, password is empty.
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`
      },
      body: JSON.stringify({
        token: token,
        amountInCents: amountInCents,
        currency: 'ZAR'
      })
    });

    const data = await yocoResponse.json();

    if (!yocoResponse.ok) {
      console.error("Yoco API Error:", data);
      return res.status(yocoResponse.status).json({ 
        success: false, 
        error: data.message || 'Payment failed at the gateway' 
      });
    }

    // Payment was successful
    // Here you would typically save the order to your database
    console.log("Payment successful, charge ID:", data.id);
    
    return res.status(200).json({ success: true, charge: data });

  } catch (error) {
    console.error("Server error processing payment:", error);
    return res.status(500).json({ success: false, error: 'Internal server error while processing payment' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
