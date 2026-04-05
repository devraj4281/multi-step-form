import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import 'dotenv/config'; 
const app = express();


app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  
  try {
    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));