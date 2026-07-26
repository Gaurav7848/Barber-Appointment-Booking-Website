import express from 'express';
import Payment from '../models/payment.model.js';
import Appointment from '../models/appointment.model.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const getRazorpay = () => {
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, appointmentId } = req.body;
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    });
    const payment = await Payment.create({
      appointmentId,
      userId: req.user._id,
      amount,
      razorpayOrderId: order.id,
      paymentMethod: 'razorpay',
      status: 'pending',
    });
    res.json({ order, payment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
    const payment = await Payment.findById(paymentId);
    if (payment) {
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.status = 'completed';
      await payment.save();
      await Appointment.findByIdAndUpdate(payment.appointmentId, { paymentStatus: 'paid', status: 'confirmed' });
      res.json({ message: 'Payment verified', payment });
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
