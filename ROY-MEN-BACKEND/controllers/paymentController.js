import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

/**
 * @desc    Get detailed payment parameters manually or verify receipts
 * @route   GET /api/v1/payments/:id
 * @access  Private
 */
export const getPaymentDetails = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('order', 'orderStatus totalPrice isPaid');

    if (!payment) {
      res.status(404);
      throw new Error('Payment reference target not found.');
    }

    const isOwner = payment.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Access Forbidden: Selected profile lacks clearance to view this payment log.');
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Manual submission/override for Transaction IDs (User action)
 * @route   PUT /api/v1/payments/:id/submit-txid
 * @access  Private
 */
export const submitTransactionId = async (req, res, next) => {
  try {
    const { transactionId, senderPhone } = req.body;

    if (!transactionId || !senderPhone) {
      res.status(400);
      throw new Error('Required transaction credentials (transactionId, senderPhone) are mandatory.');
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      res.status(404);
      throw new Error('Payment index mismatch.');
    }

    // Only owners may update details
    if (payment.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access Denied: Action restricted to asset holder.');
    }

    if (payment.paymentStatus === 'Paid') {
      res.status(400);
      throw new Error('Changes rejected. This transaction was historically audited and marked Paid.');
    }

    // Check for duplicate TXID
    const duplicateCheck = await Payment.findOne({ transactionId, _id: { $ne: payment._id } });
    if (duplicateCheck) {
      res.status(400);
      throw new Error(`The transaction ID '${transactionId}' is already linked to another order.`);
    }

    payment.transactionId = transactionId;
    payment.senderPhone = senderPhone;
    payment.paymentStatus = 'Pending'; // Return back to pending evaluation

    const updatedPayment = await payment.save();

    res.status(200).json({
      success: true,
      message: 'Transaction ID verification details registered successfully. Awaiting admin approval.',
      payment: updatedPayment
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Administrative verification audit for bKash/Nagad transactions (or general status changes)
 * @route   PUT /api/v1/payments/:id/verify
 * @access  Private/Admin
 */
export const updatePaymentStatusAdmin = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;

    const allowedStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
    if (!paymentStatus || !allowedStatuses.includes(paymentStatus)) {
      res.status(400);
      throw new Error(`Target status must reside inside [${allowedStatuses.join(', ')}].`);
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      res.status(404);
      throw new Error('Target payment resource not found.');
    }

    payment.paymentStatus = paymentStatus;
    
    if (paymentStatus === 'Paid') {
      payment.verifiedAt = Date.now();
      payment.verifiedBy = req.user._id;

      // Update related Order parameters dynamically to keep system in sync
      const order = await Order.findById(payment.order);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        await order.save();
      }
    } else if (paymentStatus === 'Failed' || paymentStatus === 'Refunded') {
      const order = await Order.findById(payment.order);
      if (order) {
        order.isPaid = false;
        await order.save();
      }
    }

    const updatedPayment = await payment.save();

    res.status(200).json({
      success: true,
      message: `Transaction state parameter verified to [${paymentStatus}] successfully.`,
      payment: updatedPayment
    });

  } catch (error) {
    next(error);
  }
};

export default {
  getPaymentDetails,
  submitTransactionId,
  updatePaymentStatusAdmin
};
